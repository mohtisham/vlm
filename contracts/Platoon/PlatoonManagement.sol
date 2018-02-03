pragma solidity ^0.4.0;
/**
 * The PlatoonManagement contract does this and that...
 */
contract PlatoonManagement {
	struct Platoon {
		address addr;
		uint depositAmount;
		uint entryTime;
		uint positionInPlatoon;
	}
	
	function PlatoonManagement () public {

	}

	Platoon[] public platoons; 
	function joinPlatoon () public returns(bool res) {
		/*Query the reputation from somewhere instead of hardcoding it*/
		uint reputation = 10;
		if (reputation > 5){
			/*joining*/
			address addr = msg.sender;
			uint depositAmount = 5;
			uint entryTime = block.timestamp;
			uint positionInPlatoon = platoons.length + 1;
			platoons.push(Platoon(addr, depositAmount, entryTime, positionInPlatoon));
		} else {
			/*not joining*/
			revert();
		}
		return true;
	}

	function leavePlatoon () public returns(bool res) {
		/*Pay according to time spend in the platoon.*/
		for (uint i = 0; i < platoons.length; i++) {
			if(msg.sender == platoons[i].addr){
				if(platoons[i].positionInPlatoon == 1){
					/*fullCheck(); implement this*/
				} else {
					uint timeInPlatoon = (block.timestamp - platoons[i].entryTime);
					uint paymentAmount = timeInPlatoon / 100;
					/*Transfer funds from leaving truck to leading truck*/
					platoons[i].depositAmount -= paymentAmount;
					platoons[0].depositAmount += paymentAmount;
					/*Transfer remaining deposit to the address of the leaving truck*/
					platoons[i].addr.transfer(platoons[i].depositAmount);
				}
				return true;
			}
			return false;
		}
		return true;
	}
}