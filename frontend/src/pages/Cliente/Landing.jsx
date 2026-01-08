import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Modal from '../../components/Modal';

// Simple Icons
const SearchIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
);
const SunIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
);
const MoonIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
);

const Landing = () => {
  const [estanteriasConProductos, setEstanteriasConProductos] = useState({});
  const [cargando, setCargando] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    fetchPublicInventario();
  }, []);

  const fetchPublicInventario = async () => {
    try {
      const res = await api.get('/inventario');
      // Group by estanteria with metadata
      const agrupados = res.data.reduce((acc, prod) => {
        const key = prod.estanteria || 'Colección General';
        if (!acc[key]) {
          acc[key] = {
            products: [],
            description: prod.estanteria_desc,
            image: prod.estanteria_img
          };
        }
        acc[key].products.push(prod);
        return acc;
      }, {});
      setEstanteriasConProductos(agrupados);
    } catch (error) {
      console.error("Error al cargar catálogo", error);
    } finally {
      setCargando(false);
    }
  };

  // Filter Logic
  const filteredEstanterias = Object.entries(estanteriasConProductos).reduce((acc, [key, data]) => {
    const matchingProducts = data.products.filter(prod =>
      prod.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (matchingProducts.length > 0) {
      acc[key] = {
        ...data,
        products: matchingProducts
      };
    }
    return acc;
  }, {});

  if (cargando) return (
    <div className="flex h-screen items-center justify-center bg-bg-primary transition-colors duration-500">
      <div className="animate-pulse text-sm tracking-[0.3em] uppercase text-pink-primary font-display">Enchanted Vanity</div>
    </div>
  );

  return (
    <div className={`min-h-screen font-body transition-colors duration-500 bg-bg-primary text-text-primary selection:bg-pink-light selection:text-dark pb-20`}>

      {/* Search Header - Sticky */}
      <header className="sticky top-0 z-40 bg-bg-primary/95 dark:bg-[#050505]/95 backdrop-blur-md border-b border-grey-light/10 md:border-grey-light/20 px-4 py-4 md:py-6 transition-all duration-300">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:max-w-xl relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-grey-medium group-focus-within:text-pink-primary transition-colors">
              <SearchIcon className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-grey-light/10 dark:bg-grey-light/5 border border-transparent focus:border-pink-primary/30 rounded-full outline-none text-text-primary placeholder-grey-medium text-sm tracking-wide transition-all shadow-sm focus:shadow-md"
            />
          </div>

          <div className="flex items-center justify-between w-full md:w-auto gap-6">
            <div className="text-lg font-display font-light tracking-[0.2em] uppercase text-text-primary md:hidden mx-auto">Enchanted Vanity</div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full hover:bg-grey-light/10 active:scale-95 text-grey-medium hover:text-pink-primary transition-colors"
                title="Toggle Theme"
              >
                {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              </button>
              <button onClick={() => window.location.href = '/login'} className="text-[10px] uppercase tracking-widest font-bold border border-text-primary px-4 py-2 hover:bg-pink-primary hover:border-pink-primary hover:text-white active:scale-95 transition-all duration-300 rounded-sm">
                Admin
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto py-12 px-4 md:px-8 space-y-24">
        {Object.keys(filteredEstanterias).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-grey-medium animate-fade-in">
            <SearchIcon className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-light italic">No products found matching "{searchTerm}"</p>
          </div>
        ) : (
          Object.entries(filteredEstanterias).map(([nombreEstanteria, data]) => (
            <section key={nombreEstanteria} className="scroll-mt-32 animate-slide-up">
              <div className="flex flex-col md:flex-row items-baseline justify-between mb-8 md:mb-12 border-b border-grey-light/30 pb-4 gap-4">
                <div>
                  <h2 className="text-3xl md:text-5xl font-display font-light text-text-primary">{nombreEstanteria}</h2>
                  {data.description && (
                    <p className="text-xs md:text-sm text-grey-medium font-light italic mt-2 max-w-lg">{data.description}</p>
                  )}
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-pink-primary">
                  {data.products.length} Products
                </div>
              </div>

              {/* Product Shelf Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                {data.products.map((prod) => (
                  <div key={prod.id} onClick={() => setSelectedProduct(prod)} className="group cursor-pointer active:scale-95 transition-transform duration-200">
                    <div className="relative aspect-[3/4] bg-grey-light/5 overflow-hidden mb-4 rounded-sm">
                      {prod.imagen_url ? (
                        <img src={prod.imagen_url} alt={prod.nombre} className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl grayscale opacity-20 group-hover:scale-110 transition-transform duration-700">✨</div>
                      )}

                      {prod.cantidad_stock <= 0 && (
                        <div className="absolute top-2 left-2 z-10 bg-white/90 dark:bg-black/90 px-2 py-1 text-[8px] uppercase tracking-widest font-bold text-grey-medium backdrop-blur-sm">
                          Sold Out
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-medium font-display text-text-primary group-hover:text-pink-primary transition-colors duration-300 line-clamp-1 pr-2">{prod.nombre}</h3>
                        <span className="text-sm font-light text-text-primary whitespace-nowrap">
                          ${Number(prod.precio_venta).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[10px] text-grey-medium leading-relaxed uppercase tracking-widest font-light line-clamp-1">
                        {prod.descripcion || 'Pure Beauty Essence'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Product Detail Modal */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title="Product Details"
      >
        {selectedProduct && (
          <div className="space-y-8 animate-fade-in">
            <div className="aspect-square bg-grey-light/10 overflow-hidden relative">
              {selectedProduct.imagen_url ? (
                <img src={selectedProduct.imagen_url} alt={selectedProduct.nombre} className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl grayscale opacity-20">✨</div>
              )}
              {selectedProduct.cantidad_stock <= 0 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-white px-4 py-2 uppercase tracking-widest text-xs font-bold text-black">Out of Stock</span>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-[1px] bg-pink-primary"></div>
                  <div className="text-[10px] uppercase tracking-widest text-pink-primary font-bold">{selectedProduct.estanteria}</div>
                </div>
                <h2 className="text-3xl font-display font-light text-text-primary">{selectedProduct.nombre}</h2>
              </div>

              <p className="text-sm text-grey-medium font-light leading-relaxed">
                {selectedProduct.descripcion || "Formulated with precision for optimal results. This product embodies the synthesis of nature and science."}
              </p>

              <div className="flex justify-between items-center pt-6 border-t border-grey-light/10">
                <span className="text-2xl font-light text-text-primary">${selectedProduct.precio_venta}</span>
                {selectedProduct.cantidad_stock > 0 ? (
                  <span className="text-[10px] uppercase tracking-widest text-green-600 font-bold flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Available ({selectedProduct.cantidad_stock})
                  </span>
                ) : (
                  <span className="text-[10px] uppercase tracking-widest text-grey-medium font-bold">Unavailable</span>
                )}
              </div>

              <button
                disabled={selectedProduct.cantidad_stock <= 0}
                className={`w-full py-4 uppercase tracking-[0.2em] text-xs font-bold transition-all duration-300 ${selectedProduct.cantidad_stock > 0 ? 'bg-text-primary text-bg-primary hover:bg-pink-primary hover:text-white active:scale-95' : 'bg-grey-light text-grey-medium cursor-not-allowed'}`}
              >
                {selectedProduct.cantidad_stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Landing;
