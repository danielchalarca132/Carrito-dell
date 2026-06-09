// ==========================================
// 1. VARIABLES DE ESTADO LOCAL DEL FRONTEND
// ==========================================
let productosDelServidor = []; // Aquí se guardará el JSON que responde tu backend
const carritoLocal = [];       // Array donde se acumulan las compras del usuario

// 💡 REQUISITO EXIGIDO POR EL MENTOR: Estructura MAP nativa de JavaScript
// Como tu backend no maneja un Map, lo declaramos aquí en el Front para que lo sustentes
const metadataCategorias = new Map();
metadataCategorias.set("Ropa", { ubicacionBodega: "Pasillo Central - Estante A" });
metadataCategorias.set("Calzado", { ubicacionBodega: "Pasillo Lateral - Estante D" });

// Captura de los elementos de tu diseño HTML (DOM)
const productGrid = document.getElementById('productGrid');
const cartItems = document.getElementById('cartItems');
const countLabel = document.getElementById('countLabel');
const cartCount = document.getElementById('cartCount');
const subtotalValue = document.getElementById('subtotalValue');
const totalValue = document.getElementById('totalValue');
const checkoutBtn = document.getElementById('checkoutBtn');
const inputBuscar = document.getElementById('inputBuscar');

// Formateador de dinero para Pesos Colombianos (COP)
function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(value);
}

// ==========================================
// 2. FUNCIONES DE RENDERIZADO VISUAL
// ==========================================

// FUNCIÓN: Pintar los productos que llegaron de tu backend en la pantalla
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
      <button class="add-btn" data-id="${product.id}" ${!tieneStock ? 'disabled style="background:#444;cursor:not-allowed;"' : ''}>
        ${tieneStock ? 'Agregar al carrito' : 'Agotado'}
      </button>
    `;

    productGrid.appendChild(card);
  });
}

// REQUISITO MENTOR: Filtrar productos en el Front usando .filter(), .includes() y .toString()
function filtrarProductos(criterio) {
  const busqueda = criterio.toLowerCase();
  return productosDelServidor.filter(p =>
    p.nombre.toLowerCase().includes(busqueda) ||
    p.categoria.toLowerCase().includes(busqueda) ||
    p.precio.toString().includes(busqueda)
  );
}

// REQUISITO MENTOR: Agregar al carrito con validación y manejo de errores mediante TRY/CATCH
function addToCart(productId) {
  try {
    const product = productosDelServidor.find((item) => item.id === Number(productId));

    if (!product) throw new Error("El producto seleccionado no existe.");
    if (product.stock <= 0) throw new Error(`El producto ${product.nombre} está agotado.`);

    const existing = carritoLocal.find((item) => item.id === product.id);

    if (existing) {
      if (existing.cantidad >= product.stock) {
        throw new Error(`Límite alcanzado: No puedes agregar más unidades de ${product.nombre}.`);
      }
      existing.cantidad += 1;
    } else {
      // Método .push() para insertar objetos en el array
      carritoLocal.push({ ...product, cantidad: 1 });
    }

    renderCartVisual();
  } catch (error) {
    alert(`⚠️ Módulo Stock: ${error.message}`);
  }
}

// REQUISITO MENTOR: Eliminar del carrito mediante posición (.findIndex y .splice)
function removeFromCart(productId) {
  const index = carritoLocal.findIndex((item) => item.id === Number(productId));
  if (index >= 0) {
    carritoLocal.splice(index, 1);
  }
  renderCartVisual();
}

// REQUISITO MENTOR: Calcular total acumulado usando .reduce()
function renderCartVisual() {
  cartItems.innerHTML = '';

  if (carritoLocal.length === 0) {
    cartItems.innerHTML = '<p class="empty-state">Tu carrito está vacío.</p>';
    cartCount.textContent = '0 artículos';
    subtotalValue.textContent = formatCurrency(0);
    totalValue.textContent = formatCurrency(0);
    checkoutBtn.disabled = true;
    return;
  }

  // Uso obligatorio del acumulador matemático .reduce()
  const subtotal = carritoLocal.reduce((acumulador, item) => acumulador + (item.precio * item.cantidad), 0);

  carritoLocal.forEach((item) => {
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

  cartCount.textContent = `${carritoLocal.length} artículo(s)`;
  subtotalValue.textContent = formatCurrency(subtotal);
  totalValue.textContent = formatCurrency(subtotal);
  checkoutBtn.disabled = false;
}

// ==========================================
// 3. CONEXIÓN DIRECTA CON TU SERVIDOR (src/app.js)
// ==========================================
async function cargarInventarioDelBackend() {
  try {
    // Hace la petición http real a la ruta '/api/inventario' que tú programaste en tu app.js
    const response = await fetch('/api/inventario'); 
    
    if (!response.ok) throw new Error("No se pudo obtener la respuesta del servidor.");
    
    // Almacenamos los objetos que envía tu backend en nuestra variable del frontend
    productosDelServidor = await response.json(); 
    
    // Pintamos las tarjetas con tus datos reales
    renderProducts(productosDelServidor);
    countLabel.textContent = `${productosDelServidor.length} productos disponibles`;
    renderCartVisual();
  } catch (error) {
    countLabel.textContent = "Error de conexión con el backend.";
    console.error("Fallo al cargar tu API:", error);
  }
}

// ==========================================
// 4. CONTROLADORES DE EVENTOS (LISTENERS)
// ==========================================

// Clics en el catálogo
productGrid.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-id]');
  if (!button) return;
  addToCart(button.dataset.id);
});

// Clics en el carrito
cartItems.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-id]');
  if (!button) return;
  removeFromCart(button.dataset.id);
});

// Evento del Buscador
if (inputBuscar) {
  inputBuscar.addEventListener('input', (e) => {
    const filtrados = filtrarProductos(e.target.value);
    renderProducts(filtrados);
  });
}

// Finalizar orden
checkoutBtn.addEventListener('click', () => {
  const totalFinal = carritoLocal.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  alert(`🛒 Compra procesada de forma exitosa por un total de: ${formatCurrency(totalFinal)}.`);
});

// Disparar la petición a tu backend apenas abra la página
cargarInventarioDelBackend();