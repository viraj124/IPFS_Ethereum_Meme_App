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
    account: 'I1XTvtxSWQtNmL9vdsOYgppkXaRm6d0nP04fL7s0-SE',
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

  setupArweaveClient() {
    const arweave = Arweave.init();
    this.setState({ arweave })
  }


  onSubmit = (event) => {
    event.preventDefault();
    console.log('submitted');
    ipfs.add(this.state.buffer, (error, result) => {
       console.log('IPFS Result', result)
         var hash = result[0].hash;
       if (error) {
         console.log(error);
         return;
       }
       let key = await this.state.arweave.wallets.generate()
       let transaction = await arweave.createTransaction({
        data: '<html><head><meta charset="UTF-8"><title>IPFS Data Bridge</title></head><body></body></html>',
    }, key);
       transaction.addTag("IPFS-Add", hash)
       console.log(transaction)
       await arweave.transactions.sign(transaction, key);
       const response = await arweave.transactions.post(transaction);
       console.log(response.status);
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
