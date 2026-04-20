import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import InventoryPage from './pages/Inventory'; // Tu página modular
import MainLayout from './layouts/MainLayout';
import ReportesPage from './pages/reportes'; // Asegúrate de crear este archivo en /pages
import UsersPage from './pages/Users';
import api from './api/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.post('/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.log("Cerrando sesión localmente...");
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  if (loading) return <div className="bg-slate-950 h-screen text-white flex items-center justify-center">Cargando NexusStore...</div>;

  if (!user) {
    return <Login onLoginSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <Router>
        {/* MainLayout envuelve todo: el menú lateral estará siempre presente */}
        <MainLayout user={user} onLogout={handleLogout}>
            <Routes>
                {/* Redirección por defecto: si entran a "/", van a inventario */}
                <Route path="/" element={<Navigate to="/inventario" />} />
                
                <Route path="/inventario" element={<InventoryPage user={user} />} />
                
                {/* NUEVA RUTA DE REPORTES */}
                <Route path="/reportes" element={<ReportesPage />} />
                
                {/* Ruta 404 (Opcional) */}
                <Route path="*" element={<Navigate to="/inventario" />} />
                <Route path="/usuarios" element={<UsersPage />} />

                

            </Routes>
        </MainLayout>
    </Router>
);
}

export default App;
