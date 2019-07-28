import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('survey_tbl')
export class Survey {
    public static _omit: string[] = [];

    @PrimaryGeneratedColumn()
    public id!: string;

    @CreateDateColumn()
    public createdAt!: Date;

    @UpdateDateColumn()
    public updatedAt!: Date;

    @Column('float', { nullable: true })
    public perceived_risk?: number;

    @Column('varchar', { nullable: false })
    public recruiter!: 'family' | 'recommended' | 'curious';

    @Column('varchar', { nullable: false })
    public eye_test_frequency!: 'annual' | 'biennial' | 'quinquennial' | 'rarely' | 'never';

    @Column('varchar', { nullable: false })
    public glasses_use!: 'shortsighted' | 'longsighted' | 'astigmatism' | 'other' | 'none';

    @Column('varchar', { nullable: true })
    behaviour_change?: 'as_recommended' | 'less_likely' | 'no_change';

    @Column('integer', { nullable: true })
    public risk_res_id?: number;
}
