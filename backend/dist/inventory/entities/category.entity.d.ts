import { Shelf } from './shelf.entity';
import { Product } from './product.entity';
export declare class Category {
    id: number;
    nombre: string;
    imagenUrl: string;
    estanteria: Shelf;
    productos: Product[];
}
