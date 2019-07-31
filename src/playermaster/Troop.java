package playermaster;

import bugwars.*;

public abstract class Troop extends Attacker {
    abstract int GetCellValue(UnitType unitType, int dx, int dy);

    private Location FindSpider() {
		for (UnitInfo enemy: enemyUnits) {
			if (enemy.getType() == UnitType.SPIDER)
				return enemy.getLocation();
		}
		return null;
	}

    protected void MoveCombat() {
    	Location spiderLocation = FindSpider();
    	if (spiderLocation != null) {
    		Direction dir = myLoc.directionTo(spiderLocation);
    		if (uc.canMove(dir)) uc.move(dir);
		}
		for (UnitInfo enemy: enemyUnits) {
			Direction dir = myLoc.directionTo(enemy.getLocation());
			if (uc.canMove(dir)) uc.move(dir);
		}
    }

    @Override
    protected void Move() {
    	if (!uc.canMove()) return;
        if (inCombat) MoveCombat();
        else travel.TravelTo(target, obstacles);
    }

    @Override
	protected void InitTurn() {
    	super.InitTurn();
    	inCombat = enemyUnits.length > 0;
	}
}
