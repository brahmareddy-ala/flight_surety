# flight_surety

FlightSurety is a sample application project for Flight Delay Insurance for Passengers.

This repository contains Smart Contract code in Solidity (using Truffle), tests (also using Truffle), dApp scaffolding (using HTML, CSS and JS) and server app scaffolding.

To install, download or clone the repo, then:
--> npm install 
--> truffle compile

Develop Client:

To run truffle tests:
--> truffle test ./test/flightSurety.js 
--> truffle test ./test/oracles.js

To use the dapp:
--> truffle migrate
--> npm run dapp

To view dapp:
http://localhost:8000

Develop Server:
--> npm run server
--> truffle test ./test/oracles.js

Deploy:
To build dapp for prod:
--> npm run dapp:prod

Deploy the contents of the ./dapp folder

Libraries used in this project:

Truffle v5.1.15 (core: 5.1.15)

Solidity - ^0.6.0 (solc-js)

Node v10.16.3

Web3.js v1.2.1

openzeppelin-solidity ^3.0.0-beta.0
