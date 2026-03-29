import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Patch,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) { }

  @Get('health')
  healthCheck() {
    return { status: 'ok', environment: process.env.NODE_ENV || 'development' };
  }

  @Get()
  findAll() {
    return this.inventoryService.getInventario();
  }

  @Post('shelf')
  createShelf(@Body() body: { titulo: string }) {
    return this.inventoryService.createShelf(body.titulo);
  }

  @Delete('shelf/:id')
  deleteShelf(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.deleteShelf(id);
  }

  @Get('categories')
  findAllCategories() {
    return this.inventoryService.getAllCategories();
  }

  @Post('category')
  createCategory(@Body() body: any) {
    return this.inventoryService.createCategory(
      body.nombre,
      body.shelfId,
      body.imagenUrl,
    );
  }

  @Delete('category/:id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.deleteCategory(id);
  }

  @Patch('category/:id')
  updateCategory(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.inventoryService.updateCategory(id, body);
  }

  @Patch('category/:id/order')
  moveCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { direction: 'up' | 'down' },
  ) {
    return this.inventoryService.moveCategory(id, body.direction);
  }

  @Get('category/:id/products')
  findProductsByCategory(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.getProductsByCategory(id);
  }

  @Get('products')
  findAllProducts() {
    return this.inventoryService.getAllProducts();
  }

  @Get('featured')
  findFeaturedProducts() {
    return this.inventoryService.getFeaturedProducts();
  }

  @Post('product')
  createProduct(@Body() body: any) {
    return this.inventoryService.createProduct(body);
  }

  @Patch('product/:id')
  updateProduct(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.inventoryService.updateProduct(id, body);
  }

  @Delete('product/:id')
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.deleteProduct(id);
  }

  @Patch('product/:id/stock')
  updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { cantidad: number },
  ) {
    return this.inventoryService.updateStock(id, body.cantidad);
  }

  @Patch('product/:id/order')
  moveProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { direction: 'up' | 'down' },
  ) {
    return this.inventoryService.moveProduct(id, body.direction);
  }
}
