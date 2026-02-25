/**
 * Button Component
 */
export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  ...props 
}) {
  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn',
    lg: 'btn-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn ${variant ? `btn-${variant}` : ''} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Card Component
 */
export function Card({ children, className = '' }) {
  return (
    <div className={`card ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children }) {
  return <div className="card-header">{children}</div>;
}

export function CardBody({ children }) {
  return <div className="card-body">{children}</div>;
}

export function CardFooter({ children }) {
  return <div className="card-footer">{children}</div>;
}

/**
 * Badge Component
 */
export function Badge({ children, color = 'secondary' }) {
  return (
    <span className="badge" style={{ 
      backgroundColor: `var(--color-${color})`,
      color: color === 'secondary' ? 'var(--color-primary-dark)' : 'var(--color-surface)'
    }}>
      {children}
    </span>
  );
}

/**
 * Loading Spinner
 */
export function Spinner() {
  return <div className="spinner" />;
}

/**
 * Input Component
 */
export function Input({
  label,
  error,
  ...props
}) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input
        className={`form-input ${error ? 'error' : ''}`}
        {...props}
      />
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}

/**
 * TextArea Component
 */
export function TextArea({
  label,
  error,
  ...props
}) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <textarea
        className={`form-textarea ${error ? 'error' : ''}`}
        {...props}
      />
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}

/**
 * Select Component
 */
export function Select({
  label,
  error,
  children,
  ...props
}) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <select
        className={`form-select ${error ? 'error' : ''}`}
        {...props}
      >
        {children}
      </select>
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}
