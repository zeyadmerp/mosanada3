/**
 * Mosanada — Order cart & WhatsApp checkout
 * Persists cart in localStorage and builds WhatsApp checkout message
 */
(function () {
  'use strict';

  let cart = {};

  try {
    cart = JSON.parse(localStorage.getItem('mosanada-cart') || '{}') || {};
  } catch (_) {
    cart = {};
  }

  function saveCart() {
    try {
      localStorage.setItem('mosanada-cart', JSON.stringify(cart));
    } catch (_) {
      /* localStorage unavailable */
    }
  }

  function getActiveSite() {
    return document.querySelector('.site:not([hidden])') || document;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function formatPrice(n) {
    return n.toLocaleString('en-US');
  }

  /** Build catalog from data-add buttons in active language site */
  function buildCatalog() {
    const catalog = {};
    getActiveSite().querySelectorAll('[data-add]').forEach((btn) => {
      catalog[btn.getAttribute('data-add')] = {
        name: btn.getAttribute('data-name'),
        price: parseFloat(btn.getAttribute('data-price')) || 0,
      };
    });
    return catalog;
  }

  /** Render cart UI and update totals */
  function renderCart() {
    const root = getActiveSite();
    const cartEl = root.querySelector('.cart');
    if (!cartEl) return;

    const listEl = cartEl.querySelector('[data-cart-list]');
    const catalog = buildCatalog();
    const currency = cartEl.getAttribute('data-cur');

    let total = 0;
    let count = 0;
    let html = '';
    const lines = [];

    Object.keys(cart).forEach((id) => {
      const qty = cart[id];
      if (!qty || qty < 1) return;

      const item = catalog[id];
      if (!item) return;

      const sum = item.price * qty;
      total += sum;
      count += qty;
      lines.push(`• ${item.name} × ${qty} — ${formatPrice(sum)} ${currency}`);

      html +=
        `<div class="citem"><div class="citem__top"><h4>${escapeHtml(item.name)}</h4>` +
        `<span class="citem__price">${formatPrice(sum)} ${escapeHtml(currency)}</span></div>` +
        `<div class="citem__row"><span class="qty">` +
        `<button type="button" data-qty="-1" data-id="${escapeHtml(id)}" aria-label="-">` +
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5.4 12h13.2"/></svg></button>` +
        `<b>${qty}</b>` +
        `<button type="button" data-qty="1" data-id="${escapeHtml(id)}" aria-label="+">` +
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5.4v13.2M5.4 12h13.2"/></svg></button>` +
        `</span><button class="citem__rm" type="button" data-rm="${escapeHtml(id)}">` +
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.6 6.6h14.8"/><path d="M9.4 6.6V4.8h5.2v1.8"/><path d="M6.6 6.6 7.5 20h9l.9-13.4"/></svg>` +
        `${escapeHtml(cartEl.getAttribute('data-remove'))}</button></div></div>`;
    });

    if (listEl) {
      listEl.innerHTML = html || `<p class="cart__empty">${escapeHtml(cartEl.getAttribute('data-empty'))}</p>`;
    }

    const totalEl = cartEl.querySelector('[data-cart-total]');
    if (totalEl) totalEl.textContent = formatPrice(total);

    root.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = count;
    });

    root.querySelectorAll('.fab--cart').forEach((el) => {
      el.setAttribute('data-count', count);
    });

    const checkoutLink = cartEl.querySelector('[data-cart-checkout]');
    if (checkoutLink) {
      const msg =
        cartEl.getAttribute('data-msghead') +
        '\n\n' +
        lines.join('\n') +
        '\n\n' +
        cartEl.getAttribute('data-msgtotal') +
        ': ' +
        formatPrice(total) +
        ' ' +
        currency +
        '\n' +
        cartEl.getAttribute('data-msgfoot');

      checkoutLink.href =
        'https://wa.me/' + cartEl.getAttribute('data-wa') + (count ? '?text=' + encodeURIComponent(msg) : '');
    }
  }

  window.__cartRender = renderCart;

  /** Cart interaction handlers */
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-add]');
    if (addBtn) {
      const id = addBtn.getAttribute('data-add');
      cart[id] = (cart[id] || 0) + 1;
      saveCart();
      renderCart();

      const label = addBtn.querySelector('span');
      const addedText = addBtn.getAttribute('data-added');
      if (label && addedText && !addBtn.dataset.busy) {
        addBtn.dataset.busy = '1';
        const original = label.textContent;
        label.textContent = addedText;
        setTimeout(() => {
          label.textContent = original;
          delete addBtn.dataset.busy;
        }, 1400);
      }

      document.body.classList.add('cart-open');
      return;
    }

    const qtyBtn = e.target.closest('[data-qty]');
    if (qtyBtn) {
      const id = qtyBtn.getAttribute('data-id');
      cart[id] = (cart[id] || 0) + parseInt(qtyBtn.getAttribute('data-qty'), 10);
      if (cart[id] < 1) delete cart[id];
      saveCart();
      renderCart();
      return;
    }

    const removeBtn = e.target.closest('[data-rm]');
    if (removeBtn) {
      delete cart[removeBtn.getAttribute('data-rm')];
      saveCart();
      renderCart();
      return;
    }

    if (e.target.closest('[data-cart-open]')) {
      document.body.classList.add('cart-open');
      renderCart();
      return;
    }

    if (e.target.closest('[data-cart-close]')) {
      document.body.classList.remove('cart-open');
      return;
    }

    if (e.target.closest('[data-cart-clear]')) {
      cart = {};
      saveCart();
      renderCart();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.body.classList.remove('cart-open');
  });

  renderCart();
})();
