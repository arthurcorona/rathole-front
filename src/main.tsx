import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext' 
import { Toaster } from "@/components/ui/sonner"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60 * 1000, retry: 1, refetchOnWindowFocus: false } },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* O AuthProvider tem que ter tudo dentro do seu escopo */}
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <Toaster /> 
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)