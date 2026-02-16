import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Despesas from './pages/Despesas'
import Rendas from './pages/Rendas'
import Contas from './pages/Contas'
import Parcelamentos from './pages/Parcelamentos'
import Reservas from './pages/Reservas'
import Relatorios from './pages/Relatorios'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh' }}><LoadingSpinner /></div>
  return user ? children : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh' }}><LoadingSpinner /></div>
  return user ? <Navigate to="/" /> : children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/despesas" element={<PrivateRoute><Layout><Despesas /></Layout></PrivateRoute>} />
      <Route path="/rendas" element={<PrivateRoute><Layout><Rendas /></Layout></PrivateRoute>} />
      <Route path="/contas" element={<PrivateRoute><Layout><Contas /></Layout></PrivateRoute>} />
      <Route path="/parcelamentos" element={<PrivateRoute><Layout><Parcelamentos /></Layout></PrivateRoute>} />
      <Route path="/reservas" element={<PrivateRoute><Layout><Reservas /></Layout></PrivateRoute>} />
      <Route path="/relatorios" element={<PrivateRoute><Layout><Relatorios /></Layout></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
