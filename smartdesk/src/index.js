import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Global error filtering: ignore noisy errors from browser extensions (e.g. MetaMask)
// Prevents Create React App overlay from showing extension stack traces.
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    try {
      const src = event.filename || (event.error && event.error.stack) || '';
      if (typeof src === 'string' && src.startsWith('chrome-extension://')) {
        // suppress
        event.preventDefault();
        return true;
      }
    } catch (e) {
      // fallback - do nothing
    }
    // allow normal processing for other errors
    return false;
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    try {
      const reason = event.reason || '';
      const text = typeof reason === 'string' ? reason : (reason && reason.stack) ? reason.stack : '';
      if (typeof text === 'string' && text.includes('chrome-extension://')) {
        event.preventDefault();
        return true;
      }
    } catch (e) {
      // ignore
    }
    return false;
  }, true);
}
