package playermaster;

import bugwars.*;

public class UnitPlayer {

    public void run(UnitController uc) {
        if (uc.getType() == UnitType.ANT){
            new Ant().run(uc);
        } else if (uc.getType() == UnitType.BEE){
            new Bee().run(uc);
        } else if (uc.getType() == UnitType.BEETLE){
            new Beetle().run(uc);
        } else if (uc.getType() == UnitType.QUEEN){
            new Queen().run(uc);
        } else if (uc.getType() == UnitType.SPIDER){
            new Spider().run(uc);
        }
    }
}
