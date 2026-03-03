'use client';

export default function MapError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Failed to load map</h2>
      <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
        {error.digest ? `Error ID: ${error.digest}` : 'The map could not be initialized.'}
      </p>
      <button
        onClick={reset}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1.5rem',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          cursor: 'pointer',
          background: '#fff',
        }}
      >
        Try again
      </button>
    </div>
  );
}
