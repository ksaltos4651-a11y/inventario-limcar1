import { useEffect, useState } from "react";
import api from "../services/api";

export default function Productos() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");
  const [editingId, setEditingId] = useState(null);


  const [form, setForm] = useState({
    nombre: "",
    sku: "",
    stock_minimo: 0,
    precio: 0,
    stock_inicial: 1
  });

  const load = async () => {
    const r = await api.get("/productos");
    setItems(r.data);
  };

  useEffect(() => {
    load().catch(() => setMsg("No se pudo cargar productos"));
  }, []);

  const resetForm = () => {
    setForm({ nombre: "", sku: "", stock_minimo: 0, precio: 0, stock_inicial: 1 });
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      if (editingId) {
    
        const { stock_inicial, ...payload } = form;
        await api.put(`/productos/${editingId}`, { ...payload, activo: true });
        setEditingId(null);
      } else {
      
        const payload = {
          ...form,
          stock_inicial: Number.isFinite(+form.stock_inicial) ? +form.stock_inicial : 1
        };
        await api.post("/productos", payload);
      }

      resetForm();
      await load();
    } catch (err) {
      setMsg(
        err.response?.data?.msg ||
          err.response?.data?.error ||
          "Error guardando producto"
      );
    }
  };

  const edit = (p) => {
    setEditingId(p.id);
    setForm({
      nombre: p.nombre || "",
      sku: p.sku || "",
      stock_minimo: Number(p.stock_minimo ?? 0),
      precio: Number(p.precio ?? 0),
    
      stock_inicial: Number(p.stock ?? 1)
    });
  };

  const remove = async (id) => {
    if (!confirm("¿Eliminar producto?")) return;
    await api.delete(`/productos/${id}`);
    await load();
  };

  return (
    <div className="grid">
      <div className="col-12 card card-pad">
        <h3 style={{ marginTop: 0 }}>
          {editingId ? `Editar producto #${editingId}` : "Nuevo producto"}
        </h3>

        <form onSubmit={submit} className="grid" style={{ marginTop: 10 }}>
          <div className="col-6">
            <input
              className="input"
              placeholder="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />
          </div>

          <div className="col-6">
            <input
              className="input"
              placeholder="SKU"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
          </div>

          <div className="col-6">
            <input
              className="input"
              type="number"
              placeholder="Stock mínimo"
              value={form.stock_minimo}
              onChange={(e) => setForm({ ...form, stock_minimo: Number(e.target.value) })}
            />
          </div>

          <div className="col-6">
            <input
              className="input"
              type="number"
              step="0.01"
              placeholder="Precio"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })}
            />
          </div>

          {/*  Stock inicial solo tiene sentido al crear */}
          <div className="col-6">
            <input
              className="input"
              type="number"
              placeholder="Stock inicial"
              value={form.stock_inicial}
              onChange={(e) => setForm({ ...form, stock_inicial: Number(e.target.value) })}
              disabled={!!editingId} 
              title={editingId ? "El stock se modifica desde Movimientos" : "Stock inicial al crear el producto"}
            />
            {editingId && (
              <div className="small" style={{ marginTop: 6 }}>
                * El stock se ajusta desde <b>Movimientos</b> (Entradas/Salidas).
              </div>
            )}
          </div>

          <div className="col-12" style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" type="submit">
              {editingId ? "Actualizar" : "Crear"}
            </button>

            {editingId && (
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setEditingId(null);
                  resetForm();
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {msg && <div className="toast">{msg}</div>}
      </div>

      <div className="col-12 card card-pad">
        <h3 style={{ marginTop: 0 }}>Listado</h3>

        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Mínimo</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.nombre}</td>
                  <td>{p.sku || "-"}</td>
                  <td>{p.stock}</td>
                  <td>{p.stock_minimo}</td>
                  <td>${Number(p.precio).toFixed(2)}</td>
                  <td style={{ display: "flex", gap: 10 }}>
                    <button className="btn" onClick={() => edit(p)}>
                      Editar
                    </button>
                    <button className="btn btn-danger" onClick={() => remove(p.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}

              {!items.length && (
                <tr>
                  <td colSpan="7" style={{ color: "rgba(255,255,255,.7)" }}>
                    Sin productos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
