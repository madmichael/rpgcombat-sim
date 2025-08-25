import React from 'react';

/**
 * Simple modal header with an emoji/icon, title, and accessible title id.
 * Props:
 * - id: string (used for aria-labelledby)
 * - icon: ReactNode (emoji or icon)
 * - title: string
 */
export default function ModalHeader({ id, icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ fontSize: 20, lineHeight: 1 }}>{icon}</div>
      <h2 id={id} style={{ margin: '0 0 4px 0' }}>{title}</h2>
    </div>
  );
}
