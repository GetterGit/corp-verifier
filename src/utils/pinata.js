require('dotenv').config();
const key = process.env.REACT_APP_PINATA_KEY;
const secret = process.env.REACT_APP_PINATA_SECRET;

const axios = require('axios'); // a promise based HTTP client for the browser and node.js, which we will use to make a request to Pinata


// asynchronous function pinJSONToIPFS, which takes a JSONBody as its input and the Pinata api key and secret in its header, all to make a POST request to theirpinJSONToIPFS API.
export const pinJSONToIPFS = async(JSONBody) => {
    const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
    //making axios POST request to Pinata ⬇️
    return axios
        .post(url, JSONBody, {
            headers: {
                pinata_api_key: key,
                pinata_secrect_api_key: secret,
            }
        })
        // If this POST request is successful, then our function returns an JSON object with the success boolean as true and the pinataUrl where our metadata was pinned. We will use this pinataUrl returned as the tokenURI input to our smart contract's mint function
        .then(function (response) {
            return {
                success: true,
                pinataUrl: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash,
            };
        })
        // If this post request fails, then our function returns an JSON object with the success boolean as false and a message string that relays our error
        .catch(function (error) {
            console.log(error)
            return {
                success: false,
                message: error.message,
            };
        });
};