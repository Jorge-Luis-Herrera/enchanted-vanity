import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { InventoryModule } from './inventory/inventory.module';
import { AuthModule } from './auth/auth.module';

const backendRoot = join(__dirname, '..');
const devDbPath = join(backendRoot, 'data', 'db.sqlite');

@Module({
  imports: [
    // Servir el frontend compilado
    ServeStaticModule.forRoot({
      rootPath: process.env.NODE_ENV === 'production'
        ? join(__dirname, '..', 'client')  // Azure (segun el workflow)
        : join(__dirname, '..', '..', 'dist'), // Local
      exclude: ['/api{/*path}'],
      serveStaticOptions: {
        cacheControl: true,
      },
    }),
    // Configuración de la base de datos
    TypeOrmModule.forRoot({
      type: 'sqlite',
      // En Azure/Producción usamos carpeta persistente montada; en dev, ruta fija
      database: process.env.NODE_ENV === 'production' 
        ? '/home/data/db.sqlite' 
        : devDbPath,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production', // Desactivar en producción para evitar pérdida de datos
    }),
    AuthModule,
    InventoryModule,
  ],
})
export class AppModule {}