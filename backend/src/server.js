require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { pool } = require("./db");
const { auth } = require("./middlewares/auth");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.json({ ok: true, name: "Inventario_LimCar1 API" });
});


app.get("/db-test", async (req, res) => {
  try {
    const r = await pool.query("SELECT NOW() as now");
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.post("/auth/register", async (req, res) => {
  try {
    const { cedula, nombre, email, password } = req.body;

    if (!cedula || !nombre || !password) {
      return res.status(400).json({ msg: "Datos incompletos" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO usuarios (cedula, nombre, email, password_hash, rol)
       VALUES ($1, $2, $3, $4, 'usuario')
       RETURNING id, cedula, nombre, rol`,
      [cedula, nombre, email || null, password_hash]
    );

    res.json({ msg: "Usuario registrado", usuario: result.rows[0] });
  } catch (e) {
  
    if (e.code === "23505") {
      return res.status(409).json({ msg: "Cédula o email ya registrado" });
    }
    res.status(500).json({ error: e.message });
  }
});


app.post("/auth/login", async (req, res) => {
  try {
    const { cedula, password } = req.body;

    const result = await pool.query("SELECT * FROM usuarios WHERE cedula = $1", [cedula]);

    if (result.rows.length === 0) {
      return res.status(401).json({ msg: "Credenciales incorrectas" });
    }

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ msg: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      { id: user.id, rol: user.rol, nombre: user.nombre },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      usuario: { id: user.id, cedula: user.cedula, nombre: user.nombre, rol: user.rol }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.get("/me", auth, (req, res) => {
  res.json(req.user);
});


app.get("/productos", auth, async (req, res) => {
  try {
    const q = `
      SELECT p.*, c.nombre AS categoria
      FROM productos p
      LEFT JOIN categorias c ON c.id = p.categoria_id
      ORDER BY p.id DESC
    `;
    const r = await pool.query(q);
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.get("/productos/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const q = `
      SELECT p.*, c.nombre AS categoria
      FROM productos p
      LEFT JOIN categorias c ON c.id = p.categoria_id
      WHERE p.id = $1
    `;
    const r = await pool.query(q, [id]);
    if (!r.rows.length) return res.status(404).json({ msg: "Producto no existe" });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.post("/productos", auth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { nombre, sku, categoria_id, stock_minimo, precio, stock_inicial } = req.body;

    if (!nombre) return res.status(400).json({ msg: "nombre es obligatorio" });


    let inicial = parseInt(stock_inicial, 10);
    if (!Number.isFinite(inicial) || inicial < 1) inicial = 1;

    await client.query("BEGIN");

   
    const pr = await client.query(
      `INSERT INTO productos (nombre, sku, categoria_id, stock_minimo, precio, stock)
       VALUES ($1, $2, $3, $4, $5, 0)
       RETURNING *;`,
      [
        nombre,
        sku || null,
        categoria_id || null,
        Number.isFinite(+stock_minimo) ? +stock_minimo : 0,
        Number.isFinite(+precio) ? +precio : 0
      ]
    );

    const producto = pr.rows[0];


    await client.query(
      `INSERT INTO movimientos (producto_id, tipo, cantidad, motivo, usuario_id)
       VALUES ($1, 'ENTRADA', $2, $3, $4);`,
      [producto.id, inicial, "Registro inicial del producto", req.user.id]
    );


    const ur = await client.query(
      `UPDATE productos SET stock = $1 WHERE id = $2 RETURNING *;`,
      [inicial, producto.id]
    );

    await client.query("COMMIT");

    res.json({ msg: "Producto creado", producto: ur.rows[0] });
  } catch (e) {
    await client.query("ROLLBACK");
    if (e.code === "23505") return res.status(409).json({ msg: "SKU ya existe" });
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});



app.put("/productos/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, sku, categoria_id, stock_minimo, precio, activo } = req.body;

    if (!nombre) return res.status(400).json({ msg: "nombre es obligatorio" });

    const q = `
      UPDATE productos
      SET nombre=$1, sku=$2, categoria_id=$3, stock_minimo=$4, precio=$5, activo=$6
      WHERE id=$7
      RETURNING *;
    `;
    const r = await pool.query(q, [
      nombre,
      sku || null,
      categoria_id || null,
      Number.isFinite(+stock_minimo) ? +stock_minimo : 0,
      Number.isFinite(+precio) ? +precio : 0,
      typeof activo === "boolean" ? activo : true,
      id
    ]);

    if (!r.rows.length) return res.status(404).json({ msg: "Producto no existe" });
    res.json({ msg: "Producto actualizado", producto: r.rows[0] });
  } catch (e) {
    if (e.code === "23505") {
      return res.status(409).json({ msg: "SKU ya existe" });
    }
    res.status(500).json({ error: e.message });
  }
});


app.delete("/productos/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const r = await pool.query("DELETE FROM productos WHERE id=$1", [id]);
    if (r.rowCount === 0) return res.status(404).json({ msg: "Producto no existe" });
    res.json({ msg: "Producto eliminado" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.get("/movimientos", auth, async (req, res) => {
  try {
    const q = `
      SELECT m.*, p.nombre AS producto, u.nombre AS usuario
      FROM movimientos m
      JOIN productos p ON p.id = m.producto_id
      JOIN usuarios u ON u.id = m.usuario_id
      ORDER BY m.id DESC
    `;
    const r = await pool.query(q);
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/movimientos", auth, async (req, res) => {
  const client = await pool.connect();
  try {
  const { producto_id, tipo, cantidad, motivo } = req.body;

    if (!producto_id || !tipo || !cantidad) {
      return res.status(400).json({ msg: "producto_id, tipo, cantidad son obligatorios" });
    }

    const t = String(tipo).toUpperCase();
    if (t !== "ENTRADA" && t !== "SALIDA") {
      return res.status(400).json({ msg: "tipo debe ser ENTRADA o SALIDA" });
    }

    const qty = parseInt(cantidad, 10);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ msg: "cantidad debe ser un entero > 0" });
    }

    await client.query("BEGIN");

    const pr = await client.query("SELECT id, stock FROM productos WHERE id=$1 FOR UPDATE", [producto_id]);
    if (!pr.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ msg: "Producto no existe" });
    }

    const stockActual = parseInt(pr.rows[0].stock, 10) || 0;
    const nuevoStock = t === "ENTRADA" ? stockActual + qty : stockActual - qty;

    if (nuevoStock < 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ msg: "Stock insuficiente para realizar la salida" });
    }

    const mr = await client.query(
      `INSERT INTO movimientos (producto_id, tipo, cantidad, motivo, usuario_id)
 VALUES ($1, $2, $3, $4, $5)`
      [producto_id, t, qty, motivo || null, req.user.id]
    );

    const ur = await client.query(
      "UPDATE productos SET stock=$1 WHERE id=$2 RETURNING id, nombre, stock, stock_minimo",
      [nuevoStock, producto_id]
    );

    await client.query("COMMIT");

    res.json({
      msg: "Movimiento registrado",
      movimiento: mr.rows[0],
      producto: ur.rows[0]
    });
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
