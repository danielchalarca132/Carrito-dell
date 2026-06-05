const productGrid = document.getElementById('productGrid');
const cartItems = document.getElementById('cartItems');
const countLabel = document.getElementById('countLabel');
const cartCount = document.getElementById('cartCount');
const subtotalValue = document.getElementById('subtotalValue');
const totalValue = document.getElementById('totalValue');
const checkoutBtn = document.getElementById('checkoutBtn');

const cart = [];

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(value);
}

function renderProducts(products) {
  productGrid.innerHTML = '';

  products.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <h3>${product.nombre}</h3>
      <p class="product-meta">${product.categoria} · Stock: ${product.stock}</p>
      <p class="product-price">${formatCurrency(product.precio)}</p>
      <button class="add-btn" data-id="${product.id}">Agregar al carrito</button>
    `;

    productGrid.appendChild(card);
  });
}

function renderCart() {
  cartItems.innerHTML = '';

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-state">Tu carrito está vacío.</p>';
    cartCount.textContent = '0 artículos';
    subtotalValue.textContent = '$0';
    totalValue.textContent = '$0';
    checkoutBtn.disabled = true;
    return;
  }

  let subtotal = 0;

  cart.forEach((item) => {
    subtotal += item.precio * item.cantidad;

    const row = document.createElement('article');
    row.className = 'cart-item';
    row.innerHTML = `
      <div>
        <strong>${item.nombre}</strong>
        <small>${item.cantidad} × ${formatCurrency(item.precio)}</small>
      </div>
      <button class="remove-btn" data-id="${item.id}">Quitar</button>
    `;

    cartItems.appendChild(row);
  });

  cartCount.textContent = `${cart.length} artículo(s)`;
  subtotalValue.textContent = formatCurrency(subtotal);
  totalValue.textContent = formatCurrency(subtotal);
  checkoutBtn.disabled = false;
}

function addToCart(productId) {
  const product = products.find((item) => item.id === Number(productId));

  if (!product) return;

  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    if (existing.cantidad >= product.stock) {
      alert('No hay más stock disponible para este producto.');
      return;
    }
    existing.cantidad += 1;
  } else {
    cart.push({ ...product, cantidad: 1 });
  }

  renderCart();
}

function removeFromCart(productId) {
  const index = cart.findIndex((item) => item.id === Number(productId));

  if (index >= 0) {
    cart.splice(index, 1);
  }

  renderCart();
}

let products = [];

async function loadProducts() {
  const response = await fetch('/api/inventario');
  products = await response.json();
  renderProducts(products);
  countLabel.textContent = `${products.length} productos`;
  renderCart();
}

productGrid.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-id]');
  if (!button) return;
  addToCart(button.dataset.id);
});

cartItems.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-id]');
  if (!button) return;
  removeFromCart(button.dataset.id);
});

checkoutBtn.addEventListener('click', () => {
  alert(`Compra finalizada por ${formatCurrency(cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0))}.`);
});

loadProducts();
