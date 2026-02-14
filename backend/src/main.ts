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
  
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }

  if (process.env.NODE_ENV === 'production') {
    const dbPath = '/home/data';
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
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
  
  try {
    await app.listen(port);
    console.log(`Servidor corriendo en el puerto: ${port}`);
  } catch (err) {
    if (err.code === 'EADDRINUSE') {
      console.error(`Error: El puerto ${port} ya está en uso. Intenta cerrarlo o usar otro puerto.`);
      process.exit(1);
    } else {
      console.error('Error al iniciar el servidor:', err);
      process.exit(1);
    }
  }
}
bootstrap();