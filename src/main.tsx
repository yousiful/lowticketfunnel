import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import FoundersOffer from './FoundersOffer'
import JoinV2 from './JoinV2'
import WebinarTicket from './WebinarTicket'
import SkoolStyle from './SkoolStyle'
import { assignPageVariant } from './pageVariant'

// Lightweight path switch (no router dependency). The hidden /founders-199
// slug renders the $1.99 book offer, /join-v2 is the single-step order form
// A/B variant of the membership page, /webinar-ticket sells a paid seat to
// webinar1 registrants, and everything else is the public membership
// funnel. App is the control in that test, so leave it on the default
// route and leave its styling alone.
//
// The default route also runs a 50/50 page split: App ('control') vs
// SkoolStyle ('skool'), assigned and reported in pageVariant.ts. Force one
// with ?v=control or ?v=skool for QA.
const path = window.location.pathname.replace(/\/+$/, '')
const ROUTES: Record<string, typeof App> = {
  '/founders-199': FoundersOffer,
  '/join-v2': JoinV2,
  '/webinar-ticket': WebinarTicket,
}
const Page = ROUTES[path] ?? (assignPageVariant() === 'skool' ? SkoolStyle : App)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
