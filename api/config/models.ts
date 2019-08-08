import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { AccessTokenType } from '@offscale/nodejs-utils/interfaces';

@Entity('config_tbl')
export class Config {
    public static _omit: string[] = [];

    @PrimaryGeneratedColumn()
    public id!: number;

    @CreateDateColumn({ name: 'createdAt', type: 'timestamp with time zone', precision: 3 })
    public createdAt!: Date;

    @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp with time zone', precision: 3 })
    public updatedAt!: Date;

    @Column('text', { nullable: true })
    public client_id!: string;

    // TODO: Move this somewhere encrypted
    @Column('text', { nullable: true })
    public client_secret?: string;

    @Column('text', { nullable: false })
    public tenant_id!: string;

    @Column('text', { nullable: true })
    public access_token?: AccessTokenType;

    @Column('text', { nullable: true })
    public refresh_token?: string;

    @Column('text', { nullable: true })
    public state?: string;

    @Column('text', { nullable: true })
    public session_state?: string;

    @Column('text', { nullable: true })
    public from?: string;
}
