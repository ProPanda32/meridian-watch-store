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
- Film playback controls, poster fallback, offscreen playback suspension and reduced-motion support.
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

`npm test` runs all 20 checkout, music-control and server tests, including landing assets, HTTP metadata, full video downloads, byte-range requests and the WebM alternative. All 20 tests pass, including removed-product migration and image-route removal.

## Files

- `index.html`, `storefront.css`, `storefront.js`: storefront and demo checkout
- `landing.js`: film playback, scroll effects, navigation and product search
- `admin.html`, `admin.css`, `admin.js`: dashboard and demo login
- `store.js`: shared browser-local data and order creation
- `server.mjs`: optional static preview server
- `test/demo.test.mjs`: shared checkout model tests
- `test/server.test.mjs`: static assets and video streaming tests

## Watch imagery

Original AI-generated images from the **Create Watch Image** chat, bundled as optimized WebP files in `assets/watches/`. The champagne-gold moonphase and white-and-gold midnight-blue images remain in the collection.

The sample collection is **The Aurelia** and **The Selene**. Existing browser data automatically replaces the original stock images and unedited catalogue names, styles and descriptions while preserving custom edits, prices, stock, visibility and existing order snapshots. Admin accepts HTTPS image URLs or bundled `assets/watches/*.webp` paths.

Names and prices remain illustrative sample data.

## Landing media

The supplied `Landing Page video.mp4` is bundled at its original 1916 × 1080 resolution as `assets/watches/landing-page-video.mp4` (H.264, fast-start metadata, approximately 5.1 MB) and `assets/watches/landing-page-video.webm` (VP9, approximately 4.2 MB). The browser loads one supported format. `assets/watches/landing-page-poster.webp` is a still from the film.

The film is silent. Playback starts muted when motion is allowed, pauses offscreen, and stays paused after a visitor pauses it. Reduced-motion visitors see the poster and can choose to play the film.

## Recovery status

`recovery/watch-landing-2026-10-01` was merged into `main` on 1 October 2026 in [PR #1](https://github.com/ProPanda32/project-watch-store/pull/1), producing merge commit `c9b6a00ef2a03816f8c27697f22537f0164e0657`.

The recovery commit `c7e0bda9b2af8d6a77d514e7049ad4f04fda6a85` was directly based on the then-current `main`, `be85d5460ec8b7ee7d06626dcaf4801c2410e91a` (generated Merlock watch imagery). There were no intervening main commits and no merge conflicts. The generated watch images, admin files and storefront checkout script were unchanged, and no files were deleted. Any `sources/` files are read-only reference material.

Navigation and playback icons use Lucide geometry; its license is included in `assets/lucide-license.txt`.

## Five-watch collection

The uploaded collage is preserved as `sources/merlock-five-watch-collection.png`. Its five panels are cropped without the dividing lines into optimized WebP files in `assets/watches/`. The Verdant, Mariner, Obsidian, Argent and Voyager join the two existing watches in the storefront, search, checkout and admin catalogue. Names, prices and initial stock levels are illustrative and editable in admin; descriptions refer to the visible designs rather than verified specifications.

Returning browsers receive the five new listings once without changing existing products, custom edits or order snapshots. Once saved, the migration marker also preserves later edits and deletions to the new products. Product cards use centered square framing, trimming excess landscape background while preserving the watches. The tall Selene photo fits within the square to preserve its bracelet. The Aster listing and its skeleton image have been removed; historical order snapshots remain intact.

## Background piano

Visitors can turn on Chopin’s Waltz in A minor using the fixed Piano control and adjust its volume. Audio is off on every page load and downloads only after interaction. It loops independently of the silent hero video, pauses when the tab is hidden, and resumes only if the visitor had enabled it. Playback errors leave the control off with an accessible status message.

The composition is public domain. The recording is from craftonautJP’s Imperfect Piano Performances; its README dedicates the recordings under CC0, and its LICENSE includes the Unlicense public-domain dedication. See `assets/music/credits.txt` for sources and processing details.
