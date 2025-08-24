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

    // Measure footer height and set CSS variable for content padding
    const updateFooterHeight = () => {
      const container = containerRef.current;
      if (!container) return;
      const actions = container.querySelector('.modal-actions');
      const h = actions ? Math.ceil(actions.getBoundingClientRect().height) : 0;
      // add small buffer to ensure content can scroll a little past the footer
      const buffer = 24;
      container.style.setProperty('--actions-h', `${h + buffer}px`);
    };

    // Observe actions resizing (e.g., when buttons wrap) and window resizes
    let ro;
    const container = containerRef.current;
    const actions = container ? container.querySelector('.modal-actions') : null;
    if (actions && 'ResizeObserver' in window) {
      ro = new ResizeObserver(() => updateFooterHeight());
      ro.observe(actions);
    }
    window.addEventListener('resize', updateFooterHeight);
    // initial measure after layout and pin scrollTop=0 for a few frames
    let rafId;
    let frameCount = 0;
    const pinTop = () => {
      updateFooterHeight();
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
      window.removeEventListener('resize', updateFooterHeight);
      if (rafId) cancelAnimationFrame(rafId);
      if (ro && actions) ro.disconnect();
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
