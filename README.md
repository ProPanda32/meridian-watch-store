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

- Recovered full-width hero layout, centered brand header, collection search and navigation drawer.
- Scroll-linked film zoom and title fade, followed by a subtle collection reveal.
- Film playback controls, poster support, offscreen playback suspension and reduced-motion support, ready for the pending media assets.
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

Run `node --test test/demo.test.mjs` for the data and checkout tests. These cover storefront-to-admin order persistence, order price snapshots, stock updates, invalid/unavailable items, duplicate items, latest-stock checks, failed-storage handling, imagery migration and catalogue copy migration. All six tests passed during recovery validation.

`npm test` also runs `test/server.test.mjs`, which covers landing assets, HTTP metadata and video byte-range requests. The full suite currently fails with `ENOENT` because the video files are absent. The server tests also require the poster and WebM alternative; run the full suite again after all media assets are restored.

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

The sample collection is **The Aurelia**, **The Selene** and **The Aster**. Existing browser data automatically replaces the original stock images and unedited catalogue names, styles and descriptions while preserving custom edits, prices, stock, visibility and existing order snapshots. Admin accepts HTTPS image URLs or bundled `assets/watches/*.webp` paths.

Names and prices remain illustrative sample data.

## Landing media — pending integration

The original `Landing Page video.mp4` has been supplied again, but it has not been added to this repository. The recovered page references these paths, which are currently absent:

- `assets/watches/landing-page-video.mp4`
- `assets/watches/landing-page-video.webm`
- `assets/watches/landing-page-poster.webp`

Until those assets are restored, the hero film and poster are unavailable. Requests for the missing media can also cause the Node preview server to exit because its file reads are not guarded against missing assets. Video integration and validation remain pending; this recovery merge did not add or modify video assets.

## Recovery status

`recovery/watch-landing-2026-10-01` was merged into `main` on 1 October 2026 in [PR #1](https://github.com/ProPanda32/project-watch-store/pull/1), producing merge commit `c9b6a00ef2a03816f8c27697f22537f0164e0657`.

The recovery commit `c7e0bda9b2af8d6a77d514e7049ad4f04fda6a85` was directly based on the then-current `main`, `be85d5460ec8b7ee7d06626dcaf4801c2410e91a` (generated Merlock watch imagery). There were no intervening main commits and no merge conflicts. The generated watch images, admin files and storefront checkout script were unchanged, and no files were deleted. Any `sources/` files are read-only reference material.

Navigation and playback icons use Lucide geometry; its license is included in `assets/lucide-license.txt`.
