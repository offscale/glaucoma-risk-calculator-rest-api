import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('template_tbl')
export class Template {
    public static _omit: string[] = [];

    @PrimaryGeneratedColumn()
    public id!: number;

    @CreateDateColumn({ name: 'createdAt', precision: 3 })
    public createdAt!: Date;

    @UpdateDateColumn({ name: 'updatedAt', precision: 3 })
    public updatedAt!: Date;

    @Column('varchar', { nullable: false })
    public contents!: string;

    @Column('varchar', { nullable: false })
    public kind!: string;
}
