/* =============================================================
   CARRINHO.JS — Cart State Manager
   =============================================================
   - localStorage-based cart persistence
   - Renders cart table with BEM class structure
   - Integrates with animations.js toast system
   - Uses data-attributes (no inline onclick)
   ============================================================= */
(function () {
  'use strict';

  const FMT = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  function getCart() {
    try { return JSON.parse(localStorage.getItem('cart')) || []; }
    catch { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  /* ── Badge Update (works on all pages) ── */
  function updateBadge(cart) {
    const badge = document.getElementById('cart-count');
    if (!badge) return;
    const count = cart.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
    badge.textContent = count > 0 ? String(count) : '';
  }

  /* ── Render Cart Table (cart page only) ── */
  function renderCart() {
    const tbody = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const emptyEl = document.getElementById('cart-empty');
    const contentEl = document.getElementById('cart-content');

    const cart = getCart();
    updateBadge(cart);

    if (!tbody || !totalEl) return;

    // Toggle empty state
    if (emptyEl && contentEl) {
      if (cart.length === 0) {
        emptyEl.style.display = '';
        contentEl.style.display = 'none';
        return;
      } else {
        emptyEl.style.display = 'none';
        contentEl.style.display = '';
      }
    }

    tbody.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
      const itemTotal = Number(item.price) * Number(item.quantity);
      total += itemTotal;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td data-label="Produto">${item.name}</td>
        <td data-label="Preço">${FMT.format(item.price)}</td>
        <td data-label="Quantidade">
          <input type="number" value="${item.quantity}" min="1"
                 data-index="${index}" class="cart-table__qty"
                 aria-label="Quantidade de ${item.name}">
        </td>
        <td data-label="Total">${FMT.format(itemTotal)}</td>
        <td data-label="Ação">
          <button class="cart-table__remove" data-index="${index}"
                  aria-label="Remover ${item.name}">Remover</button>
        </td>
      `;
      tbody.appendChild(row);
    });

    totalEl.textContent = FMT.format(total);
  }

  /* ── Add to Cart (global) ── */
  window.addToCart = function (name, price) {
    const cart = getCart();
    const existing = cart.find(i => i.name === name);

    if (existing) {
      existing.quantity++;
    } else {
      cart.push({ name, price: Number(price), quantity: 1 });
    }

    saveCart(cart);
    updateBadge(cart);
    renderCart();

    // Badge pop animation
    const badge = document.getElementById('cart-count');
    if (badge) {
      badge.classList.remove('header__badge--pop');
      void badge.offsetWidth; // reflow trigger
      badge.classList.add('header__badge--pop');
    }

    // Toast
    if (typeof window.showToast === 'function') {
      window.showToast(`${name} adicionado ao carrinho!`, 'cart');
    }
  };

  /* ── Cart Page Event Delegation ── */
  document.addEventListener('DOMContentLoaded', () => {
    const cart = getCart();
    updateBadge(cart);
    renderCart();

    const tbody = document.getElementById('cart-items');
    if (tbody) {
      // Quantity change
      tbody.addEventListener('change', (e) => {
        if (e.target.classList.contains('cart-table__qty')) {
          const cart = getCart();
          const idx = Number(e.target.dataset.index);
          const qty = parseInt(e.target.value, 10);
          if (qty > 0 && cart[idx]) {
            cart[idx].quantity = qty;
            saveCart(cart);
            renderCart();
          }
        }
      });

      // Remove item
      tbody.addEventListener('click', (e) => {
        const btn = e.target.closest('.cart-table__remove');
        if (!btn) return;

        const idx = Number(btn.dataset.index);
        const cart = getCart();
        const name = cart[idx] ? cart[idx].name : '';

        // Shake animation then remove
        btn.classList.add('cart-table__remove--shake');
        setTimeout(() => {
          cart.splice(idx, 1);
          saveCart(cart);
          renderCart();
          if (typeof window.showToast === 'function') {
            window.showToast(`${name} removido do carrinho`, 'info');
          }
        }, 350);
      });
    }

    // Checkout
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        const cart = getCart();
        if (cart.length === 0) return;

        checkoutBtn.classList.add('btn--checkout-pulse');
        setTimeout(() => checkoutBtn.classList.remove('btn--checkout-pulse'), 500);

        localStorage.setItem('cart', '[]');
        renderCart();

        if (typeof window.showToast === 'function') {
          window.showToast('Compra finalizada com sucesso! 🎉', 'success');
        }
      });
    }

    /* ── Add to Cart buttons via data-attributes ── */
    document.querySelectorAll('[data-game][data-price]').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.game;
        const price = btn.dataset.price;

        // Bounce
        btn.classList.remove('btn--bounce');
        void btn.offsetWidth;
        btn.classList.add('btn--bounce');
        setTimeout(() => btn.classList.remove('btn--bounce'), 450);

        window.addToCart(name, price);
      });
    });
  });
})();
