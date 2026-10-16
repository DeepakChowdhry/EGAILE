import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="standalone-message">
      <p className="eyebrow">EGAILE / 404</p>
      <h1>
        Let’s find
        <br />a better direction.
      </h1>
      <p>This page is unavailable or hasn’t been published.</p>
      <Link className="button primary" href="/">
        Back to EGAILE ↗
      </Link>
    </main>
  );
}
