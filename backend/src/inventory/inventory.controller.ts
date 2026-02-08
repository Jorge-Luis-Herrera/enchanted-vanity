import { Controller, Get, Post, Body, Delete, Param, UseInterceptors, UploadedFile, Patch } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { Shelf } from './entities/shelf.entity';
import { Product } from './entities/product.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('products')
  async findAllProducts(): Promise<Product[]> {
    return this.inventoryService.getAllProducts();
  }

  @Get()
  async findAll(): Promise<Shelf[]> {
    return this.inventoryService.getInventario();
  }

  @Post('shelf')
  async createShelf(@Body() body: { id: string; titulo: string }): Promise<Shelf> {
    return this.inventoryService.createShelf(body.id, body.titulo);
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('imagen', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dest = process.env.NODE_ENV === 'production' 
          ? '/home/data/uploads' 
          : './uploads';
        cb(null, dest);
      },
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  async createProduct(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { nombre: string; cantidad: string; precio: string; shelfId: string }
  ): Promise<Product> {
    const imagenUrl = file ? `/uploads/${file.filename}` : undefined;
    return this.inventoryService.createProduct(
      body.nombre, 
      parseInt(body.cantidad), 
      parseFloat(body.precio), 
      body.shelfId,
      imagenUrl
    );
  }

  @Delete('shelf/:id')
  async deleteShelf(@Param('id') id: string): Promise<void> {
    return this.inventoryService.deleteShelf(id);
  }

  @Delete('product/:id')
  async deleteProduct(@Param('id') id: number): Promise<void> {
    return this.inventoryService.deleteProduct(id);
  }

  @Patch('product/:id/stock')
  async updateStock(
    @Param('id') id: number,
    @Body() body: { cantidad: number }
  ): Promise<Product> {
    return this.inventoryService.updateStock(id, body.cantidad);
  }
}