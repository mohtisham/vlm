pragma solidity ^0.4.0;
/**
 * The PlatoonManagement contract adds, tracks and compensates trucks in a platoon.
 */
contract PlatoonManagement {
	struct Platoon {
		address addr;
		uint depositAmount;
		uint entryTime;
	}
	
	uint collectedPayments;
	uint nextIndex = 0;
	Platoon[] public platoons;
	bool firstRun = true;
	
	function PlatoonManagement () public {}
    
    function() payable public {
        joinPlatoon();
    }
	
	function joinPlatoon() public returns(bool res) {
	    if(checkDoubleEntry()) {return false;}
	    if(checkSufficientDeposit()) {return false;}
		uint reputation = 10;
		/*Query the reputation from somewhere instead of hardcoding it*/
		if (reputation > 5){
		    /*joining*/
			address addr = msg.sender;
			uint depositAmount = msg.value;
			uint entryTime = block.timestamp;
			if (firstRun){nextIndex = 10; firstRun=false;}
			if(nextIndex==10){
    			platoons.push(Platoon(addr, depositAmount, entryTime));
			} else {
			    platoons[nextIndex] = Platoon(addr, depositAmount, entryTime);
			    nextIndex = 10;
			}
		} else {
		    /*not joining*/
			revert();
		}
		return true;
	}
    
	function leavePlatoon() public returns(bool res) {
	    /*Pay according to time spend in the platoon.*/
		for (uint i = 0; i < platoons.length; i++) {
			if(msg.sender == platoons[i].addr){
			    /*first guy leaving is special, he gets the funds of the contract*/
				uint paymentAmount = calculatePayment(i);
				platoons[i].depositAmount -= paymentAmount;
				platoons[0].depositAmount += paymentAmount;
				/*Transfer remaining deposit to the address of the leaving truck*/
				goodBey(i);
				return true;
			}
		}
		return false;
	}
	
	function calculatePayment(uint truckNumber) public returns(uint) {
	    uint timeInPlatoon = (block.timestamp - platoons[truckNumber].entryTime);
	    uint paymentAmount = timeInPlatoon;
	    return paymentAmount;
	}
	
	function checkDoubleEntry() public returns(bool) {
	    for(uint i = 0; i < platoons.length; i++) {
	        if (msg.sender == platoons[i].addr) {
	            platoons[i].depositAmount += msg.value;
	            return false;
	        }
	    }
	    return true;
	}
	
	function checkSufficientDeposit() public returns(bool) {
	    if(msg.value < .1*1000000000000000000){return false;}
	    return true;
	}
	
	function checkFunds() public {
	    for (uint i = 0; i < platoons.length; i++){
	        uint remainingBalance = platoons[i].depositAmount - calculatePayment(i);
	        if (remainingBalance < 1000000000000) {
	            goodBey(i);
	        }
	    }
	}
	
	function goodBey(uint i) public {
	    platoons[i].addr.transfer(platoons[i].depositAmount);
		nextIndex = i;
		delete platoons[i];
	}
	
}