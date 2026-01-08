import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Modal from '../../components/Modal';
import ProductoForm from '../../components/ProductoForm';

const Dashboard = () => {
  const backendBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const [inventario, setInventario] = useState([]);
  const [estanterias, setEstanterias] = useState([]);
  const [activeShelf, setActiveShelf] = useState(null); // null = List View, object = Detail View
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isShelfModalOpen, setIsShelfModalOpen] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Shelf Creation State
  const [newShelfName, setNewShelfName] = useState("");
  const [newShelfDesc, setNewShelfDesc] = useState("");
  const [newShelfImg, setNewShelfImg] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invRes, estRes] = await Promise.all([
        api.get('/inventario'),
        api.get('/estanterias')
      ]);
      // API can devolver null; normalizamos a [] para evitar romper la UI
      setInventario(Array.isArray(invRes.data) ? invRes.data : []);
      setEstanterias(Array.isArray(estRes.data) ? estRes.data : []);
    } catch (error) {
      console.error("Error al cargar datos", error);
      setInventario([]);
      setEstanterias([]);
    } finally {
      setCargando(false);
    }
  };

  const handleCrearEstanteria = async (e) => {
    e.preventDefault();
    if (!newShelfName.trim()) return;
    try {
      await api.post('/estanterias', {
        nombre: newShelfName,
        descripcion: newShelfDesc,
        imagen_url: newShelfImg
      });
      setNewShelfName("");
      setNewShelfDesc("");
      setNewShelfImg("");
      setIsShelfModalOpen(false);
      fetchData();
    } catch (error) {
      const msg = error.response?.data?.detail || error.response?.data?.message || "Error al crear estantería";
      alert(msg);
    }
  };

  const handleEliminarEstanteria = async (id, e) => {
    e.stopPropagation();
    if (!confirm("¿Eliminar estantería? Se perderá la referencia de los productos.")) return;
    try {
      await api.delete(`/estanterias/${id}`);
      fetchData();
      if (activeShelf?.id === id) setActiveShelf(null);
    } catch (error) {
      const msg = error.response?.data?.detail || "Error al eliminar estantería";
      alert(msg);
    }
  };

  const handleCrearProducto = async (nuevoProducto) => {
    try {
      const productData = activeShelf
        ? { ...nuevoProducto, estanteria_id: activeShelf.id }
        : nuevoProducto;

      const hasFile = productData.file instanceof File;

      if (hasFile) {
        const fd = new FormData();
        Object.entries(productData).forEach(([k, v]) => {
          if (v !== undefined && v !== null) fd.append(k, v);
        });
        await api.post('/productos', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/productos', productData);
      }

      setIsProductModalOpen(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.detail || "Error al crear producto");
    }
  };

  const actualizarStock = async (id, operacion) => {
    try {
      const response = await api.patch(`/productos/${id}/${operacion}`);
      if (response.data.error) {
        alert(response.data.error);
        return;
      }
      // Optimistic update
      setInventario(prev => prev.map(prod => {
        if (prod.id === id) {
          const cambio = operacion === 'comprar' ? 1 : -1;
          return { ...prod, cantidad_stock: prod.cantidad_stock + cambio };
        }
        return prod;
      }));
    } catch (error) {
      alert("Error de conexión");
    }
  };

  const eliminarProducto = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    try {
      await api.delete(`/productos/${id}`);
      fetchData();
    } catch (error) {
      alert("Error al eliminar producto");
    }
  };

  // Filter products for the active shelf
  const safeInventario = Array.isArray(inventario) ? inventario : [];

  const resolveImage = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return `${backendBase}${url}`;
    return `${backendBase}/${url}`;
  };

  const productsInShelf = activeShelf
    ? safeInventario.filter(p => p.estanteria_id === activeShelf.id || p.estanteria === activeShelf.nombre)
    : [];

  return (
    <div className="min-h-screen bg-[#FCFAFA] text-[#1A1A1A] font-sans selection:bg-pink-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-6 flex justify-between items-center sticky top-0 z-30">
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-pink-400">
            {activeShelf ? `Estantería / ${activeShelf.nombre}` : "Panel de Control"}
          </div>
          <h1 className="text-2xl font-light tracking-tight">
            {activeShelf ? "Gestionar Productos" : "Mis Estanterías"}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {activeShelf && (
            <button
              onClick={() => setActiveShelf(null)}
              className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-black transition mr-4"
            >
              ← Volver
            </button>
          )}

          <button
            onClick={() => activeShelf ? setIsProductModalOpen(true) : setIsShelfModalOpen(true)}
            className="bg-black text-white px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
          >
            {activeShelf ? "+ Añadir Producto" : "+ Nueva Estantería"}
          </button>

          <button
            onClick={() => { localStorage.clear(); window.location.href = '/login' }}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:bg-red-50 hover:border-red-100 hover:text-red-500 transition-all"
            title="Cerrar Sesión"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-8">
        {cargando ? (
          <div className="flex justify-center py-20 animate-pulse text-[10px] uppercase tracking-[0.3em] text-gray-400">Sincronizando...</div>
        ) : (
          <>
            {/* VIEW 1: SHELVES LIST */}
            {!activeShelf && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {estanterias.map((shelf) => {
                  const count = safeInventario.filter(p => p.estanteria_id === shelf.id || p.estanteria === shelf.nombre).length;
                  return (
                    <div
                      key={shelf.id}
                      onClick={() => setActiveShelf(shelf)}
                      className="group bg-white p-6 border border-gray-100 hover:border-pink-200 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all cursor-pointer relative overflow-hidden flex flex-col justify-end min-h-[200px]"
                    >
                      {shelf.imagen_url && (
                        <div className="absolute inset-0">
                          <img src={shelf.imagen_url} alt={shelf.nombre} className="w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity" />
                          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
                        </div>
                      )}

                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          onClick={(e) => handleEliminarEstanteria(shelf.id, e)}
                          className="text-gray-300 hover:text-red-400 p-2"
                          title="Eliminar Estantería"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>

                      <div className="relative z-10 space-y-2">
                        <div className="w-12 h-1 bg-pink-500/20 group-hover:bg-pink-500 group-hover:w-20 transition-all duration-500"></div>
                        <div>
                          <h2 className="text-2xl font-light text-gray-900 group-hover:translate-x-2 transition-transform duration-500">{shelf.nombre}</h2>
                          {shelf.descripcion && (
                            <p className="text-[10px] text-gray-400 font-light line-clamp-2 mt-1 max-w-[90%]">{shelf.descripcion}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-widest group-hover:text-pink-400 transition-colors pt-2">
                          <span>{count} Productos</span>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* VIEW 2: PRODUCTS IN SHELF */}
            {activeShelf && (
              <div className="space-y-8">
                {productsInShelf.length === 0 ? (
                  <div className="text-center py-20 border border-dashed border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-400 uppercase tracking-widest">Estantería Vacía</p>
                    <button
                      onClick={() => setIsProductModalOpen(true)}
                      className="mt-4 text-pink-500 hover:text-pink-600 text-xs font-bold uppercase tracking-widest border-b border-pink-200"
                    >
                      Añadir primer producto
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-8">
                    {productsInShelf.map((prod) => (
                      <div key={prod.id} className="bg-white p-4 border border-gray-100 space-y-4 hover:shadow-xl transition-shadow group relative">
                        <button
                          onClick={() => eliminarProducto(prod.id)}
                          className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                          ×
                        </button>

                        <div className="aspect-square bg-gray-50 overflow-hidden relative">
                          {prod.imagen_url ? (
                            <img src={resolveImage(prod.imagen_url)} alt={prod.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-200 text-2xl">IMG</div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-medium text-gray-900 truncate">{prod.nombre}</h3>
                          <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                            <span className="text-xs uppercase text-gray-500 tracking-wider">Stock</span>
                            <span className={`font-mono font-bold ${prod.cantidad_stock < 5 ? 'text-red-500' : 'text-gray-700'}`}>{prod.cantidad_stock}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <button
                              onClick={() => actualizarStock(prod.id, 'comprar')}
                              className="py-2 bg-black text-white text-[10px] uppercase font-bold hover:bg-gray-800"
                            >
                              +1
                            </button>
                            <button
                              onClick={() => actualizarStock(prod.id, 'vender')}
                              disabled={prod.cantidad_stock <= 0}
                              className="py-2 border border-gray-200 text-gray-600 text-[10px] uppercase font-bold hover:bg-red-50 disabled:opacity-50"
                            >
                              -1
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL: NEW PRODUCT */}
      <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title={`Añadir a ${activeShelf?.nombre || 'Inventario'}`}>
        <ProductoForm
          estanterias={estanterias}
          defaultShelfId={activeShelf?.id}
          onSubmit={handleCrearProducto}
          onCancel={() => setIsProductModalOpen(false)}
        />
      </Modal>

      {/* MODAL: NEW SHELF */}
      <Modal isOpen={isShelfModalOpen} onClose={() => setIsShelfModalOpen(false)} title="Nueva Estantería">
        <form onSubmit={handleCrearEstanteria} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold">Nombre de la Colección</label>
            <input
              type="text"
              value={newShelfName}
              onChange={(e) => setNewShelfName(e.target.value)}
              className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors bg-transparent placeholder-gray-300 mb-4"
              placeholder="Ej. Cuidado Facial"
              required
            />
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold">Descripción (Opcional)</label>
            <input
              type="text"
              value={newShelfDesc}
              onChange={(e) => setNewShelfDesc(e.target.value)}
              className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors bg-transparent placeholder-gray-300 mb-4"
              placeholder="Ej. Productos para el verano..."
            />
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold">URL Imagen (Opcional)</label>
            <input
              type="text"
              value={newShelfImg}
              onChange={(e) => setNewShelfImg(e.target.value)}
              className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors bg-transparent placeholder-gray-300"
              placeholder="https://..."
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsShelfModalOpen(false)}
              className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-black"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-black text-white px-8 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-gray-900"
            >
              Crear Estantería
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;