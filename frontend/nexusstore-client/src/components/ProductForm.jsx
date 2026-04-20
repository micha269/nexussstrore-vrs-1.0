import { useState, useEffect } from 'react';
import api from '../api/api';

// 1. Añadimos 'productToEdit' y cambiamos el nombre de la función de éxito a algo más genérico
export default function ProductForm({ onProductAdded, productToEdit, onCancelEdit }) {
  const [nombre, setNombre] = useState('');
  const [sku, setSku] = useState('');
  const [precio, setPrecio] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // --- EFECTO PARA CARGAR DATOS AL EDITAR ---
  useEffect(() => {
    if (productToEdit) {
        setNombre(productToEdit.nombre || '');
        setSku(productToEdit.sku || '');
        setPrecio(productToEdit.precio || '');
        // USAMOS stock_total que es lo que envía nuestro nuevo controlador
        setCantidad(productToEdit.stock_total || 0); 
        setDescripcion(productToEdit.descripcion || '');
    } else {
        limpiarCampos();
    }
}, [productToEdit]);

// --- DENTRO DE LA FUNCIÓN guardar ---
const datos = {
    nombre,
    sku,
    precio: parseFloat(precio),
    stock: parseInt(cantidad), // El backend usará esto para comparar con el stock anterior
    descripcion: descripcion || "Sin descripción"
};

  const limpiarCampos = () => {
    setNombre(''); setSku(''); setPrecio(''); setCantidad(''); setDescripcion('');
  };

  const guardar = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const datos = { 
      nombre, 
      sku, 
      precio: parseFloat(precio), 
      stock: parseInt(cantidad), // Usamos 'stock' para coincidir con tu controlador
      descripcion: descripcion || "Sin descripción"
    };

    try {
      if (productToEdit) {
        // --- MODO ACTUALIZAR (PUT) ---
        await api.put(`/productos/${productToEdit.id}`, datos, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("¡Producto actualizado exitosamente!");
      } else {
        // --- MODO CREAR (POST) ---
        await api.post('/productos', datos, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("¡Producto guardado exitosamente!");
      }
      
      if (onProductAdded) onProductAdded(); 
      limpiarCampos();
      if (onCancelEdit) onCancelEdit(); // Avisamos que terminamos de editar
      
    } catch (err) {
      console.error("Error en la operación:", err.response?.data);
      alert("Error al procesar: " + (err.response?.data?.message || "Revisa la consola"));
    }
  };

  return (
    <div className={`p-6 rounded-xl border mb-8 shadow-2xl transition-all ${productToEdit ? 'bg-indigo-950 border-indigo-500' : 'bg-slate-900 border-slate-800'}`}>
      <h3 className="text-xl font-bold mb-6 text-cyan-400">
        {productToEdit ? '📝 Editando Producto' : '📦 Registrar Nuevo Producto'}
      </h3>
      
      <form onSubmit={guardar} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input 
            type="text" placeholder="Nombre" 
            className="bg-slate-800 border border-slate-700 p-3 rounded text-white focus:border-cyan-500 outline-none"
            value={nombre} onChange={(e) => setNombre(e.target.value)} required 
          />
          <input 
            type="text" placeholder="SKU" 
            className="bg-slate-800 border border-slate-700 p-3 rounded text-white focus:border-cyan-500 outline-none"
            value={sku} onChange={(e) => setSku(e.target.value)} required 
          />
          <input 
            type="number" step="0.01" placeholder="Precio" 
            className="bg-slate-800 border border-slate-700 p-3 rounded text-white focus:border-cyan-500 outline-none"
            value={precio} onChange={(e) => setPrecio(e.target.value)} required 
          />
          <input 
            type="number" placeholder="Stock" 
            className="bg-slate-800 border border-slate-700 p-3 rounded text-white focus:border-cyan-500 outline-none"
            value={cantidad} onChange={(e) => setCantidad(e.target.value)} required 
          />
        </div>
        
        <textarea 
          placeholder="Descripción del producto..." 
          className="w-full bg-slate-800 border border-slate-700 p-3 rounded text-white focus:border-cyan-500 outline-none h-20 resize-none"
          value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
        ></textarea>

        <div className="flex gap-4">
          <button type="submit" className={`flex-1 p-3 rounded-lg font-bold transition-all shadow-lg active:scale-95 ${productToEdit ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-cyan-600 hover:bg-cyan-500'} text-white`}>
            {productToEdit ? 'Guardar Cambios' : 'Registrar en Inventario'}
          </button>
          
          {productToEdit && (
            <button 
              type="button" 
              onClick={() => { limpiarCampos(); onCancelEdit(); }}
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 rounded-lg font-bold transition-all"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
