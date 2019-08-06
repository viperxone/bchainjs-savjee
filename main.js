//import
const {Blockchain, Transaction} = require('./blockchain');

//PART4 - have to import elliptic library as we use their functions during verifications method
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

//PART4 - initialise our private key
const myKey = ec.keyFromPrivate('d9d4168f237cd2dec401dc4d7925a2bf434b0857a45e17da859297ba67438b27');
//extract public key for wallet address
const myWalletAddress  = myKey.getPublic('hex');

//make new file to generate public and private key
//to make ourselves a wallet. create keygenerator.js
//after generating the keys, edit the blockchain.js file classes

//test the blockchain
let viperCoin = new Blockchain();

//PART4 - make transactions. 'public key goes here' shd be the destination address
//however since we are the only one in the blockchain, we use this.
const txn1 = new Transaction(myWalletAddress, 'public key goes here', 10);
txn1.signTransaction(myKey);
//after signing, add transaction
viperCoin.addTransaction(txn1);


console.log("\nStarting the miner...");
//PART4 - send mining reward to public key address
viperCoin.minePendingTransaction(myWalletAddress);

console.log("\nBalance of xone is ", viperCoin.getBalanceofAddress(myWalletAddress));
//first run will give balance 0. Reward will be recorded when the next block is mined
//this is because transaction is stored in pendingTransaction so when we start miner again...
