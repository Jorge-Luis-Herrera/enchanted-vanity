import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm'; // Quitamos el que fallaba
import { Product } from './product.entity';

@Entity()
export class Shelf {
  @PrimaryColumn() // <--- Esto ahora funcionará perfecto con strings como 's1'
  id: string;

  @Column()
  titulo: string;

  @OneToMany(() => Product, (product) => product.estanteria)
  productos: Product[];
}