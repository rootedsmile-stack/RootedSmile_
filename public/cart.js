const STORAGE_KEY = "rooted_smile_cart_v1";

function loadCart() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    console.error("Failed to load cart", e);
    return [];
  }
}

function saveCart(cart) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error("Failed to save cart", e);
  }
}

function addItem(newItem) {
  const cart = loadCart();
  const idx = cart.findIndex((i) => i.id === newItem.id);
  if (idx >= 0) {
    cart[idx].qty += newItem.qty || 1;
  } else {
    cart.push({
      id: newItem.id,
      name: newItem.name,
      price: Number(newItem.price || 0),
      image: newItem.image || "",
      qty: newItem.qty || 1,
    });
  }
  saveCart(cart);
  return cart;
}

function updateQty(id, qty) {
  const cart = loadCart();
  const q = Number(qty);
  if (!Number.isFinite(q) || q <= 0) {
    const filtered = cart.filter((i) => i.id !== id);
    saveCart(filtered);
    return filtered;
  }
  const idx = cart.findIndex((i) => i.id === id);
  if (idx >= 0) {
    cart[idx].qty = q;
  }
  saveCart(cart);
  return cart;
}

function removeItem(id) {
  const cart = loadCart().filter((i) => i.id !== id);
  saveCart(cart);
  return cart;
}

function clearCart() {
  saveCart([]);
  return [];
}

function cartCount(cart) {
  return cart.reduce((sum, i) => sum + (i.qty || 0), 0);
}

function cartTotal(cart) {
  return cart.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 0), 0);
}

function renderCartCount() {
  const el = document.querySelector("[data-cart-count]");
  if (!el) return;
  const cart = loadCart();
  el.textContent = cartCount(cart);
}

function attachAddToCartButtons() {
  const buttons = document.querySelectorAll("[data-add-to-cart]");
  if (!buttons.length) return;
  buttons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const price = btn.dataset.price;
      const image = btn.dataset.image || "";
      if (!id || !name || !price) {
        console.warn("Missing item data on add-to-cart button");
        return;
      }
      addItem({
        id,
        name,
        price: Number(price),
        image,
        qty: 1,
      });
      renderCartCount();

      // Simple default UX: go to cart after adding
      const redirect = btn.dataset.redirect || "cart";
      if (redirect === "cart") {
        window.location.href = "/cart";
      }
    });
  });
}

function renderCartPage() {
  const container = document.querySelector("[data-cart-page]");
  if (!container) return;
  const cart = loadCart();

  if (!cart.length) {
    container.innerHTML = "<p>Your cart is empty right now.</p>";
    renderCartCount();
    return;
  }

  let rows = "";
  for (const item of cart) {
    rows += `
      <tr class="cart-row">
        <td class="cart-item-main">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" class="cart-thumb" />` : ""}
          <div>
            <div class="cart-item-name">${item.name}</div>
            <button type="button" class="cart-remove" data-remove-id="${item.id}">Remove</button>
          </div>
        </td>
        <td>$${(item.price || 0).toFixed(2)}</td>
        <td>
          <input type="number" min="1" value="${item.qty || 1}" class="cart-qty-input" data-qty-id="${item.id}" />
        </td>
        <td>$${((item.price || 0) * (item.qty || 0)).toFixed(2)}</td>
      </tr>
    `;
  }

  const total = cartTotal(cart);
  container.innerHTML = `
    <table class="cart-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Price</th>
          <th>Qty</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    <div class="cart-summary">
      <div class="cart-total-line">
        <span>Subtotal</span>
        <strong>$${total.toFixed(2)}</strong>
      </div>
      <p class="cart-note">Taxes and shipping will be calculated at checkout.</p>
      <div class="cart-actions">
        <button type="button" id="cart-clear">Clear cart</button>
        <button type="button" id="cart-checkout">Checkout (coming soon)</button>
      </div>
    </div>
  `;

  container.querySelectorAll(".cart-qty-input").forEach((input) => {
    input.addEventListener("change", () => {
      const id = input.dataset.qtyId;
      const qty = Number(input.value);
      updateQty(id, qty);
      renderCartPage();
      renderCartCount();
    });
  });

  container.querySelectorAll(".cart-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.removeId;
      removeItem(id);
      renderCartPage();
      renderCartCount();
    });
  });

  const clearBtn = document.getElementById("cart-clear");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      clearCart();
      renderCartPage();
      renderCartCount();
    });
  }

  const checkoutBtn = document.getElementById("cart-checkout");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      // Later: replace with Stripe/Shopify checkout
      alert("Checkout flow coming soon.");
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderCartCount();
  attachAddToCartButtons();
  renderCartPage();
});

// Expose for debugging in console
window.RootedSmileCart = {
  loadCart,
  saveCart,
  addItem,
  updateQty,
  removeItem,
  clearCart,
  cartCount,
  cartTotal,
};
