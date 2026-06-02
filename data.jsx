// Meyva Collection — Tunisian gift shop product data (French)

const PRODUCTS = [
  {
    id: 'pack-polaroid-led',
    name: 'Pack Polaroid + LED',
    cat: 'Packs',
    fromPrice: 8,
    price: 8,
    badge: 'Best-seller',
    desc: 'Mini-photos imprimées sur papier mat + clips en bois + guirlande LED chaude. Choisis le nombre de photos selon ton mur.',
    long: 'Le pack signature : tes photos préférées imprimées en mini-format polaroid (5,4 × 8,6 cm), accompagnées de pinces en bois et d\u2019une guirlande LED chaude à piles. Parfait pour habiller un mur, une tête de lit ou un coin de bureau. Envoie-nous tes photos sur Instagram après la commande.',
    swatch: 'pack',
    tiers: true,
  },
  {
    id: 'polaroid-10',
    name: 'Polaroïd prints — Pack 10',
    cat: 'Photos',
    price: 10,
    desc: 'Tes 10 photos imprimées en format polaroid, sans LED ni clips. Idéal pour offrir.',
    long: 'Dix mini-photos imprimées sur papier mat de qualité. Bord blanc style polaroid. Envoie-nous tes images après la commande.',
    swatch: 'photos',
  },
  {
    id: 'stickers-mood',
    name: 'Sticker pack — Mood',
    cat: 'Stickers',
    price: 12,
    badge: 'Personnalisable',
    desc: 'Mélange de stickers ambiance douce et pastel. Mix sur mesure possible.',
    long: 'Une sélection de 30+ stickers thème mood doux, pastel et fleuri. Indique-nous tes préférences sur Instagram et on adapte le mix.',
    swatch: 'stickers-pink',
  },
  {
    id: 'stickers-anime',
    name: 'Sticker pack — Anime',
    cat: 'Stickers',
    price: 12,
    desc: 'Stickers anime, manga, kawaii. Pour laptop, journal, carnet.',
    long: '30+ stickers thème anime et manga, vinyl résistant à l\u2019eau. Parfait pour un MacBook ou un bullet journal.',
    swatch: 'stickers-anime',
  },
  {
    id: 'stickers-y2k',
    name: 'Sticker pack — Y2K',
    cat: 'Stickers',
    price: 12,
    desc: 'Esthétique Y2K, holographique, fin des années 90.',
    long: '30+ stickers Y2K : papillons holographiques, étoiles, glitter, flames. Vinyl premium.',
    swatch: 'stickers-y2k',
  },
  {
    id: 'poster-vintage',
    name: 'Poster — Vintage moodboard',
    cat: 'Posters',
    price: 5,
    secondary: '3 pour 10 DT',
    desc: 'Poster A4 sur papier mat. Imprimé chez nous.',
    long: 'Poster A4 (21 × 29,7 cm) imprimé sur papier mat 200g. Esthétique vintage moodboard. 3 posters au choix pour 10 DT.',
    swatch: 'poster-vintage',
  },
  {
    id: 'poster-aura',
    name: 'Poster — Aura print',
    cat: 'Posters',
    price: 5,
    secondary: '3 pour 10 DT',
    desc: 'Aura colorée, dégradés doux. Format A4.',
    long: 'Poster A4 imprimé sur papier mat 200g. Dégradés aura inspirés des tests d\u2019aura. 3 posters au choix pour 10 DT.',
    swatch: 'poster-aura',
  },
  {
    id: 'bougie-rose',
    name: 'Bougie parfumée — Rose',
    cat: 'Bougies',
    price: 18,
    desc: 'Bougie en cire de soja parfum rose. Pot en verre 100g.',
    long: 'Bougie artisanale en cire de soja, parfum rose poudrée. Pot en verre transparent, mèche en coton, durée d\u2019environ 25 heures.',
    swatch: 'bougie',
  },
  {
    id: 'certificat',
    name: 'Certificat personnalisé',
    cat: 'Cadeaux',
    price: 8,
    badge: 'Custom',
    desc: 'Certificat imprimé avec ton texte. Pour offrir avec tendresse.',
    long: 'Certificat A5 imprimé sur papier épais avec ton texte personnalisé : dédicace, remerciement, déclaration. Envoie-nous le texte par message Instagram.',
    swatch: 'certificat',
  },
];

const CATEGORIES = ['Tout', 'Packs', 'Photos', 'Stickers', 'Posters', 'Bougies', 'Cadeaux'];

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

// Produits en préparation : affichés en avant-première mais pas encore en vente.
// Ajoute / retire des entrées ici quand un nouveau produit est prêt à être teasé.
// Pour lancer un produit, déplace-le simplement dans PRODUCTS ci-dessus.
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

window.MEYVA_DATA = { PRODUCTS, CATEGORIES, PHOTO_TIERS, COMING_SOON };
