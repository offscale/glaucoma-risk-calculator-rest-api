import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('risk_res_tbl')
export class RiskRes {
    public static _omit: string[] = [];

    @PrimaryGeneratedColumn()
    public id!: number;

    @CreateDateColumn({ name: 'createdAt', type: 'timestamp with time zone', precision: 3 })
    public createdAt!: Date;

    @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp with time zone', precision: 3 })
    public updatedAt!: Date;

    @Column('integer', { nullable: false })
    public age!: number;

    @Column('real', { nullable: false })
    public client_risk!: number;

    @Column('text', { nullable: false })
    public gender!: string;

    @Column('text', { nullable: false })
    public ethnicity!: string;

    @Column('text', { nullable: true })
    public other_info?: string;

    @Column('text', { nullable: true })
    public email?: string;

    @Column('boolean', { nullable: true })
    public sibling?: boolean; // sibling has glaucoma?

    @Column('boolean', { nullable: true })
    public parent?: boolean; // parent has glaucoma?

    @Column('text', { nullable: false })
    public study!: string;

    @Column('boolean', { nullable: true })
    public myopia?: boolean;

    @Column('boolean', { nullable: true })
    public diabetes?: boolean;
}
