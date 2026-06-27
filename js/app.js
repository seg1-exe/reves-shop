/* ============================================================
   RÊVES — logique partagée : header, menu, i18n, panier, pages
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- i18n ---------------- */
  var I18N = {
    fr: {
      home: "Accueil", contact: "Contact", cartNav: "Panier",
      cartTitle: "PANIER", total: "Total", checkout: "COMMANDER",
      continue: "Continuer les achats", add: "Ajouter au panier",
      goToCart: "Voir le panier",
      soldout: "ÉPUISÉ", informations: "INFORMATIONS",
      other: "Autres produits", size: "Taille",
      cartEmpty: "Votre panier est vide.", selectSize: "Choisissez d'abord une taille.",
      cartLink: "Panier", checkoutMsg: "Merci ! Commande simulée — paiement non connecté."
    },
    en: {
      home: "Homepage", contact: "Contact", cartNav: "Cart",
      cartTitle: "CART", total: "Total", checkout: "CHECKOUT",
      continue: "Continue shopping", add: "Add to cart",
      goToCart: "Go to cart",
      soldout: "SOLD OUT", informations: "INFORMATIONS",
      other: "Other products", size: "Size",
      cartEmpty: "Your cart is empty.", selectSize: "Please choose a size first.",
      cartLink: "Cart", checkoutMsg: "Thank you! Simulated order — payment not connected."
    },
    jp: {
      home: "ホーム", contact: "お問い合わせ", cartNav: "カート",
      cartTitle: "カート", total: "合計", checkout: "購入手続きへ",
      continue: "買い物を続ける", add: "カートに入れる",
      goToCart: "カートを見る",
      soldout: "売り切れ", informations: "商品情報",
      other: "その他の商品", size: "サイズ",
      cartEmpty: "カートは空です。", selectSize: "先にサイズをお選びください。",
      cartLink: "カート", checkoutMsg: "ご注文ありがとうございます！これはデモのため決済は行われません。"
    }
  };

  function getLang() { return localStorage.getItem("reves_lang") || "fr"; }
  function setLang(l) { localStorage.setItem("reves_lang", l); document.documentElement.lang = l; applyLang(); }
  function t(key) { return (I18N[getLang()] || I18N.fr)[key]; }

  /* ---------------- Cart (localStorage) ---------------- */
  function loadCart() {
    try { return JSON.parse(localStorage.getItem("reves_cart")) || []; }
    catch (e) { return []; }
  }
  function saveCart(c) { localStorage.setItem("reves_cart", JSON.stringify(c)); updateBadge(); }
  function cartCount() { return loadCart().reduce(function (n, i) { return n + i.qty; }, 0); }
  function cartTotal() {
    return loadCart().reduce(function (sum, i) {
      var p = window.getProduct(i.id);
      return sum + (p ? p.price * i.qty : 0);
    }, 0);
  }
  function addToCart(id, size) {
    var cart = loadCart();
    var line = cart.find(function (i) { return i.id === id && i.size === size; });
    if (line) line.qty += 1;
    else cart.push({ id: id, size: size, qty: 1 });
    saveCart(cart);
  }
  function setQty(id, size, delta) {
    var cart = loadCart();
    var line = cart.find(function (i) { return i.id === id && i.size === size; });
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) cart = cart.filter(function (i) { return i !== line; });
    saveCart(cart);
  }
  function removeItem(id, size) {
    saveCart(loadCart().filter(function (i) { return !(i.id === id && i.size === size); }));
  }

  /* ---------------- Header ---------------- */
  function buildHeader(opts) {
    opts = opts || {};
    var el = document.getElementById("site-header");
    if (!el) return;
    el.className = "site-header";
    el.innerHTML =
      '<div class="site-header__left">' +
        '<button class="back-btn' + (opts.back ? " show" : "") + '" aria-label="Retour" onclick="history.length>1?history.back():location.href=\'index.html\'">&larr;</button>' +
        '<a href="index.html" aria-label="Rêves — accueil"><img class="logo" src="assets/logo.png" alt="Rêves"></a>' +
      '</div>' +
      '<div class="site-header__right" style="display:flex;align-items:center;gap:14px">' +
        '<button class="burger" aria-label="Menu" id="open-menu"><span></span><span></span><span></span></button>' +
      '</div>';
    document.getElementById("open-menu").addEventListener("click", openMenu);
  }

  /* ---------------- Menu overlay ---------------- */
  function buildMenu() {
    var m = document.createElement("div");
    m.className = "menu";
    m.id = "menu";
    m.innerHTML =
      '<button class="menu__close" id="close-menu" aria-label="Fermer">&times;</button>' +
      '<a class="menu__brand" href="index.html" aria-label="Rêves — accueil"><img class="logo" src="assets/logo.png" alt="Rêves"></a>' +
      '<div class="menu__crane-wrap"><img class="menu__crane" src="assets/papercrane.png" alt=""></div>' +
      '<nav class="menu__nav">' +
        '<a href="index.html" data-i18n="home"></a>' +
        '<a href="mailto:reves.contact@gmail.com" data-i18n="contact"></a>' +
        '<a href="cart.html" id="menu-cart"></a>' +
      '</nav>' +
      '<div class="lang">' +
        '<button data-lang="fr">FR</button><span>/</span>' +
        '<button data-lang="en">EN</button><span>/</span>' +
        '<button data-lang="jp">JP</button>' +
      '</div>';
    m.setAttribute("aria-hidden", "true");
    document.body.appendChild(m);
    document.getElementById("close-menu").addEventListener("click", closeMenu);
    m.querySelectorAll(".lang button").forEach(function (b) {
      b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); });
    });
    m.addEventListener("click", function (e) { if (e.target === m) closeMenu(); });
  }
  function openMenu() {
    var m = document.getElementById("menu");
    m.classList.remove("closing");
    m.classList.add("open");
    m.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }
  function closeMenu() {
    var m = document.getElementById("menu");
    if (!m.classList.contains("open")) return;
    m.classList.remove("open");
    m.classList.add("closing");          // déclenche le slide vers la droite
    m.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    var done = function (e) {
      if (e && e.target === m && e.animationName !== "menu-close") return;
      m.classList.remove("closing");
      m.removeEventListener("animationend", done);
      clearTimeout(tid);
    };
    var tid = setTimeout(done, 600);     // garde-fou si animationend ne se déclenche pas
    m.addEventListener("animationend", done);
  }

  /* ---------------- Apply language + badge ---------------- */
  function applyLang() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n"));
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll(".lang button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-lang") === getLang());
    });
    updateCartNav();
    if (typeof window.__onLangChange === "function") window.__onLangChange();
  }
  // « Panier (1) » dans le menu — nombre d'articles entre parenthèses
  function updateCartNav() {
    var el = document.getElementById("menu-cart");
    if (!el) return;
    var c = cartCount();
    el.textContent = t("cartNav") + (c > 0 ? " (" + c + ")" : "");
  }
  function updateBadge() {
    var c = cartCount();
    document.querySelectorAll(".cart-count").forEach(function (b) {
      b.textContent = c;
      b.setAttribute("data-empty", c === 0 ? "true" : "false");
    });
    updateCartNav();
  }

  /* ---------------- Helpers ---------------- */
  function param(name) { return new URLSearchParams(location.search).get(name); }
  function nameOf(p) { return (p.typo ? "" : "") + p.label; }

  /* ============================================================
     HOMEPAGE
     ============================================================ */
  // icône « déplacer » (4 flèches) en haut à droite des cartes — cf. maquette
  var MOVE_ICON =
    '<span class="card__move"><svg viewBox="0 0 24 24" fill="none" stroke="#1f00ff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
    '<line x1="12" y1="3" x2="12" y2="21"></line><line x1="3" y1="12" x2="21" y2="12"></line>' +
    '<polyline points="9.5 5.5 12 3 14.5 5.5"></polyline><polyline points="9.5 18.5 12 21 14.5 18.5"></polyline>' +
    '<polyline points="5.5 9.5 3 12 5.5 14.5"></polyline><polyline points="18.5 9.5 21 12 18.5 14.5"></polyline>' +
    '</svg></span>';

  // Permet de déplacer une carte sur la page en maintenant le clic sur .card__move
  function makeCardDraggable(handle) {
    var card = handle.closest(".card");
    if (!card) return;
    var ox = 0, oy = 0;                       // décalage cumulé
    handle.style.cursor = "move";
    handle.style.touchAction = "none";
    card.addEventListener("dragstart", function (e) { e.preventDefault(); });
    // l'icône est une poignée : un simple clic dessus ne navigue pas
    handle.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); });

    handle.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var sx = e.clientX, sy = e.clientY, moved = false;
      try { handle.setPointerCapture(e.pointerId); } catch (err) {}
      card.style.transition = "none";
      card.style.zIndex = "40";

      function move(ev) {
        var dx = ev.clientX - sx, dy = ev.clientY - sy;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
        card.style.transform = "translate(" + (ox + dx) + "px," + (oy + dy) + "px)";
      }
      function up(ev) {
        ox += ev.clientX - sx;
        oy += ev.clientY - sy;
        handle.removeEventListener("pointermove", move);
        handle.removeEventListener("pointerup", up);
        card.style.transition = "";
        if (moved) {                          // bloque la navigation du lien juste après un drag
          var block = function (e2) { e2.preventDefault(); e2.stopPropagation(); };
          card.addEventListener("click", block, true);
          setTimeout(function () { card.removeEventListener("click", block, true); }, 60);
        }
      }
      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", up);
    });
  }

  function initHome() {
    var grid = document.getElementById("grid");
    window.HOME_CARDS.forEach(function (id) {
      if (id === "other") {
        grid.insertAdjacentHTML("beforeend",
          '<a class="card card--other" href="product.html?id=other">' +
            '<div class="card__top"><span class="card__price">Sold out</span>' + MOVE_ICON + '</div>' +
            '<div class="card__media"><img src="assets/other-products.png" alt="Other products"></div>' +
            '<div class="card__name"><span class="card__label" data-i18n="other"></span></div>' +
          '</a>');
        return;
      }
      var p = window.getProduct(id);
      grid.insertAdjacentHTML("beforeend",
        '<a class="card" href="product.html?id=' + p.id + '">' +
          '<div class="card__top"><span class="card__price">' + p.price + '€</span>' + MOVE_ICON + '</div>' +
          '<div class="card__media"><img src="' + p.card + '" alt="' + p.label + '"></div>' +
          '<div class="card__name">' +
            (p.typo ? '<img class="card__typo" src="' + p.typo + '" alt="">' : '') +
            '<span class="card__label">' + p.label + '</span>' +
          '</div>' +
        '</a>');
    });
    grid.querySelectorAll(".card__move").forEach(makeCardDraggable);
  }

  /* ============================================================
     PRODUCT PAGE
     ============================================================ */
  var SIZES = ["XS", "S", "M", "L", "XL"];

  function spotifyEmbed(albumId) {
    if (!albumId) return "";
    return '<iframe data-testid="embed-iframe" style="border-radius:12px" ' +
      'src="https://open.spotify.com/embed/album/' + albumId + '?utm_source=generator" ' +
      'width="100%" height="352" frameBorder="0" allowfullscreen ' +
      'allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>';
  }

  function initProduct() {
    var id = param("id") || "bleached";
    if (id === "other") return initOther();

    var p = window.getProduct(id);
    if (!p) { location.href = "index.html"; return; }

    var stage = document.getElementById("stage");
    var thumbs = document.getElementById("thumbs");
    var actions = document.getElementById("actions");
    var infoBody = document.getElementById("info-body");

    stage.innerHTML = '<img src="' + p.images[0] + '" alt="' + p.label + '">';
    thumbs.innerHTML = p.images.map(function (src, i) {
      return '<button class="thumb' + (i === 0 ? " active" : "") + '" data-src="' + src + '"><img src="' + src + '" alt=""></button>';
    }).join("");
    thumbs.querySelectorAll(".thumb").forEach(function (b) {
      b.addEventListener("click", function () {
        stage.querySelector("img").src = b.getAttribute("data-src");
        thumbs.querySelectorAll(".thumb").forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
      });
    });

    var selectedSize = null;
    if (p.available) {
      actions.innerHTML =
        '<div class="sizes" id="sizes">' +
          SIZES.map(function (s) { return '<button class="size-btn" data-size="' + s + '">' + s + '</button>'; }).join("") +
        '</div>' +
        '<div class="actions-row" id="actions-row">' +
          '<button class="btn-primary" id="add" data-i18n="add"></button>' +
          '<a class="btn-primary btn-go" id="go-to-cart" href="cart.html" data-i18n="goToCart"></a>' +
        '</div>';
      actions.querySelectorAll(".size-btn").forEach(function (b) {
        b.addEventListener("click", function () {
          selectedSize = b.getAttribute("data-size");
          actions.querySelectorAll(".size-btn").forEach(function (x) { x.classList.remove("active"); });
          b.classList.add("active");
        });
      });
      document.getElementById("add").addEventListener("click", function () {
        if (!selectedSize) { alert(t("selectSize")); return; }
        addToCart(p.id, selectedSize);
        document.getElementById("actions-row").classList.add("show-go");  // fait apparaître « Voir le panier »
        var btn = document.getElementById("add");
        btn.textContent = "✓ " + t("add");
        setTimeout(function () { btn.textContent = t("add"); }, 1200);
      });
      // si le panier contient déjà des articles, le bouton est visible d'emblée
      if (cartCount() > 0) document.getElementById("actions-row").classList.add("show-go");
    } else {
      actions.innerHTML = '<button class="btn-primary" disabled data-i18n="soldout"></button>';
    }

    var titleEl = document.getElementById("product-pagetitle");
    if (titleEl) titleEl.textContent = p.name || p.label;
    var priceEl = document.getElementById("product-pageprice");
    if (priceEl) priceEl.textContent = p.price + "€";

    var spotifyEl = document.getElementById("spotify");
    if (spotifyEl) spotifyEl.innerHTML = spotifyEmbed(p.spotify);

    infoBody.innerHTML =
      '<p class="info__price">' + p.price + '€</p>' +
      '<p>' + p.info + '</p>';

    document.title = "Rêves — " + (p.name || p.label);
  }

  function initOther() {
    var list = [window.getProduct("jersey"), window.getProduct("cd")];
    var current = 0;
    var stage = document.getElementById("stage");
    var thumbs = document.getElementById("thumbs");
    var actions = document.getElementById("actions");
    var infoBody = document.getElementById("info-body");
    var titleEl = document.getElementById("info-title");

    actions.innerHTML = '<button class="btn-primary" disabled data-i18n="soldout"></button>';

    function render() {
      var p = list[current];
      stage.innerHTML = '<img src="' + p.images[0] + '" alt="' + p.label + '">';
      infoBody.innerHTML = '<p class="info__price">' + p.price + '€ — <span data-i18n="soldout"></span></p><p>' + p.info + '</p>';
      var pt = document.getElementById("product-pagetitle");
      if (pt) pt.textContent = p.name || p.label;
      var pp = document.getElementById("product-pageprice");
      if (pp) pp.textContent = p.price + "€";
      var sp = document.getElementById("spotify");
      if (sp) sp.innerHTML = spotifyEmbed(p.spotify);
      document.title = "Rêves — " + (p.name || p.label);
      applyLang();
    }
    thumbs.innerHTML = list.map(function (p, i) {
      return '<button class="thumb' + (i === 0 ? " active" : "") + '" data-i="' + i + '"><img src="' + p.card + '" alt="' + p.label + '"></button>';
    }).join("");
    thumbs.querySelectorAll(".thumb").forEach(function (b) {
      b.addEventListener("click", function () {
        current = parseInt(b.getAttribute("data-i"), 10);
        thumbs.querySelectorAll(".thumb").forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        render();
      });
    });
    render();
  }

  // toggle INFORMATIONS (lié dans le HTML produit)
  window.toggleInfo = function () {
    var info = document.getElementById("info");
    info.classList.toggle("open");
    var tg = info.querySelector(".info__toggle");
    if (tg) tg.textContent = info.classList.contains("open") ? "×" : "+";
  };

  /* ============================================================
     CART PAGE
     ============================================================ */
  function initCart() {
    renderCart();
    window.__onLangChange = renderCart; // re-render au changement de langue
  }
  function renderCart() {
    var wrap = document.getElementById("cart-body");
    if (!wrap) return;
    var cart = loadCart();
    if (!cart.length) {
      wrap.innerHTML = '<p class="cart__empty">' + t("cartEmpty") +
        ' <a class="cart__continue" href="index.html" style="display:inline" data-i18n="continue">' + t("continue") + '</a></p>';
      return;
    }
    var rows = cart.map(function (i) {
      var p = window.getProduct(i.id);
      if (!p) return "";
      return '<div class="cart__line">' +
        '<button class="cart__remove" data-id="' + i.id + '" data-size="' + i.size + '" aria-label="Retirer">&times;</button>' +
        '<div class="cart__thumb"><img src="' + p.card + '" alt=""></div>' +
        '<div class="cart__info"><h3>' + p.label + '</h3><p>' + p.price + '€ · ' + t("size") + ' ' + i.size + '</p></div>' +
        '<div class="qty">' +
          '<button data-act="dec" data-id="' + i.id + '" data-size="' + i.size + '">−</button>' +
          '<span>' + i.qty + '</span>' +
          '<button data-act="inc" data-id="' + i.id + '" data-size="' + i.size + '">+</button>' +
        '</div>' +
      '</div>';
    }).join("");

    wrap.innerHTML =
      '<div class="cart__list">' + rows + '</div>' +
      '<div class="cart__foot">' +
        '<div class="cart__total">' + t("total") + ' : ' + cartTotal() + '€</div>' +
        '<a class="cart__checkout" href="#" id="checkout">' + t("checkout") + '</a>' +
        '<a class="cart__continue" href="index.html">' + t("continue") + '</a>' +
      '</div>';

    wrap.querySelectorAll(".cart__remove").forEach(function (b) {
      b.addEventListener("click", function () { removeItem(b.dataset.id, b.dataset.size); renderCart(); });
    });
    wrap.querySelectorAll(".qty button").forEach(function (b) {
      b.addEventListener("click", function () {
        setQty(b.dataset.id, b.dataset.size, b.dataset.act === "inc" ? 1 : -1);
        renderCart();
      });
    });
    var co = document.getElementById("checkout");
    if (co) co.addEventListener("click", function (e) { e.preventDefault(); alert(t("checkoutMsg")); });
  }

  /* ============================================================
     BOOT
     ============================================================ */
  document.addEventListener("DOMContentLoaded", function () {
    var page = document.body.getAttribute("data-page");
    buildHeader({ back: page === "product" });
    buildMenu();
    if (page === "home") initHome();
    else if (page === "product") initProduct();
    else if (page === "cart") initCart();
    document.documentElement.lang = getLang();
    applyLang();
    updateBadge();
  });
})();
