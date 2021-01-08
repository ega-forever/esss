import * as utils from './utils';
declare const _default: {
    utils: typeof utils;
    split: (secret: string, needed: number, publicKeys: string[]) => [string, string][];
    join: (shares: [string, string][]) => string;
    sign: (share: string, privateKey: string) => string;
    partialValidate: (xCoef: string, publicKey: string, signature: string) => boolean;
};
export default _default;
