import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuestCompletionModal from '../QuestCompletionModal';

const setupClipboard = () => {
  // If jsdom already provides clipboard, spy on writeText
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    const spy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    return spy;
  }
  // Otherwise, define a mock clipboard with a spy-able function
  const writeText = vi.fn().mockResolvedValue();
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });
  return writeText;
};

describe('QuestCompletionModal', () => {
  let clipboardSpy;
  beforeEach(() => {
    // ensure clipboard mock fresh for each test
    clipboardSpy = setupClipboard();
  });

  const renderModal = (props = {}) => {
    const onClose = vi.fn();
    render(
      <QuestCompletionModal
        isOpen
        onClose={onClose}
        questTitle="Goblin Hunt"
        rewardUrl="https://reward.example/abc"
        completionText="You saved the village!"
        {...props}
      />
    );
    return { onClose };
  };

  it('renders header, description, and reward actions when rewardUrl exists', async () => {
    renderModal();
    expect(screen.getByRole('heading', { level: 2, name: /quest complete/i })).toBeInTheDocument();
    expect(screen.getByText(/congrats on completing/i)).toBeInTheDocument();
    expect(screen.getByText(/you saved the village/i)).toBeInTheDocument();

    // Reward section
    expect(screen.getByRole('link', { name: /https:\/\/reward\.example\/abc/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open/i })).toBeInTheDocument();
  });

  it('shows copied feedback after clicking Copy Link', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: /copy link/i }));
    expect(screen.getByText(/copied!/i)).toBeInTheDocument();
  });

  it('renders empty-state message when rewardUrl missing', () => {
    renderModal({ rewardUrl: undefined });
    expect(screen.getByText(/no reward available/i)).toBeInTheDocument();
  });

  it('Close button calls onClose', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
