// Once we know our metadata is formatted properly, the next step is to wrap it into a JSON object and upload it to IPFS via the pinJSONToIPFS
import { pinJSONToIPFS } from './pinata.js';

// To import your Alchemy key from .env file and set up the Alchemy Web3 endpoint:
require('dotenv').config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);

// Add our contract ABI and contract address to our file
const contractABI = require('../contract-abi.json');
const contractAddress = "0x176647eB3A31Cb0B9470acb98B6b4ee87e80886f";

export const connectWallet = async () => {
    if (window.ethereum) {  // window.ethereum is a global API injected by Metamask and other wallet providers that allows websites to request users' Ethereum accounts. If approved, it can read data from the blockchains the user is connected to, and suggest that the user sign messages and transactions. 
        try {
            const addressArray = await window.ethereum.request({
                method: "eth_requestAccounts",  // Using a try/catch loop, we'll try to connect to Metamask by callingwindow.ethereum.request({ method: "eth_requestAccounts" }); Calling this function will open up Metamask in the browser, whereby the user will be prompted to connect their wallet to your dApp.
            });
        const obj = {   // If the user chooses to connect, method: "eth_requestAccounts"  will return an array that contains all of the user's account addresses that connected to the dApp. Altogether, our connectWallet function will return a JSON object that contains the first address in this array (see line 9) and a status message that prompts the user to write a message to the smart contract.
            status: "👆🏽 Write a message in the text-field above.",
            address: addressArray[0],
        };
        return obj;
        } catch (err) {
            return {
                address: "",
                status: "😥 " + err.message,    // If the user rejects the connection, then the JSON object will contain an empty string for the address returned and a status message that reflects that the user rejected the connection.
            };
        }
    } else {    // If window.ethereum is not present, then that means Metamask is not installed. This results in a JSON object being returned, where address returned is an empty string, and the status JSX object relays that the user must install Metamask.
        return {
            address: "",
            status: (
                <span>
                    <p>
                        {" "}
                        🦊{" "}
                        <a target="_blank" href={`https://metamask.io/download.html`}>
                        You must install Metamask, a virtual Ethereum wallet, in your
                        browser.
                        </a>
                    </p>
                </span> 
            ),
        };
    }
};

// Because we will be making numerous asynchronous calls (to Pinata to pin our metadata to IPFS, Alchemy Web3 to load our smart contract, and Metamask to sign our transactions), our function will also be asynchronous.
export const mintNFT = async (url, name, description, recipient) => {
    // Error handling
    if (url.trim() === "" || (name.trim() === "" || description.trim() === "" || recipient.trim() === "")) {
        return {
            // Essentially, if any of the input parameters are an empty string, then we return a JSON object where the success boolean is false, and the status string relays that all fields in our UI must be complete.
            success: false,
            status: "❗Please make sure all fields are completed before minting.",
        }
    }
    // Create metadata
    const metadata = new Object();
    metadata.name = name;
    metadata.image = url;
    metadata.description = description;

    // Make pinata call
    const pintataResponse = await pinJSONToIPFS(metadata);
    // Notice, we store the response of our call to pinJSONToIPFS(metadata) in the pinataResponse object. Then, we parse this object for any errors
    if (!pintataResponse.success) {
        return {
            success: false,
            status: "😢 Something went wrong while uploading your tokenURI.",
        }
    }
    // The tokenURI variable will be used as either partial or full URI for the newly minted token (depending on whether we have baseURI)
    const tokenURI = pintataResponse.pinataUrl;

    // Load the contract
    window.contract = await new web3.eth.Contract(contractABI, contractAddress);

    //set up an Ethereum transaction
    const transactionParameters = {
        to: contractAddress, // // Required except during contract publications
        from: window.ethereum.selectedAddress, // // mMst match user's active address
        'data': window.contract.methods.mint(recipient, 1, tokenURI, 0x00).encodeABI(), // Make call to the smart contract
    };

    // Sign tx via MetaMask
    try {
        // We make an await call, window.ethereum.request, where we ask Metamask to sign the transaction. Notice, in this request, we're specifying our eth method (eth_SentTransaction) and passing in our transactionParameters. At this point, Metamask will open up in the browser, and prompt the user to sign or reject the transaction.
        const txHash = await window.ethereum
            .request({
                method: 'eth_sendTransaction',
                params: [transactionParameters],
            });
        return {
            success: true,
            status: "✅ Check out your transaction on Etherscan: https://rinkeby.etherscan.io/tx/" + txHash,
        };
    } catch (error) {
        return {
            success: false,
            status: "😥 Something went wrong: " + error.message,
        };
    }
};

// The main difference from connectWallet() is that instead of calling the method eth_requestAccounts, which opens Metamask for the user to connect their wallet, here we call the method  eth_accounts, which simply returns an array containing the Metamask addresses currently connected to our dApp. 
export const getCurrentWalletConnected = async () => {
    if(window.ethereum) {
        try {
            const addressArray = await window.ethereum.request({
                method: "eth_accounts",
            });
            if (addressArray.length > 0) {
                return {
                    address: addressArray[0],
                    status: "👆🏽 Write a message in the text-field above.",
                };
            } else {
                return {
                    address: "",
                    status: "🦊 Connect to Metamask using the top right button.",
                };
            }
        } catch (err) {
            return {
                address: "",
                status: "😥 " + err.message,
            };
        }
    } else {
        return {
            address: "",
            status: (
                <span>
                    <p>
                        {" "}
                        🦊{" "}
                        <a target="_blank" href={`https://metamask.io/download.html`}>
                        You must install Metamask, a virtual Ethereum wallet, in your
                        browser.
                        </a>
                    </p>
                </span>
            ),
        };
    }
};