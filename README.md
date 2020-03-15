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

"openzeppelin-solidity": "^3.0.0-beta.0",

"rimraf": "^3.0.2",

"solc": "0.6.0",

"truffle": "5.1.15",

"truffle-assertions": "^0.9.2",

"truffle-hdwallet-provider": "1.0.2",

"web3": "^1.2.6",

"webpack": "^4.35.2",

"webpack-cli": "^3.3.6",

"webpack-dev-server": "3.7.2",

"webpack-node-externals": "1.7.2",

"mkdirp": "^1.0.3"
