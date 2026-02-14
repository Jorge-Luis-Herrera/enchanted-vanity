import { Injectable, OnModuleInit, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Product } from "./entities/product.entity";
import { Shelf } from "./entities/shelf.entity";
import { Category } from "./entities/category.entity";
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class InventoryService implements OnModuleInit {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Shelf)
    private shelfRepository: Repository<Shelf>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  // Helper para borrar archivos físicos
  private deleteFile(fileUrl: string) {
    if (!fileUrl) return;
    
    // Convertir URL (/uploads/file.ext) a ruta física
    const fileName = fileUrl.replace('/uploads/', '');
    const uploadsDir = process.env.NODE_ENV === 'production' 
      ? '/home/data/uploads' 
      : join(__dirname, '..', '..', 'uploads');
    
    const filePath = join(uploadsDir, fileName);
    
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`Error eliminando archivo: ${filePath}`, err);
      }
    }
  }

  // ─── Seed de datos inicial ───
  async onModuleInit() {
    /*
    const count = await this.shelfRepository.count();
    if (count === 0) {
      // ... (Rest of seed logic)
    }
    */
  }

  // ─── Estanterías ───
  async getInventario(): Promise<Shelf[]> {
    return this.shelfRepository.find({
      relations: ['categorias', 'categorias.productos'],
    });
  }

  async createShelf(titulo: string): Promise<Shelf> {
    const newShelf = this.shelfRepository.create({ titulo });
    return this.shelfRepository.save(newShelf);
  }

  async deleteShelf(id: number): Promise<void> {
    // Las categorías se borran en cascada por la BD
    await this.shelfRepository.delete(id);
  }

  // ─── Categorías ───
  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      relations: ['estanteria'],
    });
  }

  async createCategory(nombre: string, shelfId: number, imagenUrl?: string): Promise<Category> {
    const shelf = await this.shelfRepository.findOneBy({ id: shelfId });
    if (!shelf) throw new NotFoundException('Estantería no encontrada');
    
    const newCat = this.categoryRepository.create({ nombre, estanteria: shelf, imagenUrl });
    return this.categoryRepository.save(newCat);
  }

  async deleteCategory(id: number): Promise<void> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (category && category.imagenUrl) {
      this.deleteFile(category.imagenUrl);
    }
    await this.categoryRepository.delete(id);
  }

  async getCategoryProducts(categoryId: number): Promise<Product[]> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
      relations: ['productos'],
    });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    
    // Devolvemos todos los productos de la categoría, incluyendo combos y ofertas
    return category.productos;
  }

  async assignProductsToCategory(categoryId: number, productIds: number[]): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
      relations: ['productos'],
    });
    if (!category) throw new NotFoundException('Categoría no encontrada');

    const products = await this.productRepository.findBy({ id: In(productIds) });
    category.productos = products;
    return this.categoryRepository.save(category);
  }

  // ─── Productos ───
  async getAllProducts(): Promise<Product[]> {
    return this.productRepository.find({
      relations: ['categorias']
    });
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return this.productRepository.find({
      where: [
        { esCombo: true },
        { esOferta: true }
      ]
    });
  }

  async createProduct(
    nombre: string, 
    cantidad: number, 
    precio: number, 
    categoryIds: number[],
    imagenUrl?: string, 
    esCombo?: boolean, 
    esOferta?: boolean
  ): Promise<Product> {
    const categories = categoryIds.length > 0 
      ? await this.categoryRepository.findBy({ id: In(categoryIds) })
      : [];

    const newProduct = this.productRepository.create({ 
      nombre, 
      cantidad, 
      precio, 
      imagenUrl,
      esCombo: esCombo || false,
      esOferta: esOferta || false,
      categorias: categories,
    });
    return this.productRepository.save(newProduct);
  }

  async updateProduct(
    id: number,
    data: {
      nombre?: string;
      cantidad?: number;
      precio?: number;
      imagenUrl?: string;
      esCombo?: boolean;
      esOferta?: boolean;
      categoryIds?: number[];
    }
  ): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['categorias'],
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    if (data.nombre !== undefined) product.nombre = data.nombre;
    if (data.cantidad !== undefined) product.cantidad = data.cantidad;
    if (data.precio !== undefined) product.precio = data.precio;
    
    if (data.imagenUrl !== undefined) {
      // Si ya tenía imagen y es distinta, borrar la vieja
      if (product.imagenUrl && product.imagenUrl !== data.imagenUrl) {
        this.deleteFile(product.imagenUrl);
      }
      product.imagenUrl = data.imagenUrl;
    }

    if (data.esCombo !== undefined) product.esCombo = data.esCombo;
    if (data.esOferta !== undefined) product.esOferta = data.esOferta;

    if (data.categoryIds !== undefined) {
      product.categorias = data.categoryIds.length > 0 
        ? await this.categoryRepository.findBy({ id: In(data.categoryIds) })
        : [];
    }

    return this.productRepository.save(product);
  }

  async deleteProduct(id: number): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['categorias'],
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    if (product.imagenUrl) {
      this.deleteFile(product.imagenUrl);
    }

    // Limpiar relación ManyToMany antes de borrar
    product.categorias = [];
    await this.productRepository.save(product);
    await this.productRepository.delete(id);
  }

  async seedTestProducts(): Promise<Product[]> {
    let categorias = await this.categoryRepository.find({ relations: ['estanteria'] });

    if (categorias.length === 0) {
      const shelf = await this.shelfRepository.save({ titulo: 'Pruebas' });
      const demoCat = await this.categoryRepository.save({ nombre: 'Demostración', estanteria: shelf });
      categorias = [demoCat];
    }

    const nombres = [
      'Brillo Aurora',
      'Serum Nocturno',
      'Labial Velvet',
      'Delineador Prisma',
      'Rubor Holográfico',
      'Iluminador Boreal',
      'Base Seda',
      'Máscara Volumen',
      'Tónico Floral',
      'Aceite Lumi'
    ];

    const imagenes = [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800',
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800',
      'https://images.unsplash.com/photo-1526045478516-99145907023c?w=800',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=700',
      'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=800',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600',
      'https://images.unsplash.com/photo-1526045431048-0c1df022bdd7?w=800',
      'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=700',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500',
      'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=600'
    ];

    const nuevos: Product[] = [];

    for (let i = 0; i < 10; i++) {
      const categoria = categorias[Math.floor(Math.random() * categorias.length)];
      const esCombo = i % 3 === 0;
      const esOferta = i % 3 === 1;

      const producto = this.productRepository.create({
        nombre: `${nombres[i % nombres.length]} #${i + 1}`,
        cantidad: Math.floor(Math.random() * 15) + 5,
        precio: parseFloat((Math.random() * 80 + 10).toFixed(2)),
        imagenUrl: imagenes[i % imagenes.length],
        esCombo,
        esOferta,
        categorias: [categoria],
      });

      nuevos.push(producto);
    }

    return this.productRepository.save(nuevos);
  }

  async updateStock(id: number, cantidad: number): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) throw new NotFoundException('Producto no encontrado');
    
    product.cantidad = cantidad;
    return this.productRepository.save(product);
  }
}
2