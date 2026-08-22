import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import FoundersOffer from './FoundersOffer'
import JoinV2 from './JoinV2'

// Lightweight path switch (no router dependency). The hidden /founders-199
// slug renders the $1.99 book offer, /join-v2 is the single-step order form
// A/B variant of the membership page, and everything else is the public
// membership funnel. App is the control in that test, so leave it on the
// default route and leave its styling alone.
const path = window.location.pathname.replace(/\/+$/, '')
const ROUTES: Record<string, typeof App> = {
  '/founders-199': FoundersOffer,
  '/join-v2': JoinV2,
}
const Page = ROUTES[path] ?? App

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
