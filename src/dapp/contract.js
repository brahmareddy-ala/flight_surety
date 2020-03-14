import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        // this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.web3 = new Web3(config.url);
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        this.appAddress = config.appAddress;
        this.firstAirline = config.firstAirline;
        this.fund(this.firstAirline, this.web3.utils.toWei("10", "ether"), (error, result) => {
            console.log(result.airline + ' ' + result.amount);
        });
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
        this.gas = config.gas;
        this.gasPrice = config.gasPrice
    }

    initialize(callback) {
        let self = this;
        self.web3.eth.getAccounts((error, accts) => {
           
            self.owner = accts[0];

            let counter = 1;
            
            while(self.airlines.length < 5) {
                self.airlines.push(accts[counter++]);
                this.fund(accts[counter++], this.web3.utils.toWei("10", "ether"), (error, result) => {
                    console.log(result.airline + ' ' + result.amount);
                });
            }

            while(self.passengers.length < 5) {
                self.passengers.push(accts[counter++]);
            }

            callback();
        });

    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner }, callback);
    }

    authorizeCaller(callback) {
        let self = this;
        let payload = {
            appContractOwner: self.owner,
            authorized: true
        }
        self.flightSuretyData.methods
            .authorizeCaller(self.appAddress)
            .send({ from: payload.appContractOwner }, (error, result) => {
                callback(error, payload);
            });
    }

    /*registerAirline(airlineAddress, name, newAirline, callback) {
        let self = this;
        let payload = {
            newAirline: newAirline,
            name: name
        }
        if(airlineAddress == '' || airlineAddress == null)
            airlineAddress = self.firstAirline;
        self.flightSuretyApp.methods
            .registerAirline(payload.name, payload.newAirline)
            .send({ from: airlineAddress, gas: airlineAddress.gas, gasPrice: airlineAddress.gasPrice }, (error, result) => {
                callback(error, payload);
            });
    }*/

    fund(airline, amount, callback) {
        let self = this;
        let payload = {
            airline: airline,
            amount: amount
        } 
        self.flightSuretyApp.methods
            .fund()
            .send({ from: payload.airline, value: this.web3.utils.toWei(payload.amount, "ether") }, (error, result) => {
                callback(error, payload);
            });
    }

    buy(flight, timestamp, insuree, value, callback) {
        let self = this;
        let payload = {
            flight: flight,
            timestamp: timestamp,
            insuree: insuree,
            value: value
        } 
        self.flightSuretyApp.methods
            .buy(self.firstAirline, payload.flight, payload.timestamp)
            .send({ from: payload.insuree, value: this.web3.utils.toWei(payload.value, "ether"), gasPrice:self.gasPrice}, (error, result) => {
                callback(error, payload);
            });
    }

    credit(insuree, callback) {
        let self = this;

        self.flightSuretyApp.methods
            .getInsureeBalance()
            .call({from: insuree}, (error, result) => {
                callback(error, result);
            });
    }

    withdraw(insuree, callback) {
        let self = this;
        let payload = {
            passenger: insuree
        } 
        self.flightSuretyApp.methods
            .withdraw()
            .send({ from: payload.passenger, gas: self.gas, gasPrice: self.gasPrice }, (error, result) => {
                callback(error, payload);
            });
    }

    fetchFlightStatus(flight, timestamp, callback) {
        let self = this;
        let payload = {
            flight: flight,
            timestamp: timestamp
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(self.firstAirline, payload.flight, payload.timestamp)
            .send({ from: self.owner }, (error, result) => {
                callback(error, payload);
            });
    }
}