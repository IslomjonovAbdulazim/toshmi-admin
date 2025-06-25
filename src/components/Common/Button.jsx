import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'btn-primary';
      case 'danger':
        return 'btn-danger';
      case 'secondary':
        return 'btn-secondary';
      default:
        return '';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'btn-sm';
      case 'lg':
        return 'btn-lg';
      default:
        return '';
    }
  };

  const classes = [
    'btn',
    getVariantClass(),
    getSizeClass(),
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <div className="spinner"></div>}
      {children}
    </button>
  );
};

export default Button;