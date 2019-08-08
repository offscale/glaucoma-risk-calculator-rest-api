import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('template_tbl')
export class Template {
    public static _omit: string[] = [];

    @PrimaryGeneratedColumn()
    public id!: number;

    @CreateDateColumn({ name: 'createdAt', type: 'timestamp with time zone', precision: 3 })
    public createdAt!: Date;

    @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp with time zone', precision: 3 })
    public updatedAt!: Date;

    @Column('text', { nullable: false })
    public contents!: string;

    @Column('text', { nullable: false })
    public kind!: string;
}
