import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadData, saveData } from "../utils/storage";

const defaultUsers = [
  {
    name: "Administrador",
    email: "admin@amaru.pe",
    password: "admin123",
    role: "admin"
  }
];

const Auth = ({ onLogin }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "cliente" });
  const [message, setMessage] = useState(null);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUsers = loadData("amaru_users", []);
    if (savedUsers.length === 0) {
      saveData("amaru_users", defaultUsers);
      setUsers(defaultUsers);
    } else {
      setUsers(savedUsers);
    }
  }, []);

  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setMessage(null);
  };

  const handleRegister = () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setMessage({ type: "error", text: "Todos los campos son obligatorios." });
      return;
    }

    const exists = users.some(user => user.email === form.email.trim().toLowerCase());
    if (exists) {
      setMessage({ type: "error", text: "El correo ya está registrado." });
      return;
    }

    const newUser = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      role: form.role
    };

    const nextUsers = [...users, newUser];
    saveData("amaru_users", nextUsers);
    setUsers(nextUsers);
    setMessage({ type: "success", text: "Usuario registrado. Redirigiendo..." });
    
    // Auto login after registration for a smoother MVP flow
    setTimeout(() => {
      onLogin(newUser);
      navigate('/perfil');
    }, 1000);
  };

  const handleLogin = () => {
    if (!form.email.trim() || !form.password.trim()) {
      setMessage({ type: "error", text: "Correo y contraseña son obligatorios." });
      return;
    }

    const user = users.find(
      u => u.email === form.email.trim().toLowerCase() && u.password === form.password
    );

    if (!user) {
      setMessage({ type: "error", text: "Credenciales inválidas." });
      return;
    }

    onLogin(user);
    navigate('/perfil');
  };

  const submit = (event) => {
    event.preventDefault();
    if (mode === "login") {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  return (
    <main className="container py-5 min-vh-100">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card shadow-sm mt-5">
            <div className="card-body p-4">
              <h2 className="brand-font mb-3 text-center">Amaru Restaurante</h2>
              <p className="text-muted text-center">Inicia sesión o regístrate para usar la aplicación.</p>

              <div className="mb-4 d-flex gap-2">
                <button
                  className={`btn btn-${mode === "login" ? "dark" : "outline-dark"} w-50`}
                  onClick={() => { setMode("login"); setMessage(null); }}
                >
                  Iniciar sesión
                </button>
                <button
                  className={`btn btn-${mode === "register" ? "dark" : "outline-dark"} w-50`}
                  onClick={() => { setMode("register"); setMessage(null); }}
                >
                  Registrarse
                </button>
              </div>

              {message && (
                <div className={`alert ${message.type === "error" ? "alert-danger" : "alert-success"}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={submit}>
                {mode === "register" && (
                  <div className="mb-3">
                    <label className="form-label">Nombre completo</label>
                    <input
                      className="form-control"
                      value={form.name}
                      onChange={(e) => updateForm("name", e.target.value)}
                    />
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Correo electrónico</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    value={form.password}
                    onChange={(e) => updateForm("password", e.target.value)}
                  />
                </div>

{/* Role selection removed, defaults to cliente */}

                <button type="submit" className="btn btn-dark w-100 py-2 mt-3">
                  {mode === "login" ? "Ingresar" : "Crear cuenta"}
                </button>
              </form>

              <p className="small text-muted mt-4 text-center">
                prueba <strong>admin@amaru.pe</strong> / <strong>admin123</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Auth;
