import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: string;

  @Column()
  street!: string;

  @Column()
  city!: string;

  @Column()
  province!: string;

  @Column()
  zipCode!: string;

  @Column({ default: false })
  isDefault!: boolean;
}