import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { initializeTheme } from './lib/theme';
import { isDemoMode } from './lib/config';
import './styles/global.css';

const rootElement = document.getElementById('root');
initializeTheme();
document.documentElement.dataset.demo = String(isDemoMode);

if (!rootElement) {
  throw new Error('Elemento #root não encontrado no index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
