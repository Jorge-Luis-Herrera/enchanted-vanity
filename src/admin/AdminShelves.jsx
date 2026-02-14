import React, { useState, useEffect } from "react";
import { API_URL } from "../apiConfig";
import { getAuthHeaders } from "../utils/auth";
import "./AdminShelves.css";

const AdminShelves = () => {
    const [shelves, setShelves] = useState([]);
    const [newShelfTitle, setNewShelfTitle] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchShelves();
    }, []);

    const fetchShelves = () => {
        fetch(`${API_URL}/inventory`)
            .then(res => {
                if (!res.ok) throw new Error("Error en el servidor");
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setShelves(data);
                } else {
                    console.error("Respuesta inesperada:", data);
                    setError("Error al cargar las estanterías: respuesta no válida.");
                }
            })
            .catch(err => {
                console.error("Error cargando estanterías", err);
                setError("No se pudo conectar con el servidor.");
            });
    };

    const handleCreateShelf = (e) => {
        e.preventDefault();
        setError("");
        const trimmed = newShelfTitle.trim();
        if (!trimmed) {
            setError("El nombre de la estantería no puede estar vacío.");
            return;
        }
        if (trimmed.length < 2) {
            setError("El nombre debe tener al menos 2 caracteres.");
            return;
        }

        fetch(`${API_URL}/inventory/shelf`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeaders() },
            body: JSON.stringify({ titulo: trimmed })
        })
        .then(() => {
            setNewShelfTitle("");
            setError("");
            fetchShelves();
            alert("Estantería creada con éxito");
        })
        .catch(err => console.error("Error creando estantería", err));
    };

    const handleDeleteShelf = (id) => {
        if (!window.confirm("¿Seguro que quieres eliminar esta estantería y TODAS sus categorías asociadas?")) return;

        fetch(`${API_URL}/inventory/shelf/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        })
        .then(() => {
            fetchShelves();
            alert("Estantería y categorías eliminadas con éxito.");
        })
        .catch(err => console.error("Error eliminando estantería", err));
    };

    return (
        <div className="admin-view">
            <h1>Gestión de Estanterías</h1>
            
            <form className="admin-form" onSubmit={handleCreateShelf}>
                <h3>Nueva Estantería</h3>
                {error && <p className="admin-form-error">{error}</p>}
                <div className="form-group">
                    <input 
                        type="text" 
                        placeholder="Nombre de la Estantería" 
                        value={newShelfTitle}
                        onChange={(e) => { setNewShelfTitle(e.target.value); setError(""); }}
                        className={error ? "input-error" : ""}
                    />
                    <button type="submit" className="add-btn">Añadir Estantería</button>
                </div>
            </form>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Título</th>
                            <th>Total Categorías</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shelves.map(shelf => (
                            <tr key={shelf.id}>
                                <td>{shelf.id}</td>
                                <td>{shelf.titulo}</td>
                                <td>{shelf.categorias?.length || 0}</td>
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
