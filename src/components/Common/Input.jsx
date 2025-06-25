import React from 'react';

const Input = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  name,
  id,
  required = false,
  disabled = false,
  className = '',
  error = '',
  ...props
}) => {
  const inputClasses = [
    'form-input',
    error ? 'border-red-500' : '',
    disabled ? 'opacity-50' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="w-full">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        name={name}
        id={id}
        required={required}
        disabled={disabled}
        className={inputClasses}
        {...props}
      />
      {error && (
        <div className="text-red-500 text-sm mt-1">{error}</div>
      )}
    </div>
  );
};

export default Input;