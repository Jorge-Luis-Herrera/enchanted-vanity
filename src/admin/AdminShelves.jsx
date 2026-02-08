import React, { useState, useEffect } from "react";
import { API_URL } from "../apiConfig";
import "./AdminShelves.css";

const AdminShelves = () => {
    const [shelves, setShelves] = useState([]);
    const [newShelfTitle, setNewShelfTitle] = useState("");
    const [newShelfId, setNewShelfId] = useState("");

    useEffect(() => {
        fetchShelves();
    }, []);

    const fetchShelves = () => {
        fetch(`${API_URL}/inventory`)
            .then(res => res.json())
            .then(data => setShelves(data))
            .catch(err => console.error("Error cargando estanterías", err));
    };

    const handleCreateShelf = (e) => {
        e.preventDefault();
        if (!newShelfId || !newShelfTitle) return;

        fetch(`${API_URL}/inventory/shelf`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: newShelfId, titulo: newShelfTitle })
        })
        .then(() => {
            setNewShelfId("");
            setNewShelfTitle("");
            fetchShelves();
            alert("Categoría creada con éxito");
        })
        .catch(err => console.error("Error creando estantería", err));
    };

    const handleDeleteShelf = (id) => {
        if (!window.confirm("¿Seguro que quieres eliminar esta categoría y TODOS sus productos asociados?")) return;

        fetch(`${API_URL}/inventory/shelf/${id}`, {
            method: "DELETE"
        })
        .then(() => {
            fetchShelves();
            alert("Categoría y productos eliminados con éxito.");
        })
        .catch(err => console.error("Error eliminando estantería", err));
    };

    return (
        <div className="admin-view">
            <h1>Gestión de Categorías</h1>
            
            <form className="admin-form" onSubmit={handleCreateShelf}>
                <h3>Nueva Sección / Categoría</h3>
                <div className="form-group">
                    <input 
                        type="text" 
                        placeholder="ID Técnico (ej: s3)" 
                        value={newShelfId}
                        onChange={(e) => setNewShelfId(e.target.value)}
                    />
                    <input 
                        type="text" 
                        placeholder="Nombre de la Categoría" 
                        value={newShelfTitle}
                        onChange={(e) => setNewShelfTitle(e.target.value)}
                    />
                    <button type="submit" className="add-btn">Añadir Categoría</button>
                </div>
            </form>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Descripción / Título</th>
                            <th>Total Productos</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shelves.map(shelf => (
                            <tr key={shelf.id}>
                                <td>{shelf.id}</td>
                                <td>{shelf.titulo}</td>
                                <td>{shelf.productos?.length || 0}</td>
                                <td>
                                    <button 
                                        className="del-btn" 
                                        onClick={() => handleDeleteShelf(shelf.id)}
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

export default AdminShelves;
