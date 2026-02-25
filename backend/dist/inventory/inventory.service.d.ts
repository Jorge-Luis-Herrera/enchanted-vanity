import { OnModuleInit } from '@nestjs/common';
export declare class InventoryService implements OnModuleInit {
    private readonly dbPath;
    onModuleInit(): void;
    private ensureDbStructure;
    private getData;
    private saveData;
    private saveImage;
    getInventario(): Promise<any>;
    createShelf(titulo: string): Promise<{
        id: number;
        titulo: string;
        categorias: any[];
    }>;
    deleteShelf(id: number): Promise<void>;
    getAllCategories(): Promise<any>;
    createCategory(nombre: string, shelfId: number, imagenUrl?: string): Promise<{
        id: number;
        nombre: string;
        shelfId: number;
        imagenUrl: string;
        productos: any[];
    }>;
    deleteCategory(id: number): Promise<void>;
    getProductsByCategory(categoryId: number): Promise<any>;
    getAllProducts(): Promise<any>;
    getFeaturedProducts(): Promise<any>;
    createProduct(productData: any): Promise<{
        id: number;
        nombre: any;
        descripcion: any;
        esCombo: any;
        esOferta: any;
        isBestSeller: any;
        cantidad: number;
        precio: number;
        imagenUrl: any;
        categoryIds: any;
    }>;
    updateProduct(id: number, updateData: any): Promise<any>;
    deleteProduct(id: number): Promise<void>;
    updateStock(id: number, cantidad: number): Promise<any>;
}
