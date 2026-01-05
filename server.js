const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const ADMIN_PASS = "pequenios123";

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
   RUTAS HTML (CLAVE)
======================= */
// Página pública
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Página admin
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

// ➕ AGREGAR PRODUCTO
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

// ✏️ EDITAR PRODUCTO
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

// 🗑 ELIMINAR PRODUCTO
app.post("/api/admin/eliminar", async (req, res) => {
  const { password, id } = req.body;

  if (password !== ADMIN_PASS) {
    return res.status(401).json({ error: "Contraseña incorrecta" });
  }

  await Producto.findByIdAndDelete(id);
  res.json({ ok: true });
});

/* =======================
   SERVER (Render compatible)
======================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor activo:");
  console.log(`🌐 Página pública: http://localhost:${PORT}/`);
  console.log(`🛠 Admin: http://localhost:${PORT}/admin`);
});
