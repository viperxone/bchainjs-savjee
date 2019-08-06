//PART 3
//make cryptocurrency involves 2 parts;
//1 - a block can contain multiple transactions
//2 - add rewards for miners. mining rewards steadily introduce money into the system

//have to import sha256 hash function as JS doesnt have one
//look at the comment text below about this
const SHA256 = require('crypto-js/sha256');

//PART3 - transactions will get an array of transactions
//therefore create new class
class transactions{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
}

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
}

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
            new transactions(null, miningRewardAddress, this.miningReward)
        ];
    }

    //PART3 - will receive transaction and add to pendingTransactions
    createTransaction(transaction){
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

//test the blockchain
let viperCoin = new Blockchain();

//PART3 - in reality address1 and address2 are public key of someone's wallet
//once created this, it will be in the pendingTransactions array
//it will go to miner to have it stored in the blockchain
viperCoin.createTransaction(new transactions('address1', 'address2', 100));
viperCoin.createTransaction(new transactions('address2', 'address1', 50));

console.log("\nStarting the miner...");
//minePendingTransactions expect a mining reward address
viperCoin.minePendingTransaction("xone-address");

console.log("\nBalance of xone is ", viperCoin.getBalanceofAddress("xone-address"));
//first run will give balance 0. Reward will be recorded when the next block is mined
//this is because transaction is stored in pendingTransaction so when we start miner again...

console.log("\nStarting the miner again...");
viperCoin.minePendingTransaction("xone-address");
//will show the balance
console.log("\nBalance of xone is ", viperCoin.getBalanceofAddress("xone-address"));