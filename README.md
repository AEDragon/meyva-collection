# meyva collection — boutique virtuelle

Single-page React storefront for **meyva collection**, a small Tunisian gift shop
(polaroid photos, stickers, posters, candles, custom certificates).
Built as a single self-contained `index.html` (React + Babel via CDN), with the
component source mirrored in individual `.jsx` files, plus a few Vercel
serverless functions (`api/`) for orders, uploads and editable site content.

Orders are confirmed and paid via Instagram DM — [@meyva__collection](https://instagram.com/meyva__collection).

## Run

It's a static site. Open `index.html` directly in a browser, or serve the folder:

```bash
npx serve .
# then open the printed http://localhost:... URL
```

Without the Vercel functions (local static serve), the site falls back to the
hardcoded default content and the admin dashboard can't load/save — that part
only works on the deployed site (or `vercel dev`).

## Project structure

| File | Role |
| --- | --- |
| `index.html` | The runnable app — all components inlined in one `text/babel` script. |
| `styles.css` | All styling (design tokens, layout, components). |
| `data.jsx` | Default product catalogue, photo price tiers, promos, **coming-soon items** + `mergeContent` (dynamic content merge). |
| `pages.jsx` | Page components: Home, Shop, ProductDetail, About. |
| `shared.jsx` | Nav, Footer, ProductCard, icons, utility bar. |
| `coming-soon.jsx` | "Bientôt disponible" preview section (products not yet on sale). |
| `news-events.jsx` | Home sections « Annonces » + « Événements » (dashboard-managed). |
| `admin-dashboard.jsx` | The tabbed admin dashboard (orders + content editing). |
| `promos.jsx` | "Grande promotion spéciale" section. |
| `swatches.jsx` | SVG product artwork. |
| `polaroid-cluster.jsx` | Hero polaroid + LED cluster. |
| `price-ladder.jsx` | Photo-pack price ladder. |
| `cart-drawer.jsx` | Slide-out cart. |
| `checkout.jsx` | Checkout form + order capture. |
| `tweaks-panel.jsx` | Design tweak tooling. |
| `api/orders.js` | Order API (create / list / delete, mescolis file streaming). |
| `api/upload.js` | Private customer file upload (custom stickers, certificates). |
| `api/content.js` | **Site content API** — GET public document, PUT admin-only (with previous-version backup). |
| `api/media.js` | Admin-only public image upload (product / post / event photos). |
| `vercel.json` | `/admin` rewrite so the dashboard has its own URL. |

> Note: `index.html` is the source of truth at runtime. The standalone `.jsx`
> files are mirrors of the same components for editing convenience — keep both in
> sync when changing a component.

## Admin dashboard

The shop owner manages the whole site from **`/admin`** (also reachable via the
"Admin" button in the bottom page switcher), behind the existing Clerk sign-in:

- **Commandes** — orders list, customer files, delete, mescolis.tn CSV export.
- **Produits** — add / edit / reorder / delete products, fixed price or photo-tier
  pricing, badge, photos (upload or URL), featured flag, customer-upload flag,
  plus the "Bientôt disponible" list with a one-click **launch** into the shop.
- **Promos** — the "Grande promotion spéciale" cards (empty list hides the section).
- **Annonces** — short news posts shown on the home page ("Quoi de neuf ?").
- **Événements** — markets / fairs / pop-ups shown on the home page.
- **Réglages** — delivery fee, both photo price ladders, and a previous-version
  restore button.

Edits accumulate in a local draft; a sticky **Enregistrer** bar publishes
everything at once via `PUT /api/content`. The document is stored in the Vercel
Blob store (`content/site.json`), and each save keeps the prior version in
`content/site-prev.json` for one-click restore. The storefront fetches
`GET /api/content` on load (edge-cached ~60 s) and merges it over the hardcoded
defaults in `data.jsx` — so the site still renders fine if the API is down.

### Required Vercel env vars

| Var | Used for |
| --- | --- |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage (orders, uploads, content, media). |
| `CLERK_SECRET_KEY` | Server-side verification of the admin's Clerk session. |
| `ADMIN_KEY` | Legacy fallback access key (`?key=` / `x-admin-key`). |

## Coming Soon section

Products that are prepared but **not yet launched** render in a "Bientôt
disponible" section on the home page as preview-only cards — no add-to-cart,
just a prompt to reserve via Instagram. They're managed from the dashboard
(Produits tab → Bientôt disponible), where the **Lancer en boutique** button
converts one into a real product. The `COMING_SOON` array in `data.jsx` only
provides the defaults used before any content has been published.
