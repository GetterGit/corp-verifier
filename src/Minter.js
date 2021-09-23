import { useEffect, useState } from "react";
import { connectWallet, mintNFT, getCurrentWalletConnected} from "./utils/interact";

const Minter = (props) => {

  //State variables
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setURL] = useState("");
  const [recipient, setRecipient] = useState("");
 
  useEffect(async () => {
    const {address, status} = await getCurrentWalletConnected();
    setWallet(address);
    setStatus(status); 

    addWalletListener();
  }, []);

  const connectWalletPressed = async () => { 
    // In connectWalletPressed, we simply make an await call to our imported connectWallet function, and using its response, we update our status and walletAddress variables via their state hooks.
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  // Makes await call to the imported mintNFT function and update the status state variable to reflect whether our transaction succeeded or failed
  const onMintPressed = async () => {
    const {status} = await mintNFT(url, name, description, recipient);
    setStatus(status);
  };

  // Implementing the wallet listener so our UI updates when our wallet's state changes, such as when the user disconnects or switches accounts.
function addWalletListener() {
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", (accounts) => { // accountsChanged listens for state changes in the Metamask wallet, which include when the user connects an additional account to the dApp, switches accounts, or disconnects an account. If there is at least one account connected, the walletAddress state variable is updated as the first account in the accounts array returned by the listener. Otherwise, walletAddress is set as an empty string. 
      if (accounts.length > 0) {
        setWallet(accounts[0]);
        setStatus("👆🏽 Write a message in the text-field above.");
      } else {
        setWallet("");
        setStatus("🦊 Connect to Metamask using the top right button.");
      }
    });
  } else {
    setStatus(
      <p>
        {" "}
        🦊{" "}
        <a target="_blank" href={`https://metamask.io/download.html`}>
          You must install Metamask, a virtual Ethereum wallet, in your
          browser.
        </a>
      </p>
    );
  }
}

//the UI of our component
return (
  <div className="Minter">
    <button id="walletButton" onClick={connectWalletPressed}>
      {walletAddress.length > 0 ? (
        "Connected: " +
        String(walletAddress).substring(0, 6) +
        "..." +
        String(walletAddress).substring(38)
      ) : (
        <span>Connect Wallet</span>
      )}
    </button>

    <br></br>
    <h1 id="title">🧙‍♂️ Alchemy NFT Minter</h1>
    <p>
      Simply add your asset's link, name, and description, then press "Mint."
    </p>
    <form>
      <h2>🖼 Link to asset: </h2>
      <input
        type="text"
        placeholder="e.g. https://gateway.pinata.cloud/ipfs/<hash>"
        onChange={(event) => setURL(event.target.value)}
      />
      <h2>🤔 Name: </h2>
      <input
        type="text"
        placeholder="e.g. My first NFT!"
        onChange={(event) => setName(event.target.value)}
      />
      <h2>✍️ Description: </h2>
      <input
        type="text"
        placeholder="e.g. Even cooler than cryptokitties ;)"
        onChange={(event) => setDescription(event.target.value)}
      />
      <h2>👻 Recipient: </h2>
      <input
        type="text"
        placeholder="e.g. Pickle Rick"
        onChange={(event) => setRecipient(event.target.value)}
      />
    </form>
    <button id="mintButton" onClick={onMintPressed}>
      Mint NFT
    </button>
    <p id="status">
      {status}
    </p>
  </div>
  );
}

export default Minter;
