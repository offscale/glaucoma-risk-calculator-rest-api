import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';


@Entity('risk_stats_tbl')
export class RiskStats {
    public static _omit: string[] = [];

    @PrimaryGeneratedColumn()
    public id!: number;

    @CreateDateColumn({ name: 'createdAt', type: 'timestamp with time zone', precision: 3 })
    public createdAt!: Date;

    @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp with time zone', precision: 3 })
    public updatedAt!: Date;

    @Column('text', { nullable: false })
    risk_json!: string;

    @BeforeUpdate()
    @BeforeInsert()
    ensureString() {
        if (typeof this.risk_json !== 'string')
            this.risk_json = JSON.stringify(this.risk_json);
    }

    maybeJson(): {} | string {
        if (['{', '['].indexOf(this.risk_json[0]) > -1)
            return JSON.parse(this.risk_json);
        return this.risk_json;
    }
}
