export interface Producto {
    id: number;
    nombre: string;
    cantidad:number;
    precio: number;
}

export interface Estanteria {
    id: string;
    titulo: string;
    productos: Producto[];

}