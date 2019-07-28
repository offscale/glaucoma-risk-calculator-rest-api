import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('template_tbl')
export class Template {
    public static _omit: string[] = [];

    @PrimaryGeneratedColumn()
    public id!: string;

    @CreateDateColumn()
    public createdAt!: Date;

    @UpdateDateColumn()
    public updatedAt!: Date;

    @Column('varchar', { nullable: false })
    public contents!: string;

    @Column('varchar', { nullable: false })
    public kind!: string;
}
