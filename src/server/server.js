import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';


let config = Config['localhost'];
let accounts;
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

const statusCodes = [0, 10, 20, 30, 40, 50];
const oracleInitialIndex = config.oracleInitialIndex;
const oracleLastIndex = config.oracleLastIndex;
let oracleRegistered = false;

web3.eth.getAccounts().then((result) => {
  web3.eth.defaultAccount = result[0];
  accounts = result;
});

function getRandomStatus() {
  const randomIndex = Math.floor(Math.random() * 6);
  return statusCodes[randomIndex];
}

function registerOracles() {
  flightSuretyApp.methods.REGISTRATION_FEE().call().then((oracleFee) => {
    for(let a = oracleInitialIndex; a <= oracleLastIndex; a++) {      
      flightSuretyApp.methods.registerOracle().send({ from: accounts[a], value: oracleFee, gas: config.gas, gasPrice: config.gasPrice })
      .then((res)=> {
        flightSuretyApp.methods.getMyIndexes().call({from: accounts[a]}).then((result) => {
          console.log(`Oracle registred: ${result[0]}, ${result[1]}, ${result[2]}`);
          if(a == oracleLastIndex)
            console.log("Oracles Registration Completed...!!!");
        });
      });  
    }
  });
  oracleRegistered = true;
}

registerOracles();

flightSuretyApp.events.OracleRequest({
    fromBlock: 0
  }, function (error, event) {
    if (oracleRegistered) {
      if (error) {
        console.log(error);
      } else {
        const flightStatus = getRandomStatus();
        const index = event.returnValues.index;
        const airline = event.returnValues.airline;
        const flight = event.returnValues.flight;
        const timestamp = event.returnValues.timestamp;

        for(let a = oracleInitialIndex; a <= oracleLastIndex; a++) {
          flightSuretyApp.methods.getMyIndexes().call({from: accounts[a]}).then((result) => {
            console.log(result);
            if(result) {
            for (let i = 0; i < result.length; i++) {
              if (result[i] == index) {
                flightSuretyApp.methods
                    .submitOracleResponse(index, airline, flight, timestamp, flightStatus)
                    .send({from: accounts[a], gas: config.gas}).then((error, result) => {
                });
              }
            }
          }
          });
        }
      }
    }
});

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;