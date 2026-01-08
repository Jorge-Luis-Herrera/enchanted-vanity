
import os
import pymysql

def get_db_connection():
    # Try Railway standard variables first, then fallback to custom DB_* or defaults
    host = os.getenv('MYSQLHOST') or os.getenv('DB_HOST') or 'localhost'
    user = os.getenv('MYSQLUSER') or os.getenv('DB_USER') or 'root'
    password = os.getenv('MYSQLPASSWORD') or os.getenv('DB_PASSWORD') or 'Jorgito123@'
    database = os.getenv('MYSQLDATABASE') or os.getenv('DB_NAME') or 'enchanted_vanity'
    port = int(os.getenv('MYSQLPORT') or os.getenv('DB_PORT') or '3306')

    return pymysql.connect(
        host=host,
        user=user,
        password=password,
        database=database,
        port=port,
        cursorclass=pymysql.cursors.DictCursor
    )

def migrate():
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Add descripcion column
            try:
                cursor.execute("ALTER TABLE estanterias ADD COLUMN descripcion TEXT")
                print("Added 'descripcion' column.")
            except pymysql.err.OperationalError as e:
                if e.args[0] == 1060:
                    print("'descripcion' column already exists.")
                else:
                    print(f"Error adding 'descripcion': {e}")

            # Add imagen_url column
            try:
                cursor.execute("ALTER TABLE estanterias ADD COLUMN imagen_url VARCHAR(255)")
                print("Added 'imagen_url' column.")
            except pymysql.err.OperationalError as e:
                if e.args[0] == 1060:
                    print("'imagen_url' column already exists.")
                else:
                    print(f"Error adding 'imagen_url': {e}")
            
            connection.commit()
            print("Migration completed.")
    finally:
        connection.close()

if __name__ == "__main__":
    migrate()
