import { InventoryService } from './inventory.service';
import { Shelf } from './entities/shelf.entity';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    findAll(): Promise<Shelf[]>;
    createShelf(body: {
        titulo: string;
    }): Promise<Shelf>;
    deleteShelf(id: number): Promise<void>;
    findAllCategories(): Promise<Category[]>;
    createCategory(file: Express.Multer.File, body: {
        nombre: string;
        shelfId: string;
    }): Promise<Category>;
    deleteCategory(id: number): Promise<void>;
    getCategoryProducts(id: number): Promise<Product[]>;
    assignProductsToCategory(id: number, body: {
        productIds: number[];
    }): Promise<Category>;
    findAllProducts(): Promise<Product[]>;
    findFeaturedProducts(): Promise<Product[]>;
    createProduct(file: Express.Multer.File, body: {
        nombre: string;
        cantidad: string;
        precio: string;
        categoryIds?: string;
        esCombo?: string;
        esOferta?: string;
    }): Promise<Product>;
    updateProduct(id: number, file: Express.Multer.File, body: {
        nombre?: string;
        cantidad?: string;
        precio?: string;
        esCombo?: string;
        esOferta?: string;
        categoryIds?: string;
    }): Promise<Product>;
    deleteProduct(id: number): Promise<void>;
    updateStock(id: number, body: {
        cantidad: number;
    }): Promise<Product>;
}
