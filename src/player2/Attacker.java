package player2;

import bugwars.*;

//Every unit except queens
public abstract class Attacker extends Unit {
    boolean inCombat;

    @Override
    protected void PickTarget() {
        int minHP = Integer.MAX_VALUE;
        Location minLoc = null;
        for (UnitInfo enemy: enemyUnits) {
            if (enemy.getHealth() < minHP) {
                minHP = enemy.getHealth();
                minLoc = enemy.getLocation();
            }
        }
        if (minLoc == null) {
            target = uc.getEnemyQueensLocation()[0];
        } else {
            target = minLoc;
        }
    }


    protected void AttackEnemy() {
        if (!uc.canAttack()) return;
        int minEnemyHP = Integer.MAX_VALUE;
        Location minEnemyLoc = null;
        for (UnitInfo unitInfo : enemyUnits) {
            if (uc.canAttack(unitInfo)) {
                if (unitInfo.getHealth() < minEnemyHP) {
                    minEnemyHP = unitInfo.getHealth();
                    minEnemyLoc = unitInfo.getLocation();
                }
            }
        }
        if (minEnemyLoc != null) {
            uc.attack(minEnemyLoc);
        }
    }

    protected void AttackRock() {
        if (!uc.canAttack()) return;
        if (enemyUnits.length > 0) return;
        RockInfo[] rocks = uc.senseObstacles();
        int minRockHP = Integer.MAX_VALUE;
        Location minRockLoc = null;
        for (RockInfo rockInfo : rocks) {
            if (uc.canAttack(rockInfo)) {
                if (rockInfo.getDurability() < minRockHP) {
                    minRockHP = rockInfo.getDurability();
                    minRockLoc = rockInfo.getLocation();
                }
            }
        }
        if (minRockLoc != null) {
            uc.attack(minRockLoc);
        }
    }


    protected abstract void Attack();

    protected void ExecuteSpecialMechanics() {
        Attack();
    }



}
