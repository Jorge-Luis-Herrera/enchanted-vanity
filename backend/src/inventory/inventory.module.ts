import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { Product } from './entities/product.entity';
import { Shelf } from './entities/shelf.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Shelf])], 
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService], 
})
export class InventoryModule {}