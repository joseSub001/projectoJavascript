import { useState, useEffect } from "react";
import { loadData, saveData } from "../utils/storage";
import { useNavigate } from "react-router-dom";

const CART_KEY = "amaru_carrito";
const ORDERS_KEY = "amaru_pedidos";

const Carrito = ({ user, cart, setCart }) => {
  const [localCart, setLocalCart] = useState([]);
  const [pedidoEnviado, setPedidoEnviado] = useState(false);
  const [note, setNote] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const saved = loadData(CART_KEY, []);
    setLocalCart(saved);
  }, [cart]);

  const syncCart = (updated) => {
    setLocalCart(updated);
    saveData(CART_KEY, updated);
    if (setCart) setCart(updated);
  };

  const updateQty = (id, delta) => {
    const updated = localCart
      .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
      .filter((item) => item.qty > 0);
    syncCart(updated);
  };

  const removeItem = (id) => {
    syncCart(localCart.filter((item) => item.id !== id));
  };

  const clearCart = () => syncCart([]);

  const total = localCart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const totalItems = localCart.reduce((acc, item) => acc + item.qty, 0);

  const confirmarPedido = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (localCart.length === 0) return;

    const newOrder = {
      id: Date.now().toString(),
      clientEmail: user.email,
      clientName: user.name,
      items: localCart,
      total: total,
      note: note.trim(),
      date: new Date().toISOString(),
      status: "pendiente",
    };

    const existingOrders = loadData(ORDERS_KEY, []);
    saveData(ORDERS_KEY, [newOrder, ...existingOrders]);
    syncCart([]);
    setNote("");
    setPedidoEnviado(true);
  };

  if (!user) {
    return (
      <main className="container py-5 text-center min-vh-100">
        <div className="alert alert-warning mt-5 p-4">
          <i className="bi bi-cart-x fs-1 d-block mb-3"></i>
          <h4>Debes iniciar sesión</h4>
          <p className="mb-3">Para realizar un pedido, primero inicia sesión en tu cuenta.</p>
          <button className="btn btn-dark" onClick={() => navigate("/login")}>
            Iniciar sesión
          </button>
        </div>
      </main>
    );
  }

  if (pedidoEnviado) {
    return (
      <main className="container py-5 text-center min-vh-100">
        <div className="card shadow-sm p-5 mx-auto mt-5" style={{ maxWidth: "500px", borderRadius: "20px" }}>
          <i className="bi bi-check-circle-fill text-success fs-1 mb-3"></i>
          <h3 className="brand-font mb-3">¡Pedido confirmado!</h3>
          <p className="text-muted mb-4">
            Tu pedido ha sido enviado al restaurante. En breve lo prepararemos.
          </p>
          <div className="d-flex gap-2 justify-content-center">
            <button className="btn btn-outline-dark" onClick={() => navigate("/")}>
              Ver carta
            </button>
            <button className="btn btn-dark" onClick={() => setPedidoEnviado(false)}>
              Nuevo pedido
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-light min-vh-100">
      <div className="container py-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h1 className="brand-font fs-2 mb-0">
            <i className="bi bi-cart3 me-2"></i>Mi Carrito
          </h1>
          {localCart.length > 0 && (
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={clearCart}
            >
              <i className="bi bi-trash me-1"></i>Vaciar carrito
            </button>
          )}
        </div>

        {localCart.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-cart-x fs-1 d-block mb-3"></i>
            <p className="mb-3">Tu carrito está vacío.</p>
            <button className="btn btn-dark" onClick={() => navigate("/")}>
              <i className="bi bi-arrow-left me-2"></i>Ver la carta
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {/* Cart items */}
            <div className="col-lg-8">
              <div className="card shadow-sm border-0" style={{ borderRadius: "16px", overflow: "hidden" }}>
                <div className="card-body p-0">
                  {localCart.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`p-3 d-flex align-items-center gap-3 ${idx > 0 ? "border-top" : ""}`}
                    >
                      {item.img && (
                        <img
                          src={item.img}
                          alt={item.name}
                          style={{ width: "64px", height: "64px", objectFit: "cover", borderRadius: "10px" }}
                        />
                      )}
                      <div className="flex-grow-1">
                        <div className="fw-semibold">{item.name}</div>
                        <div className="text-muted small">S/ {Number(item.price).toFixed(2)} c/u</div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => updateQty(item.id, -1)}
                          aria-label="Reducir cantidad"
                        >
                          <i className="bi bi-dash"></i>
                        </button>
                        <span className="fw-bold" style={{ minWidth: "24px", textAlign: "center" }}>
                          {item.qty}
                        </span>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => updateQty(item.id, 1)}
                          aria-label="Aumentar cantidad"
                        >
                          <i className="bi bi-plus"></i>
                        </button>
                      </div>
                      <div className="fw-bold text-end" style={{ minWidth: "80px" }}>
                        S/ {(item.price * item.qty).toFixed(2)}
                      </div>
                      <button
                        className="btn btn-sm btn-link text-danger p-0"
                        onClick={() => removeItem(item.id)}
                        aria-label="Eliminar del carrito"
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nota de pedido */}
              <div className="card shadow-sm border-0 mt-3" style={{ borderRadius: "16px" }}>
                <div className="card-body p-3">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-chat-left-text me-2"></i>Notas adicionales (opcional)
                  </label>
                  <textarea
                    id="cart-note"
                    className="form-control"
                    rows={2}
                    placeholder="Ej. Sin cebolla, alérgico al mariscos, etc."
                    value={note}
                    onChange={(e) => {
                      if (e.target.value.length <= 200) setNote(e.target.value);
                    }}
                  />
                  <div className="text-muted small text-end mt-1">{note.length}/200</div>
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="col-lg-4">
              <div className="card shadow-sm border-0 sticky-top" style={{ borderRadius: "16px", top: "90px" }}>
                <div className="card-body p-4">
                  <h5 className="brand-font mb-4">Resumen del pedido</h5>
                  <div className="d-flex justify-content-between mb-2 text-muted">
                    <span>Productos ({totalItems})</span>
                    <span>S/ {total.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 text-muted">
                    <span>Servicio</span>
                    <span className="text-success">Gratis</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold fs-5 mb-4">
                    <span>Total</span>
                    <span>S/ {total.toFixed(2)}</span>
                  </div>
                  <button
                    id="btn-confirmar-pedido"
                    className="btn btn-dark w-100 py-2"
                    onClick={confirmarPedido}
                  >
                    <i className="bi bi-check-circle me-2"></i>Confirmar pedido
                  </button>
                  <p className="text-muted small text-center mt-3 mb-0">
                    Hola, <strong>{user.name}</strong>. Tu pedido será registrado en el sistema del restaurante.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Carrito;
