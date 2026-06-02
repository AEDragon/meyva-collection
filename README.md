# meyva collection — boutique virtuelle

Single-page React storefront for **meyva collection**, a small Tunisian gift shop
(polaroid photos, stickers, posters, candles, custom certificates).
Built as a single self-contained `index.html` (React + Babel via CDN), with the
component source mirrored in individual `.jsx` files.

Orders are confirmed and paid via Instagram DM — [@meyva__collection](https://instagram.com/meyva__collection).

## Run

It's a static site. Open `index.html` directly in a browser, or serve the folder:

```bash
npx serve .
# then open the printed http://localhost:... URL
```

## Project structure

| File | Role |
| --- | --- |
| `index.html` | The runnable app — all components inlined in one `text/babel` script. |
| `styles.css` | All styling (design tokens, layout, components). |
| `data.jsx` | Product catalogue, categories, photo price tiers, **coming-soon items**. |
| `pages.jsx` | Page components: Home, Shop, ProductDetail, About. |
| `shared.jsx` | Nav, Footer, ProductCard, icons, utility bar. |
| `coming-soon.jsx` | "Bientôt disponible" preview section (products not yet on sale). |
| `swatches.jsx` | SVG product artwork. |
| `polaroid-cluster.jsx` | Hero polaroid + LED cluster. |
| `price-ladder.jsx` | Photo-pack price ladder. |
| `cart-drawer.jsx` | Slide-out cart. |
| `tweaks-panel.jsx` | Design tweak tooling. |

> Note: `index.html` is the source of truth at runtime. The standalone `.jsx`
> files are mirrors of the same components for editing convenience — keep both in
> sync when changing a component.

## Coming Soon section

Products that are prepared but **not yet launched** live in the `COMING_SOON`
array in `data.jsx` (and mirrored in `index.html`). They render in a
"Bientôt disponible" section on the home page as preview-only cards — no add-to-cart,
just a prompt to reserve via Instagram. To launch one, move its entry into
`PRODUCTS`.
