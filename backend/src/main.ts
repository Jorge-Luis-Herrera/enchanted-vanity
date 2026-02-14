import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Asegurar que las carpetas existen ANTES de arrancar NestJS
  const isProd = process.env.NODE_ENV === 'production';
  const uploadsPath = isProd ? '/home/data/uploads' : join(__dirname, '..', 'uploads');
  const dataPath = isProd ? '/home/data' : join(__dirname, '..', 'data');

  const ensureDir = (path: string) => {
    try {
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
        console.log(`[STARTUP] Carpeta creada exitosamente: ${path}`);
      } else {
        console.log(`[STARTUP] Carpeta ya existe: ${path}`);
      }
    } catch (err) {
      console.error(`[STARTUP] ERROR crítico creando carpeta ${path}:`, err.message);
    }
  };

  ensureDir(dataPath);
  ensureDir(uploadsPath);

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors();

  // Prefijo global para que no choque con el frontend
  app.setGlobalPrefix('api');

  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });

  // Azure usa process.env.PORT
  const port = process.env.PORT || 3000;

  try {
    await app.listen(port);
    console.log(`[STARTUP] Servidor corriendo exitosamente en el puerto: ${port}`);
    console.log(`[STARTUP] Modo: ${isProd ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
    console.log(`[STARTUP] Base de datos: ${isProd ? '/home/data/db.sqlite' : 'data/db.sqlite'}`);
  } catch (err) {
    if (err.code === 'EADDRINUSE') {
      console.error(`[STARTUP] ERROR FATAL: El puerto ${port} ya está en uso.`);
    } else {
      console.error(`[STARTUP] ERROR FATAL al iniciar el servidor:`, err.message);
    }
    process.exit(1);
  }
}
bootstrap();