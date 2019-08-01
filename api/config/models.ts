import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { AccessTokenType } from '@offscale/nodejs-utils/interfaces';

@Entity('config_tbl')
export class Config {
    public static _omit: string[] = [];

    @PrimaryGeneratedColumn()
    public id!: string;

    @CreateDateColumn()
    public createdAt!: Date;

    @UpdateDateColumn()
    public updatedAt!: Date;

    @Column('varchar', { nullable: true })
    public client_id!: string;

    // TODO: Move this somewhere encrypted
    @Column('varchar', { nullable: true })
    public client_secret?: string;

    @Column('varchar', { nullable: false })
    public tenant_id!: string;

    @Column('varchar', { nullable: true })
    public access_token?: AccessTokenType;

    @Column('varchar', { nullable: true })
    public refresh_token?: string;

    @Column('varchar', { nullable: true })
    public state?: string;

    @Column('varchar', { nullable: true })
    public session_state?: string;

    @Column('varchar', { nullable: true })
    public from?: string;
}
