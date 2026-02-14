import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Category } from './category.entity';

@Entity()
export class Shelf {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  // Una estantería contiene categorías (no productos directamente)
  @OneToMany(() => Category, (category) => category.estanteria)
  categorias: Category[];
}