import React, { useState, useEffect } from "react";
import { API_URL, STATIC_URL } from "../apiConfig";
import { getAuthHeaders } from "../utils/auth";
import "./AdminProducts.css";

const AdminProducts = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [editingId, setEditingId] = useState(null);

    const emptyProduct = {
        nombre: "",
        cantidad: 0,
        precio: 0,
        categoryIds: [],
        esCombo: false,
        esOferta: false,
    };
    const [formData, setFormData] = useState(emptyProduct);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => { fetchData(); }, []);

    const fetchData = () => {
        fetch(`${API_URL}/inventory/categories`)
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setCategories(data); })
            .catch(err => console.error("Error cargando categorías", err));

        fetch(`${API_URL}/inventory/products`)
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setProducts(data); else setProducts([]); })
            .catch(err => { console.error("Error cargando productos", err); setProducts([]); });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleCategoryToggle = (catId) => {
        setFormData(prev => {
            const ids = prev.categoryIds.includes(catId)
                ? prev.categoryIds.filter(id => id !== catId)
                : [...prev.categoryIds, catId];
            return { ...prev, categoryIds: ids };
        });
    };

    const handleEdit = (product) => {
        setEditingId(product.id);
        setFormData({
            nombre: product.nombre,
            cantidad: product.cantidad,
            precio: product.precio,
            categoryIds: product.categorias?.map(c => c.id) || [],
            esCombo: product.esCombo || false,
            esOferta: product.esOferta || false,
        });
        setSelectedFile(null);
        setPreviewUrl(product.imagenUrl ? `${STATIC_URL}${product.imagenUrl}` : null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData(emptyProduct);
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        const nombreTrim = formData.nombre.trim();
        if (!nombreTrim) {
            setError("El nombre del producto no puede estar vacío.");
            return;
        }
        const cantidad = parseInt(formData.cantidad, 10);
        const precio = parseFloat(formData.precio);
        if (isNaN(cantidad) || cantidad < 0) {
            setError("El stock debe ser un número mayor o igual a 0.");
            return;
        }
        if (isNaN(precio) || precio <= 0) {
            setError("El precio debe ser un número mayor que 0.");
            return;
        }

        const fd = new FormData();
        fd.append("nombre", nombreTrim);
        fd.append("cantidad", cantidad.toString());
        fd.append("precio", precio.toString());
        fd.append("categoryIds", JSON.stringify(formData.categoryIds));
        fd.append("esCombo", formData.esCombo.toString());
        fd.append("esOferta", formData.esOferta.toString());
        if (selectedFile) fd.append("imagen", selectedFile);

        const url = editingId 
            ? `${API_URL}/inventory/product/${editingId}` 
            : `${API_URL}/inventory/product`;
        const method = editingId ? "PATCH" : "POST";

        fetch(url, { method, headers: getAuthHeaders(), body: fd })
            .then(() => {
                setError("");
                handleCancelEdit();
                fetchData();
                alert(editingId ? "Producto actualizado" : "Producto guardado");
            })
            .catch(err => console.error("Error guardando producto", err));
    };

    const handleDeleteProduct = (id) => {
        if (!window.confirm("¿Seguro que quieres eliminar este producto?")) return;
        fetch(`${API_URL}/inventory/product/${id}`, { method: "DELETE", headers: getAuthHeaders() })
            .then(() => fetchData())
            .catch(err => console.error("Error eliminando producto", err));
    };

    const handleUpdateStock = (id, currentStock, delta) => {
        const newStock = Math.max(0, currentStock + delta);
        fetch(`${API_URL}/inventory/product/${id}/stock`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", ...getAuthHeaders() },
            body: JSON.stringify({ cantidad: newStock })
        })
        .then(() => fetchData())
        .catch(err => console.error("Error actualizando stock", err));
    };

    return (
        <div className="admin-view">
            <h1>Gestión de Productos</h1>

            <form className="admin-form" onSubmit={handleSubmit}>
                <h3>{editingId ? `Editando Producto #${editingId}` : 'Añadir Nuevo Producto'}</h3>
                {error && <p className="admin-form-error">{error}</p>}
                <div className="form-grid">
                    <div className="field">
                        <label>Nombre del Producto</label>
                        <input 
                            type="text" 
                            value={formData.nombre}
                            onChange={(e) => { setFormData({...formData, nombre: e.target.value}); setError(""); }}
                            required 
                        />
                    </div>
                    <div className="field">
                        <label>Stock Inicial</label>
                        <input 
                            type="number" 
                            value={formData.cantidad}
                            onChange={(e) => { setFormData({...formData, cantidad: parseInt(e.target.value, 10) || 0}); setError(""); }}
                        />
                    </div>
                    <div className="field">
                        <label>Precio ($)</label>
                        <input 
                            type="number" 
                            step="0.01"
                            value={formData.precio}
                            onChange={(e) => { setFormData({...formData, precio: parseFloat(e.target.value) || 0}); setError(""); }}
                        />
                    </div>
                </div>

                {/* Categorías multi-select */}
                <div className="field" style={{ marginTop: '10px' }}>
                    <label>Categorías</label>
                    <div className="category-checkboxes">
                        {categories.map(cat => (
                            <label key={cat.id} className="checkbox-label">
                                <input 
                                    type="checkbox"
                                    checked={formData.categoryIds.includes(cat.id)}
                                    onChange={() => handleCategoryToggle(cat.id)}
                                />
                                {cat.nombre} <small>({cat.estanteria?.titulo})</small>
                            </label>
                        ))}
                        {categories.length === 0 && <span style={{ color: 'gray', fontSize: '0.8rem' }}>No hay categorías creadas</span>}
                    </div>
                </div>

                {/* Toggles Combo / Oferta */}
                <div className="specialization-toggles">
                    <label className="toggle-label">
                        <input 
                            type="checkbox"
                            checked={formData.esCombo}
                            onChange={(e) => setFormData({...formData, esCombo: e.target.checked})}
                        />
                        <span className="toggle-text combo">Es Combo</span>
                    </label>
                    <label className="toggle-label">
                        <input 
                            type="checkbox"
                            checked={formData.esOferta}
                            onChange={(e) => setFormData({...formData, esOferta: e.target.checked})}
                        />
                        <span className="toggle-text oferta">Es Oferta</span>
                    </label>
                </div>

                <div className="form-upload-section">
                    <div className="image-preview">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" />
                        ) : (
                            <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'gray', fontSize: '0.7rem' }}>
                                Sin Imagen
                            </div>
                        )}
                    </div>
                    <div className="file-input-wrapper">
                        <input type="file" id="file-upload" onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                        <label htmlFor="file-upload" className="upload-btn-label">
                            {selectedFile ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                        </label>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="submit" className="add-btn">
                            {editingId ? 'Actualizar' : 'Guardar Producto'}
                        </button>
                        {editingId && (
                            <button type="button" className="del-btn" onClick={handleCancelEdit}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </div>
            </form>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Miniatura</th>
                            <th>Nombre</th>
                            <th>Stock</th>
                            <th>Precio</th>
                            <th>Categorías</th>
                            <th>Tipo</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>
                                    {product.imagenUrl ? (
                                        <img 
                                            src={`${STATIC_URL}${product.imagenUrl}`} 
                                            alt="thumb" 
                                            style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <span style={{ fontSize: '0.7rem', color: 'gray' }}>N/A</span>
                                    )}
                                </td>
                                <td>{product.nombre}</td>
                                <td>
                                    <div className="stock-controls">
                                        <button 
                                            className="stock-btn"
                                            onClick={() => handleUpdateStock(product.id, product.cantidad, -1)}
                                        >-</button>
                                        <span className="stock-value">{product.cantidad}</span>
                                        <button 
                                            className="stock-btn"
                                            onClick={() => handleUpdateStock(product.id, product.cantidad, 1)}
                                        >+</button>
                                    </div>
                                </td>
                                <td>${product.precio}</td>
                                <td style={{ fontSize: '0.75rem' }}>
                                    {product.categorias?.map(c => c.nombre).join(', ') || 'Ninguna'}
                                </td>
                                <td>
                                    {product.esCombo && <span className="badge combo">Combo</span>}
                                    {product.esOferta && <span className="badge oferta">Oferta</span>}
                                    {!product.esCombo && !product.esOferta && <span style={{ fontSize: '0.7rem', color: 'gray' }}>Normal</span>}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button className="edit-btn" onClick={() => handleEdit(product)}>Editar</button>
                                        <button className="del-btn" onClick={() => handleDeleteProduct(product.id)}>Eliminar</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProducts;
