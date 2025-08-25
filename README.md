# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Modal accessibility usage

Shared modal component: `src/components/common/Modal.jsx`

- Props:
  - `isOpen`: boolean
  - `onClose`: function
  - `titleId`: string, id of header element bound via `aria-labelledby`
  - `descriptionId` (optional): string, id of descriptive paragraph bound via `aria-describedby`
  - `theme`: `default | success | danger`
  - `width`: CSS width string

- Features:
  - ARIA `role="dialog"`, `aria-modal`, `aria-labelledby`, optional `aria-describedby`
  - ESC key to close and overlay click to close; inner clicks do not close
  - Focus trap within modal content and initial focus on container
  - Body scroll lock while open
  - Respects `prefers-reduced-motion` (disables open animation when enabled)

- Example header component: `src/components/common/ModalHeader.jsx`

Example usage:

```jsx
<Modal isOpen={open} onClose={close} titleId="my-title" descriptionId="my-desc" theme="success">
  <ModalHeader id="my-title" icon={<span role="img" aria-label="trophy">🏆</span>} title="Quest Complete" />
  <p id="my-desc">Congrats on completing the quest!</p>
  {/* actions */}
  <button type="button">OK</button>
  <a href="https://...">Reward link</a>
</Modal>
```

## Running tests

This project uses Vitest with jsdom and Testing Library.

- One-time install:

```
npm install
```

- Run tests once:

```
npm run test
```

- Watch mode:

```
npm run test:watch
```
