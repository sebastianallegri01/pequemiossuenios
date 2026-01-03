const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const DB = path.join(__dirname, "productos.json");
const ADMIN_PASS = "pequenios123";

/* =======================
   FUNCIONES AUXILIARES
======================= */
function leerProductos() {
  if (!fs.existsSync(DB)) return [];
  return JSON.parse(fs.readFileSync(DB, "utf8"));
}

function guardarProductos(data) {
  fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}

/* =======================
   API PUBLICA
======================= */
app.get("/api/productos", (req, res) => {
  res.json(leerProductos());
});

/* =======================
   API ADMIN
======================= */

// ➕ AGREGAR PRODUCTO
app.post("/api/admin/agregar", (req, res) => {
  const { password, nombre, precio, categoria, imagen, descripcion } = req.body;

  if (password !== ADMIN_PASS) {
    return res.status(401).json({ error: "Contraseña incorrecta" });
  }

  const productos = leerProductos();

  productos.push({
    id: Date.now(),
    nombre,
    precio,
    categoria: categoria || "sin categoría",
    imagen,
    descripcion
  });

  guardarProductos(productos);
  res.json({ ok: true });
});

// ✏️ EDITAR PRODUCTO
app.post("/api/admin/editar", (req, res) => {
  const { password, id, nombre, precio, categoria, imagen, descripcion } = req.body;

  if (password !== ADMIN_PASS) {
    return res.status(401).json({ error: "Contraseña incorrecta" });
  }

  const productos = leerProductos();
  const producto = productos.find(p => p.id === Number(id));

  if (!producto) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  producto.nombre = nombre;
  producto.precio = precio;
  producto.categoria = categoria || "sin categoría";
  producto.imagen = imagen;
  producto.descripcion = descripcion;

  guardarProductos(productos);
  res.json({ ok: true });
});

// 🗑 ELIMINAR PRODUCTO
app.post("/api/admin/eliminar", (req, res) => {
  const { password, id } = req.body;

  if (password !== ADMIN_PASS) {
    return res.status(401).json({ error: "Contraseña incorrecta" });
  }

  let productos = leerProductos();
  productos = productos.filter(p => p.id !== Number(id));

  guardarProductos(productos);
  res.json({ ok: true });
});

/* =======================
   SERVER
======================= */
app.listen(3000, () => {
  console.log("Servidor activo en http://localhost:3000");
});


