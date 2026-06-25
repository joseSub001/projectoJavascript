import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Menu from './components/Menu'
import Footer from './components/Footer'
import Auth from './components/Auth'
import Perfil from './components/Perfil'
import AdminPanel from './components/AdminPanel'
import Carrito from './components/Carrito'
import { loadData, saveData } from './utils/storage'

const CART_KEY = 'amaru_carrito'

function App() {
  const [user, setUser] = useState(null)
  const [cart, setCart] = useState([])

  useEffect(() => {
    const session = loadData('amaru_session', null)
    if (session) setUser(session)
    const savedCart = loadData(CART_KEY, [])
    setCart(savedCart)
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    saveData('amaru_session', userData)
  }

  const handleLogout = () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('amaru_session')
    }
  }

  const handleSetCart = (updated) => {
    setCart(updated)
    saveData(CART_KEY, updated)
  }

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0)

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} cartCount={cartCount} />

      <Routes>
        {/* Página principal: Hero + Menú dinámico */}
        <Route path="/" element={
          <>
            <Hero />
            <Menu user={user} cart={cart} setCart={handleSetCart} />
          </>
        } />

        {/* Login / Registro */}
        <Route path="/login" element={
          user ? <Navigate to="/perfil" /> : <Auth onLogin={handleLogin} />
        } />

        {/* Perfil del usuario */}
        <Route path="/perfil" element={
          user ? <Perfil user={user} /> : <Navigate to="/login" />
        } />

        {/* Carrito de compras */}
        <Route path="/carrito" element={
          <Carrito user={user} cart={cart} setCart={handleSetCart} />
        } />

        {/* Panel de administración (solo admin) */}
        <Route path="/admin" element={
          user?.role === 'admin'
            ? <AdminPanel user={user} />
            : <Navigate to="/login" />
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <Footer />
    </>
  )
}

export default App
