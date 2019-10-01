import React, { Component } from 'react';
import logo from '../logo.png';
import './App.css';
import MemeContract from '../abis/MemeContract.json';
import Web3 from 'web3';

const ipfsClient = require('ipfs-http-client');
var ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })


class App extends Component {

constructor(props) {
  super(props);
  this.state = {
    buffer : null,
    account: '',
    contract: '',
    memeHash : 'QmQ86gLytagjVk7gDEvU98nx1vPiPjmjtYEnh148fN6cRS'
  };
}

async componentWillMount() {
  await this.loadWeb3();
  await this.integrateSmartContract()
}

  captureFile = (event) => {
  event.preventDefault();
  const file = event.target.files[0]
  const reader = new FileReader()
  reader.readAsArrayBuffer(file)
  reader.onloadend = () => {
    this.setState({buffer : Buffer(reader.result)})
    }
  }

  async integrateSmartContract() {
   const web3 = window.web3
   const accounts = await web3.eth.getAccounts()
   console.log(accounts[0])
   this.setState({account: accounts[0]})
   const networkId = await web3.eth.net.getId()
   const nwData = MemeContract.networks[networkId]
   if (nwData) {
     const abi = MemeContract.abi
     const address = nwData.address
     const contract = web3.eth.Contract(abi, address)
     this.setState({contract: contract})
     const memeHash = await contract.methods.get().call()
     this.setState({memeHash})
   } else {
     window.alert("Contract Not Deployed!")
   }
   console.log(networkId)
  }

  async loadWeb3() {
    //getting linked with metamask wallet
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    } else if (window.web3) {
     window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert("Please Use Metamask!")
    }
  }

  onSubmit = (event) => {
    event.preventDefault();
    console.log('submitted');
    ipfs.add(this.state.buffer, (error, result) => {
       console.log('IPFS Result', result)
         var memeHash = result[0].hash;
       if (error) {
         console.log(error);
         return;
       }
       this.state.contract.methods.set(memeHash).send({from : this.state.account}).then((r) =>{
             return this.setState({memeHash})
       })
    })
  }
  render() {
    return (
      <div>        
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Dapp University
          </a>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src = {`https://ipfs.infura.io/ipfs/${this.state.memeHash}`} className="App-logo" alt="logo" />
                </a>
                <p>&nbsp;</p>
                <h2>Change Meme</h2>
                <form onSubmit = {this.onSubmit}>
                  <input type ="file" onChange = { this.captureFile }/>
                  <input type = "submit" />
                  </form>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
