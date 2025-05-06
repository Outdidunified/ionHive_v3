import React from 'react';

const InputField = ({
    type = 'text',
    value,
    onChange,
    placeholder = '',
    maxLength,
    className = 'form-control',
    required = false,
    name,
    onClick,
    ariaLabel,
    style,
    accept,
    autoComplete,
    id,
    max,
    min,
    disabled,
    ariadescribedby,readOnly,
    requiredvalue,checked
}) => {
    return (
        <input
            type={type}
            className={className}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            maxLength={maxLength}
            required={required}
            name={name}
            onClick={onClick}
            aria-label={ariaLabel}
            aria-describedby={ariadescribedby} // ✅ fixed
            style={style}
            accept={accept}
            id={id}
            autoComplete={autoComplete}
            max={max}
            min={min}
            disabled={disabled}
            requiredvalue={requiredvalue}
            readOnly={readOnly}
            checked={checked}
            
        />
    );
};

export default InputField;
