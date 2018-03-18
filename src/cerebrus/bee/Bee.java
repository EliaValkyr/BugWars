package cerebrus.bee;

import navgame.Location;
import navgame.UnitController;

/**
 * Created by Ivan on 2/4/2018.
 */
public class Bee {

    Bugpath bugPath;
    UnitController uc;

    void run(UnitController _uc){
        uc = _uc;
        BasicCombatUnit basicCombatUnit = new BasicCombatUnit(uc);
        bugPath = new Bugpath(uc);
        Location target = null;

        while (true) {
            basicCombatUnit.getBestTarget();
            target = basicCombatUnit.bestTarget == null ? null : basicCombatUnit.bestTarget.loc;
            if (target == null && uc.getRound() > 500) target = basicCombatUnit.getClosestQueen();
            if (uc.getRound() > 2300) target = basicCombatUnit.getClosestQueen();


            basicCombatUnit.tryAttack();

            if (uc.canMove()){
                bugPath.fightMove();
                if (!bugPath.moveTo(target)) {
                    bugPath.safeMove();
                }
            }

            basicCombatUnit.tryAttack();
            basicCombatUnit.tryAttackRock();

            uc.yield();
        }
    }
}
