import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational((error, result) => {
            //console.log(error,result);
            status('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });
    
        /*contract.authorizeCaller((error, result) => {
            //console.log(error,result);
            //status('Authorization Status', 'Check if contract is authorized', [ { label: 'Authorization Status', error: error, value: result.authorized} ]);
        });*/

        // User-submitted transaction
        /*DOM.elid('submit-funds').addEventListener('click', () => {
            let airlineAddress = DOM.elid('airline-address').value;
            let fundValue = DOM.elid('fund-value').value;
            // Write transaction
            contract.fund(airlineAddress, fundValue, (error, result) => {
                log('Airline', 'Add Funds', [ { label: 'Add Funds Status', error: error, value: result.airline + ' ' + result.amount } ]);
            });
        })

        // User-submitted transaction
        DOM.elid('submit-airline').addEventListener('click', () => {
            let airlineAddress = DOM.elid('airline-address').value;
            console.log(airlineAddress);
            let newAirlineAddress = DOM.elid('new-airline-address').value;
            let newAirlineName = DOM.elid('new-airline-name').value;
            // Write transaction
            contract.registerAirline(airlineAddress, newAirlineName, newAirlineAddress, (error, result) => {
                log('Airline', 'Register Airline', [ { label: 'New Airline Status', error: error, value: result.name } ]);
            });
        })*/

        // User-submitted transaction
        DOM.elid('submit-buy').addEventListener('click', () => {
            let flightInfo = DOM.elid('passenger-flight').value;            
            let flightNumber = flightInfo.split(" ")[0];
            let timestamp = flightInfo.split(" ")[1];
            let passengerAddress = DOM.elid('passenger-address').value;
            let insuranceValue = DOM.elid('insurance-value').value;
            // Write transaction
            contract.buy(flightNumber, timestamp, passengerAddress, insuranceValue, (error, result) => {
                log('Flight', 'Buy Insurance', [ { label: 'Buy Insurance', error: error, value: result.insuree + ' ' + result.value } ]);
            });
        })

        // User-submitted transaction
        DOM.elid('submit-credit').addEventListener('click', () => {
            let passengerAddress = DOM.elid('withdraw-passenger-address').value;
            // Write transaction
            contract.credit(passengerAddress, (error, result) => {
                log('Passenger', 'Show Credit', [ { label: 'Credit', error: error, value: result } ]);
            });
        })

        // User-submitted transaction
        DOM.elid('submit-withdraw').addEventListener('click', () => {
            let passengerAddress = DOM.elid('withdraw-passenger-address').value;
            // Write transaction
            contract.withdraw(passengerAddress, (error, result) => {
                log('Passenger', 'Claim Insurance', [ { label: 'Insurance', error: error, value: result.passenger } ]);
            });
        })

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flightInfo = DOM.elid('oracles-flight').value;            
            let flightNumber = flightInfo.split(" ")[0];
            let timestamp = flightInfo.split(" ")[1];
            // Write transaction
            contract.fetchFlightStatus(flightNumber, timestamp, (error, result) => {
                log('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })
    });
    

})();


function status(title, description, results) {
    displayDiv("display-status", title, description, results);
}

function log(title, description, results) {
    displayDiv("display-log", title, description, results);
}

function displayDiv(divId, title, description, results) {
    let div = DOM.elid(divId);
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    div.append(section);

}
