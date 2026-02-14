import React, { useState, useEffect } from "react";
import { API_URL, STATIC_URL } from "../apiConfig";
import { getAuthHeaders } from "../utils/auth";
import "./AdminProducts.css"; // Reutilizamos estilos del admin

const AdminCategories = () => {
    const [shelves, setShelves] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ nombre: "", shelfId: "" });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => { fetchData(); }, []);

    const fetchData = () => {
        fetch(`${API_URL}/inventory`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setShelves(data);
                    if (data.length > 0 && !newCategory.shelfId) {
                        setNewCategory(prev => ({ ...prev, shelfId: data[0].id }));
                    }
                }
            })
            .catch(err => console.error("Error cargando estanterías", err));

        fetch(`${API_URL}/inventory/categories`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setCategories(data);
                else setCategories([]);
            })
            .catch(err => {
                console.error("Error cargando categorías", err);
                setCategories([]);
            });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleCreate = (e) => {
        e.preventDefault();
        setError("");
        const nombreTrim = newCategory.nombre.trim();
        if (!nombreTrim) {
            setError("El nombre de la categoría no puede estar vacío.");
            return;
        }
        if (nombreTrim.length < 2) {
            setError("El nombre debe tener al menos 2 caracteres.");
            return;
        }
        if (!newCategory.shelfId) {
            setError(shelves.length === 0 ? "No hay estanterías. Cree una estantería primero." : "Debe seleccionar una estantería.");
            return;
        }

        const formData = new FormData();
        formData.append("nombre", nombreTrim);
        formData.append("shelfId", newCategory.shelfId.toString());
        if (selectedFile) formData.append("imagen", selectedFile);

        fetch(`${API_URL}/inventory/category`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: formData
        })
        .then(() => {
            setNewCategory({ nombre: "", shelfId: shelves[0]?.id || "" });
            setSelectedFile(null);
            setPreviewUrl(null);
            setError("");
            fetchData();
            alert("Categoría creada correctamente");
        })
        .catch(err => console.error("Error creando categoría", err));
    };

    const handleDelete = (id) => {
        if (!window.confirm("¿Seguro que quieres eliminar esta categoría?")) return;
        fetch(`${API_URL}/inventory/category/${id}`, { method: "DELETE", headers: getAuthHeaders() })
            .then(() => fetchData())
            .catch(err => console.error("Error eliminando categoría", err));
    };

    return (
        <div className="admin-view">
            <h1>Gestión de Categorías</h1>

            <form className="admin-form" onSubmit={handleCreate}>
                <h3>Nueva Categoría</h3>
                {error && <p className="admin-form-error">{error}</p>}
                <div className="form-grid">
                    <div className="field">
                        <label>Nombre de la Categoría</label>
                        <input 
                            type="text" 
                            value={newCategory.nombre}
                            onChange={(e) => { setNewCategory({...newCategory, nombre: e.target.value}); setError(""); }}
                            required 
                        />
                    </div>
                    <div className="field">
                        <label>Estantería</label>
                        <select 
                            value={newCategory.shelfId}
                            onChange={(e) => { setNewCategory({...newCategory, shelfId: e.target.value}); setError(""); }}
                            className={error && !newCategory.shelfId ? "input-error" : ""}
                        >
                            <option value="">Seleccione estantería</option>
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
                        <input type="file" id="cat-file-upload" onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                        <label htmlFor="cat-file-upload" className="upload-btn-label">
                            {selectedFile ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                        </label>
                    </div>
                    <button type="submit" className="add-btn">Guardar Categoría</button>
                </div>
            </form>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Imagen</th>
                            <th>Nombre</th>
                            <th>Estantería</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => (
                            <tr key={cat.id}>
                                <td>
                                    {cat.imagenUrl ? (
                                        <img 
                                            src={`${STATIC_URL}${cat.imagenUrl}`} 
                                            alt="thumb" 
                                            style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <span style={{ fontSize: '0.7rem', color: 'gray' }}>N/A</span>
                                    )}
                                </td>
                                <td>{cat.nombre}</td>
                                <td>{cat.estanteria?.titulo || 'Sin estantería'}</td>
                                <td>
                                    <button className="del-btn" onClick={() => handleDelete(cat.id)}>
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

export default AdminCategories;
