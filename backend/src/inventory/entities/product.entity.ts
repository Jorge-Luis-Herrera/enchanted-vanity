import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Shelf } from './shelf.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn() // Crea un ID que se auto-incrementa (1, 2, 3...)
  id: number;

  @Column()
  nombre: string;

  @Column()
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  @Column({ nullable: true })
  imagenUrl: string;

  // Relación: Muchos productos pertenecen a una Estantería con eliminación en cascada
  @ManyToOne(() => Shelf, (shelf) => shelf.productos, { onDelete: 'CASCADE' })
  estanteria: Shelf;
}