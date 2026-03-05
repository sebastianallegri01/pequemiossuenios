const pass = document.getElementById("pass");
const nombre = document.getElementById("nombre");
const precio = document.getElementById("precio");
const categoria = document.getElementById("categoria");
const imagen = document.getElementById("imagen");
const descripcion = document.getElementById("descripcion");
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
            <p>${p.descripcion || ""}</p>

            <button onclick="editar('${p._id}')">✏️ Editar</button>
            <button onclick="borrar('${p._id}')">🗑 Eliminar</button>
          </div>
        `;

        lista.appendChild(card);

      });

    })
    .catch(err => console.error("Error cargando productos:", err));

}


/* =====================
   EDITAR
===================== */
function editar(id) {

  fetch("/api/productos")
    .then(r => r.json())
    .then(data => {

      const p = data.find(x => x._id === id);

      if (!p) {
        alert("Producto no encontrado");
        return;
      }

      editandoId = id;

      nombre.value = p.nombre;
      precio.value = p.precio;
      categoria.value = p.categoria || "";
      imagen.value = p.imagen || "";
      descripcion.value = p.descripcion || "";

      window.scrollTo(0,0);

    });

}


/* =====================
   AGREGAR / EDITAR
===================== */
function agregar() {

  if (!pass.value) {
    alert("Ingresá la contraseña de administrador");
    return;
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
      password: pass.value,
      id: editandoId,
      nombre: nombre.value,
      precio: Number(precio.value),
      categoria: categoria.value,
      imagen: imagen.value,
      descripcion: descripcion.value
    })
  })
  .then(res => {

    if (!res.ok) {
      alert("❌ Contraseña incorrecta");
      return;
    }

    limpiarFormulario();
    cargar();

  })
  .catch(err => console.error("Error:", err));

}


/* =====================
   BORRAR
===================== */
function borrar(id) {

  if (!pass.value) {
    alert("Ingresá la contraseña de administrador");
    return;
  }

  if (!confirm("¿Seguro que querés eliminar este producto?")) return;

  fetch("/api/admin/eliminar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      password: pass.value,
      id: id
    })
  })
  .then(res => {

    if (!res.ok) {
      alert("❌ Contraseña incorrecta");
      return;
    }

    cargar();

  })
  .catch(err => console.error("Error:", err));

}


/* =====================
   LIMPIAR FORMULARIO
===================== */
function limpiarFormulario() {

  editandoId = null;

  nombre.value = "";
  precio.value = "";
  categoria.value = "";
  imagen.value = "";
  descripcion.value = "";

}


/* =====================
   INICIAR
===================== */

cargar();
