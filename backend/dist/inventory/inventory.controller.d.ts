import { InventoryService } from './inventory.service';
import { Shelf } from './entities/shelf.entity';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    healthCheck(): Promise<any>;
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
    seedTestProducts(): Promise<Product[]>;
    createProduct(file: Express.Multer.File, body: CreateProductDto): Promise<Product>;
    updateProduct(id: number, file: Express.Multer.File, body: UpdateProductDto): Promise<Product>;
    deleteProduct(id: number): Promise<void>;
    updateStock(id: number, body: {
        cantidad: number;
    }): Promise<Product>;
}
