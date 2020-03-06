pragma solidity >=0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    struct Airline {
        string name;
        bool isRegistered;
        uint256 funds;
    }

    address private contractOwner;
    address private appContractOwner;
    bool private operational = true;
    
    uint constant airlinesThreshold = 4;
    uint256 private airlinesCount = 0;
    mapping(address => Airline) private registeredAirlines;    
    mapping(address => uint256) private multiParty;
    mapping(address => address) private votedAddress;

    mapping(bytes32 => address[]) private flightInsurees;
    mapping(address => uint256) private insureesBalance;
    
    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor(address firstAirline, string memory name) public
    {
        contractOwner = msg.sender;
        _registerAirline(firstAirline, name);
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational()
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireAppContractOwner() {
        require(msg.sender == appContractOwner, "Caller is not App contract owner");
        _;
    }

    /**
     * @dev Modifier that requires the Airline be registered
     */
    modifier requireRegistredAirline(address airline) {
        require(registeredAirlines[airline].isRegistered == true, "Airline is not registered");
        _;
    }

    /**
     * @dev Modifier that requires the Airline has funds
     */
    modifier requireFundedAirline(address airline) {
        require(registeredAirlines[airline].funds >= (10 ether), "Airline has not enough fund");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */
    function isOperational() public view returns(bool)
    {
        return operational;
    }

    /**
     * Authorize application contract owner calls this contract. Only this address can call
     * data contract business methods.
     */
    function authorizeCaller(address _appContractOwner) external requireIsOperational requireContractOwner {
        appContractOwner = _appContractOwner;
    }

    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */
    function setOperatingStatus(bool mode) external
    requireContractOwner requireAppContractOwner
    {
        require(mode != operational, "New mode must be different from existing one");
        operational = mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */
    function registerAirline(address airline, string calldata name, address applicantAirline)
            external requireIsOperational requireAppContractOwner
                     requireRegistredAirline(airline) requireFundedAirline(airline) {
        if(airlinesCount > airlinesThreshold)
        {
            require(!(votedAddress[airline] == applicantAirline), "The airline is already voted to applicantAirline");
            multiParty[applicantAirline] += 1;
            votedAddress[airline] = applicantAirline;
            if(airlinesCount.mod(multiParty[applicantAirline]) == 0)
            {
                _registerAirline(applicantAirline, name);
                delete multiParty[applicantAirline];
                delete votedAddress[airline];
            }
        }
        else
        {
            _registerAirline(airline, name);
        }
    }

    function _registerAirline(address airlineAddr, string memory name) private {
        Airline memory airline = Airline(name, true, 0);
        airlinesCount++;
        registeredAirlines[airlineAddr] = airline;
    }

   /**
    * @dev Buy insurance for a flight
    *
    */
    function buy(address airline, string calldata flight, uint256 timestamp, address insuree)
            external payable requireIsOperational requireAppContractOwner {

        require(msg.value <= (1 ether), "Insufficient Funds");
        address(this).transfer(msg.value);

        bytes32 flightKey = getFlightKey(airline, flight, timestamp);
        flightInsurees[flightKey].push(insuree);
        insureesBalance[insuree] = msg.value;
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees(address airline, string calldata flight, uint256 timestamp, uint256 payableValue)
            external requireIsOperational requireAppContractOwner {
        bytes32 flightKey = getFlightKey(airline, flight, timestamp);
        for (uint256 i = 0; i < flightInsurees[flightKey].length; i++) {
            uint256 currentBalance = insureesBalance[flightInsurees[flightKey][i]];
            uint256 newBalance = currentBalance.mul(payableValue);
            insureesBalance[flightInsurees[flightKey][i]] = newBalance;
        }
        delete flightInsurees[flightKey];
    }

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay(address payable insuree) external payable requireIsOperational requireAppContractOwner
    {
        require(insureesBalance[insuree] > 0, "This insuree has no balance.");
        uint256 value = insureesBalance[insuree];
        insureesBalance[insuree] = 0;
        insuree.transfer(value);
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */
    function fund(address airline, uint256 value) external view requireIsOperational requireAppContractOwner
    requireRegistredAirline(airline)
    {
        registeredAirlines[airline].funds.add(value);
    }

    function getFlightKey(address airline, string memory flight, uint256 timestamp) internal pure returns(bytes32)
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
     * @dev Check Airline existance
     */
    function airlineExists(address airline) external view requireIsOperational requireAppContractOwner returns (bool) {
        return registeredAirlines[airline].isRegistered;
    }

    function getAirline(address airlineAddress) external view requireIsOperational requireAppContractOwner
                returns(string memory, bool, uint) {
        Airline memory airline = registeredAirlines[airlineAddress];
        return(airline.name, airline.isRegistered, airline.funds);
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    fallback() external payable
    {
        //fund();
    }
}