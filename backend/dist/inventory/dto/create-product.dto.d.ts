export declare class CreateProductDto {
    nombre: string;
    cantidad: number;
    precio: number;
    imagenUrl?: string;
    esCombo?: boolean;
    esOferta?: boolean;
    categoryIds?: number[];
}
