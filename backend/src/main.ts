import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Asegurar que las carpetas existen ANTES de arrancar NestJS
  const uploadsPath = process.env.NODE_ENV === 'production' 
    ? '/home/data/uploads' 
    : join(__dirname, '..', 'uploads');
  
  try {
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
      console.log(`Carpeta de uploads creada: ${uploadsPath}`);
    }
  } catch (err) {
    console.error(`Error creando carpeta de uploads ${uploadsPath}:`, err.message);
  }

  if (process.env.NODE_ENV === 'production') {
    const dbPath = '/home/data';
    try {
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
        console.log(`Carpeta creada: ${dbPath}`);
      }
    } catch (err) {
      console.error(`Error creando carpeta ${dbPath}:`, err.message);
    }
  } else {
    const devDataPath = join(__dirname, '..', 'data');
    if (!fs.existsSync(devDataPath)) {
      fs.mkdirSync(devDataPath, { recursive: true });
    }
  }

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
  await app.listen(port);
  console.log(`Servidor corriendo en el puerto: ${port}`);
}
bootstrap();