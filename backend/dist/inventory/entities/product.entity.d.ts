import { Category } from './category.entity';
export declare class Product {
    id: number;
    nombre: string;
    cantidad: number;
    precio: number;
    imagenUrl: string;
    esCombo: boolean;
    esOferta: boolean;
    categorias: Category[];
}
