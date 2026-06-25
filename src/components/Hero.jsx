const Hero = () => {
  return (
    <section id="inicio" className="hero-section text-center position-relative">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h2 className="brand-font text-accent mb-3 fs-4">Tradición & Vanguardia</h2>
            <h1 className="brand-font display-2 fw-bold mb-4 text-dark">Sabores de los Andes</h1>
            <p className="lead mb-5 text-dark w-75 mx-auto">
              Experimenta la auténtica gastronomía peruana en un ambiente minimalista y elegante. 
              Nuestra cocina rinde homenaje a la tierra, el mar y nuestra cultura.
            </p>
            <a href="#menu" className="btn btn-custom btn-lg">VER MENÚ</a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
