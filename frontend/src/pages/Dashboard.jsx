import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [kpi, setKpi] = useState({ productos: 0, movimientos: 0 });

  useEffect(() => {
    (async () => {
      const [p, m] = await Promise.all([api.get("/productos"), api.get("/movimientos")]);
      setKpi({ productos: p.data.length, movimientos: m.data.length });
    })().catch(() => {});
  }, []);

  return (
    <div className="grid">
      <div className="col-6 card card-pad">
        <div className="kpi">
          <div>
            <div className="small">Productos registrados</div>
            <strong>{kpi.productos}</strong>
          </div>
          <div style={{ fontSize: 28 }}>📦</div>
        </div>
      </div>

      <div className="col-6 card card-pad">
        <div className="kpi">
          <div>
            <div className="small">Movimientos</div>
            <strong>{kpi.movimientos}</strong>
          </div>
          <div style={{ fontSize: 28 }}>🔄</div>
        </div>
      </div>

      <div className="col-6 card card-pad">
        <h3 style={{ marginTop: 0 }}>Gestión de productos</h3>
        <p className="p">Crea, edita, elimina y revisa stock mínimo.</p>
        <div style={{ marginTop: 12 }}>
          <Link className="btn btn-primary" to="/productos">Ir a Productos</Link>
        </div>
      </div>

      <div className="col-6 card card-pad">
        <h3 style={{ marginTop: 0 }}>Historial y stock</h3>
        <p className="p">Registra entradas/salidas y consulta el historial.</p>
        <div style={{ marginTop: 12 }}>
          <Link className="btn btn-primary" to="/movimientos">Ir a Movimientos</Link>
        </div>
      </div>
    </div>
  );
}
