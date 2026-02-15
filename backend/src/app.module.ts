import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { InventoryModule } from './inventory/inventory.module';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Frontend estático
    ServeStaticModule.forRoot({
      rootPath:
        process.env.NODE_ENV === 'production'
          ? join(__dirname, '..', 'client')
          : join(__dirname, '..', '..', 'dist'),
      exclude: ['/api/:path*', '/uploads/:path*'],
    }),
    AuthModule,
    InventoryModule,
  ],
})
export class AppModule { }
