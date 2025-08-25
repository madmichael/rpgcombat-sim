import React, { useLayoutEffect, useRef } from 'react';

const Modal = ({ children, onClose }) => {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    // Lock background scroll while modal is open (mobile safe)
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const prev = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width
    };
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Ensure content starts at the top for a few frames after mount
    let rafId;
    let frameCount = 0;
    const pinTop = () => {
      const content = containerRef.current?.querySelector('.modal-content');
      if (content) {
        content.scrollTop = 0;
      }
      if (frameCount++ < 8) {
        rafId = requestAnimationFrame(pinTop);
      }
    };
    rafId = requestAnimationFrame(pinTop);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Restore scroll position/styles
      document.body.style.overflow = prev.overflow;
      document.body.style.position = prev.position;
      document.body.style.top = prev.top;
      document.body.style.width = prev.width;
      const y = Math.abs(parseInt(prev.top || `-${scrollY}`, 10)) || scrollY;
      window.scrollTo(0, y);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [onClose]);

  return (
    <div 
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-container" ref={containerRef}>
        <button 
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
          tabIndex={0}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
