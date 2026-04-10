export default function AuthCard({ title, subtitle, icon, error, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 1.25rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: 0, overflow: 'hidden' }}>
        <div className="auth-header">
          <span className="auth-icon">{icon}</span>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div style={{ padding: '1.75rem' }}>
          {error && (
            <div className="alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
