import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';

// 🚀 ADVANCED GLOBAL CONFIGURATION
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // Data stays fresh for 5 mins
      cacheTime: 10 * 60 * 1000,
      gcTime: 10 * 60 * 1000,          // (Note: cacheTime is renamed to gcTime in React Query v5)
      refetchOnWindowFocus: false,     // 🚫 DISABLES tab-switch fetching globally
      refetchOnReconnect: false,       // 🚫 Prevents fetching if wifi drops and reconnects
      refetchOnMount: false,           // 🚫 Prevents fetching just because a component unmounted/remounted
      retry: 1,                        // Only retry failed requests once
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);