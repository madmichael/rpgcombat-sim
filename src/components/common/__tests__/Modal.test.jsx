import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '../Modal';
import ModalHeader from '../ModalHeader';

function TestModal({ onClose }) {
  return (
    <Modal isOpen onClose={onClose} titleId="t-title" descriptionId="t-desc" theme="success">
      <ModalHeader id="t-title" icon={<span role="img" aria-label="trophy">🏆</span>} title="Header" />
      <p id="t-desc">Description</p>
      <button type="button">Action</button>
      <a href="#">Link</a>
    </Modal>
  );
}

describe('Modal', () => {
  it('wires aria attributes', () => {
    const onClose = vi.fn();
    render(<TestModal onClose={onClose} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 't-title');
    expect(dialog).toHaveAttribute('aria-describedby', 't-desc');
  });

  it('closes on ESC', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<TestModal onClose={onClose} />);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on overlay click but not on inner click', () => {
    const onClose = vi.fn();
    const { container } = render(<TestModal onClose={onClose} />);
    const overlay = container.querySelector('.modal-overlay');
    const inner = container.querySelector('.modal-container');

    // Click inner should NOT close
    fireEvent.click(inner);
    expect(onClose).not.toHaveBeenCalled();

    // Click overlay should close
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('focus stays trapped inside modal when tabbing', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(
      <div>
        <button type="button" data-testid="outside">Outside</button>
        <TestModal onClose={onClose} />
      </div>
    );

    const dialog = screen.getByRole('dialog');
    // Modal sets initial focus to container (async after effect)
    await waitFor(() => expect(dialog).toHaveFocus());

    // Tab should move to first tabbable (button)
    await user.tab();
    const firstButton = screen.getByRole('button', { name: /action/i });
    expect(firstButton).toHaveFocus();

    // Tabbing through items should not leave modal
    await user.tab(); // link
    expect(screen.getByRole('link', { name: /link/i })).toHaveFocus();

    await user.tab(); // wrap back to first
    expect(firstButton).toHaveFocus();

    // Outside element should never gain focus
    const outside = screen.getByTestId('outside');
    expect(outside).not.toHaveFocus();
  });
});
