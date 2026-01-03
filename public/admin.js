const pass = document.getElementById("pass");
const nombre = document.getElementById("nombre");
const precio = document.getElementById("precio");
const categoria = document.getElementById("categoria");
const imagen = document.getElementById("imagen");
const descripcion = document.getElementById("descripcion");
const lista = document.getElementById("lista");

let editandoId = null;

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
              <button onclick="editar(${p.id})">✏️ Editar</button>
              <button onclick="borrar(${p.id})">🗑 Eliminar</button>
            </div>
          </div>
        `;
      });
    });
}

function editar(id) {
  id = Number(id); // ✅ convertir a número
  fetch("/api/productos")
    .then(r => r.json())
    .then(data => {
      const p = data.find(x => x.id === id); // comparación estricta
      if (!p) return alert("Producto no encontrado");

      editandoId = id;

      nombre.value = p.nombre;
      precio.value = p.precio;
      categoria.value = p.categoria || "";
      imagen.value = p.imagen || "";
      descripcion.value = p.descripcion || "";
    });
}

function agregar() {
  if (!pass.value) return alert("Ingresá la contraseña");

  const url = editandoId ? "/api/admin/editar" : "/api/admin/agregar";

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      password: pass.value,
      id: editandoId ? Number(editandoId) : undefined, // 🔹 convertir a número
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

function borrar(id) {
  id = Number(id); // ✅ convertir a número
  fetch("/api/admin/eliminar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: pass.value, id })
  }).then(res => {
    if (!res.ok) return alert("Contraseña incorrecta");
    cargar();
  });
}

function limpiarFormulario() {
  editandoId = null;
  nombre.value = "";
  precio.value = "";
  categoria.value = "";
  imagen.value = "";
  descripcion.value = "";
}

cargar();
