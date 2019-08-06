//PART 2
//ask computers are fast, people may spam our blockchain
//also there is a security issue like changing the contents
//of our block and rehashing it PLUS all the blocks after it
//hence we will end up with a valid chain
//to solve, blockchain has Proof of Work. With this mechanism
//you have to prove that you have put a lot of computing power into
//making a block. This process is called mining.
//POW requires a block hash to begin with a certain number of zeros
//hence the difficulty

//have to import sha256 hash function as JS doesnt have one
//look at the comment text below about this
const SHA256 = require('crypto-js/sha256');

class Block{
    //constructor with properties with default empty
    //index - where block sits on the chain
    //timestamp - tell us when block was created
    //data - any type of data like details of transfer
    //previoushash - string contain hash of block before current block
    constructor(index, timestamp, data, previoushash = ''){
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
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
        this.difficulty = 5;
    }
    
    //first block in the chain is called genesis block and has to be added manually
    createGenesisBlock(){
        //call the class Block. properties can be anything as its the first block
        return new Block(0, "07/07/2019", "Genesis Block", "0");
    }

    //return the last block in the chain/the last element in the chain
    getLatestBlock(){
        return this.chain[this.chain.length-1];
    }

    //this method will receive new block and add it onto the chain
    //but it needs to do some work before it pushes onto the array
    addBlock(newBlock){
        //first it needs to set the previousHash to the hash of the last block in the chain
        newBlock.previoushash =  this.getLatestBlock().hash;
        
        //next we need to recalculate the hash as each time properties change, new hash needs to be calculated
        //newBlock.hash = newBlock.calculateHash();
        
        //above 2 lines are from PART1.
        //PART2. difficulty is from the blockchain property
        newBlock.mineBlock(this.difficulty);

        //this will add the newblock to the end of the chain
        //in reality its not so easy as this as there need to have several checks
        //but this is for simplicity as it demonstrates how blockchain works
        this.chain.push(newBlock);
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
//create new blocks
console.log('Mining block 1...');
viperCoin.addBlock(new Block(1, "10/07/2019", { amount: 4 }));
console.log('Mining block 2...');
viperCoin.addBlock(new Block(2, "11/07/2019", { amount: 10 }));

