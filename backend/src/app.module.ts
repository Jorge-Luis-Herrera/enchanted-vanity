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
      rootPath: join(__dirname, '..', 'client'),
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
      // SQLite + proyecto en desarrollo: synchronize siempre crea/alinea las tablas
      synchronize: true,
      logging: process.env.NODE_ENV !== 'production' || process.env.DB_LOGGING === 'true',
    }),
    AuthModule,
    InventoryModule,
  ],
})
export class AppModule { }