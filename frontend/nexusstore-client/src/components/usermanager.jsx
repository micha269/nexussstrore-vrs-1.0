import { useState, useEffect } from 'react';
import api from '../api/api';

export default function UserManager() {
    const [usuarios, setUsuarios] = useState([]);
    // Estados del formulario
    const [nombre, setNombre] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [roleId, setRoleId] = useState(3);
    
    // NUEVO: Estado para saber si estamos editando
    const [editingUser, setEditingUser] = useState(null);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await api.get('/usuarios', { headers: { Authorization: `Bearer ${token}` } });
            setUsuarios(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchUsers(); }, []);

    // FUNCIÓN PARA CARGAR DATOS EN EL FORMULARIO
    const prepararEdicion = (u) => {
        setEditingUser(u);
        setNombre(u.name);
        setUsername(u.username);
        setEmail(u.email);
        setRoleId(u.rol_id || 3);
        setPassword(''); // La contraseña se deja vacía a menos que se quiera cambiar
    };

    const limpiarFormulario = () => {
        setEditingUser(null);
        setNombre(''); setUsername(''); setEmail(''); setPassword(''); setRoleId(3);
    };

    const guardar = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const datos = { name: nombre, username, email, password, rol_id: parseInt(roleId) };

        try {
            if (editingUser) {
                // MODO ACTUALIZAR
                await api.put(`/usuarios/${editingUser.id}`, datos, { headers: { Authorization: `Bearer ${token}` } });
                alert("Usuario actualizado correctamente");
            } else {
                // MODO CREAR
                await api.post('/usuarios', datos, { headers: { Authorization: `Bearer ${token}` } });
                alert("Usuario registrado");
            }
            limpiarFormulario();
            fetchUsers();
        } catch (err) { alert("Error: " + err.response?.data?.message); }
    };

    return (
        <div className="space-y-8">
            {/* FORMULARIO AJUSTADO (Cambia de color si edita) */}
            <div className={`p-6 rounded-2xl border transition-all shadow-xl ${editingUser ? 'bg-indigo-900/40 border-indigo-500' : 'bg-slate-900/40 border-slate-800'}`}>
                <h3 className={`font-bold mb-6 flex items-center gap-2 ${editingUser ? 'text-indigo-400' : 'text-cyan-400'}`}>
                    {editingUser ? '📝 Editando Usuario' : '➕ Registrar Nuevo Personal'}
                </h3>
                <form onSubmit={guardar} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input type="text" placeholder="Nombre Real" className="bg-slate-800 border border-slate-700 p-3 rounded-lg text-white outline-none focus:border-cyan-500" value={nombre} onChange={e => setNombre(e.target.value)} required />
                    <input type="text" placeholder="Username" className="bg-slate-800 border border-slate-700 p-3 rounded-lg text-white outline-none focus:border-cyan-500" value={username} onChange={e => setUsername(e.target.value)} required />
                    <input type="email" placeholder="Email" className="bg-slate-800 border border-slate-700 p-3 rounded-lg text-white outline-none focus:border-cyan-500" value={email} onChange={e => setEmail(e.target.value)} required />
                    <input type="password" placeholder={editingUser ? "Nueva clave (opcional)" : "Contraseña"} className="bg-slate-800 border border-slate-700 p-3 rounded-lg text-white outline-none focus:border-cyan-500" value={password} onChange={e => setPassword(e.target.value)} required={!editingUser} />
                    <select className="bg-slate-800 border border-slate-700 p-3 rounded-lg text-white outline-none" value={roleId} onChange={e => setRoleId(e.target.value)}>
                        <option value="1">Superadministrador</option>
                        <option value="2">Supervisor</option>
                        <option value="3">Operario</option>
                    </select>
                    <div className="flex gap-2">
                        <button type="submit" className={`flex-1 font-bold py-3 rounded-lg transition-all text-white ${editingUser ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-cyan-600 hover:bg-cyan-500'}`}>
                            {editingUser ? 'GUARDAR CAMBIOS' : 'REGISTRAR'}
                        </button>
                        {editingUser && (
                            <button type="button" onClick={limpiarFormulario} className="bg-slate-700 px-4 rounded-lg text-white">X</button>
                        )}
                    </div>
                </form>
            </div>

            {/* TABLA CON BOTÓN EDITAR */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-slate-800/50 text-cyan-500 text-xs uppercase border-b border-slate-800">
                        <tr><th className="p-4">Usuario / Rol</th><th className="p-4">Correo</th><th className="p-4 text-right">Acciones</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {usuarios.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-800/40">
                                <td className="p-4"><div className="text-slate-200">{u.name}</div><div className="text-[10px] text-cyan-600 uppercase font-bold">{u.rol}</div></td>
                                <td className="p-4 text-slate-400 text-sm">{u.email}</td>
                                <td className="p-4 text-right space-x-2">
                                    <button onClick={() => prepararEdicion(u)} className="text-cyan-500 text-[10px] font-bold border border-cyan-500/20 px-3 py-1 rounded hover:bg-cyan-500 hover:text-white transition-all">EDITAR</button>
                                    {/* ... tus otros botones de Reset y Quitar ... */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
