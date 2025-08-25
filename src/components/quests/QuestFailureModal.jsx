import React, { useState } from 'react';
import Modal from '../common/Modal';
import ModalHeader from '../common/ModalHeader';
import '../common/Modal.css';

export default function QuestFailureModal({ isOpen, onClose, questTitle, failureText, failureLootUrl }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(failureLootUrl || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} titleId="quest-failed-title" descriptionId="quest-failed-desc" theme="danger">
      <ModalHeader id="quest-failed-title" icon={<span role="img" aria-label="skull">💀</span>} title="Quest Failed" />
      <p id="quest-failed-desc" style={{ marginTop: 6 }}>You failed the quest <strong>{questTitle}</strong>.</p>
      {failureText && (
        <p style={{ color: '#f2c0c0', marginTop: 4 }}>{failureText}</p>
      )}
      {failureLootUrl ? (
        <div style={{ marginTop: 12, background: '#1b0d0f', border: '1px solid #5a2b2f', borderRadius: 8, padding: 12 }}>
          <div style={{ fontWeight: 600, color: '#f2c0c0' }}>Consolation reward</div>
          <div style={{ wordBreak: 'break-all', marginTop: 6 }}>
            <a href={failureLootUrl} target="_blank" rel="noreferrer">{failureLootUrl}</a>
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <button onClick={handleCopy} className="btn btn-danger">Copy Link</button>
            <a href={failureLootUrl} target="_blank" rel="noreferrer">
              <button className="btn btn-outline-danger">Open</button>
            </a>
            {copied && <div style={{ color: '#f2c0c0', alignSelf: 'center' }}>Copied!</div>}
          </div>
        </div>
      ) : (
        <div style={{ color: '#d2d2d2', marginTop: 12 }}>No consolation reward.</div>
      )}
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <button onClick={onClose} className="btn btn-ghost-danger">Close</button>
      </div>
    </Modal>
  );
}
