package firstbot.firstversion;

import navgame.UnitController;

public class UnitPlayer {

    public void run(UnitController uc) throws InterruptedException {
	/*Insert here the code that should be executed only at the beginning of the unit's lifespan*/

        while (true){
			/*Insert here the code that should be executed every round*/

            uc.yield(); //End of turn
        }

    }
}
