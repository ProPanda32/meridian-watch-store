# Merlock Watch Store — Demo

A luxury watch storefront and owner dashboard, built for demonstrations.

## Try it

Run `npm start` with Node.js 20 or later, then open http://localhost:3000. No dependencies or owner password setup are required.

You can also host the files on a static website service. Serve both pages at the same origin. Opening separate file: URLs is not recommended because browser storage sharing varies.

1. Add watches to the bag.
2. Choose **Demo checkout**, use fictional details, and select **Place demo order**.
3. Use **Admin sign-in** in the storefront footer, or the confirmation's dashboard link.
4. Sign in using username **owner** and password **MerlockDemo123!**.
5. Open **Orders**. Your storefront order appears alongside sample orders.

## Demo admin login

The login flow is intentionally browser-based with public demo credentials. It is not secure access control and must not be used for real customer information or a live store. Sign-in is retained for the current tab using session storage; **Sign out** clears it.

## Included

- Full-width watch film, centered brand header, collection search and navigation drawer.
- Scroll-linked film zoom and title fade, followed by a subtle collection reveal.
- Pause/play control, poster fallback, offscreen playback suspension and reduced-motion support.
- Storefront product details, bag quantities, stock limits and demo checkout.
- Orders shared between the storefront and admin dashboard in the same browser.
- Automatic updates across open tabs, plus refresh when a page regains focus.
- Confirmation showing the order reference and total.
- Admin order search, status filtering, fulfilment status, payment records and notes.
- Product price, stock, name, image, description and visibility editing; add products.
- Store name and announcement settings.
- Three initial sample orders.
- Original order price snapshots, independent of later product price changes.

Checkout validates the latest stock and reduces inventory only after a successful save. Failed saves do not clear the bag or show a success confirmation. No payments are taken, no emails are sent, and no real orders are transmitted to a server.

Cancelled orders do not automatically restock; adjust demo stock in Products when needed. Payment statuses are illustrative records only.

## Storage

Data lives in browser local storage under `meridian-preview-v1` (retained for compatibility with earlier demo versions). Pages must be on the same origin, in the same browser profile, to share orders. Data persists on refresh, but is not shared between devices or visitors and is lost when this site's browser data is cleared.

The live workspace, login API, database and real-order backend have been removed for now. The optional Node server serves static files only. GitHub Pages or any static host can run the full demo.

## Checks

Run `npm test`. Tests cover storefront-to-admin order persistence, order price snapshots, stock updates, invalid/unavailable items, duplicate items, latest-stock checks, failed-storage handling, landing assets and video byte-range requests.

## Files

- `index.html`, `storefront.css`, `storefront.js`: storefront and demo checkout
- `landing.js`: film playback, scroll effects, navigation and product search
- `admin.html`, `admin.css`, `admin.js`: dashboard and demo login
- `store.js`: shared browser-local data and order creation
- `server.mjs`: optional static preview server
- `test/demo.test.mjs`: shared checkout model tests
- `test/server.test.mjs`: static assets and video streaming tests

## Watch imagery

Original AI-generated images from the **Create Watch Image** chat, bundled as optimized WebP files in `assets/watches/`. The latest refined champagne-gold moonphase and skeleton images are paired with the white and gold midnight-blue watch.

Existing browser data automatically replaces the original stock images and unedited style descriptions while preserving custom images, prices, stock, visibility and orders. Admin accepts HTTPS image URLs or bundled `assets/watches/*.webp` paths.

Names and prices remain illustrative sample data.

The supplied luxury watch film is bundled as `assets/watches/landing-page-video.webm` (VP9) and `landing-page-video.mp4` (H.264 with fast-start metadata), retaining its 1916 x 1080 resolution. The browser loads one supported format. `landing-page-poster.webp` is a frame from that film. The film is silent; the speaker indicator is informational, not a mute toggle. Playback starts muted when motion is allowed, pauses offscreen, and remains paused after a visitor pauses it. Reduced-motion visitors see the poster and can choose to play the film.

Navigation and playback icons use Lucide geometry; its license is included in `assets/lucide-license.txt`.
