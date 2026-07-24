import React, { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';

const CustomDateTimePicker = ({ 
  value, 
  onChange, 
  id, 
  className = "form-control", 
  style,
  placeholder = "Select Date & Time...", 
  required = false 
}) => {
  const inputRef = useRef(null);
  const fpInstance = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      fpInstance.current = flatpickr(inputRef.current, {
        enableTime: true,
        dateFormat: "Y-m-d\\TH:i",
        altInput: true,
        altFormat: "F j, Y - H:i",
        altInputClass: className, // Ensure the generated visual input matches form-control styling
        disableMobile: true,      // Disable mobile fallback so styling is consistent
        time_24hr: true,
        defaultDate: value || undefined,
        onChange: (selectedDates, dateStr) => {
          if (onChange) {
            onChange({
              target: {
                id,
                value: dateStr
              }
            });
          }
        }
      });

      // Apply style to the generated altInput if provided
      if (style && fpInstance.current.altInput) {
        Object.assign(fpInstance.current.altInput.style, style);
      }
    }

    return () => {
      if (fpInstance.current) {
        fpInstance.current.destroy();
      }
    };
  }, [style]);

  // Sync value if changed from parent
  useEffect(() => {
    if (fpInstance.current && value !== undefined) {
      const currentDateStr = fpInstance.current.input.value;
      if (value !== currentDateStr) {
        fpInstance.current.setDate(value, false);
      }
    }
  }, [value]);

  return (
    <input
      ref={inputRef}
      type="text"
      id={id}
      style={{ display: 'none' }} // Hidden because altInput will be generated and visible
      placeholder={placeholder}
      required={required}
    />
  );
};

export default CustomDateTimePicker;
