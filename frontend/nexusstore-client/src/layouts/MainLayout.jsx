// src/layouts/MainLayout.jsx
import { Link } from 'react-router-dom';

export default function MainLayout({ children, user, onLogout }) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-white font-sans">
      {/* Sidebar Fijo */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-6">
        <h2 className="text-2xl font-bold text-cyan-400 mb-8">NexusStore</h2>
        <nav className="flex-1 space-y-4">
          <Link to="/inventario" className="flex items-center gap-2 hover:text-cyan-400">📦 Inventario</Link>
          <Link to="/reportes" className="flex items-center gap-2 hover:text-cyan-400">📊 Reportes</Link>
          <Link to="/usuarios" className="flex items-center gap-2 hover:text-cyan-400">👥 Usuarios</Link>
        </nav>
        <div className="border-t border-slate-800 pt-4 mt-auto">
          <p className="text-xs text-slate-500 uppercase">{user?.rol}</p>
          <p className="font-bold mb-4">{user?.name}</p>
          <button onClick={onLogout} className="text-red-400 text-sm">🚪 Cerrar Sesión</button>
        </div>
      </aside>

      {/* Contenido Dinámico */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-slate-800 flex items-center px-8 justify-between bg-slate-900/50">
          <h1 className="font-bold uppercase tracking-widest">Panel de Control</h1>
          <span className="text-xs bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full uppercase">{user?.rol} MODE</span>
        </header>
        <main className="p-8">
          {children} {/* AQUÍ SE RENDERIZA EL INVENTARIO UNA SOLA VEZ */}
        </main>
      </div>
    </div>
  );
}
