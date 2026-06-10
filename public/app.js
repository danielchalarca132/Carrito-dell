let productosDelServidor = [];

const metadataCategorias = new Map();
metadataCategorias.set("Ropa", { ubicacionBodega: "Pasillo Central" });
metadataCategorias.set("Calzado", { ubicacionBodega: "Pasillo Lateral" });

const productGrid = document.getElementById('productGrid');
const cartItems = document.getElementById('cartItems');
const countLabel = document.getElementById('countLabel');
const cartCount = document.getElementById('cartCount');
const subtotalValue = document.getElementById('subtotalValue');
const totalValue = document.getElementById('totalValue');
const checkoutBtn = document.getElementById('checkoutBtn');
const inputBuscar = document.getElementById('inputBuscar');

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
}

// Pintar productos en pantalla
function renderProducts(productsList) {
  productGrid.innerHTML = '';
  productsList.forEach((product) => {
    const tieneStock = product.stock > 0;
    const card = document.createElement('article');
    card.className = 'product-card';
    card.style.opacity = !tieneStock ? '0.4' : '1';
    card.innerHTML = `
      <span class="tag">${product.categoria}</span>
      <h3>${product.nombre}</h3>
      <p class="product-meta">Stock disponible: ${product.stock} uds</p>
      <p class="product-price">${formatCurrency(product.precio)}</p>
      <button class="add-btn" data-id="${product.id}" ${!tieneStock ? 'disabled style="background:#444;"' : ''}>
        ${tieneStock ? 'Agregar al carrito' : 'Agotado'}
      </button>
    `;
    productGrid.appendChild(card);
  });
}

function actualizarInterfazCarrito(dataCarrito) {
  cartItems.innerHTML = '';
  const cart = dataCarrito.items;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-state">Tu carrito está vacío.</p>';
    cartCount.textContent = '0 artículos';
    subtotalValue.textContent = formatCurrency(0);
    totalValue.textContent = formatCurrency(0);
    checkoutBtn.disabled = true;
    return;
  }

  cart.forEach((item) => {
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

  cartCount.textContent = `${cart.length} artículo(s) En Back`;
  subtotalValue.textContent = formatCurrency(dataCarrito.total);
  totalValue.textContent = formatCurrency(dataCarrito.total);
  checkoutBtn.disabled = false;
}

async function cargarApp() {
  const resInventario = await fetch('/api/inventario');
  productosDelServidor = await resInventario.json();
  renderProducts(productosDelServidor);

  const resCarrito = await fetch('/api/carrito');
  const dataCarrito = await resCarrito.json();
  actualizarInterfazCarrito(dataCarrito);
  countLabel.textContent = `${productosDelServidor.length} productos sincronizados con Back`;

  const bodegaRopa = metadataCategorias.get("Ropa");
  console.log("🚚 Verificación de Bodega (Map .get):", bodegaRopa.ubicacionBodega);
}

// DISPARAR TU FUNCIÓN agregarAlCarrito() EN EL BACK
async function clickAgregar(productId) {
  try {
    const response = await fetch('/api/carrito/agregar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idProducto: productId })
    });

    const data = await response.json();

    if (data.success) {
      actualizarInterfazCarrito(data);
    } else {
      // Muestra el mensaje de stock exacto configurado en tu servicio del backend
      alert(`⚠️ Control de Inventario: ${data.error}`);
    }
  } catch (error) {
    console.error("Fallo de red en la petición:", error);
    alert("⚠️ Error crítico de comunicación con el servidor.");
  }
}

// DISPARAR TU FUNCIÓN eliminarDelCarrito() EN EL BACK
async function clickQuitar(productId) {
  const response = await fetch('/api/carrito/eliminar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idProducto: productId })
  });
  const data = await response.json();
  actualizarInterfazCarrito(data);
}

if (inputBuscar) {
  inputBuscar.addEventListener('input', (e) => {
    const criterio = e.target.value.toLowerCase();
    const filtrados = productosDelServidor.filter(p =>
      p.nombre.toLowerCase().includes(criterio) ||
      p.categoria.toLowerCase().includes(criterio) ||
      p.precio.toString().includes(criterio)
    );
    renderProducts(filtrados);
  });
}

productGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-id]');
  if (btn) clickAgregar(btn.dataset.id);
});

cartItems.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-id]');
  if (btn) clickQuitar(btn.dataset.id);
});

cargarApp();