import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    setCedula("");
    setPassword("");
    setMsg("");
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const res = await api.post("/auth/login", { cedula, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.usuario));

    
      setCedula("");
      setPassword("");

      navigate("/dashboard");
    } catch (err) {
      setMsg(err.response?.data?.msg || err.response?.data?.error || "Error al iniciar sesión");
    }
  };

  return (
    <div className="hero">
      <div className="card card-pad formCard">
        <h1 className="h1">Inventario LimCar</h1>
        <p className="p">Accede con tu cédula y contraseña</p>

        {/*  autoComplete="off" en el formulario */}
        <form onSubmit={onSubmit} className="formRow" autoComplete="off">
          <input
            className="input"
            placeholder="Cédula"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            required
            autoComplete="off"
            inputMode="numeric"
          />

          <input
            className="input"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          {msg && <div className="toast">{msg}</div>}

          <button className="btn btn-primary" type="submit">
            Entrar
          </button>

          <div className="small">
            ¿No tienes cuenta? <Link to="/register">Crear usuario</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

