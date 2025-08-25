import React, { useState } from 'react';
import Modal from '../common/Modal';
import ModalHeader from '../common/ModalHeader';
import '../common/Modal.css';

export default function QuestCompletionModal({ isOpen, onClose, questTitle, rewardUrl, completionText }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(rewardUrl || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} titleId="quest-complete-title" descriptionId="quest-complete-desc" theme="success">
      <ModalHeader id="quest-complete-title" icon={<span role="img" aria-label="trophy">🏆</span>} title="Quest Complete" />
      <p id="quest-complete-desc" style={{ marginTop: 6 }}>Congrats on completing <strong>{questTitle}</strong>!</p>
      {completionText && (
        <p style={{ color: '#cfe9cf', marginTop: 4 }}>{completionText}</p>
      )}
      {rewardUrl ? (
        <div style={{ marginTop: 12, background: '#0b1b11', border: '1px solid #1e3b27', borderRadius: 8, padding: 12 }}>
          <div style={{ fontWeight: 600, color: '#aee5b3' }}>Your reward link</div>
          <div style={{ wordBreak: 'break-all', marginTop: 6 }}>
            <a href={rewardUrl} target="_blank" rel="noreferrer">{rewardUrl}</a>
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <button onClick={handleCopy} className="btn btn-success">Copy Link</button>
            <a href={rewardUrl} target="_blank" rel="noreferrer">
              <button className="btn btn-outline-success">Open</button>
            </a>
            {copied && <div style={{ color: '#aee5b3', alignSelf: 'center' }}>Copied!</div>}
          </div>
        </div>
      ) : (
        <div style={{ color: '#d2d2d2', marginTop: 12 }}>No reward available.</div>
      )}
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <button onClick={onClose} className="btn btn-ghost-success">Close</button>
      </div>
    </Modal>
  );
}
