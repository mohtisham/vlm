pragma solidity ^0.4.0;
/**
 * The PlatoonManagement contract does this and that...
 */
contract PlatoonManagement {

	function PlatoonManagement () {
		struct Platoon {
			address addr;
			uint depositAmount;
			uint entryTime;
			uint positionInPlatoon;
		}
	}

	uint platoons;
	mapping (uint => Platoon) platoons;
	
	function joinPlatoon () returns(bool res) {
		uint msg.sender.reputation = 10; /*Just for testing, query this from somewhere*/'
		if (msg.sender.reputation > 5){
			/*joining*/
			uint curNumTrucks = platoons.length;
			uint newNumTrucks = curNumTrucks + 1;

			address addr = msg.sender;
			uint depositAmount = 5;
			uint entryTime = block.timestamp;
			uint positionInPlatoon = newNumTrucks;
			platoons[curNumTrucks] = Platoon(addr, depositAmount, entryTime, positionInPlatoon);
		} else {
			/*not joining*/
			revert();
		}
		return true;
	}

	function leavePlatoon () returns(bool res) {
		/*Pay according to time spend in the platoon.*/
		for (uint i = 0; i < platoons.length; i++) {
			Platoon storage p = platoons[i];
			if(msg.sender = platoons[i].addr){
				if(platoons[i].positionInPlatoon = 1){
					fullCheck(); /*implement this*/
				} else {
					uint timeInPlatoon = (block.timestamp - platoons[i].entryTime);
					uint paymentAmount = timeInPlatoon / 100;
					/*Transfer funds from leaving truck to leading truck*/
					platoons[i].depositAmount -= paymentAmount;
					platoons[0].depositAmount += paymentAmount;
					/*Transfer remaining deposit to the address of the leaving truck*/
					Sent(this, platoons[i].addr, platoons[i].depositAmount);
				}
				return true;
			}
			return false;
		}
		return true;
	}
}