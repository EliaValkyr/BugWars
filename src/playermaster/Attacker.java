package playermaster;

import bugwars.*;

//Every unit except queens
public abstract class Attacker extends Unit {

    @Override
    protected void PickTargetToMove() {
		UnitInfo bestUnit = null;
		for (UnitInfo unitInfo : enemyUnits) {
			bestUnit = CompareEnemyTargets(bestUnit, unitInfo);
		}
		target = bestUnit != null ? bestUnit.getLocation() : uc.getEnemyQueensLocation()[0];
    }

    // Value of attacking a unit of the given type
    private int GetEnemyUnitTypeAttackValue(UnitType type) {
    	if (type == UnitType.BEETLE) return 3;
    	if (type == UnitType.ANT) return 2;
    	if (type == UnitType.BEE) return 4;
    	if (type == UnitType.SPIDER) return 5;
    	if (type == UnitType.QUEEN) return 1;
    	return 0;
	}

    private UnitInfo CompareEnemyTargets(UnitInfo u1, UnitInfo u2) {
    	if (u1 == null) return u2;
    	if (u2 == null) return u1;

    	// Compare by type.
    	int u1TypeValue = GetEnemyUnitTypeAttackValue(u1.getType());
    	int u2TypeValue = GetEnemyUnitTypeAttackValue(u2.getType());
    	if (u1TypeValue != u2TypeValue)
    		return u1TypeValue > u2TypeValue ? u1 : u2;

    	// Lowest health
		int u1Health = u1.getHealth();
		int u2Health = u2.getHealth();
		if (u1Health != u2Health)
			return u1Health < u2Health ? u1 : u2;

		// Closest unit
		int u1Distance = myLoc.distanceSquared(u1.getLocation());
		int u2Distance = myLoc.distanceSquared(u2.getLocation());
		if (u1Distance != u2Distance)
			return u1Distance < u2Distance ? u1 : u2;

		return u1;
	}

    protected void AttackEnemy() {
        if (!uc.canAttack()) return;
        UnitInfo bestUnit = null;
        for (UnitInfo unitInfo : enemyUnits) {
			if (uc.canAttack(unitInfo)) {
				bestUnit = CompareEnemyTargets(bestUnit, unitInfo);
			} else if (myLoc.distanceSquared(unitInfo.getLocation()) > uc.getType().attackRangeSquared)
				break;
        }
        if (bestUnit != null) {
            uc.attack(bestUnit.getLocation());
        }
    }

    boolean AttackRockTowardsTarget() {
    	if (target == null) return false;
    	if (myLoc.distanceSquared(target) > 100) return false;
    	Direction dirToTarget = myLoc.directionTo(target);
		Location rockLocation = myLoc.add(dirToTarget);
		RockInfo ri = uc.senseObstacle(rockLocation);
		if (ri != null && ri.getDurability() > 0 && uc.canAttack(ri)) {
			uc.attack(ri);
			return true;
		}
    	return false;
	}

    protected void AttackRock() {
        if (!uc.canAttack()) return;
        if (inCombat) return;
        if (AttackRockTowardsTarget()) return;
        int minRockHP = Integer.MAX_VALUE;
        Location minRockLoc = null;
        for (RockInfo rockInfo : obstacles) {
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

	protected void Attack() {
		AttackEnemy();
		AttackRock();
	}

    protected void ExecuteSpecialMechanics(boolean firstTime) {
        Attack();
    }

	@Override
    protected void ReadMessages() {

	}

}
