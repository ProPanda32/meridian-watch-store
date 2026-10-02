# Merlock Watch Store — Demo

A luxury watch storefront and owner dashboard, built for demonstrations.

## Try it

Run `npm start` with Node.js 20 or later, then open http://localhost:3000. No dependencies or owner password setup are required.

You can also host the files on a static website service. Serve both pages at the same origin. Opening separate file: URLs is not recommended because browser storage sharing varies.

1. Add watches to the bag.
2. Choose **Demo checkout**, use fictional details, and select **Place demo order**.
3. Track the sample order from its confirmation, or use **Admin sign-in** in the storefront footer.
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
- 54 initial sample orders spanning April–October 2026.
- Original order price snapshots, independent of later product price changes.

Checkout validates the latest stock and reduces inventory only after a successful save. Failed saves do not clear the bag or show a success confirmation. No payments are taken, no emails are sent, and no real orders are transmitted to a server.

Cancelled orders do not automatically restock; adjust demo stock in Products when needed. Payment statuses are illustrative records only.

## Storage

Data lives in browser local storage under `meridian-preview-v1` (retained for compatibility with earlier demo versions). Pages must be on the same origin, in the same browser profile, to share orders. Data persists on refresh, but is not shared between devices or visitors and is lost when this site's browser data is cleared.

The live workspace, login API, database and real-order backend have been removed for now. The optional Node server serves static files only. GitHub Pages or any static host can run the full demo.

## Checks

Run `npm test` for the data, analytics, shopping, music-control and static-server regression tests. The suite covers checkout snapshots and stock, discounts, saved-bag validation, catalogue filters, historical demo-data migration, analysis calculations and CSV safety, reset behaviour, music fades and media delivery.

Browser verification also checks saved favourites and bags across refreshes, the three-watch comparison limit, gallery zoom and extra photos, discount checkout through tracking, filtered CSV downloads, reset cancellation/confirmation, and 320–1280px layouts. Those browser checks are separate from the Node test suite.

## Files

- `index.html`, `storefront.css`, `storefront.js`: storefront and demo checkout
- `landing.js`: film playback, scroll effects, navigation and product search
- `admin.html`, `admin.css`, `admin.js`: dashboard and demo login
- `store.js`: shared browser-local data, order creation, discounts and demo reset
- `shop.js`: shared catalogue metadata, filters and saved-bag validation
- `analytics.js`: sales calculations, date filtering and CSV formatting
- `server.mjs`: optional static preview server
- `test/demo.test.mjs`: shared checkout model tests
- `test/server.test.mjs`: static assets and video streaming tests

## Watch imagery

Original AI-generated images from the **Create Watch Image** chat, bundled as optimized WebP files in `assets/watches/`. The champagne-gold moonphase and white-and-gold midnight-blue images remain in the collection.

The sample collection is **The Aurelia** and **The Selene**. Existing browser data automatically replaces the original stock images and unedited catalogue names, styles and descriptions while preserving custom edits, prices, stock, visibility and existing order snapshots. Admin accepts HTTPS image URLs or bundled `assets/watches/*.webp` paths.

Names and prices remain illustrative sample data.

## Landing media

The supplied `Complete Landing Page Video.mp4` is prepared for the web as `assets/watches/landing-page-video.mp4` (H.264, 1920 × 1080, approximately 16 MB) and `assets/watches/landing-page-video.webm` (VP9, approximately 12 MB). The browser loads one supported format. `assets/watches/landing-page-poster.webp` is a still from the film.

The film is silent. Playback starts muted when motion is allowed, pauses offscreen, and stays paused after a visitor pauses it. Reduced-motion visitors see the poster and can choose to play the film.

## Recovery status

`recovery/watch-landing-2026-10-01` was merged into `main` on 1 October 2026 in [PR #1](https://github.com/ProPanda32/project-watch-store/pull/1), producing merge commit `c9b6a00ef2a03816f8c27697f22537f0164e0657`.

The recovery commit `c7e0bda9b2af8d6a77d514e7049ad4f04fda6a85` was directly based on the then-current `main`, `be85d5460ec8b7ee7d06626dcaf4801c2410e91a` (generated Merlock watch imagery). There were no intervening main commits and no merge conflicts. The generated watch images, admin files and storefront checkout script were unchanged, and no files were deleted. Any `sources/` files are read-only reference material.

Navigation and playback icons use Lucide geometry; its license is included in `assets/lucide-license.txt`.

## Five-watch collection

The uploaded collage is preserved as `sources/merlock-five-watch-collection.png`. Its five panels are cropped without the dividing lines into optimized WebP files in `assets/watches/`. The Verdant, Mariner, Obsidian, Argent and Voyager join the two existing watches in the storefront, search, checkout and admin catalogue. Names, prices and initial stock levels are illustrative and editable in admin; descriptions refer to the visible designs rather than verified specifications.

Returning browsers receive the five new listings once without changing existing products, custom edits or order snapshots. Once saved, the migration marker also preserves later edits and deletions to the new products. Product cards use centered square framing, trimming excess landscape background while preserving the watches. The Selene photo has a seamlessly extended square studio background, preserving its whole bracelet and matching the other product cards without side bars. The Aster listing and its skeleton image have been removed; historical order snapshots remain intact.

## Background piano

Chopin’s Prelude in A major, Op. 28 No. 7 attempts to start automatically at 20% volume. The header music-note button beside Our perspective toggles playback, and its volume panel appears on interaction or keyboard focus and closes immediately when the page scrolls or after three seconds of inactivity (while allowing uninterrupted dragging). Browsers that block audible autoplay show the icon as off; music retries on the first interaction outside the control, or starts when the visitor clicks the icon. Turning music off prevents interaction-based retries. It loops independently of the silent hero video, pauses when the tab is hidden, and resumes while music remains enabled. Playback errors leave the control off with an accessible status message.

The composition is public domain. The recording is from craftonautJP’s Imperfect Piano Performances; its README dedicates the recordings under CC0, and its LICENSE includes the Unlicense public-domain dedication. See `assets/music/credits.txt` for sources and processing details.

The piano recording is normalized to -26 LUFS, starts at 20% volume and fades gently in and out. This slower major-key prelude replaces the earlier waltz.

## Header and wordmark

The fixed header overlays the full-height hero with white navigation on a transparent background at the top. After scrolling it transitions to the storefront’s chalk-white background and dark navigation. The scroll-linked film animation starts at zero progress with the header overlay. The MERLOCK wordmark uses locally hosted Bodoni Moda, licensed under the SIL Open Font License (`assets/fonts/OFL.txt`).

## Dress and sport collection

The second uploaded collage is renamed `sources/merlock-dress-and-sport-collection.png`. Its five watches are individually cropped into square WebP images, omitting divider lines and keeping each full watch visible. The Estelle, Luna, Sylvan, Elara and Eclipse bring the default catalogue to 12 products. Their prices and initial stock levels are sample values editable in admin.

Returning browsers receive this collection once while retaining existing catalogue edits, stock levels and order snapshots. Later changes or deletions to the new listings are preserved once saved. All five listings work with storefront details, search, checkout and admin editing.

## Collection tabs

All watches is selected on page load and shows the full active catalogue. Four themes contain three watches each: Celestial (Aurelia, Selene, Luna), Dress (Estelle, Elara, Argent), Sport (Mariner, Sylvan, Voyager), and Statement (Verdant, Obsidian, Eclipse). Any extra products added in admin appear in All watches. Tab counts reflect active products; existing search still covers the whole catalogue.

Tabs support click, arrow keys, Home and End, with one keyboard tab stop and a labelled product panel. Switching collections preserves the bag and the current collection survives stock updates and checkout. On mobile the tab strip scrolls horizontally.

## Sold-out watches

An active watch with zero stock remains in its collection with a Sold out badge and disabled add button. Product details reflect stock changes while open. Returning stock restores the original badge and add button. Bag updates remove watches that become unavailable, and both add-to-bag and checkout validate the latest stock.

Switching watch tabs uses a short fade-out followed by a gentle fade-and-slide in, with animated panel height between All watches and smaller groups. Rapid selections cancel earlier transitions. Reduced-motion visitors switch immediately.

The shopping bag includes square watch thumbnails beside each item.


Collection cards and product details show Add to bag at zero quantity and matching-size minus/quantity/plus controls after adding. Plus is disabled when the bag reaches available stock.

## Shopping demo features

- Search within the collection; filter by dial colour, strap, price and stock. Sorting offers featured, price, name and popularity from non-cancelled demo orders. Filters work alongside the themed tabs.
- Save watches with the heart button. Open Saved watches above the collection or in the menu. Favourites and the bag persist in this browser; stock changes cap quantities and remove unavailable products.
- Select two or three watches using Compare on each card, then open the comparison. Specifications are illustrative; they are not verified manufacturing or performance claims.
- Product details include a full-watch view, a cropped dial view, tap-to-zoom and two clearly labelled fictional reviews. Admin product editing accepts up to six additional image URLs for the gallery. The bundled watches retain their original image; detail views use that image rather than inventing alternate photographs.
- Apply WELCOME10 (10%) or MERLOCK15 (15%) in the bag. The checkout records the discount and original item prices, and admin/analysis display the discounted value. One code per order; no real promotion or payment is involved.
- Track an order with its number and fictional email from the confirmation, menu or footer. Try sample order DEMO-1003, or use Advance demo status to simulate Processing → Shipped → Delivered. Changes also appear in admin; there is no carrier integration.
- The brand story and FAQ explain the collection, demo checkout, saved watches, sample reviews and tracking.

## Analysis and reset

Analysis supports an inclusive date range, order-value/units/order-count charts, monthly differences, and best sellers filtered by month. Cancelled orders are excluded. Values include demo and unpaid orders, with recorded discounts deducted; they are not cash receipts. Monthly and product CSV exports respect the selected filters. Months without orders between the first and last month appear as zero values. Current or date-filtered months can be incomplete.

Settings → Reset demo restores the twelve-watch catalogue, original stocks, sample order history and store settings, and clears saved watches, the bag, applied code and last order reference. A confirmation is required. Unrelated local-storage data and the current admin sign-in are retained. Export CSVs first if you want to keep the analysis.

## Distinct watch backgrounds

Watches 3–12 use a restrained palette of warm charcoal, muted slate, graphite, espresso and champagne taupe, with softly diffused background lighting. The clean ImageGen edits are resized to the original image dimensions and saved as WebP. These replace the earlier masked composites, removing the gold outlines around the watches. `sources/watch-backgrounds.json` records the image mapping; saved product references migrate to the clean images. The original images remain available for reference and existing gallery links. Aurelia and Selene are unchanged.

`manifest.json` maps the previous bundled images to the new assets. Returning browsers update those default image paths while preserving custom image URLs, product edits and order history. New asset names avoid displaying a cached version of the previous background.

Checkout collects fictional delivery addresses and optional instructions, with normal (£15, 3–5 working days) or express (£30, 1–2 working days) delivery. Postage is added after watch discounts and saved with the order. Card and digital-wallet options are simulated; no card information is collected or payment processed. Admin order details show the address, instructions, delivery method, postage and demo payment method. Legacy orders retain their totals; sales analysis excludes postage.

The Accessories tab contains an espresso leather strap (£95), single-watch travel case (£125) and watch care kit (£35), with individual AI-generated product images. Accessories are excluded from All watches and the four watch themes. Available accessories are suggested at checkout when the bag contains a watch; sold-out, hidden and already-added accessories are omitted. They share stock validation, quantity controls, discounts, checkout and admin management with watches. The product editor includes a Watch/Accessory type selector, and existing catalogues receive the accessories once without overwriting edits or restoring removed products.
