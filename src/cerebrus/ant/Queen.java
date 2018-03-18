package cerebrus.ant;

import navgame.Direction;
import navgame.UnitController;
import navgame.UnitInfo;
import navgame.UnitType;

/**
 * Created by Ivan on 2/4/2018.
 */
public class Queen {

    Bugpath bugpath;
    int contUnit;
    int mine_index;
    Messaging mes;
    UnitController uc;

    Direction[] directions = {
            Direction.NORTH, Direction.NORTHWEST, Direction.WEST, Direction.SOUTHWEST,
            Direction.SOUTH, Direction.SOUTHEAST, Direction.EAST, Direction.NORTHEAST
    };

    UnitType getType(){
        if (contUnit%6 == 0) return UnitType.BEE;
        else if (contUnit%6 == 2) return UnitType.BEETLE;
        else if (contUnit%6 == 4 || contUnit%6 == 5) return UnitType.SPIDER;
        int mine_number = uc.read(mes.FIRST_MINING_MESSAGE);
        if (mine_number == 0){
            ++contUnit;
            return getType();
        }
        boolean adv = false;
        int i = mine_index;
        for (; (!adv || mine_index != i) && uc.getEnergyUsed() < 8000; ){
            Target target2 = mes.getTarget(uc.read(mes.FIRST_MINING_MESSAGE + i + 1));
            if (!mes.isMineFree(target2.loc)){
                ++i;
                if (i >= mine_number) i = 0;
                continue;
            }
            return UnitType.ANT;
        }
        mine_index = i;

        ++contUnit;
        return getType();
    }

    void run(UnitController _uc) {

        uc = _uc;
        bugpath = new Bugpath(uc);
        contUnit = 0;
        mine_index = 0;
        mes = new Messaging(uc);


        while (true) {

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

            UnitType type = getType();

            for (int i = 0; i < 8; ++i) {
                if (uc.canSpawn(directions[i], type)) {
                    uc.spawn(directions[i], type);
                    ++contUnit;
                }
            }

            UnitInfo[] units = uc.senseUnits(uc.getType().getHealingRangeSquared());
            for (int i = 0; i < units.length; ++i){
                if (uc.canHeal(units[i]) && units[i].getHealth() < units[i].getType().getMaxHealth()){
                    uc.heal(units[i]);
                }
            }

            mes.putVisibleMines();



            // End turn
            uc.yield();
        }
    }

}
