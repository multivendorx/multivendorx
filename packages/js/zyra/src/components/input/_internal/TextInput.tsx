import { forwardRef, ChangeEvent } from 'react';

export const TextInput = forwardRef<HTMLInputElement, any>(
  (
    {
      value,
      onChange,
      needsObjectValue,
      ...props
    },
    ref
  ) => {
    const displayValue = typeof value === 'object' ? value.value ?? '' : value ?? '';

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (!onChange) return;

      const newVal = e.target.value;

      if (needsObjectValue) {
        // Save as object with main value
        const base = typeof value === 'object' ? value : { value: typeof value === 'string' ? value : '' };
        onChange({
          ...base,
          value: newVal,
        });
      } else {
        // Pass the raw value for simple inputs
        onChange(newVal);
      }
    };

    return (
      <input
        ref={ref}
        {...props}
        value={displayValue}
        onChange={handleChange}
      />
    );
  }
);
