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
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const inventory_service_1 = require("./inventory.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const multerConfig = {
    storage: (0, multer_1.diskStorage)({
        destination: (req, file, cb) => {
            const dest = process.env.NODE_ENV === 'production'
                ? '/home/data/uploads'
                : './uploads';
            cb(null, dest);
        },
        filename: (req, file, cb) => {
            const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
            return cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
        }
    })
};
let InventoryController = class InventoryController {
    inventoryService;
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    async findAll() {
        return this.inventoryService.getInventario();
    }
    async createShelf(body) {
        return this.inventoryService.createShelf(body.titulo);
    }
    async deleteShelf(id) {
        return this.inventoryService.deleteShelf(id);
    }
    async findAllCategories() {
        return this.inventoryService.getAllCategories();
    }
    async createCategory(file, body) {
        const imagenUrl = file ? `/uploads/${file.filename}` : undefined;
        return this.inventoryService.createCategory(body.nombre, parseInt(body.shelfId), imagenUrl);
    }
    async deleteCategory(id) {
        return this.inventoryService.deleteCategory(id);
    }
    async getCategoryProducts(id) {
        return this.inventoryService.getCategoryProducts(id);
    }
    async assignProductsToCategory(id, body) {
        return this.inventoryService.assignProductsToCategory(id, body.productIds);
    }
    async findAllProducts() {
        return this.inventoryService.getAllProducts();
    }
    async findFeaturedProducts() {
        return this.inventoryService.getFeaturedProducts();
    }
    async createProduct(file, body) {
        const imagenUrl = file ? `/uploads/${file.filename}` : undefined;
        const categoryIds = body.categoryIds ? JSON.parse(body.categoryIds) : [];
        return this.inventoryService.createProduct(body.nombre, parseInt(body.cantidad), parseFloat(body.precio), categoryIds, imagenUrl, body.esCombo === 'true', body.esOferta === 'true');
    }
    async updateProduct(id, file, body) {
        const data = {};
        if (body.nombre !== undefined)
            data.nombre = body.nombre;
        if (body.cantidad !== undefined)
            data.cantidad = parseInt(body.cantidad);
        if (body.precio !== undefined)
            data.precio = parseFloat(body.precio);
        if (body.esCombo !== undefined)
            data.esCombo = body.esCombo === 'true';
        if (body.esOferta !== undefined)
            data.esOferta = body.esOferta === 'true';
        if (body.categoryIds !== undefined)
            data.categoryIds = JSON.parse(body.categoryIds);
        if (file)
            data.imagenUrl = `/uploads/${file.filename}`;
        return this.inventoryService.updateProduct(id, data);
    }
    async deleteProduct(id) {
        return this.inventoryService.deleteProduct(id);
    }
    async updateStock(id, body) {
        return this.inventoryService.updateStock(id, body.cantidad);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('shelf'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createShelf", null);
__decorate([
    (0, common_1.Delete)('shelf/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "deleteShelf", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "findAllCategories", null);
__decorate([
    (0, common_1.Post)('category'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('imagen', multerConfig)),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Delete)('category/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.Get)('category/:id/products'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getCategoryProducts", null);
__decorate([
    (0, common_1.Post)('category/:id/products'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "assignProductsToCategory", null);
__decorate([
    (0, common_1.Get)('products'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "findAllProducts", null);
__decorate([
    (0, common_1.Get)('featured'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "findFeaturedProducts", null);
__decorate([
    (0, common_1.Post)('product'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('imagen', multerConfig)),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Patch)('product/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('imagen', multerConfig)),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Delete)('product/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "deleteProduct", null);
__decorate([
    (0, common_1.Patch)('product/:id/stock'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "updateStock", null);
exports.InventoryController = InventoryController = __decorate([
    (0, common_1.Controller)('inventory'),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map