import os
import time
from pathlib import Path

import pymysql
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

# --- CONFIGURACIÓN DE SEGURIDAD ---
MAX_PRODUCTOS_TOTALES = 500
ADMIN_USER = "admin"
ADMIN_PASS = "enchanted123"

class LoginRequest(BaseModel):
    username: str
    password: str

class EstanteriaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    imagen_url: Optional[str] = None

class EstanteriaCreate(EstanteriaBase):
    pass

class Estanteria(EstanteriaBase):
    id: int

    class Config:
        from_attributes = True

class ProductoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    imagen_url: Optional[str] = None
    cantidad_stock: int = 0
    precio_compra: float
    precio_venta: float
    estanteria_id: int

class ProductoCreate(ProductoBase):
    pass

class Producto(ProductoBase):
    id: int

    class Config:
        from_attributes = True

app = FastAPI(title="Enchanted Vanity API")

# Serve uploaded files so frontend can load images
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# Public URL used to build absolute links for uploaded assets
PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "http://localhost:8000")

# CORS - allow frontend origins
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    return pymysql.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', 'Jorgito123@'),
        database=os.getenv('DB_NAME', 'enchanted_vanity'),
        port=int(os.getenv('DB_PORT', '3306')),
        cursorclass=pymysql.cursors.DictCursor
    )

@app.get("/")
def health_check():
    """Simple health check endpoint that doesn't require database"""
    return {"status": "ok", "message": "Enchanted Vanity API is running"}

@app.get("/inventario")
def obtener_inventario():
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # INNER JOIN to ensure we only get valid products and avoid null IDs in frontend
            # Empty shelves are handled by /estanterias endpoint
            sql = """
            SELECT e.nombre as estanteria, e.descripcion as estanteria_desc, e.imagen_url as estanteria_img, p.* 
            FROM estanterias e 
            INNER JOIN productos p ON e.id = p.estanteria_id
            """
            cursor.execute(sql)
            resultados = cursor.fetchall()
            return resultados
    finally:
        connection.close()

@app.patch("/productos/{producto_id}/vender")
def vender_producto(producto_id: int):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql_update = "UPDATE productos SET cantidad_stock = cantidad_stock - 1 WHERE id = %s AND cantidad_stock > 0"
            cursor.execute(sql_update, (producto_id,))
            connection.commit()

            if cursor.rowcount == 0:
                return {"error": "No se pudo vender: sin stock o producto inexistente"}
            return {"mensaje": "Producto vendido con éxito"}
    finally:
        connection.close()

@app.patch("/productos/{producto_id}/comprar")
def comprar_producto(producto_id: int):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql_update = "UPDATE productos SET cantidad_stock = cantidad_stock + 1 WHERE id = %s AND cantidad_stock < 100"
            cursor.execute(sql_update, (producto_id,))
            connection.commit()
            filas_afectadas = cursor.rowcount
            
        if filas_afectadas == 0:
            return {"error": "No se pudo comprar: producto no encontrado o stock máximo (100) alcanzado"}
        
        return {"mensaje": "Compra registrada con éxito"} 
    finally:
        connection.close()

@app.post("/productos")
async def crear_producto(
    nombre: str = Form(...),
    descripcion: Optional[str] = Form(None),
    imagen_url: Optional[str] = Form(None),
    cantidad_stock: int = Form(0),
    precio_compra: float = Form(...),
    precio_venta: float = Form(...),
    estanteria_id: int = Form(...),
    file: Optional[UploadFile] = File(None)
):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # 1. Protección: Contar total de productos para evitar saturación
            cursor.execute("SELECT COUNT(*) as total FROM productos")
            resultado = cursor.fetchone()
            if resultado['total'] >= MAX_PRODUCTOS_TOTALES:
                return {"error": "Límite global de productos alcanzado. No se pueden agregar más."}

            # 2. Si llega archivo, guardamos y usamos esa ruta como imagen_url
            final_imagen = imagen_url
            if file is not None and file.filename:
                safe_name = f"{int(time.time())}_{file.filename}"
                dest_path = uploads_dir / safe_name
                with dest_path.open("wb") as f:
                    f.write(await file.read())
                # Guardamos ruta accesible desde el frontend (URL absoluta)
                final_imagen = f"{PUBLIC_BASE_URL}/uploads/{safe_name}"

            # 3. Insertar el producto de forma segura
            sql = """
            INSERT INTO productos (nombre, descripcion, imagen_url, cantidad_stock, precio_compra, precio_venta, estanteria_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (
                nombre,
                descripcion,
                final_imagen,
                cantidad_stock,
                precio_compra,
                precio_venta,
                estanteria_id
            ))
            connection.commit()
            return {"mensaje": "Producto creado con éxito", "id": cursor.lastrowid}
    finally:
        connection.close()

@app.post("/login")
def login(request: LoginRequest):
    if request.username == ADMIN_USER and request.password == ADMIN_PASS:
        return {"mensaje": "Login exitoso", "usuario": ADMIN_USER}
    return {"error": "Credenciales incorrectas"}

@app.delete("/productos/{producto_id}")
def eliminar_producto(producto_id: int):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = "DELETE FROM productos WHERE id = %s"
            cursor.execute(sql, (producto_id,))
            connection.commit()
            if cursor.rowcount == 0:
                return {"error": "Producto no encontrado"}
            return {"mensaje": "Producto eliminado correctamente"}
    finally:
        connection.close()

@app.get("/estanterias")
def obtener_estanterias():
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM estanterias")
            return cursor.fetchall()
    finally:
        connection.close()

@app.post("/estanterias")
def crear_estanteria(estanteria: EstanteriaBase):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = "INSERT INTO estanterias (nombre, descripcion, imagen_url) VALUES (%s, %s, %s)"
            cursor.execute(sql, (estanteria.nombre, estanteria.descripcion, estanteria.imagen_url))
            connection.commit()
            return {"mensaje": "Estantería creada", "id": cursor.lastrowid}
    finally:
        connection.close()

@app.delete("/estanterias/{estanteria_id}")
def eliminar_estanteria(estanteria_id: int):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = "DELETE FROM estanterias WHERE id = %s"
            cursor.execute(sql, (estanteria_id,))
            connection.commit()
            if cursor.rowcount == 0:
                return {"error": "Estantería no encontrada"}
            return {"mensaje": "Estantería eliminada correctamente"}
    finally:
        connection.close()