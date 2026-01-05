import { useEffect, useState } from "react";
import api from "../services/api";

export default function Movimientos() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    producto_id: 1,
    tipo: "ENTRADA",
    cantidad: 1,
    motivo: ""
  });

  const load = async () => {
    const r = await api.get("/movimientos");
    setItems(r.data);
  };

  useEffect(() => {
    load().catch(() => setMsg("No se pudo cargar movimientos"));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
    
      await api.post("/movimientos", {
        producto_id: form.producto_id,
        tipo: form.tipo,
        cantidad: form.cantidad,
        motivo: form.motivo
      });

      setForm({ ...form, cantidad: 1, motivo: "" });
      await load();
    } catch (err) {
      setMsg(
        err.response?.data?.msg ||
          err.response?.data?.error ||
          "Error registrando movimiento"
      );
    }
  };

  return (
    <div className="grid">
      <div className="col-12 card card-pad">
        <h3 style={{ marginTop: 0 }}>Registrar movimiento</h3>

        <form onSubmit={submit} className="grid" style={{ marginTop: 10 }}>
          <div className="col-6">
            <input
              className="input"
              type="number"
              placeholder="Producto ID"
              value={form.producto_id}
              onChange={(e) =>
                setForm({ ...form, producto_id: Number(e.target.value) })
              }
            />
          </div>

          <div className="col-6">
            <select
              className="select"
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            >
              <option value="ENTRADA">ENTRADA</option>
              <option value="SALIDA">SALIDA</option>
            </select>
          </div>

          <div className="col-6">
            <input
              className="input"
              type="number"
              placeholder="Cantidad"
              value={form.cantidad}
              onChange={(e) =>
                setForm({ ...form, cantidad: Number(e.target.value) })
              }
            />
          </div>

          <div className="col-6">
            <input
              className="input"
              placeholder="Motivo (opcional)"
              value={form.motivo}
              onChange={(e) => setForm({ ...form, motivo: e.target.value })}
            />
          </div>

          <div className="col-12">
            <button className="btn btn-primary" type="submit">
              Registrar
            </button>
          </div>
        </form>

        {msg && <div className="toast">{msg}</div>}
      </div>

      <div className="col-12 card card-pad">
        <h3 style={{ marginTop: 0 }}>Historial</h3>

        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Motivo</th>
                <th>Usuario</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.producto || m.producto_id}</td>
                  <td>{m.tipo}</td>
                  <td>{m.cantidad}</td>
                  <td>{m.motivo || "-"}</td>
                  <td>{m.usuario || m.usuario_id}</td>
                  <td>
                    {m.created_at ? new Date(m.created_at).toLocaleString() : "-"}
                  </td>
                </tr>
              ))}

              {!items.length && (
                <tr>
                  <td colSpan="7" style={{ color: "rgba(255,255,255,.7)" }}>
                    Sin movimientos
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
