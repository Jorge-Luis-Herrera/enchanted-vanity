
import pymysql

def get_db_connection():
    return pymysql.connect(
        host='localhost',
        user='root',
        password='Jorgito123@',
        database='enchanted_vanity',
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
