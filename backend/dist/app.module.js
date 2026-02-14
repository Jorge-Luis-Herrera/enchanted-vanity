"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const inventory_module_1 = require("./inventory/inventory.module");
const auth_module_1 = require("./auth/auth.module");
const product_entity_1 = require("./inventory/entities/product.entity");
const category_entity_1 = require("./inventory/entities/category.entity");
const shelf_entity_1 = require("./inventory/entities/shelf.entity");
const backendRoot = (0, path_1.join)(__dirname, '..');
const devDbPath = (0, path_1.join)(backendRoot, 'data', 'db.sqlite');
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: process.env.NODE_ENV === 'production'
                    ? (0, path_1.join)(__dirname, '..', 'client')
                    : (0, path_1.join)(__dirname, '..', '..', 'dist'),
                exclude: ['/api{/*path}'],
                serveStaticOptions: {
                    cacheControl: true,
                },
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'sqlite',
                database: process.env.NODE_ENV === 'production'
                    ? '/home/data/db.sqlite'
                    : devDbPath,
                entities: [product_entity_1.Product, category_entity_1.Category, shelf_entity_1.Shelf],
                synchronize: process.env.NODE_ENV !== 'production' || process.env.DB_SYNC === 'true',
            }),
            auth_module_1.AuthModule,
            inventory_module_1.InventoryModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map