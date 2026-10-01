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

Run `npm test`. Tests cover storefront-to-admin order persistence, order price snapshots, stock updates, invalid/unavailable items, duplicate items, latest-stock checks and failed-storage handling.

## Files

- `index.html`, `storefront.js`: storefront and demo checkout
- `admin.html`, `admin.css`, `admin.js`: dashboard and demo login
- `store.js`: shared browser-local data and order creation
- `server.mjs`: optional static preview server
- `test/demo.test.mjs`: shared checkout model tests

## Watch imagery

Original AI-generated images from the **Create Watch Image** chat, bundled as optimized WebP files in `assets/watches/`. The latest refined champagne-gold moonphase and skeleton images are paired with the white and gold midnight-blue watch.

Existing browser data automatically replaces the original stock images and unedited style descriptions while preserving custom images, prices, stock, visibility and orders. Admin accepts HTTPS image URLs or bundled `assets/watches/*.webp` paths.

Names and prices remain illustrative sample data.
