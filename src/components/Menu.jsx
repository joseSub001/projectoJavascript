import { useState, useEffect } from "react";
import { loadData, saveData } from "../utils/storage";
import { useNavigate } from "react-router-dom";

const MEALS_KEY = "amaru_menu";
const ORDERS_KEY = "amaru_pedidos";

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

const CART_KEY = "amaru_carrito";

const Menu = ({ user, cart, setCart }) => {
  const [menu, setMenu] = useState([]);
  const [filterCat, setFilterCat] = useState("Todas");
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = loadData(MEALS_KEY, null);
    if (!saved) {
      saveData(MEALS_KEY, defaultMenu);
      setMenu(defaultMenu);
    } else {
      setMenu(saved);
    }
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const addToCart = (item) => {
    if (!user) {
      navigate("/login");
      return;
    }
    const currentCart = loadData(CART_KEY, []);
    const existing = currentCart.find((c) => c.id === item.id);
    let updated;
    if (existing) {
      updated = currentCart.map((c) =>
        c.id === item.id ? { ...c, qty: c.qty + 1 } : c
      );
    } else {
      updated = [...currentCart, { ...item, qty: 1 }];
    }
    saveData(CART_KEY, updated);
    if (setCart) setCart(updated);
    showToast(`🛒 "${item.name}" añadido al carrito.`);
  };

  const categories = ["Todas", ...new Set(menu.map((m) => m.category))];
  const displayed = menu.filter(
    (m) => m.available && (filterCat === "Todas" || m.category === filterCat)
  );

  return (
    <section id="menu" className="py-5 bg-white">
      {toast && (
        <div
          className="position-fixed bottom-0 end-0 m-4 alert alert-dark shadow-lg"
          style={{ zIndex: 9999, minWidth: "260px", borderRadius: "12px" }}
        >
          {toast}
        </div>
      )}

      <div className="container py-4">
        <div className="text-center mb-5">
          <h2 className="brand-font fs-1">Nuestra Carta</h2>
          <div
            style={{
              width: "40px",
              height: "2px",
              backgroundColor: "var(--primary-color)",
            }}
            className="mx-auto mt-3"
          ></div>
          <p className="text-muted mt-3">
            Menú actualizado desde el panel de administración · Persistido en LocalStorage
          </p>
        </div>

        {/* Category filter */}
        <div className="d-flex gap-2 flex-wrap justify-content-center mb-5">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`btn btn-sm ${filterCat === cat ? "btn-dark" : "btn-outline-secondary"}`}
              onClick={() => setFilterCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {displayed.length === 0 ? (
          <p className="text-center text-muted py-5">
            No hay platos disponibles en esta categoría.
          </p>
        ) : (
          <div className="row g-4 justify-content-center">
            {displayed.map((item) => (
              <div key={item.id} className="col-md-6 col-lg-4">
                <div className="card menu-card h-100">
                  <div className="menu-img-container">
                    {item.img ? (
                      <img
                        src={item.img}
                        className="card-img-top rounded-0"
                        alt={item.name}
                        style={{ height: "250px", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        className="d-flex align-items-center justify-content-center bg-light"
                        style={{ height: "250px" }}
                      >
                        <i className="bi bi-image fs-1 text-muted"></i>
                      </div>
                    )}
                  </div>
                  <div className="card-body text-center mt-3 p-0 pb-3 px-3">
                    <span className="badge bg-secondary mb-2">{item.category}</span>
                    <h4 className="brand-font fs-5 mb-2">{item.name}</h4>
                    <p className="text-muted small mb-3">{item.desc}</p>
                    <p className="menu-price mb-3">S/ {Number(item.price).toFixed(2)}</p>
                    <button
                      id={`btn-add-cart-${item.id}`}
                      className="btn btn-dark btn-sm w-100"
                      onClick={() => addToCart(item)}
                    >
                      <i className="bi bi-cart-plus me-2"></i>
                      {user ? "Agregar al carrito" : "Iniciar sesión para ordenar"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Menu;
