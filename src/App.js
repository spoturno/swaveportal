import React, { useEffect, useState } from "react";
import './App.css';
import abi from "./contracts/WavePortal.json"
import { ethers } from "ethers"


const App = () => {

  // state varialbe to store user's public wallet
  const [currentAccount, setCurrentAccount] = useState("");

  // state variable to store user's input - wave message
  const [message, setMessage] = useState("");

  // state variable to store all past waves 
  const [allWaves, setAllWaves] = useState([]);

  // state variable to store wave count
  const [waveCount, setWaveCount] = useState(0);

  // state variable to handle change in wave count
  const [state, chageState] = useState(false);

  // contract address and contract ABI after deploy to rinkeby test network
  const contractAddress = "0xafDa0d14Aa2AfF61292704bD442D0FB083eAC25C";
  const contractABI = abi.abi;


  const checkIfWalletIsConnected = async () => {
    try{

      const { ethereum } = window;

      if(!ethereum)
        console.log("Make sure you have Metamask!");
      else console.log("We have the ethereum object", ethereum);

      //check if we're autorized to access user's wallet
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if(accounts.length !== 0){
        const account = accounts[0];
        console.log("Found autorized account: ", account);
        setCurrentAccount(account);
      }else{
        console.log("No authorized account found");
      }
    } catch (error){
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try{
      const { ethereum } = window;

      if(!ethereum){
        alert("Get Metamask!");
        return;
      }

      // Gets all the accounts from Metamask browser
      const accounts = await ethereum.request({ method: "eth_requestAccounts"});
     
      console.log("Connected", accounts[0]);

      // change currentAccount state to first account
      setCurrentAccount(accounts[0]);

    } catch(error){
      console.log(error);
    }
  }

 const wave = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        // A Web3Provider wraps a standard Web3 provider, which is
        // what MetaMask injects as window.ethereum into each page
        const provider = new ethers.providers.Web3Provider(ethereum);

        // The MetaMask plugin also allows signing transactions to
        // send ether and pay to change state within the blockchain.
        // For this, you need the account signer...
        const signer = provider.getSigner();

        // The contract object
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        // Calls the getAllWaves method from smart contract
        let count = await wavePortalContract.getWaveCount();

        console.log("Retrieved total wave count...", count.toNumber());

        //Execute the actual wave from your smart contract
        const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 });
        console.log("Mining ...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        // get the wave count after block is mined,
        // transaction valid -> wave successfully send
        count = await wavePortalContract.getWaveCount();
        setWaveCount(count.toNumber());

        console.log("Retrieved total wave count...", waveCount);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  } 

  // check for invalid input, calls wave and empties the field
  const handleSubmit = (evt) => {

    // If the event does not get explicitly handled,
    // its default action should not be taken as it normally would be.
    evt.preventDefault();

    if(message == ""){
      alert("This field must be filled out");
      return false;
    }
    wave();
    setMessage("");
  }

  const getAllWaves = async () => {
    try{
      const { ethereum } = window;
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        // Calls the getAllWaves method from smart contract
        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = [];

        // stores waves info from smart contract like object
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp*1000),
            message: wave.message
          }) 
        });

        // updates allWaves state variable
        setAllWaves(wavesCleaned);

        // Listens to smart contract event 
        wavePortalContract.on("NewWave", (from, timestamp, message) => {

          console.log("NewWave", from, timestamp, message);

          // updates previous allWaves state by adding new wave
          setAllWaves(prevState => [...prevState, {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message
          }]);

          // update state so that waveCount updates in updateWaveCount
          chageState(!state); 
        });
      }else{
        console.log("Ethereum object doesn't exist!");
      }
   }catch(error){
     console.log(error);
   }
  }

  const updateWaveCount = async () => {
      const { ethereum } = window;
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const count = await wavePortalContract.getWaveCount();
        setWaveCount(count.toNumber());
      }
  }

  // Listens for emitter events
  useEffect(() => {
    checkIfWalletIsConnected();
    getAllWaves();
  }, [])

  // Listens for changes in state,
  // if changes then waveCount is updated in real time
  useEffect(() => {
    updateWaveCount();
  }, [state])


  return(
    <div className="mainContainer">
      <div className="dataContainer">

        <div className="header">
          👋 Hey there!
        </div>

        <div className="bio">
          This is my personal wave portal. Connect your Ethereum wallet and wave at me!
        </div>

        {/* message input section */}
        <form className="waveForm" onSubmit={handleSubmit}>
          <label>
            <input className="waveInput" type="text" value={message} onChange={e => setMessage(e.target.value)} />
          </label>

          <input className="waveButton" type="submit" value="Wave at me"/>
        </form>
        


        {/* if there is no currentAccount render this button */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {/* title and total waves */}
        <div className="waves">
          <div className="waves-title">
            <h3>Lasts waves</h3>
            <h3>Total: {waveCount}</h3>
          </div>

          {/* show each wave stored in with smart contract */}
          {allWaves.map((wave, index) => {
            return (
              <div key={index} className="waveObject">
                <div className="waveObject-from">From: {wave.address}</div>
                <div className="waveObject-msg">{wave.message}</div>
                <div className="waveObject-time">{wave.timestamp.getDate().toString()} / {wave.timestamp.getMonth() + 1} / {wave.timestamp.getFullYear().toString()}</div>
              </div>)
          })}
        </div>

      </div>
    </div>
  );
}

export default App;
