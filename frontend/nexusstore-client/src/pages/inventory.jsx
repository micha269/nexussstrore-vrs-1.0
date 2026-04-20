import { useState, useEffect } from 'react';
import api from '../api/api';
import ProductForm from "../components/ProductForm";
import InventoryTable from "../components/InventoryTable";

export default function InventoryPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para controlar qué producto se está editando
  const [productoAEditar, setProductoAEditar] = useState(null);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await api.get('/productos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Datos recibidos del server:", res.data);
      setProductos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error al cargar listado:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  return (
    <div className="space-y-8 p-4">
      {/* 
          CONEXIÓN AL FORMULARIO:
          - onProductAdded: Refresca la tabla tras guardar/editar.
          - productToEdit: Pasa los datos del producto seleccionado para llenar los campos.
          - onCancelEdit: Función para volver al modo "Registro" (limpiar estado).
      */}
      <ProductForm 
        onProductAdded={cargarProductos} 
        productToEdit={productoAEditar}
        onCancelEdit={() => setProductoAEditar(null)}
      />
      
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
        <h3 className="text-xl font-bold mb-6 text-cyan-400 font-mono flex items-center gap-2">
           📊 Stock Real en Bodega
        </h3>
        
        {loading ? (
          <div className="flex items-center gap-2 text-slate-400 italic">
             <span className="animate-pulse">Cargando productos...</span>
          </div>
        ) : (
          /* 
             CONEXIÓN A LA TABLA:
             - onEdit: Captura el producto 'p' al hacer clic y lo sube al estado del padre.
          */
          <InventoryTable 
            productos={productos} 
            onProductDeleted={cargarProductos} 
            onEdit={(p) => {
              setProductoAEditar(p);
              // Opcional: scroll suave hacia el formulario al editar
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
          />
        )}
      </div>
    </div>
  );
}
