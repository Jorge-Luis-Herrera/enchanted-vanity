import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InventoryService implements OnModuleInit {
  private readonly dbPath = process.env.NODE_ENV === 'production'
    ? '/home/data/db.json'
    : path.join(process.cwd(), 'data', 'db.json');

  onModuleInit() {
    if (!fs.existsSync(path.dirname(this.dbPath))) {
      fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
    }
    this.ensureDbStructure();
  }

  private ensureDbStructure() {
    let data;
    try {
      if (fs.existsSync(this.dbPath)) {
        data = JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
      }
    } catch (e) {
      data = {};
    }

    if (!data || typeof data !== 'object') data = {};
    if (!Array.isArray(data.shelves)) data.shelves = [{ id: 1, titulo: 'Estantería Principal' }];
    if (!Array.isArray(data.categories)) data.categories = [{ id: 1, nombre: 'General', shelfId: 1 }];
    if (!Array.isArray(data.products)) data.products = [];

    this.saveData(data);
  }

  private getData() {
    try {
      const data = JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
      return {
        shelves: Array.isArray(data.shelves) ? data.shelves : [],
        categories: Array.isArray(data.categories) ? data.categories : [],
        products: Array.isArray(data.products) ? data.products : []
      };
    } catch (e) {
      return { shelves: [], categories: [], products: [] };
    }
  }

  private saveData(data: any) {
    fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
  }

  private saveImage(base64Data: string, prefix: string): string | null {
    if (!base64Data || !base64Data.startsWith('data:image')) return null;

    try {
      const extension = base64Data.split(';')[0].split('/')[1];
      const base64Image = base64Data.split(';base64,').pop();
      const fileName = `${prefix}-${Date.now()}.${extension}`;
      const uploadsPath = process.env.NODE_ENV === 'production' ? '/home/data/uploads' : path.join(process.cwd(), 'uploads');

      if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath, { recursive: true });
      }

      fs.writeFileSync(path.join(uploadsPath, fileName), base64Image, { encoding: 'base64' });
      return fileName;
    } catch (e) {
      console.error('Error saving image:', e);
      return null;
    }
  }

  // Estanterías
  async getInventario() {
    const data = this.getData();
    return data.shelves.map(shelf => ({
      ...shelf,
      categorias: data.categories
        .filter(c => Number(c.shelfId) === Number(shelf.id))
        .map(cat => ({
          ...cat,
          productos: data.products.filter(p => p.categoryIds?.map(Number).includes(Number(cat.id)))
        }))
    }));
  }

  async createShelf(titulo: string) {
    const data = this.getData();
    const newShelf = { id: Date.now(), titulo, categorias: [] };
    data.shelves.push(newShelf);
    this.saveData(data);
    return newShelf;
  }

  async deleteShelf(id: number) {
    const data = this.getData();
    // Use Number() to ensure type safety
    data.shelves = data.shelves.filter(s => Number(s.id) !== Number(id));
    // Cascade delete categories
    data.categories = data.categories.filter(c => Number(c.shelfId) !== Number(id));
    this.saveData(data);
  }

  // Categorías
  async getAllCategories() {
    const data = this.getData();
    return data.categories.map(c => ({
      ...c,
      estanteria: data.shelves.find(s => Number(s.id) === Number(c.shelfId))
    }));
  }

  async createCategory(nombre: string, shelfId: number, imagenUrl?: string) {
    const data = this.getData();
    const shelf = data.shelves.find(s => Number(s.id) === Number(shelfId));
    if (!shelf) throw new NotFoundException('Estantería no encontrada');

    const finalImageUrl = imagenUrl && imagenUrl.startsWith('data:')
      ? this.saveImage(imagenUrl, 'cat')
      : imagenUrl;

    const newCategory = { id: Date.now(), nombre, shelfId: Number(shelfId), imagenUrl: finalImageUrl, productos: [] };
    data.categories.push(newCategory);
    this.saveData(data);
    return newCategory;
  }

  async deleteCategory(id: number) {
    const data = this.getData();
    // Use Number() to ensure type safety
    data.categories = data.categories.filter(c => Number(c.id) !== Number(id));
    this.saveData(data);
  }

  async getProductsByCategory(categoryId: number) {
    const data = this.getData();
    return data.products.filter(p => p.categoryIds?.map(Number).includes(Number(categoryId)));
  }

  // Productos
  async getAllProducts() {
    const data = this.getData();
    return data.products.map(p => ({
      ...p,
      categorias: data.categories.filter(c => p.categoryIds?.map(Number).includes(Number(c.id)))
    }));
  }

  async getFeaturedProducts() {
    const data = this.getData();
    return data.products.filter(p => p.esCombo || p.esOferta || p.isBestSeller);
  }

  async createProduct(productData: any) {
    const data = this.getData();

    // Handle image upload if provided as base64
    if (productData.imagenUrl && productData.imagenUrl.startsWith('data:')) {
      productData.imagenUrl = this.saveImage(productData.imagenUrl, 'prod');
    }

    // Ensure required fields have sensible defaults
    const newProduct = {
      id: Date.now(),
      nombre: productData.nombre ?? '',
      descripcion: productData.descripcion ?? '', // New description field
      esCombo: productData.esCombo ?? false,
      esOferta: productData.esOferta ?? false,
      isBestSeller: productData.isBestSeller ?? false, // New best seller flag
      cantidad: Number(productData.cantidad) || 0,
      precio: Number(productData.precio) || 0,
      imagenUrl: productData.imagenUrl ?? null,
      categoryIds: productData.categoryIds?.map(Number) || [],
    };
    data.products.push(newProduct);
    this.saveData(data);
    return newProduct;
  }

  async updateProduct(id: number, updateData: any) {
    const data = this.getData();
    const index = data.products.findIndex(p => Number(p.id) === Number(id));
    if (index === -1) throw new NotFoundException('Producto no encontrado');

    // Handle image upload if provided as base64
    if (updateData.imagenUrl && updateData.imagenUrl.startsWith('data:')) {
      updateData.imagenUrl = this.saveImage(updateData.imagenUrl, 'prod');
    }

    // Merge updates, preserving existing fields and applying defaults where needed
    const existing = data.products[index];
    const updatedProduct = {
      ...existing,
      ...updateData,
      descripcion: updateData.descripcion ?? existing.descripcion,
      isBestSeller: updateData.isBestSeller ?? existing.isBestSeller,
      esCombo: updateData.esCombo ?? existing.esCombo,
      esOferta: updateData.esOferta ?? existing.esOferta,
      cantidad: updateData.cantidad !== undefined ? Number(updateData.cantidad) : existing.cantidad,
      precio: updateData.precio !== undefined ? Number(updateData.precio) : existing.precio,
      categoryIds: updateData.categoryIds ? updateData.categoryIds.map(Number) : existing.categoryIds,
      id: existing.id,
    };
    data.products[index] = updatedProduct;
    this.saveData(data);
    return updatedProduct;
  }

  async deleteProduct(id: number) {
    const data = this.getData();
    data.products = data.products.filter(p => Number(p.id) !== Number(id));
    this.saveData(data);
  }

  async updateStock(id: number, cantidad: number) {
    const data = this.getData();
    const product = data.products.find(p => Number(p.id) === Number(id));
    if (!product) throw new NotFoundException('Producto no encontrado');
    product.cantidad = cantidad;
    this.saveData(data);
    return product;
  }
}
