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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const typeorm_1 = require("typeorm");
const shelf_entity_1 = require("./shelf.entity");
const product_entity_1 = require("./product.entity");
let Category = class Category {
    id;
    nombre;
    imagenUrl;
    estanteria;
    productos;
};
exports.Category = Category;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Category.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Category.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Category.prototype, "imagenUrl", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shelf_entity_1.Shelf, (shelf) => shelf.categorias, { onDelete: 'CASCADE' }),
    __metadata("design:type", shelf_entity_1.Shelf)
], Category.prototype, "estanteria", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => product_entity_1.Product, (product) => product.categorias, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinTable)({
        name: 'category_products',
        joinColumn: { name: 'categoryId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'productId', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Category.prototype, "productos", void 0);
exports.Category = Category = __decorate([
    (0, typeorm_1.Entity)()
], Category);
//# sourceMappingURL=category.entity.js.map