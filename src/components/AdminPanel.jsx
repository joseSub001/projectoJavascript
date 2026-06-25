import { useState, useEffect } from "react";
import { loadData, saveData } from "../utils/storage";

const MEALS_KEY = "amaru_menu";

const defaultMenu = [
  {
    id: "1",
    name: "Ceviche Clásico",
    desc: "Pescado fresco marinado en limón, ají limo, culantro y cebolla roja.",
    img: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&w=600&q=80",
    price: 35.0,
    category: "Entradas",
    available: true,
  },
  {
    id: "2",
    name: "Lomo Saltado",
    desc: "Trozos de lomo fino salteados al wok con cebolla, tomate y ají amarillo.",
    img: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80",
    price: 42.0,
    category: "Fondos",
    available: true,
  },
  {
    id: "3",
    name: "Ají de Gallina",
    desc: "Crema de ají amarillo con pechuga deshilachada, acompañado de arroz.",
    img: "https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=600&q=80",
    price: 28.0,
    category: "Fondos",
    available: true,
  },
];

const emptyForm = {
  name: "",
  desc: "",
  img: "",
  price: "",
  category: "Entradas",
  available: true,
};

const CATEGORIES = ["Entradas", "Fondos", "Bebidas", "Postres", "Especiales"];

// Validation rules
const validateForm = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = "El nombre es obligatorio.";
  else if (form.name.trim().length < 3) errors.name = "El nombre debe tener al menos 3 caracteres.";

  if (!form.desc.trim()) errors.desc = "La descripción es obligatoria.";
  else if (form.desc.trim().length < 10) errors.desc = "La descripción debe tener al menos 10 caracteres.";

  const priceNum = parseFloat(form.price);
  if (!String(form.price).trim()) errors.price = "El precio es obligatorio.";
  else if (isNaN(priceNum) || priceNum <= 0) errors.price = "El precio debe ser un número mayor a 0.";
  else if (priceNum > 9999) errors.price = "El precio no puede superar S/ 9,999.";

  if (form.img.trim() && !/^https?:\/\/.+/.test(form.img.trim())) {
    errors.img = "La URL de imagen debe comenzar con http:// o https://";
  }

  return errors;
};

const AdminPanel = ({ user }) => {
  const [menu, setMenu] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filterCategory, setFilterCategory] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");

  // Load menu from localStorage on mount
  useEffect(() => {
    const saved = loadData(MEALS_KEY, null);
    if (!saved) {
      saveData(MEALS_KEY, defaultMenu);
      setMenu(defaultMenu);
    } else {
      setMenu(saved);
    }
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const openCreate = () => {
    setForm(emptyForm);
    setErrors({});
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({
      name: item.name,
      desc: item.desc,
      img: item.img || "",
      price: String(item.price),
      category: item.category,
      available: item.available,
    });
    setErrors({});
    setEditId(item.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    let updated;
    if (editId) {
      // UPDATE
      updated = menu.map((item) =>
        item.id === editId
          ? {
              ...item,
              name: form.name.trim(),
              desc: form.desc.trim(),
              img: form.img.trim(),
              price: parseFloat(form.price),
              category: form.category,
              available: form.available,
            }
          : item
      );
      showToast(`✅ Plato "${form.name.trim()}" actualizado correctamente.`);
    } else {
      // CREATE
      const newItem = {
        id: Date.now().toString(),
        name: form.name.trim(),
        desc: form.desc.trim(),
        img: form.img.trim(),
        price: parseFloat(form.price),
        category: form.category,
        available: form.available,
      };
      updated = [...menu, newItem];
      showToast(`✅ Plato "${newItem.name}" creado correctamente.`);
    }

    saveData(MEALS_KEY, updated);
    setMenu(updated);
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
    setErrors({});
  };

  const handleDelete = (id) => {
    const item = menu.find((m) => m.id === id);
    const updated = menu.filter((m) => m.id !== id);
    saveData(MEALS_KEY, updated);
    setMenu(updated);
    setConfirmDelete(null);
    showToast(`🗑️ Plato "${item?.name}" eliminado.`, "warning");
  };

  // API: Fetch random meal suggestion from TheMealDB
  const fetchApiSuggestion = async () => {
    setApiLoading(true);
    try {
      const res = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
      if (!res.ok) throw new Error("Error en la respuesta de la API");
      const data = await res.json();
      const meal = data.meals[0];
      setForm({
        name: meal.strMeal,
        desc: meal.strInstructions.slice(0, 120) + "...",
        img: meal.strMealThumb,
        price: "",
        category: "Especiales",
        available: true,
      });
      setErrors({});
      setEditId(null);
      setShowForm(true);
      showToast("🌐 Sugerencia importada desde TheMealDB. ¡Revisa y ajusta el precio!", "info");
    } catch (err) {
      showToast("❌ Error al consultar la API externa. Intenta de nuevo.", "error");
    } finally {
      setApiLoading(false);
    }
  };

  // Filtered + searched menu
  const displayedMenu = menu.filter((item) => {
    const matchCat = filterCategory === "Todas" || item.category === filterCategory;
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  if (!user || user.role !== "admin") {
    return (
      <main className="container py-5 text-center min-vh-100">
        <div className="alert alert-danger mt-5 p-4">
          <i className="bi bi-shield-lock fs-1 d-block mb-3"></i>
          <h4>Acceso restringido</h4>
          <p className="mb-0">Solo los administradores pueden acceder a este panel.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-light min-vh-100">
      {/* Toast notification */}
      {toast && (
        <div
          className={`position-fixed top-0 end-0 m-3 alert ${
            toast.type === "error"
              ? "alert-danger"
              : toast.type === "warning"
              ? "alert-warning"
              : toast.type === "info"
              ? "alert-info"
              : "alert-success"
          } shadow-lg`}
          style={{ zIndex: 9999, minWidth: "300px", borderRadius: "12px" }}
          role="alert"
        >
          {toast.msg}
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9998 }}
        >
          <div className="card shadow-lg p-4" style={{ maxWidth: "400px", borderRadius: "16px" }}>
            <h5 className="mb-3">⚠️ Confirmar eliminación</h5>
            <p>
              ¿Estás seguro de que deseas eliminar el plato{" "}
              <strong>"{menu.find((m) => m.id === confirmDelete)?.name}"</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="d-flex gap-2 justify-content-end mt-3">
              <button className="btn btn-outline-secondary" onClick={() => setConfirmDelete(null)}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(confirmDelete)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container py-5">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
          <div>
            <h1 className="brand-font fs-2 mb-1">Panel de Administración</h1>
            <p className="text-muted mb-0">Gestiona la carta del restaurante Amaru</p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <button
              className="btn btn-outline-secondary"
              onClick={fetchApiSuggestion}
              disabled={apiLoading}
              title="Importar sugerencia de plato desde TheMealDB"
            >
              {apiLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Consultando API...
                </>
              ) : (
                <>
                  <i className="bi bi-cloud-download me-2"></i>Sugerir desde API
                </>
              )}
            </button>
            <button className="btn btn-dark" onClick={openCreate}>
              <i className="bi bi-plus-lg me-2"></i>Nuevo Plato
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center py-3">
              <div className="fs-2 fw-bold text-dark">{menu.length}</div>
              <div className="text-muted small">Total platos</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center py-3">
              <div className="fs-2 fw-bold text-success">{menu.filter((m) => m.available).length}</div>
              <div className="text-muted small">Disponibles</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center py-3">
              <div className="fs-2 fw-bold text-warning">{menu.filter((m) => !m.available).length}</div>
              <div className="text-muted small">No disponibles</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center py-3">
              <div className="fs-2 fw-bold" style={{ color: "var(--primary-color, #c8a96e)" }}>
                {[...new Set(menu.map((m) => m.category))].length}
              </div>
              <div className="text-muted small">Categorías</div>
            </div>
          </div>
        </div>

        {/* Form create/edit */}
        {showForm && (
          <div className="card shadow-sm mb-4 border-0" style={{ borderRadius: "16px" }}>
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 brand-font">
                  {editId ? "✏️ Editar Plato" : "➕ Nuevo Plato"}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => { setShowForm(false); setErrors({}); }}
                  aria-label="Cerrar formulario"
                ></button>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  {/* Name */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Nombre del plato <span className="text-danger">*</span>
                    </label>
                    <input
                      id="admin-field-name"
                      type="text"
                      className={`form-control ${errors.name ? "is-invalid" : ""}`}
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Ej. Ceviche Mixto"
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>

                  {/* Price */}
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">
                      Precio (S/) <span className="text-danger">*</span>
                    </label>
                    <input
                      id="admin-field-price"
                      type="number"
                      step="0.5"
                      min="0.5"
                      className={`form-control ${errors.price ? "is-invalid" : ""}`}
                      value={form.price}
                      onChange={(e) => updateField("price", e.target.value)}
                      placeholder="0.00"
                    />
                    {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                  </div>

                  {/* Category */}
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Categoría</label>
                    <select
                      id="admin-field-category"
                      className="form-select"
                      value={form.category}
                      onChange={(e) => updateField("category", e.target.value)}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      Descripción <span className="text-danger">*</span>
                    </label>
                    <textarea
                      id="admin-field-desc"
                      className={`form-control ${errors.desc ? "is-invalid" : ""}`}
                      rows={3}
                      value={form.desc}
                      onChange={(e) => updateField("desc", e.target.value)}
                      placeholder="Describe el plato brevemente..."
                    />
                    {errors.desc && <div className="invalid-feedback">{errors.desc}</div>}
                  </div>

                  {/* Image URL */}
                  <div className="col-md-9">
                    <label className="form-label fw-semibold">URL de imagen</label>
                    <input
                      id="admin-field-img"
                      type="url"
                      className={`form-control ${errors.img ? "is-invalid" : ""}`}
                      value={form.img}
                      onChange={(e) => updateField("img", e.target.value)}
                      placeholder="https://..."
                    />
                    {errors.img && <div className="invalid-feedback">{errors.img}</div>}
                  </div>

                  {/* Available toggle */}
                  <div className="col-md-3 d-flex align-items-end">
                    <div className="form-check form-switch mb-2">
                      <input
                        id="admin-field-available"
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        checked={form.available}
                        onChange={(e) => updateField("available", e.target.checked)}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="admin-field-available">
                        Disponible
                      </label>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => { setShowForm(false); setErrors({}); }}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-dark px-4">
                    {editId ? "Guardar cambios" : "Crear plato"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filter + Search bar */}
        <div className="card shadow-sm border-0 mb-4 p-3" style={{ borderRadius: "12px" }}>
          <div className="row g-2 align-items-center">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  id="admin-search"
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Buscar plato..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex gap-2 flex-wrap">
                {["Todas", ...CATEGORIES].map((cat) => (
                  <button
                    key={cat}
                    className={`btn btn-sm ${filterCategory === cat ? "btn-dark" : "btn-outline-secondary"}`}
                    onClick={() => setFilterCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Menu table */}
        {displayedMenu.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-inbox fs-1 d-block mb-3"></i>
            <p>No se encontraron platos. {menu.length === 0 ? "Crea el primero." : "Prueba otro filtro."}</p>
          </div>
        ) : (
          <div className="card shadow-sm border-0" style={{ borderRadius: "16px", overflow: "hidden" }}>
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="table-dark">
                  <tr>
                    <th style={{ width: "70px" }}>Foto</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedMenu.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.img ? (
                          <img
                            src={item.img}
                            alt={item.name}
                            style={{ width: "56px", height: "56px", objectFit: "cover", borderRadius: "8px" }}
                          />
                        ) : (
                          <div
                            className="bg-secondary text-white d-flex align-items-center justify-content-center"
                            style={{ width: "56px", height: "56px", borderRadius: "8px" }}
                          >
                            <i className="bi bi-image"></i>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="fw-semibold">{item.name}</div>
                        <div className="text-muted small" style={{ maxWidth: "300px" }}>
                          {item.desc.length > 60 ? item.desc.slice(0, 60) + "..." : item.desc}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-secondary">{item.category}</span>
                      </td>
                      <td className="fw-semibold">S/ {Number(item.price).toFixed(2)}</td>
                      <td>
                        <span className={`badge ${item.available ? "bg-success" : "bg-warning text-dark"}`}>
                          {item.available ? "Disponible" : "No disponible"}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-dark me-2"
                          onClick={() => openEdit(item)}
                          title="Editar plato"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => setConfirmDelete(item.id)}
                          title="Eliminar plato"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p className="text-muted small mt-3 text-end">
          Mostrando {displayedMenu.length} de {menu.length} platos · Datos persistidos en LocalStorage
        </p>
      </div>
    </main>
  );
};

export default AdminPanel;
