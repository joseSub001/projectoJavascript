import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user, onLogout, cartCount = 0 }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom sticky-top py-3">
      <div className="container">
        <Link className="navbar-brand brand-font fs-3 text-accent" to="/">Amaru</Link>
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link className="nav-link px-3" to="/">Inicio</Link>
            </li>

            {user ? (
              <>
                {/* Carrito con badge */}
                <li className="nav-item">
                  <Link
                    id="nav-link-carrito"
                    className="nav-link px-3 position-relative"
                    to="/carrito"
                    aria-label={`Carrito, ${cartCount} artículos`}
                  >
                    <i className="bi bi-cart3 fs-5"></i>
                    {cartCount > 0 && (
                      <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: '0.65rem' }}
                      >
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link px-3" to="/perfil">Mi Perfil</Link>
                </li>

                {/* Admin link - solo visible para admins */}
                {user.role === 'admin' && (
                  <li className="nav-item">
                    <Link
                      id="nav-link-admin"
                      className="nav-link px-3"
                      to="/admin"
                    >
                      <i className="bi bi-gear me-1"></i>Admin
                    </Link>
                  </li>
                )}

                <li className="nav-item">
                  <span className="nav-link px-3 text-capitalize text-muted">
                    Hola, {user.name.split(' ')[0]}
                  </span>
                </li>
                <li className="nav-item ms-lg-2 mt-3 mt-lg-0">
                  <button
                    id="btn-logout"
                    className="btn btn-custom w-100"
                    onClick={handleLogout}
                    type="button"
                  >
                    Cerrar sesión
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item ms-lg-3 mt-3 mt-lg-0">
                <Link id="nav-link-login" className="btn btn-custom w-100" to="/login">
                  Iniciar Sesión
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
