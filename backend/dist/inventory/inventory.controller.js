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
let InventoryController = class InventoryController {
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    healthCheck() {
        return { status: 'ok', environment: process.env.NODE_ENV || 'development' };
    }
    findAll() {
        return this.inventoryService.getInventario();
    }
    createShelf(body) {
        return this.inventoryService.createShelf(body.titulo);
    }
    deleteShelf(id) {
        return this.inventoryService.deleteShelf(id);
    }
    findAllCategories() {
        return this.inventoryService.getAllCategories();
    }
    createCategory(body) {
        return this.inventoryService.createCategory(body.nombre, body.shelfId, body.imagenUrl);
    }
    deleteCategory(id) {
        return this.inventoryService.deleteCategory(id);
    }
    updateCategory(id, body) {
        return this.inventoryService.updateCategory(id, body);
    }
    moveCategory(id, body) {
        return this.inventoryService.moveCategory(id, body.direction);
    }
    findProductsByCategory(id) {
        return this.inventoryService.getProductsByCategory(id);
    }
    findAllProducts() {
        return this.inventoryService.getAllProducts();
    }
    findFeaturedProducts() {
        return this.inventoryService.getFeaturedProducts();
    }
    createProduct(body) {
        return this.inventoryService.createProduct(body);
    }
    updateProduct(id, body) {
        return this.inventoryService.updateProduct(id, body);
    }
    deleteProduct(id) {
        return this.inventoryService.deleteProduct(id);
    }
    updateStock(id, body) {
        return this.inventoryService.updateStock(id, body.cantidad);
    }
    moveProduct(id, body) {
        return this.inventoryService.moveProduct(id, body.direction);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('shelf'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "createShelf", null);
__decorate([
    (0, common_1.Delete)('shelf/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "deleteShelf", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "findAllCategories", null);
__decorate([
    (0, common_1.Post)('category'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Delete)('category/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.Patch)('category/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Patch)('category/:id/order'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "moveCategory", null);
__decorate([
    (0, common_1.Get)('category/:id/products'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "findProductsByCategory", null);
__decorate([
    (0, common_1.Get)('products'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "findAllProducts", null);
__decorate([
    (0, common_1.Get)('featured'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "findFeaturedProducts", null);
__decorate([
    (0, common_1.Post)('product'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Patch)('product/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Delete)('product/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "deleteProduct", null);
__decorate([
    (0, common_1.Patch)('product/:id/stock'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "updateStock", null);
__decorate([
    (0, common_1.Patch)('product/:id/order'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "moveProduct", null);
exports.InventoryController = InventoryController = __decorate([
    (0, common_1.Controller)('inventory'),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map