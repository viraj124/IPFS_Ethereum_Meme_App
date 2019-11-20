import React, { Component } from 'react';
import logo from '../logo.png';
import './App.css';
import MemeContract from '../abis/MemeContract.json';
import Web3 from 'web3';
import Arweave from 'arweave/web';


const ipfsClient = require('ipfs-http-client');
var ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })


class App extends Component {

constructor(props) {
  super(props);
  this.state = {
    buffer : null,
    address: '',
    memeHash : ''
  };
}

async componentWillMount() {
  await this.setupArweaveClient()
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

  getwallet = (event) => {
    event.preventDefault()
    let wallet
    const fileReader = new FileReader();
    fileReader.onload = async (e) => {
      wallet = JSON.parse(e.target.result);
      console.log(wallet)
      const address = await this.state.arweave.wallets.jwkToAddress(wallet)
      console.log(await this.state.arweave.wallets.getBalance(address))
      this.setState({ wallet })
      this.setState({ address })
    }
    fileReader.readAsText(event.target.files[0]);
  }

  async setupArweaveClient() {
    const arweave = Arweave.init();
    this.setState({ arweave })
  }

  async setuptransaction(hash) {
    let transaction = await this.state.arweave.createTransaction({
      data: '<html><head><meta charset="UTF-8"><title>IPFS Data Bridge</title></head><body></body></html>',
  }, this.state.wallet);
     
     transaction.addTag('IPFS-Add', hash);
     this.state.arweave.transactions.sign(transaction, this.state.wallet);
     const response = this.state.arweave.transactions.post(transaction);
     console.log(response.status);
  }


   onSubmit =  event => {
    event.preventDefault();
    console.log('submitted');
    ipfs.add(this.state.buffer, (error, result) => {
       console.log('IPFS Result', result)
         var hash = result[0].hash;
       if (error) {
         console.log(error);
         return;
       }
       this.setuptransaction(hash)
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
                  <input type ="file" onChange = { this.getwallet }/>
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
