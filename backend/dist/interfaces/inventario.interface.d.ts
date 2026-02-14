export interface Producto {
    id: number;
    nombre: string;
    cantidad: number;
    precio: number;
    imagenUrl?: string;
    esCombo: boolean;
    esOferta: boolean;
}
export interface Categoria {
    id: number;
    nombre: string;
    imagenUrl?: string;
    productos?: Producto[];
}
export interface Estanteria {
    id: number;
    titulo: string;
    categorias: Categoria[];
}
