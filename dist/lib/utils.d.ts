/// <reference types="node" />
export declare const pubKeyToPoint: (pubKey: any) => any;
export declare const pointToPublicKey: (P: any) => Buffer;
export declare const generateSafeKeyPair: () => {
    privateKey: string;
    publicKey: string;
};
