const Test = require('../config/testConfig.js');
const BigNumber = require('bignumber.js');
const truffleAssert = require('truffle-assertions');

contract('Flight Surety Tests', async (accounts) => {

  const airlineInitialFund = web3.utils.toWei("10", "ether");
  const oneEther = web3.utils.toWei("1", "ether");
  const timestamp = Math.floor(Date.now() / 1000);
  const lateFlight = "EK-521"

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/
 
  it('(config) can authorize App Contract to call Data Contract functions', async () => {
    
    // ARRANGE
    let isAuthorized = false
    // ACT
    try {
        await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
        isAuthorized = true;
    }
    catch(e) {
        console.log(e);
    }
    // ASSERT
    assert.equal(isAuthorized, true, "Contract Data doesn't authorize App Contract");
  });
  
  it(`(constructor) checks first airline registered in contract deploy`, async function () {

    // Get operating status
    const airline = await config.flightSuretyApp.getAirline.call(config.firstAirline);
    
    // Checks airline atributes
    assert.equal(airline[0], 'Emirates', 'Incorret name of first airline');
    assert.equal(airline[1], true, 'First airline not registered');
  });

  it(`has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it('(airline) add funds to first Airline', async () => {

    await config.flightSuretyApp.fund({from: config.firstAirline, value: airlineInitialFund});
    const airline = await config.flightSuretyApp.getAirline.call(config.firstAirline);    
    assert.equal(airline[0], 'Emirates', 'Incorret name of first airline');
    assert.equal(airline[1], true, 'Emirates airline not registered');
    assert.equal(airline[2], airlineInitialFund, "Emirates airline should have funds");
  });

  it('(airline) first Airline register second Airline', async () => {
    
    await config.flightSuretyApp.registerAirline('Qatar', config.secondAirline, {from: config.firstAirline});
    const airline = await config.flightSuretyApp.getAirline.call(config.secondAirline);
  
    // Checks airline atributes
    assert.equal(airline[0], 'Qatar', 'Name is empty');
    assert.equal(airline[1], true, 'Qatar airline not registered');
  });

  /*it('(airline) cannot register an Airline if it is not having funds', async () => {
    
    await truffleAssert.reverts(config.flightSuretyApp.registerAirline(config.thirdAirline, 'British Airways', {from: config.secondAirline}));
    const airline = await config.flightSuretyApp.getAirline.call(config.thirdAirline);

    // Checks airline atributes
    assert.equal(airline[0], '', 'Name is not empty');
    assert.equal(airline[1], false, 'Qatar airline not registered');
    assert.equal(airline[2], 0, "Qatar airline should't have investements");
  });*/

  it('(airline) add initial funds to second Airline', async () => {

    await config.flightSuretyApp.fund({from: config.secondAirline, value: airlineInitialFund});
    const airline = await config.flightSuretyApp.getAirline.call(config.secondAirline);

    assert.equal(airline[0], 'Qatar', 'Incorret name of second airline');
    assert.equal(airline[1], true, 'Qatar airline not registered');
    assert.equal(airline[2], airlineInitialFund, "Qatar airline should have funds");
  });

  it('(airline) first Airline register third Airline', async () => {
    
    await config.flightSuretyApp.registerAirline('British Airways', config.thirdAirline, {from: config.firstAirline});
    const airline = await config.flightSuretyApp.getAirline.call(config.thirdAirline);
  
    // Checks airline atributes
    assert.equal(airline[0], 'British Airways', 'Name is not empty');
    assert.equal(airline[1], true, 'British Airways airline not registered');
  });

  it('(airline) add initial funds to third Airline', async () => {
    
    await config.flightSuretyApp.fund({from: config.thirdAirline, value: airlineInitialFund});
    const airline = await config.flightSuretyApp.getAirline.call(config.thirdAirline);

    assert.equal(airline[0], 'British Airways', 'Incorret name of second airline');
    assert.equal(airline[1], true, 'British Airways airline not registered');
    assert.equal(airline[2], airlineInitialFund, "British Airways airline should have funds");
  });

  it('(airline) second Airline register fourth Airline', async () => {
    
    await config.flightSuretyApp.registerAirline('Air India', config.fourthAirline, {from: config.secondAirline});
    const airline = await config.flightSuretyApp.getAirline.call(config.fourthAirline);
  
    // Checks airline atributes
    assert.equal(airline[0], 'Air India', 'Name is not empty');
    assert.equal(airline[1], true, 'Air India airline not registered');
  });

  it('(airline) add initial funds to fourth Airline', async () => {
    
    await config.flightSuretyApp.fund({from: config.fourthAirline, value: airlineInitialFund});
    const airline = await config.flightSuretyApp.getAirline.call(config.fourthAirline);

    assert.equal(airline[0], 'Air India', 'Incorret name of second airline');
    assert.equal(airline[1], true, 'Air India airline not registered');
    assert.equal(airline[2], airlineInitialFund, "Air India airline should have funds");
  });
  
  it('(multiparty) (airline) fourth Airline register fifth Airline', async () => {
    
    await config.flightSuretyApp.registerAirline('Ethihad', config.fifthAirline, {from: config.fourthAirline});
    const airline = await config.flightSuretyApp.getAirline.call(config.fifthAirline);
  
    // Checks airline atributes
    assert.equal(airline[0], '', 'Name is not empty');
    assert.equal(airline[1], false, 'Ethihad airline registered');
  });

  it('(multiparty) (airline) third Airline register fifth Airline', async () => {
    
    await config.flightSuretyApp.registerAirline('Ethihad', config.fifthAirline, {from: config.thirdAirline});
    const airline = await config.flightSuretyApp.getAirline.call(config.fifthAirline);
  
    // Checks airline atributes
    assert.equal(airline[0], 'Ethihad', 'Name is not empty');
    assert.equal(airline[1], true, 'Ethihad airline registered');
  });
  
  it('(multiparty) (airline) add initial funds to fifth Airline', async () => {
    
    await config.flightSuretyApp.fund({from: config.fifthAirline, value: airlineInitialFund});
    const airline = await config.flightSuretyApp.getAirline.call(config.fifthAirline);

    assert.equal(airline[0], 'Ethihad', 'Incorret name of second airline');
    assert.equal(airline[1], true, 'Ethihad airline not registered');
    assert.equal(airline[2], airlineInitialFund, "Ethihad airline should have funds");
  });

  it("(insuree) insuree buy flight insurance", async () => {
    let beforeBalance = await web3.eth.getBalance(config.passengerOne);
    await config.flightSuretyApp.buy(config.fifthAirline, lateFlight, timestamp, {from: config.passengerOne, value: oneEther, gasPrice:0});
    // Checks passenger balance
    let balance = await config.flightSuretyData.getInsureeBalance(config.passengerOne);
    console.log(balance);
    let afterBalance = await web3.eth.getBalance(config.passengerOne);
    assert(parseInt(beforeBalance) > parseInt(afterBalance), "Balance incorrect!");
  });

  it("(insuree) insuree withdraw flight insurance", async () => {
    let beforeBalance = await web3.eth.getBalance(config.passengerOne);
    await config.flightSuretyApp.processFlightStatus(config.fifthAirline, lateFlight, timestamp, 20);
    let balance = await config.flightSuretyData.getInsureeBalance(config.passengerOne);
    console.log(balance);
    await config.flightSuretyApp.withdraw({from: config.passengerOne});
    // Checks passenger balance
    let afterBalance = await web3.eth.getBalance(config.passengerOne);
    assert(parseInt(beforeBalance) < parseInt(afterBalance), "Balance incorrect!");
  });

});