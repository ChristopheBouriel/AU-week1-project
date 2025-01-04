const secp = require("ethereum-cryptography/secp256k1");
const { getRandomBytesSync } = require("ethereum-cryptography/random.js");
const { toHex } = require("ethereum-cryptography/utils");

const privateKey = getRandomBytesSync(32);

console.log('private key', toHex(privateKey));

const publicKey = secp.secp256k1.getPublicKey(privateKey);

console.log('public key', toHex(publicKey));

