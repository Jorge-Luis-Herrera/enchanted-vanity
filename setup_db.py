import pymysql

# Credenciales de Railway MySQL
DB_HOST = "caboose.proxy.rlwy.net"
DB_PORT = 42230
DB_USER = "root"
DB_PASSWORD = "iWkZRZYuSYbCEAVOUzzsocwFGhuHgubV"
DB_NAME = "railway"

try:
    connection = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor
    )
    print("✓ Conectado a MySQL en Railway")
    
    with connection.cursor() as cursor:
        # Crear tabla estanterias
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS estanterias (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nombre VARCHAR(255) NOT NULL,
          descripcion TEXT,
          imagen_url VARCHAR(500)
        )
        """)
        print("✓ Tabla 'estanterias' creada")
        
        # Crear tabla productos
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS productos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nombre VARCHAR(255) NOT NULL,
          descripcion TEXT,
          imagen_url VARCHAR(500),
          cantidad_stock INT DEFAULT 0,
          precio_compra DECIMAL(10,2),
          precio_venta DECIMAL(10,2) NOT NULL,
          estanteria_id INT,
          FOREIGN KEY (estanteria_id) REFERENCES estanterias(id) ON DELETE SET NULL
        )
        """)
        print("✓ Tabla 'productos' creada")
        
        connection.commit()
        print("\n✓✓✓ ¡Tablas creadas exitosamente en Railway! ✓✓✓")
        
except Exception as e:
    print(f"✗ Error: {e}")
finally:
    if connection:
        connection.close()
