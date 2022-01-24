import React, { useEffect, useState } from "react";
import './App.css';
import abi from "./contracts/WavePortal.json"
import { ethers } from "ethers"


const App = () => {
  //state variable to store user's public waller
  const [currentAccount, setCurrentAccount] = useState("");
  const [message, setMessage] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [waveCount, setWaveCount] = useState(0);
  const [state, chageState] = useState(false);

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
      const accounts = await ethereum.request({ method: "eth_requestAccounts"});

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

    } catch(error){
      console.log(error);
    }
  }

 const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getWaveCount();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getWaveCount();
        //await count.wait();
        setWaveCount(count.toString());

        
        setWaveCount(count.toNumber());

        console.log("Retrieved total wave count...", waveCount);


      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  } 

  const handleSubmit = (evt) => {
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

        //call the getAllWaves method from smart contract
        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp*1000),
            message: wave.message
          }) 
        });
        setAllWaves(wavesCleaned);

        wavePortalContract.on("NewWave", (from, timestamp, message) => {
          console.log("NewWave", from, timestamp, message);

          setAllWaves(prevState => [...prevState, {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message
          }]);

          //setWaveCount(prevState => prevState + 1);
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


  
  // listen for emitter events
  useEffect(() => {
    checkIfWalletIsConnected();
    getAllWaves();
  }, [])

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

        <div className="waves">
          <div className="waves-title">
            <h3>Lasts waves</h3>
            <h3>Total: {waveCount}</h3>
          </div>

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
