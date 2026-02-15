import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Aumentar el límite para Base64
  const bodyLimit = '5mb';
  const express = require('express');
  app.use(express.json({ limit: bodyLimit }));
  app.use(express.urlencoded({ limit: bodyLimit, extended: true }));

  // Configuración de carpetas necesarias
  const uploadsPath =
    process.env.NODE_ENV === 'production'
      ? '/home/data/uploads'
      : join(process.cwd(), 'uploads');

  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }

  // Middleware y Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();
  app.setGlobalPrefix('api');

  // Archivos estáticos
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });

  const port = process.env.PORT || 3000;

  try {
    await app.listen(port);
    console.log(`🚀 Servidor minimalista listo en puerto: ${port}`);
  } catch (err) {
    console.error('❌ Error fatal al arrancar:', err);
    process.exit(1);
  }
}
bootstrap();
