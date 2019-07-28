import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('contact_tbl')
export class Contact {
    public static _omit: string[] = [];

    @CreateDateColumn()
    public createdAt!: Date;

    @UpdateDateColumn()
    public updatedAt!: Date;

    @PrimaryColumn({ type: 'varchar', name: 'email', nullable: false, primary: true, unique: true })
    public email!: string;

    @Column('varchar', { nullable: true })
    public name?: string;

    @Column('varchar', { nullable: false })
    public owner!: string;
}
