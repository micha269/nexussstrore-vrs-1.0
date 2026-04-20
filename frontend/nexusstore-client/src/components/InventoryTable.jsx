import api from '../api/api';

export default function InventoryTable({ productos = [], onProductDeleted, onEdit }) {
    
    const eliminar = async (id) => {
        if (window.confirm("¿Deseas eliminar este producto permanentemente? Se borrarán también sus lotes e historial.")) {
            try {
                const token = localStorage.getItem('token');
                await api.delete(`/productos/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                onProductDeleted();
            } catch (err) {
                console.error(err);
                alert("Error al eliminar el producto");
            }
        }
    };

    if (productos.length === 0) {
        return (
            <p className="text-slate-500 italic p-4 text-center border border-dashed border-slate-800 rounded">
                No hay productos registrados en la base de datos.
            </p>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="text-slate-500 text-xs uppercase border-b border-slate-800">
                        <th className="p-3">Nombre</th>
                        <th className="p-3">SKU</th>
                        <th className="p-3">Descripción</th>
                        <th className="p-3">Precio</th>
                        <th className="p-3">Stock Real</th> {/* <-- Antes decía Stock */}
                        <th className="p-3 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {productos.map((p) => {
                        // Lógica de alerta: comparamos stock actual vs el mínimo configurado
                        const esStockBajo = p.stock_total <= p.stock_minimo;
                        
                        return (
                            <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="p-3 font-medium text-slate-200">{p.nombre}</td>
                                <td className="p-3 font-mono text-cyan-500 text-sm">{p.sku}</td>
                                <td className="p-3 text-slate-400 text-sm max-w-xs truncate">
                                    {p.descripcion || <span className="italic opacity-50">Sin descripción</span>}
                                </td>
                                <td className="p-3 text-emerald-400 font-bold">${p.precio}</td>
                                
                                {/* Celda de Stock con Alerta */}
                                <td className={`p-3 font-bold ${esStockBajo ? 'text-orange-500' : 'text-slate-300'}`}>
                                    {p.stock_total || 0} und.
                                    {esStockBajo && <span className="ml-1 text-[10px] animate-pulse">⚠️ BAJO</span>}
                                </td>

                                <td className="p-3 text-right flex justify-end gap-2">
                                    <button 
                                        onClick={() => onEdit(p)} 
                                        className='bg-cyan-500/10 hover:bg-cyan-500 text-cyan-500 hover:text-white px-3 py-1 rounded transition-all text-xs font-bold'
                                    >
                                        EDITAR
                                    </button>
                                    <button 
                                        onClick={() => eliminar(p.id)} 
                                        className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-3 py-1 rounded transition-all text-xs font-bold"
                                    >
                                        ELIMINAR
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
