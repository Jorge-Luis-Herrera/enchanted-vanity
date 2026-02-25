"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let InventoryService = class InventoryService {
    constructor() {
        this.dbPath = process.env.NODE_ENV === 'production'
            ? '/home/data/db.json'
            : path.join(process.cwd(), 'data', 'db.json');
    }
    onModuleInit() {
        if (!fs.existsSync(path.dirname(this.dbPath))) {
            fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
        }
        this.ensureDbStructure();
    }
    ensureDbStructure() {
        let data;
        try {
            if (fs.existsSync(this.dbPath)) {
                data = JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
            }
        }
        catch (e) {
            data = {};
        }
        if (!data || typeof data !== 'object')
            data = {};
        if (!Array.isArray(data.shelves))
            data.shelves = [{ id: 1, titulo: 'Estantería Principal' }];
        if (!Array.isArray(data.categories))
            data.categories = [{ id: 1, nombre: 'General', shelfId: 1 }];
        if (!Array.isArray(data.products))
            data.products = [];
        this.saveData(data);
    }
    getData() {
        try {
            const data = JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
            return {
                shelves: Array.isArray(data.shelves) ? data.shelves : [],
                categories: Array.isArray(data.categories) ? data.categories : [],
                products: Array.isArray(data.products) ? data.products : []
            };
        }
        catch (e) {
            return { shelves: [], categories: [], products: [] };
        }
    }
    saveData(data) {
        fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
    }
    saveImage(base64Data, prefix) {
        if (!base64Data || !base64Data.startsWith('data:image'))
            return null;
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
        }
        catch (e) {
            console.error('Error saving image:', e);
            return null;
        }
    }
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
    async createShelf(titulo) {
        const data = this.getData();
        const newShelf = { id: Date.now(), titulo, categorias: [] };
        data.shelves.push(newShelf);
        this.saveData(data);
        return newShelf;
    }
    async deleteShelf(id) {
        const data = this.getData();
        data.shelves = data.shelves.filter(s => Number(s.id) !== Number(id));
        data.categories = data.categories.filter(c => Number(c.shelfId) !== Number(id));
        this.saveData(data);
    }
    async getAllCategories() {
        const data = this.getData();
        return data.categories.map(c => ({
            ...c,
            estanteria: data.shelves.find(s => Number(s.id) === Number(c.shelfId))
        }));
    }
    async createCategory(nombre, shelfId, imagenUrl) {
        const data = this.getData();
        const shelf = data.shelves.find(s => Number(s.id) === Number(shelfId));
        if (!shelf)
            throw new common_1.NotFoundException('Estantería no encontrada');
        const finalImageUrl = imagenUrl && imagenUrl.startsWith('data:')
            ? this.saveImage(imagenUrl, 'cat')
            : imagenUrl;
        const newCategory = { id: Date.now(), nombre, shelfId: Number(shelfId), imagenUrl: finalImageUrl, productos: [] };
        data.categories.push(newCategory);
        this.saveData(data);
        return newCategory;
    }
    async deleteCategory(id) {
        const data = this.getData();
        data.categories = data.categories.filter(c => Number(c.id) !== Number(id));
        this.saveData(data);
    }
    async getProductsByCategory(categoryId) {
        const data = this.getData();
        return data.products.filter(p => p.categoryIds?.map(Number).includes(Number(categoryId)));
    }
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
    async createProduct(productData) {
        const data = this.getData();
        if (productData.imagenUrl && productData.imagenUrl.startsWith('data:')) {
            productData.imagenUrl = this.saveImage(productData.imagenUrl, 'prod');
        }
        const newProduct = {
            id: Date.now(),
            nombre: productData.nombre ?? '',
            descripcion: productData.descripcion ?? '',
            esCombo: productData.esCombo ?? false,
            esOferta: productData.esOferta ?? false,
            isBestSeller: productData.isBestSeller ?? false,
            cantidad: Number(productData.cantidad) || 0,
            precio: Number(productData.precio) || 0,
            imagenUrl: productData.imagenUrl ?? null,
            categoryIds: productData.categoryIds?.map(Number) || [],
        };
        data.products.push(newProduct);
        this.saveData(data);
        return newProduct;
    }
    async updateProduct(id, updateData) {
        const data = this.getData();
        const index = data.products.findIndex(p => Number(p.id) === Number(id));
        if (index === -1)
            throw new common_1.NotFoundException('Producto no encontrado');
        if (updateData.imagenUrl && updateData.imagenUrl.startsWith('data:')) {
            updateData.imagenUrl = this.saveImage(updateData.imagenUrl, 'prod');
        }
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
    async deleteProduct(id) {
        const data = this.getData();
        data.products = data.products.filter(p => Number(p.id) !== Number(id));
        this.saveData(data);
    }
    async updateStock(id, cantidad) {
        const data = this.getData();
        const product = data.products.find(p => Number(p.id) === Number(id));
        if (!product)
            throw new common_1.NotFoundException('Producto no encontrado');
        product.cantidad = cantidad;
        this.saveData(data);
        return product;
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)()
], InventoryService);
//# sourceMappingURL=inventory.service.js.map