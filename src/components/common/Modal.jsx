import React, { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Accessible Modal with:
 * - aria role="dialog" and aria-modal
 * - ESC to close, overlay click to close
 * - Focus management with a simple focus trap
 * - Body scroll lock while open
 * - Subtle open animation
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - titleId: string (id of the title element for aria-labelledby)
 * - theme: 'default' | 'success' | 'danger'
 * - width: css width string (e.g., 'min(640px, 92vw)')
 * - children: ReactNode (modal content)
 */
export default function Modal({ isOpen, onClose, titleId, descriptionId, theme = 'default', width = 'min(640px, 92vw)', children }) {
  const containerRef = useRef(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    try {
      const mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
      const update = () => setReduceMotion(!!mq.matches);
      if (mq) {
        update();
        mq.addEventListener ? mq.addEventListener('change', update) : mq.addListener(update);
        return () => {
          mq.removeEventListener ? mq.removeEventListener('change', update) : mq.removeListener(update);
        };
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Initial focus to modal container
    const t = setTimeout(() => containerRef.current?.focus(), 0);

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
      } else if (e.key === 'Tab') {
        // Simple focus trap
        const root = containerRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  const themeStyles = {
    default: {
      bg: '#111',
      fg: '#eee',
      border: '#444',
      shadow: '0 10px 30px rgba(0,0,0,0.5)'
    },
    success: {
      bg: '#0f1214',
      fg: '#eef5ef',
      border: '#264d31',
      shadow: '0 10px 30px rgba(0,0,0,0.5)'
    },
    danger: {
      bg: '#141011',
      fg: '#f6eaeb',
      border: '#5a2b2f',
      shadow: '0 10px 30px rgba(0,0,0,0.5)'
    }
  }[theme] || {};

  // Always call useMemo, but conditionally include animation properties
  const animationStyle = useMemo(() => {
    if (reduceMotion) return {};
    return { transform: 'scale(1)', animation: 'modal-pop 160ms ease-out' };
  }, [reduceMotion]);

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="presentation"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
    >
      <div
        className="modal-container"
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        style={{ background: themeStyles.bg, color: themeStyles.fg, border: `1px solid ${themeStyles.border}` , boxShadow: themeStyles.shadow, borderRadius: 10, padding: 18, width, ...(animationStyle) }}
      >
        {!reduceMotion && <style>{`@keyframes modal-pop { from { opacity: 0; transform: translateY(8px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>}
        {children}
      </div>
    </div>
  );
}
