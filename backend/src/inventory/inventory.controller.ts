import { Controller, Get, Post, Body, Delete, Param, UseInterceptors, UploadedFile, Patch, ParseIntPipe, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Shelf } from './entities/shelf.entity';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

// Helper para la configuración de Multer
const multerConfig = {
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
};

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) { }

  // ─── Diagnóstico ───
  @Get('health')
  async healthCheck() {
    const result: any = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'not set',
      nodeVersion: process.version,
      port: process.env.PORT || '3000 (default)',
    };

    try {
      const shelves = await this.inventoryService.getInventario();
      result.database = 'connected';
      result.shelfCount = shelves.length;
    } catch (err) {
      result.status = 'error';
      result.database = 'failed';
      result.dbError = err.message;
      result.dbErrorStack = err.stack?.split('\n').slice(0, 5);
    }

    return result;
  }

  // ─── Estanterías ───
  @Get()
  async findAll(): Promise<Shelf[]> {
    return this.inventoryService.getInventario();
  }

  @Post('shelf')
  @UseGuards(JwtAuthGuard)
  async createShelf(@Body() body: { titulo: string }): Promise<Shelf> {
    return this.inventoryService.createShelf(body.titulo);
  }

  @Delete('shelf/:id')
  @UseGuards(JwtAuthGuard)
  async deleteShelf(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.inventoryService.deleteShelf(id);
  }

  // ─── Categorías ───
  @Get('categories')
  async findAllCategories(): Promise<Category[]> {
    return this.inventoryService.getAllCategories();
  }

  @Post('category')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('imagen', multerConfig))
  async createCategory(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { nombre: string; shelfId: string }
  ): Promise<Category> {
    const imagenUrl = file ? `/uploads/${file.filename}` : undefined;
    return this.inventoryService.createCategory(
      body.nombre,
      parseInt(body.shelfId),
      imagenUrl
    );
  }

  @Delete('category/:id')
  @UseGuards(JwtAuthGuard)
  async deleteCategory(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.inventoryService.deleteCategory(id);
  }

  @Get('category/:id/products')
  async getCategoryProducts(@Param('id', ParseIntPipe) id: number): Promise<Product[]> {
    return this.inventoryService.getCategoryProducts(id);
  }

  @Post('category/:id/products')
  @UseGuards(JwtAuthGuard)
  async assignProductsToCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { productIds: number[] }
  ): Promise<Category> {
    return this.inventoryService.assignProductsToCategory(id, body.productIds);
  }

  // ─── Productos ───
  @Get('products')
  async findAllProducts(): Promise<Product[]> {
    return this.inventoryService.getAllProducts();
  }

  @Get('featured')
  async findFeaturedProducts(): Promise<Product[]> {
    return this.inventoryService.getFeaturedProducts();
  }

  @Post('seed-test-products')
  async seedTestProducts(): Promise<Product[]> {
    return this.inventoryService.seedTestProducts();
  }

  @Post('product')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('imagen', multerConfig))
  async createProduct(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateProductDto
  ): Promise<Product> {
    const imagenUrl = file ? `/uploads/${file.filename}` : undefined;

    const categoryIds = typeof body.categoryIds === 'string'
      ? JSON.parse(body.categoryIds)
      : (body.categoryIds || []);

    return this.inventoryService.createProduct(
      body.nombre,
      body.cantidad,
      body.precio,
      categoryIds,
      imagenUrl,
      body.esCombo,
      body.esOferta,
    );
  }

  @Patch('product/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('imagen', multerConfig))
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateProductDto
  ): Promise<Product> {
    const data: any = { ...body };
    if (typeof body.categoryIds === 'string') data.categoryIds = JSON.parse(body.categoryIds);
    if (file) data.imagenUrl = `/uploads/${file.filename}`;

    return this.inventoryService.updateProduct(id, data);
  }

  @Delete('product/:id')
  @UseGuards(JwtAuthGuard)
  async deleteProduct(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.inventoryService.deleteProduct(id);
  }

  @Patch('product/:id/stock')
  @UseGuards(JwtAuthGuard)
  async updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { cantidad: number }
  ): Promise<Product> {
    return this.inventoryService.updateStock(id, body.cantidad);
  }
}
