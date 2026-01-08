import { useState } from 'react';

const ProductoForm = ({ estanterias, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    imagen_url: '',
    precio_compra: '',
    precio_venta: '',
    cantidad_stock: 0,
    estanteria_id: estanterias[0]?.id || ''
  });
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cantidad_stock' || name === 'estanteria_id' ? parseInt(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.precio_venta || !formData.estanteria_id) {
      alert("Por favor completa los campos obligatorios");
      return;
    }
    onSubmit({ ...formData, file });
  };

  const inputClass = "w-full border-b border-gray-100 py-3 focus:border-black outline-none transition-colors text-sm font-light tracking-wide placeholder:text-gray-200";
  const labelClass = "text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 block mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <div>
          <label className={labelClass}>Nombre del Producto *</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className={inputClass}
            placeholder="Ej: Silk Lip Gloss"
            required
          />
        </div>

        <div>
          <label className={labelClass}>Descripción</label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            className={`${inputClass} resize-none h-20`}
            placeholder="Detalles del producto..."
          />
        </div>

        <div>
          <label className={labelClass}>URL Imagen</label>
          <input
            type="text"
            name="imagen_url"
            value={formData.imagen_url}
            onChange={handleChange}
            className={inputClass}
            placeholder="https://..."
          />
        </div>

        <div>
          <label className={labelClass}>Imagen (archivo)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className={`${inputClass} cursor-pointer`}
          />
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <label className={labelClass}>Precio Compra</label>
            <input
              type="number"
              name="precio_compra"
              value={formData.precio_compra}
              onChange={handleChange}
              className={inputClass}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className={labelClass}>Precio Venta *</label>
            <input
              type="number"
              name="precio_venta"
              value={formData.precio_venta}
              onChange={handleChange}
              className={inputClass}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <label className={labelClass}>Stock Inicial</label>
            <input
              type="number"
              name="cantidad_stock"
              value={formData.cantidad_stock}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Estantería *</label>
            <select
              name="estanteria_id"
              value={formData.estanteria_id}
              onChange={handleChange}
              className={`${inputClass} bg-transparent cursor-pointer`}
              required
            >
              <option value="">Seleccionar...</option>
              {estanterias.map(est => (
                <option key={est.id} value={est.id}>{est.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-4">
        <button
          type="submit"
          className="w-full bg-black text-white text-[10px] uppercase tracking-[0.3em] font-bold py-5 hover:bg-gray-800 transition-all duration-500"
        >
          Guardar Producto
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full text-[9px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors py-2"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default ProductoForm;
