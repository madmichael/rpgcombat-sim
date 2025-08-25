import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuestFailureModal from '../QuestFailureModal';

const setupClipboard = () => {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    const spy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    return spy;
  }
  const writeText = vi.fn().mockResolvedValue();
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });
  return writeText;
};

describe('QuestFailureModal', () => {
  let clipboardSpy;
  beforeEach(() => {
    clipboardSpy = setupClipboard();
  });

  const renderModal = (props = {}) => {
    const onClose = vi.fn();
    render(
      <QuestFailureModal
        isOpen
        onClose={onClose}
        questTitle="Goblin Hunt"
        failureText="The village was overrun."
        failureLootUrl="https://consolation.example/xyz"
        {...props}
      />
    );
    return { onClose };
  };

  it('renders header, description, and consolation actions when failureLootUrl exists', async () => {
    renderModal();
    expect(screen.getByRole('heading', { level: 2, name: /quest failed/i })).toBeInTheDocument();
    expect(screen.getByText(/you failed the quest/i)).toBeInTheDocument();
    expect(screen.getByText(/the village was overrun\./i)).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /https:\/\/consolation\.example\/xyz/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open/i })).toBeInTheDocument();
  });

  it('shows copied feedback after clicking Copy Link', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: /copy link/i }));
    expect(screen.getByText(/copied!/i)).toBeInTheDocument();
  });

  it('renders empty-state message when failureLootUrl missing', () => {
    renderModal({ failureLootUrl: undefined });
    expect(screen.getByText(/no consolation reward/i)).toBeInTheDocument();
  });

  it('Close button calls onClose', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
