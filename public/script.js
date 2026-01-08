let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || {};

// ===============================
// GUARDAR CARRITO
// ===============================
function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// ===============================
// CARGAR PRODUCTOS
// ===============================
fetch("/api/productos")
  .then(res => res.json())
  .then(data => {
    productos = data;
    mostrarProductos(productos);
    actualizarCarrito();
  });

// ===============================
// MOSTRAR PRODUCTOS
// ===============================
function mostrarProductos(lista) {
  const contenedor = document.getElementById("productos");
  contenedor.innerHTML = "";

  lista.forEach(p => {
    const cantidad = carrito[p._id]?.cantidad || 0;

    const div = document.createElement("div");
    div.className = "producto";
    div.innerHTML = `
      ${p.imagen ? `<img src="${p.imagen}">` : ""}
      <h3>${p.nombre}</h3>
      <p>${p.descripcion || ""}</p>
      <p><strong>$${p.precio}</strong></p>

      <div class="cantidad">
        <button onclick="restarProducto('${p._id}')">−</button>
        <span id="cant-${p._id}">${cantidad}</span>
        <button onclick="agregarAlCarrito('${p._id}')">+</button>
      </div>
    `;
    contenedor.appendChild(div);
  });
}

// ===============================
// AGREGAR
// ===============================
function agregarAlCarrito(id) {
  if (carrito[id]) {
    carrito[id].cantidad++;
  } else {
    const producto = productos.find(p => p._id === id);
    if (!producto) return;
    carrito[id] = { ...producto, cantidad: 1 };
  }

  guardarCarrito();
  actualizarCarrito();
  animarCarrito();
}

// ===============================
// RESTAR
// ===============================
function restarProducto(id) {
  if (!carrito[id]) return;

  carrito[id].cantidad--;
  if (carrito[id].cantidad <= 0) {
    delete carrito[id];
  }

  guardarCarrito();
  actualizarCarrito();
}

// ===============================
// ACTUALIZAR CARRITO
// ===============================
function actualizarCarrito() {
  const cont = document.getElementById("carritoItems");
  cont.innerHTML = "";
  let total = 0;
  let totalItems = 0;

  Object.values(carrito).forEach(item => {
    total += item.precio * item.cantidad;
    totalItems += item.cantidad;

    const div = document.createElement("div");
    div.className = "carrito-item";
    div.innerHTML = `
      <span>${item.nombre} x${item.cantidad}</span>
      <div>
        <button onclick="restarProducto('${item._id}')">−</button>
        <button onclick="agregarAlCarrito('${item._id}')">+</button>
      </div>
    `;
    cont.appendChild(div);
  });

  document.getElementById("totalCarrito").textContent = "Total: $" + total;
  document.getElementById("contadorCarrito").textContent = totalItems;

  productos.forEach(p => {
    const span = document.getElementById(`cant-${p._id}`);
    if (span) span.textContent = carrito[p._id]?.cantidad || 0;
  });
}

// ===============================
// ABRIR / CERRAR
// ===============================
function abrirCarrito() {
  document.getElementById("carritoPanel").classList.add("abierto");
  document.getElementById("overlay").classList.add("activo");
}

function cerrarCarrito() {
  document.getElementById("carritoPanel").classList.remove("abierto");
  document.getElementById("overlay").classList.remove("activo");
}

// ===============================
// ANIMACIÓN
// ===============================
function animarCarrito() {
  const btn = document.querySelector(".carrito-btn");
  btn.classList.add("shake");
  setTimeout(() => btn.classList.remove("shake"), 300);
}

// ===============================
// FINALIZAR COMPRA
// ===============================
function finalizarCompra() {
  if (Object.keys(carrito).length === 0) {
    alert("El carrito está vacío");
    return;
  }

  let mensaje = "Hola Cintia! Mi pedido de Pequeños Sueños es:%0A";
  let total = 0;

  Object.values(carrito).forEach(item => {
    mensaje += `- ${item.nombre} x${item.cantidad}%0A`;
    total += item.precio * item.cantidad;
  });

  mensaje += `%0ATotal: $${total}`;

  window.open(
    `https://wa.me/542236882481?text=${mensaje}`,
    "_blank"
  );
}
