import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';

// Global fetch patch: automatically add ngrok header to bypass warning page
const _originalFetch = window.fetch;
window.fetch = function(input, init) {
  const newInit = init ? { ...init } : {};
  const headers = new Headers(newInit.headers || {});
  headers.set('ngrok-skip-browser-warning', 'true');
  newInit.headers = headers;
  return _originalFetch(input, newInit);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0f172a',
                color: '#fff',
                fontSize: '14px',
                borderRadius: '10px',
                padding: '12px 16px'
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              duration: 3500
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);