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
const fs = __importStar(require("fs"));
const path_1 = require("path");
let InventoryService = class InventoryService {
    productRepository;
    shelfRepository;
    categoryRepository;
    constructor(productRepository, shelfRepository, categoryRepository) {
        this.productRepository = productRepository;
        this.shelfRepository = shelfRepository;
        this.categoryRepository = categoryRepository;
    }
    deleteFile(fileUrl) {
        if (!fileUrl)
            return;
        const fileName = fileUrl.replace('/uploads/', '');
        const uploadsDir = process.env.NODE_ENV === 'production'
            ? '/home/data/uploads'
            : (0, path_1.join)(__dirname, '..', '..', 'uploads');
        const filePath = (0, path_1.join)(uploadsDir, fileName);
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            }
            catch (err) {
                console.error(`Error eliminando archivo: ${filePath}`, err);
            }
        }
    }
    async onModuleInit() {
        const isProd = process.env.NODE_ENV === 'production';
        console.log(`[DATABASE] Inicializando... (Modo: ${isProd ? 'PRODUCCIÓN' : 'DESARROLLO'})`);
        try {
            const count = await this.shelfRepository.count();
            console.log(`[DATABASE] Conexión exitosa. Estanterías encontradas: ${count}`);
        }
        catch (err) {
            console.error('[DATABASE] ERROR CRÍTICO de conexión a la base de datos:', err.message);
            console.error('[DATABASE] Ruta intentada:', isProd ? '/home/data/db.sqlite' : 'data/db.sqlite');
        }
    }
    async getInventario() {
        try {
            return await this.shelfRepository.find({
                relations: ['categorias', 'categorias.productos'],
            });
        }
        catch (err) {
            console.error('[DATABASE] Error obteniendo inventario:', err.message);
            throw err;
        }
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
        const category = await this.categoryRepository.findOneBy({ id });
        if (category && category.imagenUrl) {
            this.deleteFile(category.imagenUrl);
        }
        await this.categoryRepository.delete(id);
    }
    async getCategoryProducts(categoryId) {
        const category = await this.categoryRepository.findOne({
            where: { id: categoryId },
            relations: ['productos'],
        });
        if (!category)
            throw new common_1.NotFoundException('Categoría no encontrada');
        return category.productos;
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
        if (data.imagenUrl !== undefined) {
            if (product.imagenUrl && product.imagenUrl !== data.imagenUrl) {
                this.deleteFile(product.imagenUrl);
            }
            product.imagenUrl = data.imagenUrl;
        }
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
        if (product.imagenUrl) {
            this.deleteFile(product.imagenUrl);
        }
        product.categorias = [];
        await this.productRepository.save(product);
        await this.productRepository.delete(id);
    }
    async seedTestProducts() {
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
        const nuevos = [];
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