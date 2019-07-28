export declare class RiskStats {
    static _omit: string[];
    id: string;
    createdAt: Date;
    updatedAt: Date;
    risk_json: string;
    ensureString(): void;
    maybeJson(): {} | string;
}
