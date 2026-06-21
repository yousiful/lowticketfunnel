import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import FoundersOffer from './FoundersOffer'

// Lightweight path switch (no router dependency). The hidden /founders-199
// slug renders the $1.99 book offer; everything else is the public $7 funnel.
const path = window.location.pathname.replace(/\/+$/, '')
const Page = path === '/founders-199' ? FoundersOffer : App

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
