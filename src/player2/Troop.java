package player2;

import bugwars.*;

public abstract class Troop extends Attacker {
    abstract int GetCellValue(UnitType unitType, int dx, int dy);

    protected void MoveCombat() {
        int bestDirValue = Integer.MIN_VALUE;
        Direction bestDir = null;
        for(Direction direction: Direction.values()) {
            if (!uc.canMove(direction)) continue;
            int dirValue = 0;
            Location newLoc = myLoc.add(direction);
            for (UnitInfo enemy: enemyUnits) {
                int dx = Math.abs(newLoc.x = enemy.getLocation().x);
                int dy = Math.abs(newLoc.y = enemy.getLocation().y);
                dirValue += GetCellValue(enemy.getType(), dx, dy);
            }
            if (dirValue > bestDirValue) {
                bestDirValue = dirValue;
                bestDir = direction;
            }
        }
        if (bestDir != null) uc.move(bestDir);
    }

    @Override
    protected void Move() {
        if (inCombat) MoveCombat();
        else travel.TravelTo(target);
    }
}
