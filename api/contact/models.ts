import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('contact_tbl')
export class Contact {
    public static _omit: string[] = [];

    @CreateDateColumn({ name: 'createdAt', type: 'timestamp with time zone', precision: 3 })
    public createdAt!: Date;

    @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp with time zone', precision: 3 })
    public updatedAt!: Date;

    @PrimaryColumn({ type: 'text', name: 'email', nullable: false, primary: true, unique: true })
    public email!: string;

    @Column('text', { nullable: true })
    public name?: string;

    @Column('text', { nullable: false })
    public owner!: string;
}
