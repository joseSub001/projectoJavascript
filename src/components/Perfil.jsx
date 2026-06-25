import React from 'react'

const Perfil = ({ user }) => {
  if (!user) {
    return (
      <div className="container py-5 text-center">
        <h2>No has iniciado sesión</h2>
        <p>Por favor, regístrate o inicia sesión para ver tu perfil.</p>
      </div>
    )
  }

  return (
    <section className="py-5 bg-white min-vh-100">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card shadow-sm p-4 text-center">
              <h2 className="brand-font mb-4">Mi Perfil</h2>
              <div className="mb-3">
                <strong>Nombre:</strong> {user.name}
              </div>
              <div className="mb-3">
                <strong>Correo:</strong> {user.email}
              </div>
              <p className="text-muted mt-4">
                Este es el panel principal de tu cuenta.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Perfil
