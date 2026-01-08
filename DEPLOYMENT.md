# Enchanted Vanity - Deployment Guide

## 🚀 Deploy Backend (Railway)

1. **Create Railway Account**: https://railway.app
2. **Create New Project** → "Deploy from GitHub repo"
3. **Add MySQL Database**:
   - In Railway dashboard, click "New" → "Database" → "Add MySQL"
   - Railway will auto-generate `MYSQL_URL` variable
4. **Configure Environment Variables**:
   ```
   DB_HOST=<from Railway MySQL>
   DB_USER=<from Railway MySQL>
   DB_PASSWORD=<from Railway MySQL>
   DB_NAME=<from Railway MySQL>
   DB_PORT=<from Railway MySQL>
   PUBLIC_BASE_URL=https://your-app.railway.app
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. **Create Database Tables**: Connect to Railway MySQL and run:
   ```sql
   CREATE TABLE estanterias (
     id INT AUTO_INCREMENT PRIMARY KEY,
     nombre VARCHAR(255) NOT NULL,
     descripcion TEXT,
     imagen_url VARCHAR(500)
   );

   CREATE TABLE productos (
     id INT AUTO_INCREMENT PRIMARY KEY,
     nombre VARCHAR(255) NOT NULL,
     descripcion TEXT,
     imagen_url VARCHAR(500),
     cantidad_stock INT DEFAULT 0,
     precio_compra DECIMAL(10,2),
     precio_venta DECIMAL(10,2) NOT NULL,
     estanteria_id INT,
     FOREIGN KEY (estanteria_id) REFERENCES estanterias(id) ON DELETE SET NULL
   );
   ```
6. **Deploy**: Railway will auto-deploy from your repo
7. **Get Backend URL**: Copy the generated Railway URL (e.g., `https://enchanted-vanity-production.up.railway.app`)

---

## 🌐 Deploy Frontend (Vercel)

1. **Create Vercel Account**: https://vercel.com
2. **Import Project** → Select your GitHub repo → Choose `frontend` folder as root
3. **Configure Build Settings**:
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Add Environment Variable**:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```
5. **Deploy**: Vercel will build and deploy automatically

---

## 📝 Post-Deployment

1. Update `frontend/.env.production` with your Railway backend URL
2. In Railway, update `FRONTEND_URL` env var with your Vercel URL
3. Test login with credentials: `admin` / `enchanted123`

---

## 🔧 Local Development

Backend:
```bash
uvicorn main:app --reload
```

Frontend:
```bash
cd frontend
npm run dev
```

Database: MySQL running on localhost:3306
