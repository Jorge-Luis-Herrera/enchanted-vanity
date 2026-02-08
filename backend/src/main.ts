import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  
  // Prefijo global para que no choque con el frontend
  app.setGlobalPrefix('api');

  // Servir archivos estáticos desde la carpeta 'uploads'
  // En Azure usamos /home/data/uploads para persistencia
  const uploadsPath = process.env.NODE_ENV === 'production' 
    ? '/home/data/uploads' 
    : join(__dirname, '..', 'uploads');
    
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });

  // Azure usa process.env.PORT
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Servidor corriendo en el puerto: ${port}`);
}
bootstrap();