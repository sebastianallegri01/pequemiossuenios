const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

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
   MONGODB
======================= */

const mongoUri = process.env.MONGO_URL;

if (!mongoUri) {
  console.error("❌ MONGO_URL no está definida");
}

mongoose.connect(mongoUri)
.then(() => console.log("✅ MongoDB conectado"))
.catch(err => console.log("❌ Error MongoDB:", err));

/* =======================
   MODELO
======================= */

const ProductoSchema = new mongoose.Schema({
  nombre: String,
  precio: Number,
  categoria: String,
  imagen: String,
  descripcion: String,
  stock: { type: Number, default: 0 }   // ⭐ NUEVO
});

const Producto = mongoose.model("Producto", ProductoSchema);

/* =======================
   HTML
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

  try {

    const productos = await Producto.find();

    res.json(productos);

  } catch (err) {

    console.log("❌ error cargando productos", err);

    res.status(500).json({ error: "error cargando productos" });

  }

});

/* =======================
   ADMIN AGREGAR
======================= */

app.post("/api/admin/agregar", async (req, res) => {

  const { nombre, precio, categoria, imagen, descripcion, stock } = req.body;

  try {

    await Producto.create({
      nombre,
      precio,
      categoria,
      imagen,
      descripcion,
      stock
    });

    console.log("✅ producto agregado");

    res.json({ ok: true });

  } catch (err) {

    console.log("❌ error agregando producto", err);

    res.status(500).json({ error: "error agregando producto" });

  }

});

/* =======================
   ADMIN EDITAR
======================= */

app.post("/api/admin/editar", async (req, res) => {

  const { id, nombre, precio, categoria, imagen, descripcion, stock } = req.body;

  try {

    await Producto.findByIdAndUpdate(id, {
      nombre,
      precio,
      categoria,
      imagen,
      descripcion,
      stock
    });

    res.json({ ok: true });

  } catch (err) {

    console.log("❌ error editando producto", err);

    res.status(500).json({ error: "error editando producto" });

  }

});

/* =======================
   ADMIN BORRAR
======================= */

app.post("/api/admin/eliminar", async (req, res) => {

  const { id } = req.body;

  try {

    await Producto.findByIdAndDelete(id);

    res.json({ ok: true });

  } catch (err) {

    console.log("❌ error eliminando producto", err);

    res.status(500).json({ error: "error eliminando producto" });

  }

});

/* =======================
   CARRITO
======================= */

app.get("/api/carrito", (req, res) => {

  if (!req.session.carrito) req.session.carrito = [];

  res.json(req.session.carrito);

});


app.post("/api/carrito/agregar", async (req, res) => {

  const { productoId, cantidad } = req.body;

  const producto = await Producto.findById(productoId);

  if (!producto) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  if (producto.stock <= 0) {
    return res.status(400).json({ error: "Sin stock" });
  }

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

  res.json({ ok: true });

});


app.post("/api/carrito/eliminar", (req, res) => {

  const { productoId } = req.body;

  if (!req.session.carrito) req.session.carrito = [];

  req.session.carrito =
    req.session.carrito.filter(p => p._id !== productoId);

  res.json({ ok: true });

});


/* =======================
   FINALIZAR COMPRA
======================= */

app.post("/api/compra/finalizar", async (req, res) => {

  if (!req.session.carrito || req.session.carrito.length === 0) {
    return res.status(400).json({ error: "Carrito vacío" });
  }

  try {

    for (const item of req.session.carrito) {

      const producto = await Producto.findById(item._id);

      if (!producto) continue;

      if (producto.stock < item.cantidad) {
        return res.status(400).json({
          error: `No hay suficiente stock de ${producto.nombre}`
        });
      }

      producto.stock -= item.cantidad;

      await producto.save();

    }

    req.session.carrito = [];

    res.json({ ok: true });

  } catch (err) {

    console.log("❌ error finalizando compra", err);

    res.status(500).json({ error: "error finalizando compra" });

  }

});

/* =======================
   SERVER
======================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {

  console.log("🚀 Servidor activo");
  console.log("Clientes: /");
  console.log("Admin: /admin");

});