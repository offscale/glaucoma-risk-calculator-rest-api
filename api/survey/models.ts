import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('survey_tbl')
export class Survey {
    public static _omit: string[] = [];

    @PrimaryGeneratedColumn()
    public id!: number;

    @CreateDateColumn({ name: 'createdAt', type: 'timestamp with time zone', precision: 3 })
    public createdAt!: Date;

    @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp with time zone', precision: 3 })
    public updatedAt!: Date;

    @Column('real', { nullable: true })
    public perceived_risk?: number;

    @Column('text', { nullable: false })
    public recruiter!: 'family' | 'recommended' | 'curious';

    @Column('text', { nullable: false })
    public eye_test_frequency!: 'annual' | 'biennial' | 'quinquennial' | 'rarely' | 'never';

    @Column('text', { nullable: false })
    public glasses_use!: 'shortsighted' | 'longsighted' | 'astigmatism' | 'other' | 'none';

    @Column('text', { nullable: true })
    behaviour_change?: 'as_recommended' | 'less_likely' | 'no_change';

    @Column('integer', { nullable: true })
    public risk_res_id?: number;
}
