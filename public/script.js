let productos = [];
let carrito = {};

// ===============================
// CARGAR PRODUCTOS DESDE MONGO
// ===============================
fetch("/api/productos")
  .then(res => res.json())
  .then(data => {
    productos = data;
    mostrarProductos(productos);
  });

// ===============================
// MOSTRAR PRODUCTOS
// ===============================
function mostrarProductos(lista) {
  const contenedor = document.getElementById("productos");
  contenedor.innerHTML = "";

  lista.forEach(p => {
    const div = document.createElement("div");
    div.className = "producto";
    div.innerHTML = `
      ${p.imagen ? `<img src="${p.imagen}" style="width:100%;border-radius:10px">` : ""}
      <h3>${p.nombre}</h3>
      <p>${p.descripcion || ""}</p>
      <p><strong>$${p.precio}</strong></p>
      <button onclick="agregarAlCarrito('${p._id}')">Agregar</button>
    `;
    contenedor.appendChild(div);
  });
}

// ===============================
// AGREGAR AL CARRITO
// ===============================
function agregarAlCarrito(id) {
  if (carrito[id]) {
    carrito[id].cantidad += 1;
  } else {
    const producto = productos.find(p => p._id === id);
    if (!producto) return;

    carrito[id] = {
      ...producto,
      cantidad: 1
    };
  }

  actualizarCarrito();
}

// ===============================
// ELIMINAR PRODUCTO
// ===============================
function eliminarDelCarrito(id) {
  delete carrito[id];
  actualizarCarrito();
}

// ===============================
// ACTUALIZAR CARRITO LATERAL
// ===============================
function actualizarCarrito() {
  const container = document.getElementById("carritoItems");
  container.innerHTML = "";

  let total = 0;

  Object.values(carrito).forEach(item => {
    total += item.precio * item.cantidad;

    const div = document.createElement("div");
    div.className = "carrito-item";
    div.innerHTML = `
      <p>${item.nombre} x${item.cantidad} - $${item.precio * item.cantidad}</p>
      <button onclick="eliminarDelCarrito('${item._id}')">Eliminar</button>
    `;
    container.appendChild(div);
  });

  document.getElementById("totalCarrito").textContent = "Total: $" + total;
  document.getElementById("contadorCarrito").textContent = Object.keys(carrito).length;
}

// ===============================
// ABRIR / CERRAR CARRITO
// ===============================
function abrirCarrito() {
  document.getElementById("carritoPanel").style.right = "0";
}

function cerrarCarrito() {
  document.getElementById("carritoPanel").style.right = "-500px";
}

// ===============================
// FINALIZAR COMPRA (WHATSAPP)
// ===============================
function finalizarCompra() {
  if (Object.keys(carrito).length === 0) {
    alert("El carrito está vacío");
    return;
  }

  let mensaje = "Hola Cintia! Mi pedido de Pequeños Sueños es:%0A";
  let total = 0;

  Object.values(carrito).forEach(item => {
    mensaje += `- ${item.nombre} x${item.cantidad} - $${item.precio * item.cantidad}%0A`;
    total += item.precio * item.cantidad;
  });

  mensaje += `%0ATotal: $${total}`;

  window.open(
    `https://wa.me/542236882481?text=${mensaje}`,
    "_blank"
  );
}
