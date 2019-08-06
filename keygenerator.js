//import elliptic library to generate the keys
//plus has a method to sign and verify a signature
//npm install elliptic in terminal
const EC = require('elliptic').ec;
//make an instance. can use any elliptic curve. here we use secp256k1
//this is the algorithm that is also the basis for bitcoin wallet
const ec = new EC('secp256k1');

//generate key pair
const key = ec.genKeyPair();
//hex format string
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

console.log();
console.log('Private key :', privateKey);
console.log();
console.log('Public key :', publicKey);