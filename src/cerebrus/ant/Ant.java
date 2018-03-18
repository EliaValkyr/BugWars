package cerebrus.ant;

import navgame.*;

/**
 * Created by Ivan on 2/26/2018.
 */
public class Ant {

    final int offset = 10;

    Bugpath bugPath;
    UnitController uc;
    int mine_index = 0;
    BasicCombatUnit basicCombatUnit;

    Target target = null;

    void run(UnitController _uc){
        uc = _uc;
        basicCombatUnit = new BasicCombatUnit(uc);
        bugPath = new Bugpath(uc);

        while (true) {
            basicCombatUnit.getBestTarget();
            getTarget();

            basicCombatUnit.tryAttack();

            //if (target == null && uc.getRound() < 600)uc.println("NULL TARGET FOR ANT");
            //else if (uc.getRound() < 600){
                //String sx = ((Integer) uc.getLocation().x).toString();
                //String sy = ((Integer) uc.getLocation().y).toString();

                //String ssx = ((Integer) target.loc.x).toString();
                //String ssy = ((Integer) target.loc.y).toString();
                //uc.println("Got target at: " + ssx + " " + ssy);
                //uc.println("While I'm at: " + sx + " " + sy);
            //}

            if (uc.canMove()) {
                bugPath.fightMove();
                if (target != null) bugPath.moveTo(target.loc);
                bugPath.safeMove();
            }

            tryMine();

            basicCombatUnit.tryAttack();
            basicCombatUnit.tryAttackRock();

            basicCombatUnit.mes.putMyLocation();
            basicCombatUnit.mes.putVisibleMines();

            uc.yield();
        }
    }

    void getTarget(){
        if (target != null){
            if (target.loc.distanceSquared(uc.getLocation()) <= 24) target = null;
        }
        Messaging mes = basicCombatUnit.mes;

        FoodInfo[] food = uc.senseFood();
        for (int i = 0; i < food.length && uc.getEnergyUsed() < 8000; ++i){
            int d = food[i].location.distanceSquared(uc.getLocation());
            if (target == null) {
                target = new Target(food[i].location, mes.MINE, food[i].food, mes);
                continue;
            }
            if (food[i].food*food[i].food*(target.loc.distanceSquared(uc.getLocation()) + offset) > target.value*target.value*(d+offset)){
                target = new Target(food[i].location, mes.MINE, food[i].food, mes);
            }
        }

        int mine_number = uc.read(mes.FIRST_MINING_MESSAGE);
        if (mine_number == 0) return;
        boolean adv = false;
        int i = mine_index;
        for (; (!adv || mine_index != i) && uc.getEnergyUsed() < 10000; ){
            adv = true;
            Target target2 = mes.getTarget(uc.read(mes.FIRST_MINING_MESSAGE + i + 1));
            int d = target2.loc.distanceSquared(uc.getLocation());
            if (d <= 24){
                ++i;
                if (i >= mine_number) i = 0;
                continue;
            }
            if (d > 36 && !mes.isMineFree(target2.loc)){
                ++i;
                if (i >= mine_number) i = 0;
                continue;
            }
            if (target == null) {
                target = target2;
                ++i;
                if (i >= mine_number) i = 0;
                continue;
            }

            if (target2.value*target2.value*(target.loc.distanceSquared(uc.getLocation())+offset) > target.value*target.value*(d+offset)) target = target2;

            ++i;
            if (i >= mine_number) i = 0;
        }
        mine_index = i;
    }

    void tryMine(){
        FoodInfo[] food = uc.senseFood(uc.getType().getMiningRangeSquared());
        FoodInfo bestFood = null;
        for (int i = 0; i < food.length && uc.getEnergyUsed() < 12000; ++i){
            if (bestFood == null || bestFood.food < food[i].food) bestFood = food[i];
        }
        if (bestFood != null) uc.mine(bestFood.location);
    }

}
