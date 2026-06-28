# Rêves — Architecture du site

Boutique e-commerce de **Rêves** (organisation de concerts à Paris et au Japon).
Site **statique multi-pages** en HTML / CSS / JavaScript **vanilla**, sans build, sans dépendance, sans framework.

---

## 1. Philosophie technique

- **Zéro build** : on ouvre les fichiers directement, ou on sert le dossier avec n'importe quel serveur statique.
- **Zéro dépendance** runtime (pas de npm en prod, pas de bundler).
- **Vanilla JS** dans une IIFE (`app.js`), partagé entre toutes les pages.
- **Panier persistant** côté client via `localStorage` (pas de backend).
- **Mobile-first dans l'esprit**, mais écrit en *desktop-first* (styles de base = desktop, surcharges via `@media (max-width: …)`).

### Lancer le site

```bash
cd site
python3 -m http.server 8753
# puis http://localhost:8753/index.html
```

> Tout serveur statique fait l'affaire (`npx serve`, Live Server, etc.).
> Les embeds Spotify nécessitent une connexion réseau.

---

## 2. Arborescence

```
site/
├── index.html          # Homepage (grille produits)
├── product.html        # Page produit (paramétrée par ?id=…)
├── cart.html           # Panier
├── css/
│   └── style.css       # TOUT le style + responsive + animations
├── js/
│   ├── data.js         # Données produits (catalogue)
│   └── app.js          # Logique partagée (header, menu, i18n, panier, pages)
├── assets/             # Images (logo, t-shirts, grue, typographies…)
└── ARCHITECTURE.md     # Ce fichier
```

Les 3 pages HTML sont volontairement **minimales** : elles ne contiennent que des
conteneurs vides (`<div id="…">`) ; tout le contenu est injecté par `app.js`.

---

## 3. Design system

Défini dans `:root` (`css/style.css`) et d'après les maquettes `/maquettes`.

| Token | Valeur | Usage |
|-------|--------|-------|
| `--blue` | `#1f00ff` | Fond du site (échantillonné sur les maquettes) |
| `--white` | `#ffffff` | Texte, bordures |
| `--border` | `2px solid #fff` | Bordures cartes / panneaux / boutons |
| `--maxw` | `1320px` | Largeur max du contenu centré |
| `--header-h` | `128px` | Hauteur du header (réduite en responsive) |
| `--sans` | Helvetica Neue / Helvetica / Arial | Police principale |

Autres règles transverses :
- `letter-spacing: -0.09em` (-9 %) sur **tout** le texte Helvetica (`body`).
- Le **logo** est `assets/logo.png` (wordmark bleu) repassé en **blanc** via `filter: brightness(0) invert(1)`.
- **Motifs récurrents** : double trait blanc en **diagonale** (`-40°`) et **grue origami** colorée (`papercrane.png`).

---

## 4. Modèle de données (`js/data.js`)

Catalogue exposé en global :

```js
window.PRODUCTS = [ { … }, … ];   // 5 produits
window.HOME_CARDS = ["bleached", "lbady-white", "lbady-blue", "other"];
window.getProduct = (id) => …;    // helper
```

### Schéma d'un produit

| Champ | Type | Description |
|-------|------|-------------|
| `id` | string | Identifiant (clé d'URL `product.html?id=…`) |
| `label` | string | Nom court (cartes d'accueil) |
| `name` | string | Nom complet (titre de la page produit ; `\n` = saut de ligne) |
| `typo` | string \| null | Image typographique manuscrite du nom |
| `price` | number | Prix en € |
| `available` | bool | `false` = SOLD OUT (bouton désactivé, pas de tailles) |
| `spotify` | string? | ID d'album Spotify (embed) |
| `card` | string | Image sur la carte d'accueil |
| `images` | string[] | Galerie (miniatures + image principale) |
| `info` | string | Texte descriptif (panneau INFORMATIONS) |

### Les 5 produits

| id | Nom | Prix | Stock |
|----|-----|------|-------|
| `bleached` | Bleached T-shirt | 30 € | dispo |
| `lbady-white` | Le bleu a des yeux — T-shirt blanc | 30 € | dispo |
| `lbady-blue` | Le bleu a des yeux — T-shirt bleu | 30 € | dispo |
| `jersey` | Jersey Rêves 8 | 40 € | **SOLD OUT** |
| `cd` | CD — Le bleu a des yeux | 15 € | **SOLD OUT** |

`HOME_CARDS` affiche 3 t-shirts + une carte **« Autres produits »** (`id=other`)
qui regroupe le jersey et le CD (image composite `other-products.png`).

---

## 5. Pages

Chaque page = `<body data-page="…">` + conteneurs vides. `app.js` lit `data-page`
au `DOMContentLoaded` et appelle l'initialiseur correspondant.

### `index.html` — Homepage (`data-page="home"`)
- Grille de cartes (`#grid`), centrée verticalement, 90 % de large, cartes à 24 %.
- Chaque carte : bandeau **prix** (fond blanc) + icône **déplacer** en haut, image au centre, **nom** (fond bleu) en bas.
- Carte « Autres produits » : prix = `Sold out`, sans badge.
- **Drag & drop** : maintenir le clic sur l'icône déplacer fait glisser la carte (cf. §7).

### `product.html` — Page produit (`data-page="product"`)
Lue via `?id=…`. Structure :
- `.product__head` (**fixe**, aligné sous le logo) : titre + prix.
- `.product__stage` : image principale.
- `.product__controls` : `INFORMATIONS` (panneau dépliable) | miniatures | tailles + boutons.
- `.product__spotify` : lecteur Spotify (**fixed** à droite sur grand écran, sinon dans le flux).
- Boutons : **Ajouter au panier** + **Voir le panier** (ce dernier apparaît au 1ᵉʳ ajout et rétrécit l'autre).
- `?id=other` → mode galerie jersey/CD (sold out, sélection par miniatures).

### `cart.html` — Panier (`data-page="cart"`)
- Titre `CART`, lignes produit (miniature, nom, prix, quantité `− n +`, suppression `×`), total, **CHECKOUT** (simulé), **Continue shopping**.
- Rendu depuis `localStorage`, re-rendu au changement de langue.

### Menu overlay (toutes les pages)
Injecté par `app.js`. Contient logo, liens **Accueil / Contact / Panier (n)**,
sélecteur de langue **FR / EN / JP**, et la grue. Animations d'ouverture/fermeture (cf. §8).

---

## 6. Logique partagée (`js/app.js`)

Tout est encapsulé dans une **IIFE**. Sections principales :

| Bloc | Rôle |
|------|------|
| `I18N` + `getLang`/`setLang`/`t` | Dictionnaire FR/EN/JP, langue dans `localStorage` (`reves_lang`) |
| Panier | `loadCart`/`saveCart`/`addToCart`/`setQty`/`removeItem`/`cartCount`/`cartTotal` (clé `reves_cart`) |
| `buildHeader` | Injecte logo + burger dans `#site-header` |
| `buildMenu` | Injecte l'overlay menu, câble langue + ouverture/fermeture |
| `applyLang` / `updateBadge` / `updateCartNav` | Met à jour textes i18n, compteur, lien « Panier (n) » |
| `makeCardDraggable` | Drag des cartes d'accueil |
| `initHome` / `initProduct` / `initOther` / `initCart` | Rendu spécifique par page |
| `spotifyEmbed(albumId)` | Génère l'iframe Spotify (compact, hauteur 152) |
| `window.toggleInfo` | Ouvre/ferme le panneau INFORMATIONS |

**Boot** (bas de fichier) :

```js
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.getAttribute("data-page");
  buildHeader({ back: page === "product" });
  buildMenu();
  if (page === "home")    initHome();
  else if (page === "product") initProduct();
  else if (page === "cart")    initCart();
  applyLang();
  updateBadge();
});
```

### État client (localStorage)
- `reves_cart` : `[{ id, size, qty }]`
- `reves_lang` : `"fr" | "en" | "jp"`

---

## 7. Drag des cartes (homepage)

`makeCardDraggable(handle)` sur chaque `.card__move` :
- `pointerdown` → `setPointerCapture`, désactive la transition, `z-index` élevé.
- `pointermove` → `transform: translate(dx, dy)` cumulatif.
- `pointerup` → fige l'offset ; si déplacement réel, bloque la navigation du lien (le clic suivant est `preventDefault`).
- Souris **et** tactile (Pointer Events). Un simple clic sur la poignée ne navigue pas.

> Le `transform` inline du drag n'entre pas en conflit avec l'animation d'apparition
> des cartes car celle-ci utilise `animation-fill-mode: backwards` (ne fige aucun transform après coup).

---

## 8. Animations (`css/style.css`)

| Élément | Effet |
|---------|-------|
| Diagonales | Tracé `scaleX 0→1` (`@keyframes diag-before/after`) à l'arrivée |
| Header / cartes / image / panier | `fade-up` / `fade-in` en cascade (délais échelonnés) |
| Grue (coin + menu) | Flottement continu `@keyframes crane-float` |
| **Menu — ouverture** | Wipe **droite → gauche** via `clip-path: inset(…)` (`@keyframes menu-open`) |
| **Menu — fermeture** | Glisse **vers la droite** via `translateX` (`@keyframes menu-close`, classe `.closing`) |
| Grue du menu | Arrive **depuis la gauche** (`translateX(-130%) → 0`) à l'ouverture |

Détails menu :
- Pas de `transition` sur `.menu` : ouverture et fermeture sont **deux keyframes distinctes** (évite le double-rejeu).
- L'état fermé de base (`translateX(100%)`) = fin du slide → aucun saut.
- `overflow: hidden` sur `.menu` empêche ses enfants (la grue) de réapparaître hors écran.
- `closeMenu()` pose la classe `.closing`, nettoie sur `animationend` (+ garde-fou `setTimeout`).

**Accessibilité** : tout est désactivé sous `@media (prefers-reduced-motion: reduce)`.

---

## 9. Responsive

Styles de base = desktop. Quatre paliers de surcharge :

| Breakpoint | Cible | Principales adaptations |
|------------|-------|-------------------------|
| `≤ 1400px` | desktop étroit | L'embed Spotify repasse **dans le flux** (plus de flottant à droite faute de marge) |
| `≤ 1024px` | tablette | Grille 2 colonnes ; homepage non centrée verticalement ; contrôles produit **empilés** ; titre+prix dans le flux ; boutons empilés |
| `≤ 720px` | mobile | Header centré (logo réduit), burger/flèche, diagonale + grue masquées, grille 1 colonne, panier reflowé, menu ajusté |
| `≤ 460px` | petit téléphone | Logo/paddings réduits, tailles de police adaptées, menu compacté |

`--header-h` et la taille du logo décroissent par palier (128/104 → 104/76 → 92/60).

---

## 10. i18n (FR / EN / JP)

- Dictionnaire `I18N` dans `app.js`, langue par défaut **FR**.
- Les éléments statiques portent `data-i18n="clé"` ; `applyLang()` remplace leur `textContent`.
- Cas spéciaux gérés en JS : lien **« Panier (n) »** (`updateCartNav`), libellés dynamiques des pages.
- Les **descriptions produits** restent en français (non traduites).

---

## 11. Assets (`site/assets/`)

| Fichier | Usage |
|---------|-------|
| `logo.png` | Wordmark « Rêves » (recoloré en blanc via CSS) |
| `papercrane.png` | Grue origami (coin de page + menu) |
| `bleached-front/back/both.png` | T-shirt Bleached |
| `lbady-white-front/back.png`, `lbady-blue-front/back.png` | T-shirts Le bleu a des yeux |
| `jersey.png`, `lbady-cd.png` | Produits sold out |
| `other-products.png` | Composite jersey + CD (carte « Autres produits ») |
| `bleached-typo.png`, `lbady-typo.png` | Typographies manuscrites des noms |

> Les images produits ont été **optimisées** (max 1200px) pour le web.

---

## 12. Conventions & limites

- **Cache-busting** : les `<link>`/`<script>` portent `?v=N` ; incrémenter `N` à chaque modif de `css`/`js` force le rechargement (cf. les `sed` de mise à jour).
- **Paiement** : le bouton CHECKOUT est **simulé** (aucun back-end / aucune passerelle).
- **Contact** : le lien du menu pointe vers un `mailto:` placeholder.
- **Typographies manuscrites** : ce sont des images figées ; changer le texte du nom n'affecte pas l'image (`*-typo.png`).
- **Pas de tests automatisés** versionnés (la validation s'est faite via `jsdom` en cours de dev).
