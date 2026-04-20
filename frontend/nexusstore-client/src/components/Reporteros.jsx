import { useEffect, useState } from 'react';
import api from '../api/api';

export default function Reporteros() {
    const [movimientos, setMovimientos] = useState([]);

    useEffect(() => {
        const fetchMovimientos = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await api.get('/reportes/movimientos', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMovimientos(res.data);
            } catch (err) {
                console.error("Error al traer reportes", err);
            }
        };
        fetchMovimientos();
    }, []);

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left">
                <thead className="text-cyan-500 text-xs uppercase bg-slate-900 border-b border-slate-800">
                    <tr>
                        <th className="p-4">Fecha</th>
                        <th className="p-4">Usuario</th>
                        <th className="p-4">Producto</th>
                        <th className="p-4">Tipo</th>
                        <th className="p-4 text-right">Cantidad</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {movimientos.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-4 text-slate-400 text-sm">{new Date(m.created_at).toLocaleString()}</td>
                            <td className="p-4 text-slate-200">{m.usuario}</td>
                            <td className="p-4 text-slate-300 font-medium">{m.producto}</td>
                            <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    m.tipo_movimiento === 'Entrada' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                }`}>
                                    {m.tipo_movimiento}
                                </span>
                            </td>
                            <td className="p-4 text-right font-mono text-cyan-400 font-bold">{m.cantidad} und.</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
