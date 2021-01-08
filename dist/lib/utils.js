"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSafeKeyPair = exports.pointToPublicKey = exports.pubKeyToPoint = void 0;
const elliptic_1 = require("elliptic");
const crypto_1 = __importDefault(require("crypto"));
const ec = new elliptic_1.ec('secp256k1');
exports.pubKeyToPoint = (pubKey) => {
    const pubKeyEven = (pubKey[0] - 0x02) === 0;
    return ec.curve.pointFromX(pubKey.slice(1, 33).toString('hex'), !pubKeyEven);
};
exports.pointToPublicKey = (P) => {
    const buffer = Buffer.allocUnsafe(1);
    // keep sign, if is odd
    buffer.writeUInt8(P.getY().isEven() ? 0x02 : 0x03, 0);
    return Buffer.concat([buffer, P.getX().toArrayLike(Buffer)]);
};
exports.generateSafeKeyPair = () => {
    const node = crypto_1.default.createECDH('secp256k1');
    node.generateKeys();
    const publicKey = node.getPublicKey('hex', 'compressed');
    const privateKey = node.getPrivateKey().toString('hex');
    if (privateKey.startsWith('0')) {
        return exports.generateSafeKeyPair();
    }
    return {
        privateKey,
        publicKey
    };
};
//# sourceMappingURL=utils.js.map