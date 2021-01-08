"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.partialValidate = exports.sign = exports.join = exports.split = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const elliptic_1 = require("elliptic");
const utils_1 = require("./utils");
const big_integer_1 = __importDefault(require("big-integer"));
const ec = new elliptic_1.ec('secp256k1');
const prime = ec.n;
exports.split = (secret, needed, publicKeys) => {
    const coef = [new bn_js_1.default(secret, 16)];
    const shares = [];
    for (let c = 1; c <= needed; c++) {
        coef[c] = new bn_js_1.default(big_integer_1.default.randBetween(big_integer_1.default(0), big_integer_1.default(prime.sub(new bn_js_1.default(1)), 16)).toString(16), 'hex');
    }
    for (let publicKey of publicKeys) {
        let y = coef[0];
        let xCoef = new bn_js_1.default(big_integer_1.default.randBetween(big_integer_1.default(0), big_integer_1.default(prime.sub(new bn_js_1.default(1)), 16)).toString(16), 'hex');
        const xC = new bn_js_1.default(utils_1.pointToPublicKey(utils_1.pubKeyToPoint(Buffer.from(publicKey, 'hex')).mul(xCoef)).toString('hex'), 'hex');
        for (let exp = 1; exp < needed; exp++) {
            let ss = coef[exp].mul(xC.pow(new bn_js_1.default(exp))).mod(prime);
            y = y.add(ss);
        }
        y = y.toString('hex'); //it's bn
        xCoef = xCoef.toString('hex');
        shares.push([xCoef, y]);
    }
    return shares;
};
/* Gives the multiplicative inverse of k mod prime.  In other words (k * modInverse(k)) % prime = 1 for all prime > k >= 1  */
const modInverse = (k) => {
    k = k.mod(prime);
    const isKNeg = k.lt(new bn_js_1.default(0));
    let r = new bn_js_1.default(prime).egcd(new bn_js_1.default(isKNeg ? k.mul(new bn_js_1.default(-1)) : k)).b;
    if (isKNeg) {
        r = r.mul(new bn_js_1.default(-1));
    }
    return r.add(prime).mod(prime);
};
exports.join = (shares) => {
    let accum = new bn_js_1.default(0);
    for (let k = 0; k < shares.length; k++) {
        let numerator = new bn_js_1.default(1);
        let denominator = new bn_js_1.default(1);
        for (let i = 0; i < shares.length; i++) {
            if (k == i)
                continue;
            const x_k = new bn_js_1.default(utils_1.pointToPublicKey(ec.g.mul(shares[k][0])).toString('hex'), 'hex');
            const x_i = new bn_js_1.default(utils_1.pointToPublicKey(ec.g.mul(shares[i][0])).toString('hex'), 'hex');
            numerator = numerator.mul(x_i).mul(new bn_js_1.default(-1)).mod(prime);
            denominator = denominator.mul(x_k.sub(x_i)).mod(prime);
        }
        accum = accum.add(new bn_js_1.default(shares[k][1], 'hex')
            .mul(numerator)
            .add(prime)
            .mod(prime)
            .mul(modInverse(denominator))
            .add(prime)
            .mod(prime))
            .add(prime)
            .mod(prime);
    }
    return accum.toString('hex');
};
exports.sign = (share, privateKey) => {
    return new bn_js_1.default(privateKey, 'hex').mul(new bn_js_1.default(share, 'hex')).mod(ec.n).toString('hex');
};
exports.partialValidate = (xCoef, publicKey, signature) => {
    const sg = utils_1.pointToPublicKey(ec.g.mul(signature)).toString('hex');
    const pubXcoef = utils_1.pointToPublicKey(utils_1.pubKeyToPoint(Buffer.from(publicKey, 'hex')).mul(xCoef)).toString('hex');
    return sg === pubXcoef;
};
//# sourceMappingURL=esss.js.map