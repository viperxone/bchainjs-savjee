//create a blockchain and add blocks
//check if it was tampered
//objective is to understand the concept of blockchain

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
        return SHA256(this.index + this.timestamp + this.previoushash + JSON.stringify(this.data)).toString();
    }
}

class Blockchain{
    //constructor responsible for initialising our blockchain
    constructor(){
        //array of blocks. cannot be empty so add the genesis block
        this.chain = [this.createGenesisBlock()];
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
        newBlock.hash = newBlock.calculateHash();
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
viperCoin.addBlock(new Block(1, "10/07/2019", { amount: 4 }));
viperCoin.addBlock(new Block(2, "11/07/2019", { amount: 10 }));

//check if valid
console.log('Is chain valid? ' + viperCoin.isChainValid());

//test to make it invalid. we change the amount for first block
viperCoin.chain[1].data = { amount: 100};
//second, we test by recalculating the hash since we change the data
//it will return false as the relationship with the previous block is now broken
//therefore blockchain is to always add a block and to not delete, edit a block
//if it does really happen, need to roll back to the last effective chain
viperCoin.chain[1].data = viperCoin.chain[1].calculateHash();
console.log('Is chain valid? ' + viperCoin.isChainValid());

//lets see how our blockchain looks like
//stringify to make it readable and use 4 spaces to format it
//console.log(JSON.stringify(viperCoin, null, 4));

//script lack proof of work, peer to peer network to comm with other miners
//must check if got enough funds to make a transaction