import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('risk_res_tbl')
export class RiskRes {
    public static _omit: string[] = [];

    @PrimaryGeneratedColumn()
    public id!: string;

    @CreateDateColumn()
    public createdAt!: Date;

    @UpdateDateColumn()
    public updatedAt!: Date;

    @Column('integer', { nullable: false })
    public age!: number;

    @Column('float', { nullable: false })
    public client_risk!: number;

    @Column('varchar', { nullable: false })
    public gender!: string;

    @Column('varchar', { nullable: false })
    public ethnicity!: string;

    @Column('varchar', { nullable: true })
    public other_info?: string;

    @Column('varchar', { nullable: true })
    public email?: string;

    @Column('boolean', { nullable: true })
    public sibling?: boolean; // sibling has glaucoma?

    @Column('boolean', { nullable: true })
    public parent?: boolean; // parent has glaucoma?

    @Column('varchar', { nullable: false })
    public study!: string;

    @Column('boolean', { nullable: true })
    public myopia?: boolean;

    @Column('boolean', { nullable: true })
    public diabetes?: boolean;
}
