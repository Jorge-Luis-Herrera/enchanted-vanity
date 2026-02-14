import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Category } from './category.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  @Column({ nullable: true })
  imagenUrl: string;

  // Especialización: combo u oferta (no aparecen en estanterías normales)
  @Column({ default: false })
  esCombo: boolean;

  @Column({ default: false })
  esOferta: boolean;

  // Relación inversa: un producto puede estar en varias categorías
  @ManyToMany(() => Category, (category) => category.productos)
  categorias: Category[];
}