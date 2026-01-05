import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const [cedula, setCedula] = useState("");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await api.post("/auth/register", { cedula, nombre, email, password });
      navigate("/");
    } catch (err) {
  const data = err.response?.data;
  setMsg(data?.msg || data?.error || "Error al registrar");
}

  };

  return (
    <div className="hero">
      <div className="card card-pad formCard">
        <h1 className="h1">Crear cuenta</h1>
        <p className="p">Regístrate para ingresar al sistema</p>

        <form onSubmit={onSubmit} className="formRow">
          <input className="input" placeholder="Cédula" value={cedula} onChange={(e) => setCedula(e.target.value)} required />
          <input className="input" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          <input className="input" placeholder="Email (opcional)" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />

          {msg && <div className="toast">{msg}</div>}

          <button className="btn btn-primary" type="submit">Crear usuario</button>
          <div className="small">
            ¿Ya tienes cuenta? <Link to="/">Volver al login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
