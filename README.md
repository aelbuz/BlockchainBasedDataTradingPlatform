# Blockchain Based Data Trading Platform

A simple blockchain (Ethereum) based data trading platform for performing seller/buyer operations and trading cycle.  

Platform language is **Turkish**.

## Main Components:
* **[Solidity](https://github.com/ethereum/solidity):** Smart contract language.
* **[Truffle](https://github.com/trufflesuite/truffle):** Compiling smart contracts and migrating them to the blockchain. 
* **[Ganache](https://github.com/trufflesuite/ganache):** Local blockchain.
* **[Web3.js](https://github.com/ChainSafe/web3.js):** Interacting the local Ethereum node through the web page.
* **[MetaMask](https://metamask.io):** Connecting the Ethereum wallet through the internet browser.
* **HTML, CSS, JS:** Trading platform UI.

## How To Run:

**Note:** This project uses Truffle version 5.0.2 and Solidity version 0.5.0.  

**Note 2:** Web3.js also requires **MetaMask Legacy Web3** extension as well as MetaMask. This extension was removed from Google Chrome Store but not Firefox. If you want to use it with Chrome, download and install with this extension ID: `dgoegggfhkapjphahmgihfgemkgecdgl`

**Note 3:** Do not forget to install required packages with `npm install` command after you downloaded the source code.

**1.** Download and install [Node.js](https://nodejs.org/en/).  
**2.** Install Truffle and Solidity  with `npm install -g truffle@5.0.2` command through the command line.  
**3.** Install Ganache.  
**4.** Open Ganache and create a local blockchain with "Quickstart Ethereum" option.  
**5.** Install MetaMask browser extension and add Ganache as a new network.  
**6.** Open a new command line and compile the smart contracts with `truffle compile` command.  
**7.** Migrate the smart contracts to the blockchain with `truffle migrate` command.  
**8.** Start data trading platform through the lite-server with `npm run dev` command.  
**9.** Add Ganache users' wallet to MetaMask and use the platform.

### Operations that can be performed on the platform:

* Creating a new data record (with title, price and metadata information).
  - The proof (hash) of the data was also calculated with [Merkle tree](https://en.wikipedia.org/wiki/Merkle_tree) method and stored in the blockchain.
* Displaying created data records.
* Sending purchase request for a data record by the buyer.
  - After this, the seller approves the purchase request. In order to do this, the seller selects his data for calculating proof and comparing with the proof in the blockchain. If these two proofs are same, the approval operation is completed.
* Approving the purchase request by the buyer again and sending the price of the data to the seller.
* Displaying data purchased through the platform.
