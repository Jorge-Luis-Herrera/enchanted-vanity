import { OnModuleInit } from "@nestjs/common";
import { Repository } from "typeorm";
import { Product } from "./entities/product.entity";
import { Shelf } from "./entities/shelf.entity";
import { Category } from "./entities/category.entity";
export declare class InventoryService implements OnModuleInit {
    private productRepository;
    private shelfRepository;
    private categoryRepository;
    constructor(productRepository: Repository<Product>, shelfRepository: Repository<Shelf>, categoryRepository: Repository<Category>);
    private deleteFile;
    onModuleInit(): Promise<void>;
    getInventario(): Promise<Shelf[]>;
    createShelf(titulo: string): Promise<Shelf>;
    deleteShelf(id: number): Promise<void>;
    getAllCategories(): Promise<Category[]>;
    createCategory(nombre: string, shelfId: number, imagenUrl?: string): Promise<Category>;
    deleteCategory(id: number): Promise<void>;
    getCategoryProducts(categoryId: number): Promise<Product[]>;
    assignProductsToCategory(categoryId: number, productIds: number[]): Promise<Category>;
    getAllProducts(): Promise<Product[]>;
    getFeaturedProducts(): Promise<Product[]>;
    createProduct(nombre: string, cantidad: number, precio: number, categoryIds: number[], imagenUrl?: string, esCombo?: boolean, esOferta?: boolean): Promise<Product>;
    updateProduct(id: number, data: {
        nombre?: string;
        cantidad?: number;
        precio?: number;
        imagenUrl?: string;
        esCombo?: boolean;
        esOferta?: boolean;
        categoryIds?: number[];
    }): Promise<Product>;
    deleteProduct(id: number): Promise<void>;
    seedTestProducts(): Promise<Product[]>;
    updateStock(id: number, cantidad: number): Promise<Product>;
}
