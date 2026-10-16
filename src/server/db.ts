import { mkdirSync } from 'node:fs';
import path from 'node:path';
import type { Firestore, Transaction } from 'firebase-admin/firestore';
export const backend = () => process.env.EGAILE_BACKEND || 'local';
export const dataDir = () => process.env.EGAILE_DATA_DIR || path.join(process.cwd(), '.data');
export type RecordData = Record<string, unknown>;
export type Stored<T> = T & { id: string };
export interface Store {
  get<T extends RecordData>(collection: string, id: string): Promise<T | null>;
  list<T extends RecordData>(
    collection: string,
    limit?: number,
    order?: string,
  ): Promise<Stored<T>[]>;
  find<T extends RecordData>(
    collection: string,
    field: string,
    op: '==' | 'in',
    value: unknown,
    limit: number,
    order?: string,
    ascending?: boolean,
  ): Promise<Stored<T>[]>;
  set(collection: string, id: string, data: RecordData): Promise<void>;
  delete(collection: string, id: string): Promise<void>;
}
const valid = (v: string) => {
  if (!/^[a-zA-Z0-9_.-]{1,180}$/.test(v)) throw new Error('INVALID_BODY');
  return v;
};
let sqlite: import('node:sqlite').DatabaseSync | undefined;
let chain: Promise<unknown> = Promise.resolve();
async function localStore(): Promise<Store> {
  if (backend() !== 'local' || process.env.NODE_ENV === 'production')
    throw new Error('FIREBASE_CONFIGURATION_REQUIRED');
  if (!sqlite) {
    const { DatabaseSync } = await import('node:sqlite');
    mkdirSync(dataDir(), { recursive: true });
    sqlite = new DatabaseSync(path.join(dataDir(), 'egaile.sqlite'));
    sqlite.exec(
      'PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS documents (collection TEXT NOT NULL,id TEXT NOT NULL,body TEXT NOT NULL,PRIMARY KEY(collection,id));',
    );
  }
  return {
    async get<T extends RecordData>(c: string, id: string) {
      const row = sqlite!
        .prepare('SELECT body FROM documents WHERE collection=? AND id=?')
        .get(valid(c), valid(id));
      return row ? (JSON.parse(String(row.body)) as T) : null;
    },
    async list<T extends RecordData>(c: string, limit = 100, order?: string) {
      const rows = sqlite!
        .prepare('SELECT id,body FROM documents WHERE collection=?')
        .all(valid(c));
      const result = rows.map((r) => ({
        ...JSON.parse(String(r.body)),
        id: String(r.id),
      })) as Stored<T>[];
      if (order)
        result.sort((a, b) => String(b[order] || '').localeCompare(String(a[order] || '')));
      return result.slice(0, limit);
    },
    async find<T extends RecordData>(
      c: string,
      field: string,
      op: '==' | 'in',
      value: unknown,
      limit: number,
      order?: string,
      ascending = false,
    ) {
      const rows = sqlite!
        .prepare('SELECT id,body FROM documents WHERE collection=?')
        .all(valid(c));
      const result = rows
        .map((r) => ({ ...JSON.parse(String(r.body)), id: String(r.id) }))
        .filter((r) =>
          op === '==' ? r[field] === value : Array.isArray(value) && value.includes(r[field]),
        ) as Stored<T>[];
      if (order)
        result.sort(
          (a, b) =>
            String(a[order] || '').localeCompare(String(b[order] || '')) * (ascending ? 1 : -1),
        );
      return result.slice(0, limit);
    },
    async set(c, id, data) {
      sqlite!
        .prepare(
          'INSERT INTO documents(collection,id,body) VALUES(?,?,?) ON CONFLICT(collection,id) DO UPDATE SET body=excluded.body',
        )
        .run(valid(c), valid(id), JSON.stringify(data));
    },
    async delete(c, id) {
      sqlite!.prepare('DELETE FROM documents WHERE collection=? AND id=?').run(valid(c), valid(id));
    },
  };
}
function cloudStore(db: Firestore, tx?: Transaction): Store {
  return {
    async get<T extends RecordData>(c: string, id: string) {
      const ref = db.collection(valid(c)).doc(valid(id));
      const snap = tx ? await tx.get(ref) : await ref.get();
      return snap.exists ? (snap.data() as T) : null;
    },
    async list<T extends RecordData>(c: string, limit = 100, order?: string) {
      let query = db.collection(valid(c)).limit(limit);
      if (order) query = query.orderBy(valid(order), 'desc');
      const snap = tx ? await tx.get(query) : await query.get();
      return snap.docs.map((d) => ({ ...d.data(), id: d.id })) as Stored<T>[];
    },
    async find<T extends RecordData>(
      c: string,
      field: string,
      op: '==' | 'in',
      value: unknown,
      limit: number,
      order?: string,
      ascending = false,
    ) {
      let query = db.collection(valid(c)).where(valid(field), op, value).limit(limit);
      if (order) query = query.orderBy(valid(order), ascending ? 'asc' : 'desc');
      const snap = tx ? await tx.get(query) : await query.get();
      return snap.docs.map((d) => ({ ...d.data(), id: d.id })) as Stored<T>[];
    },
    async set(c, id, data) {
      const ref = db.collection(valid(c)).doc(valid(id));
      if (tx) tx.set(ref, data);
      else await ref.set(data);
    },
    async delete(c, id) {
      const ref = db.collection(valid(c)).doc(valid(id));
      if (tx) tx.delete(ref);
      else await ref.delete();
    },
  };
}
export async function transaction<T>(fn: (store: Store) => Promise<T>): Promise<T> {
  if (backend() === 'firebase') {
    const { firebaseAdmin } = await import('./firebase');
    const db = firebaseAdmin().db;
    return db.runTransaction((tx) => fn(cloudStore(db, tx)));
  }
  if (backend() !== 'local') throw new Error('FIREBASE_CONFIGURATION_REQUIRED');
  const task = chain.then(async () => {
    const store = await localStore();
    sqlite!.exec('BEGIN IMMEDIATE');
    try {
      const value = await fn(store);
      sqlite!.exec('COMMIT');
      return value;
    } catch (e) {
      sqlite!.exec('ROLLBACK');
      throw e;
    }
  });
  chain = task.catch(() => {});
  return task;
}
export async function readStore(): Promise<Store> {
  if (backend() === 'firebase') {
    const { firebaseAdmin } = await import('./firebase');
    return cloudStore(firebaseAdmin().db);
  }
  // The local adapter shares one connection: serialise external reads as well as writes.
  return {
    get: <T extends RecordData>(c: string, id: string) => transaction((db) => db.get<T>(c, id)),
    list: <T extends RecordData>(c: string, limit?: number, order?: string) =>
      transaction((db) => db.list<T>(c, limit, order)),
    find: <T extends RecordData>(
      c: string,
      field: string,
      op: '==' | 'in',
      value: unknown,
      limit: number,
      order?: string,
      ascending?: boolean,
    ) => transaction((db) => db.find<T>(c, field, op, value, limit, order, ascending)),
    set: (c, id, data) => transaction((db) => db.set(c, id, data)),
    delete: (c, id) => transaction((db) => db.delete(c, id)),
  };
}
