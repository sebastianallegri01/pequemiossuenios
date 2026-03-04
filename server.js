const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// Contraseña de administrador
const ADMIN_PASS = "pequenios123";

/* =======================
   SESIONES (Carrito)
======================= */
app.use(session({
  secret: "carrito_secret_123",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 }
}));

/* =======================
   BASE DE DATOS (FAKE)
======================= */
let productos = [];

/* =======================
   RUTAS HTML
======================= */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

/* =======================
   API PUBLICA
======================= */
app.get("/api/productos", (req, res) => {
  res.json(productos);
});

/* =======================
   API ADMIN
======================= */
app.post("/api/admin/agregar", (req, res) => {
  const { password, nombre, precio, categoria, imagen, descripcion } = req.body;

  if (password !== ADMIN_PASS) {
    return res.status(401).json({ error: "Contraseña incorrecta" });
  }

  const nuevo = {
    _id: Date.now().toString(),
    nombre,
    precio,
    categoria: categoria || "sin categoría",
    imagen,
    descripcion
  };

  productos.push(nuevo);

  res.json({ ok: true });
});

app.post("/api/admin/editar", (req, res) => {
  const { password, id, nombre, precio, categoria, imagen, descripcion } = req.body;

  if (password !== ADMIN_PASS) {
    return res.status(401).json({ error: "Contraseña incorrecta" });
  }

  productos = productos.map(p =>
    p._id === id ? { ...p, nombre, precio, categoria, imagen, descripcion } : p
  );

  res.json({ ok: true });
});

app.post("/api/admin/eliminar", (req, res) => {
  const { password, id } = req.body;

  if (password !== ADMIN_PASS) {
    return res.status(401).json({ error: "Contraseña incorrecta" });
  }

  productos = productos.filter(p => p._id !== id);

  res.json({ ok: true });
});

/* =======================
   API CARRITO
======================= */
app.get("/api/carrito", (req, res) => {
  if (!req.session.carrito) req.session.carrito = [];
  res.json(req.session.carrito);
});

app.post("/api/carrito/agregar", (req, res) => {
  const { productoId, cantidad } = req.body;

  const producto = productos.find(p => p._id === productoId);
  if (!producto) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  if (!req.session.carrito) req.session.carrito = [];

  const index = req.session.carrito.findIndex(p => p._id === productoId);

  if (index >= 0) {
    req.session.carrito[index].cantidad += cantidad;
  } else {
    req.session.carrito.push({
      _id: producto._id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad
    });
  }

  res.json({ ok: true, carrito: req.session.carrito });
});

app.post("/api/carrito/eliminar", (req, res) => {
  const { productoId } = req.body;

  if (!req.session.carrito) req.session.carrito = [];

  req.session.carrito = req.session.carrito.filter(p => p._id !== productoId);

  res.json({ ok: true, carrito: req.session.carrito });
});

/* =======================
   SERVER
======================= */
const PORT = 3000;

app.listen(PORT, () => {
  console.log("✅ Servidor activo");
  console.log(`🌐 Cliente: http://localhost:${PORT}`);
  console.log(`🛠 Admin: http://localhost:${PORT}/admin`);
});
