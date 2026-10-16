'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="standalone-message">
      <p className="eyebrow">TEMPORARILY UNAVAILABLE</p>
      <h1>
        We couldn’t load
        <br />
        this page.
      </h1>
      <p>Please try again. No enquiry receipt is implied by this error.</p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
