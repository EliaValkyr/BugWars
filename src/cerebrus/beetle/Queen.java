package cerebrus.beetle;

import navgame.Direction;
import navgame.UnitController;
import navgame.UnitInfo;
import navgame.UnitType;

/**
 * Created by Ivan on 2/4/2018.
 */
public class Queen {

    Direction[] directions = {
            Direction.NORTH, Direction.NORTHWEST, Direction.WEST, Direction.SOUTHWEST,
            Direction.SOUTH, Direction.SOUTHEAST, Direction.EAST, Direction.NORTHEAST
    };

    void run(UnitController uc) {

        Bugpath bugpath = new Bugpath(uc);
        int contUnit = 0;


        while (true) {

            UnitType type = UnitType.BEETLE;
            for (int i = 0; i < 8; ++i) {
                if (uc.canSpawn(directions[i], type)) {
                    uc.spawn(directions[i], type);
                    ++contUnit;
                }
            }

            if (uc.canMove()){
                bugpath.fightMove();
                bugpath.safeMove();


                if (uc.canMove()) {
                    int start = (int) Math.floor(Math.random() * 8);
                    for (int i = 0; i < 8; ++i) {
                        if (uc.canMove(directions[start])) uc.move(directions[start]);
                        start++;
                        if (start >= 8) start = 0;
                    }
                }
            }

            UnitInfo[] units = uc.senseUnits(uc.getType().getHealingRangeSquared());
            for (int i = 0; i < units.length; ++i){
                if (uc.canHeal(units[i]) && units[i].getHealth() < units[i].getType().getMaxHealth()){
                    uc.heal(units[i]);
                }
            }



            // End turn
            uc.yield();
        }
    }

}
