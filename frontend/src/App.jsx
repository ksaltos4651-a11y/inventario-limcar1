import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Productos from "./pages/Productos.jsx";
import Movimientos from "./pages/Movimientos.jsx";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
}

function Shell({ title, subtitle, children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="container">
      <div className="nav">
        <div className="brand">
          <div className="badge" />
          <div>
            <div className="h1">{title}</div>
            <div className="p">{subtitle}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className="small">{user?.nombre ? `👤 ${user.nombre}` : ""}</span>
          <Link className="btn" to="/dashboard">Dashboard</Link>
          <button className="btn btn-danger" onClick={logout}>Salir</button>
        </div>
      </div>

      {children}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Shell title="Inventario LimCar" subtitle="Panel principal">
                <Dashboard />
              </Shell>
            </PrivateRoute>
          }
        />

        <Route
          path="/productos"
          element={
            <PrivateRoute>
              <Shell title="Productos" subtitle="CRUD + stock mínimo">
                <Productos />
              </Shell>
            </PrivateRoute>
          }
        />

        <Route
          path="/movimientos"
          element={
            <PrivateRoute>
              <Shell title="Movimientos" subtitle="Entradas / Salidas + historial">
                <Movimientos />
              </Shell>
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
