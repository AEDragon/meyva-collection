// Meyva Collection — Tunisian gift shop product data (French)
// NOTE : index.html est la version exécutée. Ce fichier est un miroir source.
//
// Depuis le dashboard admin (/admin), tout ce contenu est modifiable en ligne :
// les valeurs ci-dessous ne sont que les DÉFAUTS, remplacés au chargement par
// le document publié via /api/content (voir mergeContent en bas de fichier).

const PRODUCTS = [
  {
    id: 'pack-polaroid-kit',
    name: 'Pack Polaroïd + pinces + LED',
    cat: 'Packs',
    fromPrice: 10,
    price: 10,
    featured: true,
    badge: 'Best-seller',
    image: 'assets/insta/pack-polaroid.jpg',
    desc: 'Tes photos imprimées en format polaroïd, livrées avec les pinces en bois et une guirlande LED lumineuse de 10 m pour les accrocher.',
    long: 'Le pack signature : tes photos préférées imprimées en mini-format polaroïd (5,4 × 8,6 cm), accompagnées des pinces en bois et d’une guirlande LED lumineuse de 10 m pour créer ton mur de souvenirs. Choisis le nombre de photos ci-dessous. Envoie-nous tes photos par message Instagram après la commande.',
    swatch: 'pack',
    tiers: true,
    tierSet: 'kit',
    kitNote: 'Le pack inclut : photos imprimées + pinces (clips en bois) + guirlande LED lumineuse 10 m.',
  },
  {
    id: 'polaroid-prints',
    name: 'Polaroïd — photos seules',
    cat: 'Photos',
    fromPrice: 8,
    price: 8,
    image: 'assets/products/polaroid.jpg',
    desc: 'Tes photos imprimées en format polaroïd, sans accessoires. Choisis ta quantité.',
    long: 'Tes mini-photos imprimées sur papier mat de qualité, bord blanc style polaroïd (5,4 × 8,6 cm). Photos seules, sans pinces ni ficelle. Envoie-nous tes images par message Instagram après la commande.',
    swatch: 'photos',
    tiers: true,
    tierSet: 'prints',
    kitNote: 'Photos imprimées seules (sans pinces ni ficelle).',
  },
  {
    id: 'sticker-unite',
    name: 'Sticker à l’unité — perso',
    cat: 'Stickers',
    price: 1,
    badge: 'Personnalisé',
    image: 'assets/products/stickers.jpg',
    upload: true,
    desc: '1 sticker = 1 DT. Choisis la quantité et dépose ton design.',
    long: 'Crée tes propres stickers : 1 sticker = 1 DT. Choisis le nombre de stickers et dépose ton image / ton design ci-dessous (PNG, JPG…). On les imprime sur vinyle résistant à l’eau. Astuce : profite de l’offre 5 + 3 offerts !',
    swatch: 'stickers-pink',
  },
  {
    id: 'stickers-mood',
    name: 'Pack stickers — Mood',
    cat: 'Stickers',
    price: 12,
    featured: true,
    image: 'assets/products/stickers.jpg',
    desc: 'Packet de 30+ stickers ambiance douce et pastel. Mix sur mesure possible.',
    long: 'Une sélection de 30+ stickers thème mood doux, pastel et fleuri. Indique-nous tes préférences sur Instagram et on adapte le mix.',
    swatch: 'stickers-pink',
  },
  {
    id: 'stickers-anime',
    name: 'Pack stickers — Anime',
    cat: 'Stickers',
    price: 12,
    image: 'assets/products/stickers.jpg',
    desc: 'Packet de 30+ stickers anime, manga, kawaii. Pour laptop, journal, carnet.',
    long: '30+ stickers thème anime et manga, vinyl résistant à l’eau. Parfait pour un MacBook ou un bullet journal.',
    swatch: 'stickers-anime',
  },
  {
    id: 'stickers-y2k',
    name: 'Pack stickers — Y2K',
    cat: 'Stickers',
    price: 12,
    image: 'assets/products/stickers.jpg',
    desc: 'Packet de 30+ stickers esthétique Y2K, holographique, fin des années 90.',
    long: '30+ stickers Y2K : papillons holographiques, étoiles, glitter, flames. Vinyl premium.',
    swatch: 'stickers-y2k',
  },
  {
    id: 'poster-vintage',
    name: 'Poster — Vintage moodboard',
    cat: 'Posters',
    price: 4,
    secondary: '3 pour 10 DT',
    image: 'assets/products/poster-vintage.jpg',
    desc: 'Poster A4 sur papier mat. Imprimé chez nous.',
    long: 'Poster A4 (21 × 29,7 cm) imprimé sur papier mat 200g. Esthétique vintage moodboard. 3 posters au choix pour 10 DT.',
    swatch: 'poster-vintage',
  },
  {
    id: 'poster-aura',
    name: 'Poster — Aura print',
    cat: 'Posters',
    price: 4,
    featured: true,
    secondary: '3 pour 10 DT',
    image: 'assets/products/poster-aura.jpg',
    desc: 'Aura colorée, dégradés doux. Format A4.',
    long: 'Poster A4 imprimé sur papier mat 200g. Dégradés aura inspirés des tests d’aura. 3 posters au choix pour 10 DT.',
    swatch: 'poster-aura',
  },
  {
    id: 'bougie-rose',
    name: 'Bougie parfumée — Rose',
    cat: 'Bougies',
    price: 18,
    featured: true,
    image: 'assets/products/bougie.jpg',
    desc: 'Bougie en cire de soja parfum rose. Pot en verre 100g.',
    long: 'Bougie artisanale en cire de soja, parfum rose poudrée. Pot en verre transparent, mèche en coton, durée d’environ 25 heures.',
    swatch: 'bougie',
  },
  {
    id: 'certificat',
    name: 'Certificat personnalisé',
    cat: 'Cadeaux',
    price: 8,
    badge: 'Custom',
    image: 'assets/products/certificat.jpg',
    upload: true,
    desc: 'Certificat imprimé avec ton texte. Pour offrir avec tendresse.',
    long: 'Certificat A5 imprimé sur papier épais avec ton texte personnalisé : dédicace, remerciement, déclaration. Dépose ton texte ou ton visuel ci-dessous, ou envoie-le par message Instagram.',
    swatch: 'certificat',
  },
];

const CATEGORIES = ['Tout', 'Packs', 'Photos', 'Stickers', 'Posters', 'Bougies', 'Cadeaux'];

// Photos seules (impression uniquement) — d'après la price list officielle
const PHOTO_TIERS = [
  { qty: 10, price: 8 },
  { qty: 20, price: 15 },
  { qty: 30, price: 20 },
  { qty: 40, price: 25 },
  { qty: 50, price: 30 },
  { qty: 60, price: 35 },
  { qty: 70, price: 40 },
  { qty: 80, price: 45 },
  { qty: 90, price: 50 },
];

// Mêmes quantités AVEC pinces (clips) + ficelle pour accrocher les photos
const PHOTO_TIERS_KIT = [
  { qty: 10, price: 10 },
  { qty: 20, price: 17.5 },
  { qty: 30, price: 23 },
  { qty: 40, price: 28.5 },
  { qty: 50, price: 34 },
  { qty: 60, price: 39.5 },
  { qty: 70, price: 45 },
  { qty: 80, price: 50.5 },
  { qty: 90, price: 56 },
];

// Grille tarifaire selon le produit (pack avec accessoires ou photos seules).
// Lit window.MEYVA_DATA (et pas les constantes) pour refléter les prix
// modifiés depuis le dashboard admin.
function tiersFor(product) {
  const D = window.MEYVA_DATA || {};
  const prints = D.PHOTO_TIERS || PHOTO_TIERS;
  const kit = D.PHOTO_TIERS_KIT || PHOTO_TIERS_KIT;
  return product && product.tierSet === 'kit' ? kit : prints;
}

// Affichage des prix à la tunisienne/française : 17,5 DT (virgule, sans .0 inutile)
function money(n) {
  const r = Math.round(Number(n) * 100) / 100;
  return String(r).replace('.', ',') + ' DT';
}

// Produits en préparation : affichés en avant-première mais pas encore en vente.
// Gérables depuis le dashboard (onglet Produits → Bientôt disponible).
const COMING_SOON = [
  {
    id: 'cs-tote',
    name: 'Tote bag personnalisé',
    cat: 'Bientôt',
    eta: 'Bientôt',
    teaser: 'Ton design ou ta photo imprimés sur un tote bag en coton épais. On prépare ça pour la prochaine collection.',
    swatch: 'stickers-pink',
  },
  {
    id: 'cs-mug',
    name: 'Mug photo',
    cat: 'Bientôt',
    eta: 'Bientôt',
    teaser: 'Ta photo préférée sur un mug en céramique. Parfait pour offrir à quelqu’un qu’on aime.',
    swatch: 'photos',
  },
];

// Frais de livraison (DT) — modifiable depuis le dashboard (onglet Réglages)
const DELIVERY_FEE = 8;

// Gouvernorats de Tunisie (pour le formulaire de commande + export mescolis.tn)
const GOUVERNORATS = [
  'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba',
  'Kairouan', 'Kasserine', 'Kébili', 'Le Kef', 'Mahdia', 'La Manouba',
  'Médenine', 'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana',
  'Sousse', 'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan',
];

// Promotions en cours (affichées dans la section « Grande promotion spéciale »)
const PROMOS = [
  {
    id: 'promo-stickers',
    title: 'Offre stickers',
    badge: '5 + 3 offerts',
    highlight: 'Achète 5 stickers, reçois-en 3 gratuitement',
    sub: 'Fais ton propre pack !',
    swatch: 'stickers-pink',
    cta: 'Voir les stickers',
    goCat: 'Stickers',
  },
  {
    id: 'promo-posters',
    title: 'Offre posters',
    badge: '−2 DT',
    highlight: 'Les 3 posters à 10 DT',
    sub: 'Au lieu de 12 DT',
    swatch: 'poster-vintage',
    cta: 'Voir les posters',
    goCat: 'Posters',
  },
];

// Annonces (posts) et événements — gérés depuis le dashboard admin.
// Vides par défaut : les sections correspondantes n'apparaissent sur le site
// que lorsqu'un contenu a été publié.
const POSTS = [];
const EVENTS = [];

window.MEYVA_DATA = { PRODUCTS, CATEGORIES, PHOTO_TIERS, PHOTO_TIERS_KIT, tiersFor, COMING_SOON, DELIVERY_FEE, GOUVERNORATS, PROMOS, POSTS, EVENTS };
window.money = money;

// ── content-store ─────────────────────────────────────────────────────────────
// Fusionne le document de contenu publié (GET /api/content) par-dessus les
// valeurs par défaut codées en dur. Les données du code restent le fallback :
// si l'API est injoignable, le site s'affiche normalement.
function mergeContent(base, doc) {
  if (!doc || typeof doc !== 'object') return base;
  const next = Object.assign({}, base);
  // Produits : ne jamais accepter une liste vide (le serveur l'interdit aussi).
  if (Array.isArray(doc.products) && doc.products.length) next.PRODUCTS = doc.products;
  // Les sections optionnelles acceptent une liste vide (= section masquée).
  if (Array.isArray(doc.comingSoon)) next.COMING_SOON = doc.comingSoon;
  if (Array.isArray(doc.promos)) next.PROMOS = doc.promos;
  if (Array.isArray(doc.posts)) next.POSTS = doc.posts;
  if (Array.isArray(doc.events)) next.EVENTS = doc.events;
  if (Array.isArray(doc.photoTiers) && doc.photoTiers.length) next.PHOTO_TIERS = doc.photoTiers;
  if (Array.isArray(doc.photoTiersKit) && doc.photoTiersKit.length) next.PHOTO_TIERS_KIT = doc.photoTiersKit;
  if (typeof doc.deliveryFee === 'number' && doc.deliveryFee >= 0) next.DELIVERY_FEE = doc.deliveryFee;
  // Catégories dérivées des produits (ordre d'apparition), « Tout » en premier.
  const cats = [];
  next.PRODUCTS.forEach((p) => { if (p.cat && !cats.includes(p.cat)) cats.push(p.cat); });
  next.CATEGORIES = ['Tout'].concat(cats);
  next.tiersFor = base.tiersFor;
  return next;
}
window.mergeContent = mergeContent;
