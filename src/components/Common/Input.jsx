import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder = '',
  required = false,
  error = '',
  className = ''
}) => {
  const inputClass = type === 'textarea' ? 'form-textarea' : 'form-input';
  const classes = [inputClass, className].filter(Boolean).join(' ');

  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label}
          {required && <span style={{ color: '#e53e3e' }}>*</span>}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={classes}
        />
      ) : type === 'select' ? (
        <select
          value={value}
          onChange={onChange}
          required={required}
          className="form-select"
        >
          {placeholder && <option value="">{placeholder}</option>}
          {/* Options will be passed as children */}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={classes}
        />
      )}
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default Input;