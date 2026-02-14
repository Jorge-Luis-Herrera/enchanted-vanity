"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
const shelf_entity_1 = require("./entities/shelf.entity");
const category_entity_1 = require("./entities/category.entity");
let InventoryService = class InventoryService {
    productRepository;
    shelfRepository;
    categoryRepository;
    constructor(productRepository, shelfRepository, categoryRepository) {
        this.productRepository = productRepository;
        this.shelfRepository = shelfRepository;
        this.categoryRepository = categoryRepository;
    }
    async onModuleInit() {
        const count = await this.shelfRepository.count();
        if (count === 0) {
            const s1 = await this.shelfRepository.save({ titulo: 'Maquillaje' });
            const s2 = await this.shelfRepository.save({ titulo: 'Cuidado de Piel' });
            const cat1 = await this.categoryRepository.save({ nombre: 'Labiales', estanteria: s1 });
            const cat2 = await this.categoryRepository.save({ nombre: 'Bases y Correctores', estanteria: s1 });
            const cat3 = await this.categoryRepository.save({ nombre: 'Cremas Hidratantes', estanteria: s2 });
            const p1 = this.productRepository.create({ nombre: 'Labial Rojo Intenso', cantidad: 15, precio: 12.50 });
            const p2 = this.productRepository.create({ nombre: 'Labial Nude Rose', cantidad: 20, precio: 10.00 });
            const p3 = this.productRepository.create({ nombre: 'Base Líquida Mate', cantidad: 8, precio: 25.00 });
            const p4 = this.productRepository.create({ nombre: 'Corrector de Ojeras', cantidad: 12, precio: 15.00 });
            const p5 = this.productRepository.create({ nombre: 'Crema Hidratante SPF30', cantidad: 10, precio: 30.00 });
            const p6 = this.productRepository.create({ nombre: 'Combo Labiales x3', cantidad: 5, precio: 28.00, esCombo: true });
            const p7 = this.productRepository.create({ nombre: 'Oferta Base + Corrector', cantidad: 3, precio: 35.00, esOferta: true });
            await this.productRepository.save([p1, p2, p3, p4, p5, p6, p7]);
            cat1.productos = [p1, p2, p6];
            cat2.productos = [p3, p4, p7];
            cat3.productos = [p5];
            await this.categoryRepository.save([cat1, cat2, cat3]);
            console.log('Base de datos inicializada con categorías y productos');
        }
    }
    async getInventario() {
        return this.shelfRepository.find({
            relations: ['categorias'],
        });
    }
    async createShelf(titulo) {
        const newShelf = this.shelfRepository.create({ titulo });
        return this.shelfRepository.save(newShelf);
    }
    async deleteShelf(id) {
        await this.shelfRepository.delete(id);
    }
    async getAllCategories() {
        return this.categoryRepository.find({
            relations: ['estanteria'],
        });
    }
    async createCategory(nombre, shelfId, imagenUrl) {
        const shelf = await this.shelfRepository.findOneBy({ id: shelfId });
        if (!shelf)
            throw new common_1.NotFoundException('Estantería no encontrada');
        const newCat = this.categoryRepository.create({ nombre, estanteria: shelf, imagenUrl });
        return this.categoryRepository.save(newCat);
    }
    async deleteCategory(id) {
        await this.categoryRepository.delete(id);
    }
    async getCategoryProducts(categoryId) {
        const category = await this.categoryRepository.findOne({
            where: { id: categoryId },
            relations: ['productos'],
        });
        if (!category)
            throw new common_1.NotFoundException('Categoría no encontrada');
        return category.productos.filter(p => !p.esCombo && !p.esOferta);
    }
    async assignProductsToCategory(categoryId, productIds) {
        const category = await this.categoryRepository.findOne({
            where: { id: categoryId },
            relations: ['productos'],
        });
        if (!category)
            throw new common_1.NotFoundException('Categoría no encontrada');
        const products = await this.productRepository.findBy({ id: (0, typeorm_2.In)(productIds) });
        category.productos = products;
        return this.categoryRepository.save(category);
    }
    async getAllProducts() {
        return this.productRepository.find({
            relations: ['categorias']
        });
    }
    async getFeaturedProducts() {
        return this.productRepository.find({
            where: [
                { esCombo: true },
                { esOferta: true }
            ]
        });
    }
    async createProduct(nombre, cantidad, precio, categoryIds, imagenUrl, esCombo, esOferta) {
        const categories = categoryIds.length > 0
            ? await this.categoryRepository.findBy({ id: (0, typeorm_2.In)(categoryIds) })
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
    async updateProduct(id, data) {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['categorias'],
        });
        if (!product)
            throw new common_1.NotFoundException('Producto no encontrado');
        if (data.nombre !== undefined)
            product.nombre = data.nombre;
        if (data.cantidad !== undefined)
            product.cantidad = data.cantidad;
        if (data.precio !== undefined)
            product.precio = data.precio;
        if (data.imagenUrl !== undefined)
            product.imagenUrl = data.imagenUrl;
        if (data.esCombo !== undefined)
            product.esCombo = data.esCombo;
        if (data.esOferta !== undefined)
            product.esOferta = data.esOferta;
        if (data.categoryIds !== undefined) {
            product.categorias = data.categoryIds.length > 0
                ? await this.categoryRepository.findBy({ id: (0, typeorm_2.In)(data.categoryIds) })
                : [];
        }
        return this.productRepository.save(product);
    }
    async deleteProduct(id) {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['categorias'],
        });
        if (!product)
            throw new common_1.NotFoundException('Producto no encontrado');
        product.categorias = [];
        await this.productRepository.save(product);
        await this.productRepository.delete(id);
    }
    async updateStock(id, cantidad) {
        const product = await this.productRepository.findOneBy({ id });
        if (!product)
            throw new common_1.NotFoundException('Producto no encontrado');
        product.cantidad = cantidad;
        return this.productRepository.save(product);
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(shelf_entity_1.Shelf)),
    __param(2, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map