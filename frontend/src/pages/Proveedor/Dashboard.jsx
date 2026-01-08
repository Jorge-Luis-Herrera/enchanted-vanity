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
  const [isUploading, setIsUploading] = useState(false);
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

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
    setIsUploading(true);
    try {
      const productData = activeShelf
        ? { ...nuevoProducto, estanteria_id: activeShelf.id }
        : nuevoProducto;

      const fd = new FormData();
      Object.entries(productData).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          if (k === 'file' && v instanceof File) {
            fd.append('file', v);
          } else if (k !== 'file') {
            fd.append(k, v);
          }
        }
      });

      await api.post('/productos', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setIsProductModalOpen(false);
      fetchData();
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.detail || "Error al crear producto";
      alert(msg);
    } finally {
      setIsUploading(false);
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
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans selection:bg-pink-pale transition-colors duration-300">
      {/* Upload Loading Overlay */}
      {isUploading && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-bg-primary/90 backdrop-blur-sm animate-fade-in">
          <div className="w-12 h-12 border-4 border-pink-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-pink-primary animate-pulse">
            Subiendo Producto...
          </div>
        </div>
      )}
      {/* Header */}
      <header className="bg-bg-primary/80 backdrop-blur-md border-b border-grey-light/20 px-8 py-6 flex justify-between items-center sticky top-0 z-30 transition-colors">
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-pink-primary">
            {activeShelf ? `Estantería / ${activeShelf.nombre}` : "Panel de Control"}
          </div>
          <h1 className="text-2xl font-light tracking-tight text-text-primary">
            {activeShelf ? "Gestionar Productos" : "Mis Estanterías"}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-grey-light/20 hover:bg-pink-pale/10 transition-all text-grey-medium"
            title="Cambiar Tema"
          >
            {isDark ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M3 12h2.25m.386-6.364l1.591 1.591M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>

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
            className="bg-text-primary text-bg-primary px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:opacity-90 transition-all shadow-lg shadow-grey-light/10"
          >
            {activeShelf ? "+ Añadir Producto" : "+ Nueva Estantería"}
          </button>

          <button
            onClick={() => { localStorage.clear(); window.location.href = '/login' }}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-grey-light/20 hover:bg-pink-pale/10 hover:border-pink-primary/30 hover:text-pink-primary transition-all text-grey-medium"
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
                      className="group bg-bg-primary p-6 border border-grey-light/20 hover:border-pink-primary/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all cursor-pointer relative overflow-hidden flex flex-col justify-end min-h-[200px] rounded-sm"
                    >
                      {shelf.imagen_url && (
                        <div className="absolute inset-0">
                          <img src={shelf.imagen_url} alt={shelf.nombre} className="w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity" />
                          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/80 to-transparent transition-colors"></div>
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
                        <div className="w-12 h-1 bg-pink-primary/20 group-hover:bg-pink-primary group-hover:w-20 transition-all duration-500"></div>
                        <div>
                          <h2 className="text-2xl font-light text-text-primary group-hover:translate-x-2 transition-transform duration-500">{shelf.nombre}</h2>
                          {shelf.descripcion && (
                            <p className="text-[10px] text-grey-medium font-light line-clamp-2 mt-1 max-w-[90%]">{shelf.descripcion}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-grey-medium uppercase tracking-widest group-hover:text-pink-primary transition-colors pt-2">
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
                  <div className="text-center py-20 border border-dashed border-grey-light/20 rounded-lg">
                    <p className="text-sm text-grey-medium uppercase tracking-widest">Estantería Vacía</p>
                    <button
                      onClick={() => setIsProductModalOpen(true)}
                      className="mt-4 text-pink-primary hover:text-pink-primary transition-colors text-xs font-bold uppercase tracking-widest border-b border-pink-primary/20"
                    >
                      Añadir primer producto
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-8">
                    {productsInShelf.map((prod) => (
                      <div key={prod.id} className="bg-bg-primary p-4 border border-grey-light/20 space-y-4 hover:shadow-2xl transition-all group relative rounded-sm">
                        <button
                          onClick={() => eliminarProducto(prod.id)}
                          className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                          ×
                        </button>

                        <div className="aspect-square bg-grey-light/10 overflow-hidden relative">
                          {prod.imagen_url ? (
                            <img src={resolveImage(prod.imagen_url)} alt={prod.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-grey-light text-2xl">IMG</div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-medium text-text-primary truncate">{prod.nombre}</h3>
                          <div className="flex justify-between items-center bg-grey-light/5 p-2 rounded">
                            <span className="text-xs uppercase text-grey-medium tracking-wider">Stock</span>
                            <span className={`font-mono font-bold ${prod.cantidad_stock < 5 ? 'text-pink-primary' : 'text-text-primary'}`}>{prod.cantidad_stock}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <button
                              onClick={() => actualizarStock(prod.id, 'comprar')}
                              className="py-2 bg-text-primary text-bg-primary text-[10px] uppercase font-bold hover:opacity-90 transition-opacity"
                            >
                              +1
                            </button>
                            <button
                              onClick={() => actualizarStock(prod.id, 'vender')}
                              disabled={prod.cantidad_stock <= 0}
                              className="py-2 border border-grey-light/30 text-text-primary text-[10px] uppercase font-bold hover:bg-pink-pale/10 disabled:opacity-50 transition-colors"
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
            <label className="block text-xs uppercase tracking-widest text-grey-medium mb-2 font-bold">Nombre de la Colección</label>
            <input
              type="text"
              value={newShelfName}
              onChange={(e) => setNewShelfName(e.target.value)}
              className="w-full border-b border-grey-light/30 py-2 focus:outline-none focus:border-pink-primary transition-colors bg-transparent placeholder-grey-light/50 mb-4 text-text-primary"
              placeholder="Ej. Cuidado Facial"
              required
            />
            <label className="block text-xs uppercase tracking-widest text-grey-medium mb-2 font-bold">Descripción (Opcional)</label>
            <input
              type="text"
              value={newShelfDesc}
              onChange={(e) => setNewShelfDesc(e.target.value)}
              className="w-full border-b border-grey-light/30 py-2 focus:outline-none focus:border-pink-primary transition-colors bg-transparent placeholder-grey-light/50 mb-4 text-text-primary"
              placeholder="Ej. Productos para el verano..."
            />
            <label className="block text-xs uppercase tracking-widest text-grey-medium mb-2 font-bold">URL Imagen (Opcional)</label>
            <input
              type="text"
              value={newShelfImg}
              onChange={(e) => setNewShelfImg(e.target.value)}
              className="w-full border-b border-grey-light/30 py-2 focus:outline-none focus:border-pink-primary transition-colors bg-transparent placeholder-grey-light/50 text-text-primary"
              placeholder="https://..."
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsShelfModalOpen(false)}
              className="text-[10px] uppercase tracking-widest font-bold text-grey-medium hover:text-pink-primary transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-text-primary text-bg-primary px-8 py-3 text-[10px] uppercase tracking-widest font-bold hover:opacity-90 transition-opacity"
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