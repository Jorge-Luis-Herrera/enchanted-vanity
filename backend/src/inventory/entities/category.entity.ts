import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Shelf } from './shelf.entity';
import { Product } from './product.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  imagenUrl: string;

  // Cada categoría pertenece a una estantería
  @ManyToOne(() => Shelf, (shelf) => shelf.categorias, { onDelete: 'CASCADE' })
  estanteria: Shelf;

  // Una categoría tiene muchos productos, y un producto puede estar en varias categorías
  @ManyToMany(() => Product, (product) => product.categorias, { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'category_products',
    joinColumn: { name: 'categoryId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'productId', referencedColumnName: 'id' },
  })
  productos: Product[];
}
