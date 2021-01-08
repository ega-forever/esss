export declare const split: (secret: string, needed: number, publicKeys: string[]) => Array<[string, string]>;
export declare const join: (shares: Array<[string, string]>) => string;
export declare const sign: (share: string, privateKey: string) => string;
export declare const partialValidate: (xCoef: string, publicKey: string, signature: string) => boolean;
