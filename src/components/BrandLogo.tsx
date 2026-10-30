export function BrandLogo({
  variant = 'header',
  tone = 'light',
}: {
  variant?: 'header' | 'footer' | 'workspace' | 'login';
  tone?: 'light' | 'ink';
}) {
  return (
    <span className={`brand-logo brand-logo--${variant} brand-logo--${tone}`}>
      <img
        className="brand-logo__mark"
        src="/brand/egaile-mark.png"
        width={56}
        height={64}
        alt=""
        aria-hidden="true"
      />
      <span className="brand-logo__copy">
        <span className="brand-logo__word" role="img" aria-label="EGAILE">
          {'EGAILE'.split('').map((letter, index) => (
            <span key={index} aria-hidden="true">
              {letter}
            </span>
          ))}
        </span>
        <span className="brand-logo__tagline">Transformational technology advisory</span>
      </span>
    </span>
  );
}
