import { useState, useEffect, useRef } from 'react';

function CustomSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find((o) => o.value === value) || options[0];

  return (
    <div className="custom-select" ref={ref}>
      <button
        className={`custom-select-btn${open ? ' open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <span>{selected.label}</span>
        <span className="custom-select-arrow">▼</span>
      </button>

      {open && (
        <div className="custom-select-dropdown">
          {options.map((opt) => (
            <button
              key={opt.value}
              className={`custom-select-option${opt.value === value ? ' selected' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              type="button"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomSelect;
