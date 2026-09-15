import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@allmytools/design-tokens/theme.css';
import '@allmytools/ui/styles.css';
import { App } from './app/App';
import { registerPwaServiceWorker } from './pwa';
import './app/styles.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('未找到应用挂载节点。');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

void registerPwaServiceWorker();
