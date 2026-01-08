let productos = [];
let carrito = {};

// Cargar productos
fetch("/api/productos")
  .then(res => res.json())
  .then(data => {
    productos = data;
    mostrarProductos(productos);
  });

// Mostrar productos
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
      <button onclick="agregar('${p._id}')">Agregar</button>
    `;
    contenedor.appendChild(div);
  });
}

// Agregar al carrito
function agregar(id) {
  carrito[id] = (carrito[id] || 0) + 1;
  actualizarCarrito();
}

// Actualizar carrito
function actualizarCarrito() {
  const ul = document.getElementById("carrito");
  ul.innerHTML = "";
  let total = 0;

  Object.keys(carrito).forEach(id => {
    const p = productos.find(prod => prod._id === id);

    // 🔒 protección clave
    if (!p) return;

    const cant = carrito[id];
    total += p.precio * cant;

    const li = document.createElement("li");
    li.textContent = `${p.nombre} x${cant} - $${p.precio * cant}`;
    ul.appendChild(li);
  });

  document.getElementById("total").textContent = total;
}

// Finalizar compra
function finalizarCompra() {
  if (Object.keys(carrito).length === 0) {
    alert("El carrito está vacío");
    return;
  }

  let mensaje = "Hola Cintia! Mi pedido de Pequeños Sueños es:%0A";
  let total = 0;

  Object.keys(carrito).forEach(id => {
    const p = productos.find(prod => prod._id === id);

    // 🔒 protección clave
    if (!p) return;

    const cant = carrito[id];
    mensaje += `- ${p.nombre} x${cant}%0A`;
    total += p.precio * cant;
  });

  mensaje += `%0ATotal: $${total}`;

  window.open(
    `https://wa.me/542236882481?text=${mensaje}`,
    "_blank"
  );
}
