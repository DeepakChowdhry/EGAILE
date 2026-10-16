export const roles = ['owner', 'editor', 'publisher', 'operator'] as const;
export type Role = (typeof roles)[number];
export type Permission =
  | 'content.read'
  | 'content.write'
  | 'content.publish'
  | 'media.write'
  | 'leads.read'
  | 'leads.write'
  | 'leads.export'
  | 'leads.delete'
  | 'members.manage';
export type Principal = { uid: string; email: string; roles: Role[] };
const grants: Record<Role, Permission[]> = {
  owner: [
    'content.read',
    'content.write',
    'content.publish',
    'media.write',
    'leads.read',
    'leads.write',
    'leads.export',
    'leads.delete',
    'members.manage',
  ],
  editor: ['content.read', 'content.write', 'media.write'],
  publisher: ['content.read', 'content.write', 'content.publish', 'media.write'],
  operator: ['leads.read', 'leads.write', 'leads.export'],
};
export function can(user: Principal | null, permission: Permission) {
  return !!user?.roles.some((role) => grants[role]?.includes(permission));
}
export function capabilities(user: Principal) {
  return [...new Set(user.roles.flatMap((role) => grants[role] || []))];
}
