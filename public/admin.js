const nombre = document.getElementById("nombre");
const precio = document.getElementById("precio");
const categoria = document.getElementById("categoria");
const imagen = document.getElementById("imagen");
const descripcion = document.getElementById("descripcion");
const stock = document.getElementById("stock");
const imagenFile = document.getElementById("imagenFile");
const lista = document.getElementById("lista");

let editandoId = null;

/* =====================
   CARGAR PRODUCTOS
===================== */

function cargar() {

  fetch("/api/productos")
    .then(r => r.json())
    .then(data => {

      lista.innerHTML = "";

      data.forEach(p => {

        const card = document.createElement("div");

        card.className = "card";

        card.innerHTML = `
          ${p.imagen ? `<img src="${p.imagen}" style="width:100%;border-radius:10px">` : ""}

          <div class="info">

            <h3>${p.nombre}</h3>

            <div class="precio">$${p.precio}</div>

            <div><b>Stock:</b> ${p.stock}</div>

            <div><b>Categoría:</b> ${p.categoria || "-"}</div>

            <p>${p.descripcion || ""}</p>

            <button onclick="editar('${p._id}')">✏️ Editar</button>

            <button onclick="borrar('${p._id}')">🗑 Eliminar</button>

          </div>
        `;

        lista.appendChild(card);

      });

    });

}

/* =====================
   EDITAR
===================== */

function editar(id) {

  fetch("/api/productos")
    .then(r => r.json())
    .then(data => {

      const p = data.find(x => x._id === id);

      editandoId = id;

      nombre.value = p.nombre;
      precio.value = p.precio;
      categoria.value = p.categoria || "";
      imagen.value = p.imagen || "";
      descripcion.value = p.descripcion || "";
      stock.value = p.stock || 0;

      window.scrollTo(0,0);

    });

}

/* =====================
   CONVERTIR IMAGEN
===================== */

function convertirImagen(file){

  return new Promise(resolve => {

    const reader = new FileReader();

    reader.onload = e => resolve(e.target.result);

    reader.readAsDataURL(file);

  });

}

/* =====================
   AGREGAR / EDITAR
===================== */

async function agregar() {

  let imagenFinal = imagen.value;

  if(imagenFile.files.length > 0){

    imagenFinal = await convertirImagen(imagenFile.files[0]);

  }

  const url = editandoId
    ? "/api/admin/editar"
    : "/api/admin/agregar";

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id: editandoId,
      nombre: nombre.value,
      precio: Number(precio.value),
      categoria: categoria.value,
      imagen: imagenFinal,
      descripcion: descripcion.value,
      stock: Number(stock.value)
    })
  })
  .then(res => res.json())
  .then(() => {

    limpiarFormulario();

    cargar();

  });

}

/* =====================
   BORRAR
===================== */

function borrar(id) {

  if (!confirm("¿Seguro que querés eliminar este producto?")) return;

  fetch("/api/admin/eliminar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id: id
    })
  })
  .then(res => res.json())
  .then(() => {

    cargar();

  });

}

/* =====================
   LIMPIAR
===================== */

function limpiarFormulario() {

  editandoId = null;

  nombre.value = "";
  precio.value = "";
  categoria.value = "";
  imagen.value = "";
  descripcion.value = "";
  stock.value = "";
  imagenFile.value = "";

}

/* =====================
   INICIAR
===================== */

cargar();