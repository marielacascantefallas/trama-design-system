import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@trama';
import './hilo.css';
import { StoreProvider } from './store';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
);
