import React, { useState, useEffect } from "react";
import { API_URL, STATIC_URL } from "../apiConfig";
import { getAuthHeaders } from "../utils/auth";
import "./AdminProducts.css"; // Reutilizamos estilos del admin

const AdminCategories = () => {
    const [shelves, setShelves] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [newCategory, setNewCategory] = useState({ nombre: "", shelfId: "" });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => { fetchData(); }, []);

    const fetchData = () => {
        fetch(`${API_URL}/inventory`)
            .then(res => {
                if (!res.ok) throw new Error("Error en servidor");
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setShelves(data);
                    if (data.length > 0 && !newCategory.shelfId) {
                        setNewCategory(prev => ({ ...prev, shelfId: data[0].id }));
                    }
                }
            })
            .catch(err => {
                console.error("Error cargando estanterías", err);
                setShelves([]);
            });

        fetch(`${API_URL}/inventory/categories`)
            .then(res => {
                if (!res.ok) throw new Error("Error en servidor");
                return res.json();
            })
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

    const handleEdit = (cat) => {
        setEditingId(cat.id);
        setNewCategory({
            nombre: cat.nombre,
            shelfId: cat.shelfId
        });
        setSelectedFile(null);
        setPreviewUrl(cat.imagenUrl ? `${STATIC_URL}${cat.imagenUrl}` : null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setNewCategory({ nombre: "", shelfId: shelves[0]?.id || "" });
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const fileToBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const handleSubmit = async (e) => {
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

        let base64Image = null;
        if (selectedFile) {
            try {
                base64Image = await fileToBase64(selectedFile);
            } catch (err) {
                console.error("Error convirtiendo imagen", err);
            }
        }

        const payload = {
            nombre: nombreTrim,
            shelfId: parseInt(newCategory.shelfId, 10),
            imagenUrl: base64Image || (editingId ? categories.find(c => c.id === editingId)?.imagenUrl : null)
        };

        const url = editingId
            ? `${API_URL}/inventory/category/${editingId}`
            : `${API_URL}/inventory/category`;
        const method = editingId ? "PATCH" : "POST";

        fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders()
            },
            body: JSON.stringify(payload)
        })
            .then(() => {
                handleCancelEdit();
                setError("");
                fetchData();
                alert(editingId ? "Categoría actualizada" : "Categoría creada");
            })
            .catch(err => console.error("Error guardando categoría", err));
    };

    const handleMove = (id, direction) => {
        fetch(`${API_URL}/inventory/category/${id}/order`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", ...getAuthHeaders() },
            body: JSON.stringify({ direction })
        })
            .then(() => fetchData())
            .catch(err => console.error("Error reordenando categoría", err));
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

            <form className="admin-form" onSubmit={handleSubmit}>
                <h3>{editingId ? `Editando Categoría #${editingId}` : 'Nueva Categoría'}</h3>
                {error && <p className="admin-form-error">{error}</p>}
                <div className="form-grid">
                    <div className="field">
                        <label>Nombre de la Categoría</label>
                        <input
                            type="text"
                            value={newCategory.nombre}
                            onChange={(e) => { setNewCategory({ ...newCategory, nombre: e.target.value }); setError(""); }}
                            required
                        />
                    </div>
                    <div className="field">
                        <label>Estantería</label>
                        <select
                            value={newCategory.shelfId}
                            onChange={(e) => { setNewCategory({ ...newCategory, shelfId: e.target.value }); setError(""); }}
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
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="submit" className="add-btn">
                            {editingId ? 'Actualizar' : 'Guardar Categoría'}
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
                            <th>Orden</th>
                            <th>Imagen</th>
                            <th>Nombre</th>
                            <th>Estantería</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat, index) => (
                            <tr key={cat.id}>
                                <td>
                                    <div className="order-controls">
                                        <button
                                            className="order-btn"
                                            disabled={index === 0}
                                            onClick={() => handleMove(cat.id, 'up')}
                                        >↑</button>
                                        <button
                                            className="order-btn"
                                            disabled={index === categories.length - 1}
                                            onClick={() => handleMove(cat.id, 'down')}
                                        >↓</button>
                                    </div>
                                </td>
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
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button className="edit-btn" onClick={() => handleEdit(cat)}>
                                            Editar
                                        </button>
                                        <button className="del-btn" onClick={() => handleDelete(cat.id)}>
                                            Eliminar
                                        </button>
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

export default AdminCategories;
