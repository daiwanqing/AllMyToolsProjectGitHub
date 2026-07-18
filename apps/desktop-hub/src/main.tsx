import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HubApp } from './app/HubApp';
import './design-system/tokens.css';
import './styles.css';

createRoot(document.getElementById('root')!).render(<StrictMode><HubApp /></StrictMode>);
