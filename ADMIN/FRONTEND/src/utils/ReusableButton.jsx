import React from 'react';

const ReusableButton = ({
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  children,
  className = '',
  style = {},
}) => {
  return (
    <div style={{ textAlign: 'center', padding: '10px', ...style }}>
      <button
        type={type}
        onClick={onClick}
        className={`btn btn-primary ${className}`}
        disabled={disabled || loading}
      >
        {loading ? <div className="spinner"></div> : children}
      </button>
    </div>
  );
};

export default ReusableButton;
