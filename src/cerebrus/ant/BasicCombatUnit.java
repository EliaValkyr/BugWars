package cerebrus.ant;

import navgame.Location;
import navgame.RockInfo;
import navgame.UnitController;
import navgame.UnitInfo;

import java.util.HashSet;

/**
 * Created by Ivan on 2/14/2018.
 */
public class BasicCombatUnit {

    Target bestTarget;
    int lastMessageRead;
    Messaging mes;
    UnitController uc;

    BasicCombatUnit(UnitController _uc){
        uc = _uc;
        mes = new Messaging(_uc);
        lastMessageRead = uc.read(mes.MAX_CYCLE);
    }

    void getBestTarget(){
        bestTarget = null;
        Location myLoc = uc.getLocation();

        HashSet<Integer> readMessages = new HashSet<>();
        while (lastMessageRead != uc.read(mes.MAX_CYCLE) && uc.getEnergyUsed() < 2500){
            int code = uc.read(lastMessageRead);
            readMessages.add(code);
            Target newTarget = mes.getTarget(code);
            if (newTarget.isBetterThan(bestTarget, myLoc)) bestTarget = newTarget;
            lastMessageRead++;
            if (lastMessageRead >= mes.MAX_CYCLE) lastMessageRead = 0;
        }

        UnitInfo[] enemies = uc.senseUnits(uc.getInfo().getType().getSightRangeSquared(), uc.getTeam().getOpponent());

        for (int i = 0; i < enemies.length && uc.getEnergyUsed() < 4000; ++i){
            if (uc.isObstructed(myLoc, enemies[i].getLocation())) continue;
            Target newTarget = new Target(mes, enemies[i]);
            if (newTarget.isBetterThan(bestTarget, myLoc)) bestTarget = newTarget;
            int code = newTarget.encode();
            if (!readMessages.contains(code)) {
                mes.sendMessage(code);
            }
        }

        lastMessageRead = uc.read(mes.MAX_CYCLE);
    }

    void tryAttack(){
        if (!uc.canAttack()) return;
        int bestIndex = -1;
        int leastHP = 1000;
        UnitInfo[] units = uc.senseUnits(uc.getType().getAttackRangeSquared(), uc.getTeam().getOpponent());
        for (int i = 0; i < units.length; ++i) {
            if(!uc.canAttack(units[i])) continue;
            if (units[i].getHealth() < leastHP){
                leastHP = units[i].getHealth();
                bestIndex = i;
            }
        }
        if (bestIndex >= 0) uc.attack(units[bestIndex]);
    }

    void tryAttackRock(){
        if (!uc.canAttack()) return;
        int bestIndex = -1;
        int leastDurability = 10000;
        RockInfo[] rocks = uc.senseObstacles(uc.getType().getAttackRangeSquared());
        for (int i = 0; i < rocks.length; ++i) {
            if(!uc.canAttack(rocks[i])) continue;
            if (rocks[i].getDurability() < leastDurability && rocks[i].getDurability() > 0){
                leastDurability = rocks[i].getDurability();
                bestIndex = i;
            }
        }
        if (bestIndex >= 0) uc.attack(rocks[bestIndex]);
    }

    Location getClosestQueen(){
        Location[] queens = uc.getEnemyQueensLocation();
        if (queens.length <= 0) return null;
        int bestQueen = 0;
        Location myLoc = uc.getLocation();
        int bestDist = myLoc.distanceSquared(queens[0]);
        for (int i = 1; i < queens.length; ++i){
            int d = myLoc.distanceSquared(queens[i]);
            if (bestDist > d){
                bestQueen = i;
                bestDist = d;
            }
        }
        return queens[bestQueen];
    }

}
