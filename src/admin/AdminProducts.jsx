import React, { useState, useEffect } from "react";
import { API_URL, STATIC_URL } from "../apiConfig";
import "./AdminProducts.css";

const AdminProducts = () => {
    const [shelves, setShelves] = useState([]);
    const [products, setProducts] = useState([]);

    const [newProduct, setNewProduct] = useState({
        nombre: "",
        cantidad: 0,
        precio: 0,
        shelfId: ""
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        // Cargar estanterías para el select
        fetch(`${API_URL}/inventory`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setShelves(data);
                    if (data.length > 0 && !newProduct.shelfId) {
                        setNewProduct(prev => ({ ...prev, shelfId: data[0].id }));
                    }
                }
            })
            .catch(err => console.error("Error cargando estanterías", err));

        // Cargar todos los productos de forma plana para la tabla
        fetch(`${API_URL}/inventory/products`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setProducts(data);
                } else {
                    setProducts([]);
                }
            })
            .catch(err => {
                console.error("Error cargando productos", err);
                setProducts([]);
            });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleCreateProduct = (e) => {
        e.preventDefault();
        if (!newProduct.nombre || !newProduct.shelfId) return;

        const formData = new FormData();
        formData.append("nombre", newProduct.nombre);
        formData.append("cantidad", newProduct.cantidad.toString());
        formData.append("precio", newProduct.precio.toString());
        formData.append("shelfId", newProduct.shelfId);
        if (selectedFile) {
            formData.append("imagen", selectedFile);
        }

        fetch(`${API_URL}/inventory/product`, {
            method: "POST",
            body: formData 
        })
        .then(() => {
            setNewProduct({
                nombre: "",
                cantidad: 0,
                precio: 0,
                shelfId: shelves[0]?.id || ""
            });
            setSelectedFile(null);
            setPreviewUrl(null);
            fetchData(); 
            alert("Producto guardado correctamente");
        })
        .catch(err => console.error("Error creando producto", err));
    };
    const handleDeleteProduct = (id) => {
        if (!window.confirm("¿Seguro que quieres eliminar este producto?")) return;

        fetch(`${API_URL}/inventory/product/${id}`, {
            method: "DELETE"
        })
        .then(() => fetchData()) // Recargamos todo
        .catch(err => console.error("Error eliminando producto", err));
    };

    const handleUpdateStock = (id, currentStock, delta) => {
        const newStock = Math.max(0, currentStock + delta);
        
        fetch(`${API_URL}/inventory/product/${id}/stock`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cantidad: newStock })
        })
        .then(() => fetchData())
        .catch(err => console.error("Error actualizando stock", err));
    };

    return (
        <div className="admin-view">
            <h1>Gestión de Productos</h1>

            <form className="admin-form" onSubmit={handleCreateProduct}>
                <h3>Añadir Nuevo Producto</h3>
                <div className="form-grid">
                    <div className="field">
                        <label>Nombre del Producto</label>
                        <input 
                            type="text" 
                            value={newProduct.nombre}
                            onChange={(e) => setNewProduct({...newProduct, nombre: e.target.value})}
                            required 
                        />
                    </div>
                    <div className="field">
                        <label>Stock Inicial</label>
                        <input 
                            type="number" 
                            value={newProduct.cantidad}
                            onChange={(e) => setNewProduct({...newProduct, cantidad: parseInt(e.target.value)})}
                        />
                    </div>
                    <div className="field">
                        <label>Precio ($)</label>
                        <input 
                            type="number" 
                            step="0.01"
                            value={newProduct.precio}
                            onChange={(e) => setNewProduct({...newProduct, precio: parseFloat(e.target.value)})}
                        />
                    </div>
                    <div className="field">
                        <label>Estantería / Sección</label>
                        <select 
                            value={newProduct.shelfId}
                            onChange={(e) => setNewProduct({...newProduct, shelfId: e.target.value})}
                        >
                            {shelves.map(s => (
                                <option key={s.id} value={s.id}>{s.titulo}</option>
                            ))}
                        </select>
                    </div>
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
                    <button type="submit" className="add-btn">Guardar Producto</button>
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
                            <th>Estantería</th>
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
                                <td>{product.estanteria?.titulo || 'Sin categoría'}</td>
                                <td>
                                    <button 
                                        className="del-btn"
                                        onClick={() => handleDeleteProduct(product.id)}
                                    >
                                        Eliminar
                                    </button>
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
