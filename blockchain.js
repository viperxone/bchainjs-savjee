//have to import sha256 hash function as JS doesnt have one
//look at the comment text below about this
const SHA256 = require('crypto-js/sha256');

//PART4 - have to import elliptic library as we use their functions during verifications method
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

//PART3 - transactions will get an array of transactions
//therefore create new class
//PART4 - create new methods to sign and check signature on transactions
class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    //PART4 - first method we need to add calculateHash{};
    //will return the sha256 of the transaction.
    //this is the hash we going to sign the private key with.
    //we not going to sign all the data in the transaction
    //but we going to sign the hash of our transaction 
    calculateHash(){
        //convert to string
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    //PART4 - to signTransaction, we need to give both private and public keys
    //signingKey is the object we use from the elliptic library we imported in keyGenerator
    //which is ec.genKeyPair() which contains public and private keys.
    signTransaction(signingKey){
        //before we sign a transaction, we need to check if the public key = fromAddress
        //as we can only spend coins we have from our wallet with the private key
        //since private key is linked to public key, hence public key is = to fromAddress from the transaction
        if(signingKey.getPublic('hex') !== this.fromAddress){
            throw new Error('You cannot sign transactions for other wallets!');
        }

        //hash of our transaction
        const hashTx = this.calculateHash();
        //create signature - signingkey we are signing the hashTx in base64
        const sig = signingKey.sign(hashTx, 'base64');
        //store the signature. toDER is a special format
        this.signature = sig.toDER('hex');
    }

    //PART4 - to check if txn is corrrecly signed. 
    isValid(){
        //this is to confirm if address is null which means from miner rewards
        //refer to the mining class below. Mining rewards fromAddress are null but is valid
        if(this.fromAddress === null) return true;

        //check if signature not empty or no signature
        if(!this.signature || this.signature === 0){
            throw new Error('No signature in the transaction!')
        }

        //last, we have confirmed that txn is not from null address and it has a signature
        //we have to verify that the txn was signed with the correct key
        //now we have to make a new public key object from the fromAddress
        //use the elliptic libraru
        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        //verify the hash of the block has been signed by the signature
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

//PART4 - after done with the singing and isValid method in the transactions class,
//we have to edit the Block class at the bottom
class Block{
    //constructor with properties with default empty
    //index - where block sits on the chain
    //timestamp - tell us when block was created
    //PART3 - data change to transactions
    //previoushash - string contain hash of block before current block
    constructor(timestamp, transactions, previoushash = ''){
        //PART3 - index is removed as blocks are not determined by index in blockchain
        //but by their position in the array
        
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previoushash = previoushash;
        //create hash for current block so need way to calculate it
        this.hash = this.calculateHash();
        //PART2-to assist in mining thats all. so must put into calculateHash
        this.nonce = 0;
    }

    //calculate hash function of this block
    //take the properties of the block that is in the constructor and 
    //ran thru the hash function to return the hash. this will 
    //identify our block in the blockchain
    //can use SHA56 as a hash function but not available in JS
    //therefore have to import a library that can do this
    //do this by opening up terminal and type
    //npm install --save crypto-js
    //this will create a node_modules and download library in crypto-js folder that will contain the hash functions
    //now import SHA256 function by typing it at the top (can close the terminal by clicking on x on the right)
    calculateHash(){
        //have to toString the hash
        //PART2 - add nonce to the hash
        return SHA256(this.index + this.timestamp + this.previoushash + JSON.stringify(this.data) + this.nonce).toString();
    }

    //PART2-process of mining with difficulty so as to adjust proportionately if computer is powerful
    mineBlock(difficulty){
        //here we will try to make a hash of a block begin with a certain
        //amount of zero. we use a while loop
        //this.hash.substring(0, difficulty) means that if difficulty set to 5,
        //will take the first 5 characters of the hash
        //Array(5).join("0") means "0000" - the number 5 means the space between the "0"
        //therefore if want difficulty 5, which means 5 "0"s, we need to have +1 hence 5+1
        //this will give "00000" - 6 seperators
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
            //this will be an endless loop because the hash will not change as
            //nothing is changed in our properties for our block
            //hence we add a nonce
            this.nonce++;

            this.hash = this.calculateHash();
        }
        //display the gotten hash, hence the mined block
        console.log("Block mined: " + this.hash);
    }

    //PART4 - create a method to verify all the transactions in the current block
    hasValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid()) return false;
        }

        //after iterating through all the transactions and none is false, we return true
        return true;

    }
}

//PART4 - edit isChainValid()
class Blockchain{
    //constructor responsible for initialising our blockchain
    constructor(){
        //array of blocks. cannot be empty so add the genesis block
        this.chain = [this.createGenesisBlock()];
        //PART2. we put the difficulty here in case we need to use
        //it in other parts later on
        this.difficulty = 2;
        //PART3. this is to store all transactions that are made in between blocks creation.
        //example bitcoin blocks are created every 10minutes. hence because of difficulty
        //pending transactions need to be stored temporarily so that they can be included
        //in the next block
        this.pendingTransactions = [];
        //PART3. reward for miners who successfully mine a new block
        this.miningReward = 100;
    }
    
    //first block in the chain is called genesis block and has to be added manually
    createGenesisBlock(){
        //call the class Block. properties can be anything as its the first block
        //PART3 - have to remove 0 as we removed index at the top
        return new Block("07/07/2019", "Genesis Block", "0");
    }

    //return the last block in the chain/the last element in the chain
    getLatestBlock(){
        return this.chain[this.chain.length-1];
    }

    //PART3 - addBlock(newBlock) method has been replaced
    //When this method is called, it will pass a wallet address
    //hence, if successful mine the block, send money to the address
    minePendingTransaction(miningRewardAddress){
        //create new block
        //in real world cryptocurrency, cannot include all pendingTransactions as its too big
        //and block cannot increase beyond 1MB. hence miner get to chose which
        //transactions they wish to include and exclude
        let block = new Block(Date.now(), this.pendingTransactions);
        block.mineBlock(this.difficulty);

        console.log("Block successfully mined!");
        this.chain.push(block);

        //reset pendingTransactions array and create a new transaction to give miner his reward
        this.pendingTransactions = [
            //null because no fromAddress as its a reward
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    //PART3 - will receive transaction and add to pendingTransactions
    //PART4 - change create to add as we receiving a transaction and pushing it in to transaction area
    addTransaction(transaction){
        //PART 4 - perform a few checks. First is to check that the fromAddress and toAddress
        //are filled in
        if((!transaction.fromAddress) || (!transaction.toAddress)){
            throw new Error("Transaction must include from and to address.")
        }

        //PART 4 - verify that the transaction we going to add is valid
        if(!transaction.isValid()){
            throw new Error('Cannot add invalid transaction to chain!')
        }

        //PART4 - after pass the top two test, we can push the transaction
        this.pendingTransactions.push(transaction);
    }

    //PART3 - method to check the balance of the address
    //we have to find out all the balance of the address in all transactions in the blocks
    //the last block does not contain your final balance. each block denotes add and minus
    getBalanceofAddress(address){
        let balance = 0;

        //have to loop over all the blocks in the blockchain
        for(const block of this.chain){
            //since block now contain multiple transactions
            for(const trans of block.transactions){
                //this means you are transferring money away from your address
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }

                //this means you have money transferred to your address
                if(trans.toAddress === address){
                    balance += trans.amount;
                }

            }

        }

        return balance;
    }

    //once block is added onto the chain, it cannot be changed without invalidating the rest of the blocks in the chain
    //hence need to verify the integrity of the blockchain
    //this will return T if valid and F if something is wrong
    isChainValid(){
        //to verify our integrity, we need to loop over entire chain
        //we wont start at zero as its the genesis block hence index i = 1
        for(let i = 1; i < this.chain.length; i++){
            //take all data from current block and previous block to compare
            const curBlock = this.chain[i];
            const prevBlock = this.chain[i - 1];

            //PART4 - verify that all the transactions in the current block is valid
            if(!currentBlock.hasValidTransactions()){
                return false;
            }
            
            //now to check if the blocks are properly linked together
            //test by checking hash is valid. hence we recalculate the hash
            if(curBlock.hash !== curBlock.calculateHash()){
                return false;
            }

            //next we check if the current block points to the correct previous block
            if(curBlock.previoushash !== prevBlock.hash){
                return false;
            }
        }

        //once for loop done and all is correct, return TRUE
        return true;

    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;