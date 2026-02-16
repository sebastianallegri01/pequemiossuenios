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
        lista.innerHTML += `
          <div class="card">
            ${p.imagen ? `<img src="${p.imagen}" />` : ""}
            <div class="info">
              <h3>${p.nombre}</h3>
              <div class="precio">$${p.precio}</div>
              <p>${p.descripcion || ""}</p>

              <button onclick="editar('${p._id}')">✏️ Editar</button>
              <button onclick="borrar('${p._id}')">🗑 Eliminar</button>
            </div>
          </div>
        `;
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
      if (!p) return alert("Producto no encontrado");

      editandoId = id;

      nombre.value = p.nombre;
      precio.value = p.precio;
      categoria.value = p.categoria || "";
      imagen.value = p.imagen || "";
      descripcion.value = p.descripcion || "";
    });
}

/* =====================
   AGREGAR / EDITAR
===================== */
function agregar() {
  if (!pass.value) return alert("Ingresá la contraseña");

  const url = editandoId ? "/api/admin/editar" : "/api/admin/agregar";

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      password: pass.value,
      id: editandoId || undefined,
      nombre: nombre.value,
      precio: Number(precio.value),
      categoria: categoria.value,
      imagen: imagen.value,
      descripcion: descripcion.value
    })
  })
    .then(res => {
      if (!res.ok) return alert("Contraseña incorrecta");

      limpiarFormulario();
      cargar();
    });
}

/* =====================
   BORRAR
===================== */
function borrar(id) {
  fetch("/api/admin/eliminar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      password: pass.value,
      id
    })
  }).then(res => {
    if (!res.ok) return alert("Contraseña incorrecta");
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
}

cargar();
