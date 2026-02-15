import { InventoryService } from './inventory.service';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    healthCheck(): {
        status: string;
        environment: string;
    };
    findAll(): Promise<any>;
    createShelf(body: {
        titulo: string;
    }): Promise<{
        id: number;
        titulo: string;
        categorias: any[];
    }>;
    deleteShelf(id: number): Promise<void>;
    findAllCategories(): Promise<any>;
    createCategory(body: any): Promise<{
        id: number;
        nombre: string;
        shelfId: number;
        imagenUrl: string;
        productos: any[];
    }>;
    deleteCategory(id: number): Promise<void>;
    findProductsByCategory(id: number): Promise<any>;
    findAllProducts(): Promise<any>;
    findFeaturedProducts(): Promise<any>;
    createProduct(body: any): Promise<any>;
    updateProduct(id: number, body: any): Promise<any>;
    deleteProduct(id: number): Promise<void>;
    updateStock(id: number, body: {
        cantidad: number;
    }): Promise<any>;
}
