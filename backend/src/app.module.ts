import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [
    // Servir el frontend compilado
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      exclude: ['/api/(.*)'],
      serveStaticOptions: {
        cacheControl: true,
      },
    }),
    // Configuración de la base de datos
    TypeOrmModule.forRoot({
      type: 'sqlite',
      // En Azure/Producción usamos una carpeta persistente fuera del código volátil
      database: process.env.NODE_ENV === 'production' 
        ? '/home/data/db.sqlite' 
        : 'db.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Cambiar a false en producciones reales
    }),
    InventoryModule,
  ],
})
export class AppModule {}