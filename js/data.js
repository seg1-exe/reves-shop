/* Données produits Rêves */
window.PRODUCTS = [
  {
    id: "bleached",
    label: "T-shirt",
    name: "Bleached T-shirt",
    typo: "assets/bleached-typo.png",
    price: 30,
    available: true,
    spotify: "3fm5uEHogwcjhaWsR4RboN",
    card: "assets/bleached-front.png",
    images: [
      "assets/bleached-front.png",
      "assets/bleached-back.png",
      "assets/bleached-both.png"
    ],
    info:
`Oversize et coton épais !
Sérigraphie artisanale par @arcane_etoile — 100% Coton.
Design original par Rêves & aoibluevi
+ typographie par Romain Pisa

Dimensions :
XS : 74cm longueur / 54cm largeur
S : 76cm longueur / 57cm largeur
M : 78cm longueur / 60cm largeur
L : 80cm longueur / 63cm largeur
XL : 82cm longueur / 66cm largeur`
  },
  {
    id: "lbady-white",
    label: "T-shirt White version",
    name: "Le Bleu Des Yeux T-shirt",
    typo: "assets/lbady-typo.png",
    price: 30,
    available: true,
    spotify: "0oTghbuoMeHAdBLcUaDHvc",
    card: "assets/lbady-white-front.png",
    images: [
      "assets/lbady-white-front.png",
      "assets/lbady-white-back.png"
    ],
    info:
`« Le Bleu Des Yeux » — version blanche.
Oversize et coton épais ! Sérigraphie bleue artisanale sur coton blanc — 100% Coton.
Design original par Rêves & aoibluevi.

Dimensions :
XS : 74cm longueur / 54cm largeur
S : 76cm longueur / 57cm largeur
M : 78cm longueur / 60cm largeur
L : 80cm longueur / 63cm largeur
XL : 82cm longueur / 66cm largeur`
  },
  {
    id: "lbady-blue",
    label: "T-shirt Blue version",
    name: "Le Bleu Des Yeux T-shirt",
    typo: "assets/lbady-typo.png",
    price: 30,
    available: true,
    spotify: "0oTghbuoMeHAdBLcUaDHvc",
    card: "assets/lbady-blue-front.png",
    images: [
      "assets/lbady-blue-front.png",
      "assets/lbady-blue-back.png"
    ],
    info:
`« Le Bleu Des Yeux » — version bleue.
Oversize et coton épais ! Sérigraphie blanche artisanale sur coton bleu — 100% Coton.
Design original par Rêves & aoibluevi.

Dimensions :
XS : 74cm longueur / 54cm largeur
S : 76cm longueur / 57cm largeur
M : 78cm longueur / 60cm largeur
L : 80cm longueur / 63cm largeur
XL : 82cm longueur / 66cm largeur`
  },
  {
    id: "jersey",
    label: "Jersey Rêves 8",
    name: "Jersey Rêves 8",
    typo: null,
    price: 40,
    available: false,
    card: "assets/jersey.png",
    images: ["assets/jersey.png"],
    info:
`Jersey officiel Rêves 8.
Édition limitée. Actuellement épuisé.`
  },
  {
    id: "cd",
    label: "CD — Le Bleu Des Yeux",
    name: "CD — Le Bleu Des Yeux",
    typo: "assets/lbady-typo.png",
    price: 15,
    available: false,
    spotify: "0oTghbuoMeHAdBLcUaDHvc",
    card: "assets/lbady-cd.png",
    images: ["assets/lbady-cd.png"],
    info:
`CD « Le Bleu Des Yeux » + livret.
Édition physique. Actuellement épuisé.`
  }
];

/* Produits affichés sur la homepage : 3 t-shirts + carte « Other products » */
window.HOME_CARDS = ["bleached", "lbady-white", "lbady-blue", "other"];

window.getProduct = function (id) {
  return window.PRODUCTS.find(function (p) { return p.id === id; });
};
