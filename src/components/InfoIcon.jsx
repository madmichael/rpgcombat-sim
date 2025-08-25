import React, { useEffect, useRef, useState } from 'react';

const InfoIcon = ({ text, size = 14, offset = 6, ariaLabel = 'info' }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const dim = Number(size) || 14;
  const fontSize = Math.max(10, Math.round(dim * 0.7));

  // Close on outside click/tap
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown, true);
    document.addEventListener('touchstart', handlePointerDown, true);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown, true);
      document.removeEventListener('touchstart', handlePointerDown, true);
    };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open]);

  return (
    <span
      ref={rootRef}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span
        aria-label={ariaLabel}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen(prev => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(prev => !prev);
          }
        }}
        style={{
          width: dim,
          height: dim,
          borderRadius: '50%',
          background: '#e0e0e0',
          color: '#333',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: fontSize,
          fontWeight: 'bold',
          cursor: 'pointer',
          lineHeight: 1,
          userSelect: 'none'
        }}
      >
        i
      </span>
      {open && text && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: `translate(-50%, ${Number(offset) || 6}px)`,
            background: '#fff',
            color: '#333',
            border: '1px solid rgba(0,0,0,0.15)',
            borderRadius: 6,
            padding: '6px 8px',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            zIndex: 1000,
            fontSize: 11
          }}
        >
          {text}
        </div>
      )}
    </span>
  );
};

export default InfoIcon;
