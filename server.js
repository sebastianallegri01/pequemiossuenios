const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");

const app = express();
app.use(express.json());
app.use(express.static("public"));

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
   MONGODB CONEXIÓN
======================= */
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch(err => console.error("❌ Error MongoDB:", err));

/* =======================
   MODELO PRODUCTO
======================= */
const ProductoSchema = new mongoose.Schema({
  nombre: String,
  precio: Number,
  categoria: String,
  imagen: String,
  descripcion: String
});

const Producto = mongoose.model("Producto", ProductoSchema);

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
app.get("/api/productos", async (req, res) => {
  const productos = await Producto.find();
  res.json(productos);
});

/* =======================
   API ADMIN
======================= */
app.post("/api/admin/agregar", async (req, res) => {
  const { password, nombre, precio, categoria, imagen, descripcion } = req.body;

  if (password !== ADMIN_PASS) {
    return res.status(401).json({ error: "Contraseña incorrecta" });
  }

  await Producto.create({
    nombre,
    precio,
    categoria: categoria || "sin categoría",
    imagen,
    descripcion
  });

  res.json({ ok: true });
});

app.post("/api/admin/editar", async (req, res) => {
  const { password, id, nombre, precio, categoria, imagen, descripcion } = req.body;

  if (password !== ADMIN_PASS) {
    return res.status(401).json({ error: "Contraseña incorrecta" });
  }

  await Producto.findByIdAndUpdate(id, {
    nombre,
    precio,
    categoria,
    imagen,
    descripcion
  });

  res.json({ ok: true });
});

app.post("/api/admin/eliminar", async (req, res) => {
  const { password, id } = req.body;

  if (password !== ADMIN_PASS) {
    return res.status(401).json({ error: "Contraseña incorrecta" });
  }

  await Producto.findByIdAndDelete(id);
  res.json({ ok: true });
});

/* =======================
   API CARRITO
======================= */
app.get("/api/carrito", (req, res) => {
  if (!req.session.carrito) req.session.carrito = [];
  res.json(req.session.carrito);
});

app.post("/api/carrito/agregar", async (req, res) => {
  const { productoId, cantidad } = req.body;

  const producto = await Producto.findById(productoId);
  if (!producto) return res.status(404).json({ error: "Producto no encontrado" });

  if (!req.session.carrito) req.session.carrito = [];

  const index = req.session.carrito.findIndex(p => p._id === productoId);
  if (index >= 0) {
    req.session.carrito[index].cantidad += cantidad;
  } else {
    req.session.carrito.push({
      _id: producto._id.toString(),
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
   SERVER (Railway compatible)
======================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Servidor activo:");
  console.log(`🌐 Página pública: http://localhost:${PORT}/`);
  console.log(`🛠 Admin: http://localhost:${PORT}/admin`);
});
