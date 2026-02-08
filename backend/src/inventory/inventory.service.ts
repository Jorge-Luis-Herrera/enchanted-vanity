import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "./entities/product.entity";
import { Shelf } from "./entities/shelf.entity";

@Injectable()
export class InventoryService implements OnModuleInit {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Shelf)
    private shelfRepository: Repository<Shelf>,
  ) {}

  // Semilla de datos inicial si la base de datos está vacía
  async onModuleInit() {
    const count = await this.shelfRepository.count();
    if (count === 0) {
      const s1 = await this.shelfRepository.save({ id: 's1', titulo: 'Esencias Primordiales' });
      const s2 = await this.shelfRepository.save({ id: 's2', titulo: 'Artefactos Raros' });

      await this.productRepository.save([
        { nombre: 'Vial de Éter', cantidad: 15, precio: 50, estanteria: s1 },
        { nombre: 'Polvo de Estrellas', cantidad: 8, precio: 120, estanteria: s1 },
        { nombre: 'Agua Bendita', cantidad: 20, precio: 30, estanteria: s1 },
        { nombre: 'Espejo del Destino', cantidad: 1, precio: 2500, estanteria: s2 },
      ]);
      console.log('Base de datos inicializada con Magia');
    }
  }

  async getInventario(): Promise<Shelf[]> {
    return this.shelfRepository.find({
      relations: ['productos'],
    });
  }

  async getAllProducts(): Promise<Product[]> {
    return this.productRepository.find({
      relations: ['estanteria']
    });
  }

  async createShelf(id: string, titulo: string): Promise<Shelf> {
    const newShelf = this.shelfRepository.create({ id, titulo });
    return this.shelfRepository.save(newShelf);
  }

  async createProduct(nombre: string, cantidad: number, precio: number, shelfId: string, imagenUrl?: string): Promise<Product> {
    const shelf = await this.shelfRepository.findOneBy({ id: shelfId });
    if (!shelf) throw new Error('Estantería no encontrada');
    
    const newProduct = this.productRepository.create({ 
      nombre, 
      cantidad, 
      precio, 
      estanteria: shelf,
      imagenUrl 
    });
    return this.productRepository.save(newProduct);
  }

  async deleteShelf(id: string): Promise<void> {
    // Eliminación manual de productos para asegurar compatibilidad total con SQLite
    const shelf = await this.shelfRepository.findOne({
      where: { id },
      relations: ['productos']
    });
    
    if (shelf && shelf.productos.length > 0) {
      await this.productRepository.remove(shelf.productos);
    }
    
    await this.shelfRepository.delete(id);
  }

  async deleteProduct(id: number): Promise<void> {
    await this.productRepository.delete(id);
  }

  async updateStock(id: number, cantidad: number): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) throw new Error('Producto no encontrado');
    
    product.cantidad = cantidad;
    return this.productRepository.save(product);
  }
}
