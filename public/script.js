let productos = [];
let carrito = {};
let categoriaActual = "todos";

/* =====================
CARGAR PRODUCTOS
===================== */

fetch("/api/productos")
  .then(res => res.json())
  .then(data => {

    productos = data;

    mostrarProductos(productos);

  })
  .catch(err => {

    console.error("Error cargando productos:", err);

  });



/* =====================
MOSTRAR PRODUCTOS
===================== */

function mostrarProductos(lista) {

  const contenedor = document.getElementById("productos");

  contenedor.innerHTML = "";

  lista.forEach(p => {

    const div = document.createElement("div");

    div.className = "producto";

    const sinStock = p.stock <= 0;

    div.innerHTML = `

      ${p.imagen ? `<img src="${p.imagen}" style="width:100%;border-radius:10px">` : ""}

      <h3>${p.nombre}</h3>

      <p>${p.descripcion || ""}</p>

      <p><strong>$${p.precio}</strong></p>

      ${
        sinStock
          ? `<div class="sin-stock">SIN STOCK</div>`
          : `<button onclick="agregar('${p._id}')">Agregar</button>`
      }

    `;

    contenedor.appendChild(div);

  });

}



/* =====================
FILTRAR CATEGORIA
===================== */

function filtrar(cat){

  categoriaActual = cat;

  if(cat === "todos"){

    mostrarProductos(productos);

    return;

  }

  const filtrados = productos.filter(p => p.categoria === cat);

  mostrarProductos(filtrados);

}



/* =====================
AGREGAR AL CARRITO
===================== */

function agregar(id){

  const producto = productos.find(p => p._id === id);

  if(!producto) return;

  const enCarrito = carrito[id] || 0;

  if(enCarrito >= producto.stock){

    alert("No hay más stock disponible");

    return;

  }

  carrito[id] = enCarrito + 1;

  actualizarCarrito();

}



/* =====================
ELIMINAR DEL CARRITO
===================== */

function eliminar(id){

  delete carrito[id];

  actualizarCarrito();

}



/* =====================
ACTUALIZAR CARRITO
===================== */

function actualizarCarrito(){

  const ul = document.getElementById("carrito");

  ul.innerHTML = "";

  let total = 0;

  Object.keys(carrito).forEach(id => {

    const p = productos.find(prod => prod._id === id);

    if(!p) return;

    const cant = carrito[id];

    const subtotal = p.precio * cant;

    total += subtotal;

    const li = document.createElement("li");

    li.innerHTML = `
      ${p.nombre} x${cant} - $${subtotal}
      <button onclick="eliminar('${id}')">❌</button>
    `;

    ul.appendChild(li);

  });

  document.getElementById("total").textContent = total;

}



/* =====================
FINALIZAR COMPRA
===================== */

function finalizarCompra(){

  if(Object.keys(carrito).length === 0){

    alert("El carrito está vacío");

    return;

  }

  let mensaje = "Hola! Quiero comprar:%0A";

  let total = 0;

  Object.keys(carrito).forEach(id => {

    const p = productos.find(prod => prod._id === id);

    if(!p) return;

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