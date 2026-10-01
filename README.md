# Merlock Watch Store

Luxury watch storefront with separate demo and protected live owner workspaces.

## Features

- Product price, stock, visibility, image and description editing; add products.
- Order search, fulfilment status, payment records and internal notes.
- Demo workspace with three sample orders stored only in this browser.
- Live workspace with owner sign-in and manually entered real orders.
- Orders reduce inventory and retain original product names and prices.
- Store name and announcement editing.
- SQLite persistence, server validation, revision conflict protection, HTTP-only sessions, CSRF protection and sign-in rate limiting.

## Demo preview

Open admin.html for demo mode. Serve files over HTTP for reliable shared local storage. On a running server, the demo's View storefront link opens index.html?demo=1; the normal storefront loads the shared live catalogue. Demo orders and live orders remain separate.

## Run locally

Use Node.js 24.14 or later. No npm dependencies or installation are needed.

Set ADMIN_PASSWORD to a unique password of at least 14 characters, then run npm start. Store the password as an environment variable; never commit it.

PowerShell:

```powershell
$env:ADMIN_PASSWORD = Read-Host 'Enter a unique owner password (14+ characters)' -MaskInput
npm start
```

Open http://localhost:3000/admin.html, select Live workspace and sign in. The live workspace starts with the sample watch catalogue and ZERO orders. Replace sample products with accurate details before adding genuine orders.

Use Orders → Add order to enter a customer name, email, product, quantity and payment record. The form records payments received elsewhere; it does not charge customers. Customer checkout and automatic order submission are not implemented.

Cancelled orders do not automatically restock or issue refunds. Adjust stock manually when appropriate. Existing order prices cannot be rewritten through product price edits.

## Host the live store

GitHub Pages and other static hosting run the demo only. The live workspace needs a Node server with HTTPS and a persistent writable disk.

| Environment variable | Value |
| --- | --- |
| ADMIN_PASSWORD | Strong unique password stored as a host secret |
| NODE_ENV | production |
| APP_ORIGIN | Exact HTTPS origin, e.g. https://your-store.example (no trailing slash) |
| HOST | 0.0.0.0 when required by the hosting provider |
| PORT | Host-assigned port, or 3000 |
| DATABASE_PATH | File on a persistent disk, e.g. /data/store.sqlite |

Start command: npm start. Run one server instance with its persistent database. Default bind address is 127.0.0.1. Terminate HTTPS at the host or reverse proxy. Production cookies use Secure; production requires an HTTPS APP_ORIGIN. Mutation requests from other origins are rejected.

Back up using SQLite-aware backup tools or stop the server before copying its database and journal files. Never commit customer records or databases. Sessions expire after eight hours and are invalidated on server restart.

This version uses one shared owner password. Separate staff accounts, password recovery, MFA and an audit trail are not included.

The dashboard starts in demo mode. Select Live workspace to resume an owner session. If a save conflicts with another tab, select Live workspace again to reload the current server data before retrying.

## Validation

Run npm test. Checks cover owner authentication, origin/CSRF enforcement, private order data, stock limits, immutable price snapshots, stale-write rejection, logout and restricted public files.

Browser checks covered owner sign-in, saving the Merlock name and creating an order in a separate local test database. No test customer records or credentials are included in the repository.

## Files

- index.html: storefront
- admin.html, admin.css, admin.js: owner dashboard
- store.js: browser-local demo model
- catalogue.json: live catalogue seed
- server.mjs: protected API and HTTP server
- test/server.test.mjs: backend tests

catalogue.json seeds new databases only. Change an existing store name using the live dashboard's Settings.

## Photography

Illustrative images by Laura Chouette and Swapnil B via Unsplash:

- https://unsplash.com/photos/black-leather-strap-gold-round-analog-watch-nIB3y79RERU
- https://unsplash.com/photos/black-and-silver-analog-watch-el44aDkmles
- https://unsplash.com/photos/black-and-silver-analog-watch-8xg3pB9V-O4
- https://unsplash.com/photos/a-watch-on-a-wrist-7rj4hxIwdBs

Sample product names and prices do not identify the brands pictured. Replace images with accurate product photography before launching sales.
