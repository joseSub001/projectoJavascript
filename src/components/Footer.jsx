const Footer = () => {
  return (
    <footer id="contacto" className="footer-custom py-5 text-center">
      <div className="container">
        <h3 className="brand-font fs-2 text-accent mb-4">Amaru</h3>
        <p className="mb-2">Av. La Paz 123, Miraflores, Lima - Perú</p>
        <p className="mb-4">Reservas: +51 987 654 321 | info@amaru.pe</p>
        
        <div className="d-flex justify-content-center gap-4 mb-4">
          <a href="#" className="text-white fs-5"><i className="bi bi-instagram"></i></a>
          <a href="#" className="text-white fs-5"><i className="bi bi-facebook"></i></a>
          <a href="#" className="text-white fs-5"><i className="bi bi-twitter-x"></i></a>
        </div>
        
        <p className="small text-muted mb-0">&copy; {new Date().getFullYear()} Amaru Restaurante. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}

export default Footer
