# B&V Cosméticos

Catálogo de productos con panel de administración. Stack: React + Vite (frontend), NestJS + TypeORM + SQLite (backend).

## Desarrollo

```bash
# Terminal 1: Backend
cd backend && npm run start:dev

# Terminal 2: Frontend
npm run dev
```

- Backend: http://localhost:3000
- Frontend: http://localhost:5173 (Vite hace proxy de /api al backend)
- Credenciales admin: `admin` / `admin123`

La base de datos y las imágenes se guardan en `backend/data/` y `backend/uploads/` respectivamente. En desarrollo la ruta es fija y los datos persisten al reiniciar el servidor.

## Producción (Azure App Service)

El disco por defecto en Azure es **efímero**: se pierde en cada reinicio o despliegue. Para conservar la base de datos y las imágenes, debes montar **Azure Files** en `/home/data`.

### Montar Azure Files

1. Crear una cuenta de **Azure Storage** y un **File Share** (por ejemplo `bv-data`).

2. En Azure Portal, ir al App Service → **Configuration** → **Path Mappings**.

3. Añadir un mount de tipo **Azure Files**:
   - **Name**: `data`
   - **Storage account**: tu cuenta
   - **Storage type**: Azure Files
   - **Storage container**: el File Share
   - **Mount path**: `/home/data`

4. Guardar y reiniciar la aplicación.

Con esto, `db.sqlite` y la carpeta `uploads` en `/home/data/` persistirán entre reinicios y despliegues.

Documentación oficial: [Montar Azure Files en App Service](https://learn.microsoft.com/azure/app-service/configure-connect-to-azure-storage)
