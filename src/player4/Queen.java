package player4;

import bugwars.*;

public class Queen extends Unit{
    boolean leader = false;

    int initQueueIndex = 0;
    UnitType[] initQueue = new UnitType[]{
            UnitType.ANT,
            UnitType.BEETLE,
            UnitType.ANT,
            UnitType.BEETLE,
            UnitType.ANT,
    };
    int cyclicQueueIndex = 0;
    UnitType[] cyclicQueue = new UnitType[] {
            UnitType.BEETLE,
            UnitType.BEETLE,
            UnitType.BEETLE,
            UnitType.BEETLE,
            UnitType.ANT,
    };

    @Override
    protected void InitGame(UnitController _uc) {
        super.InitGame(_uc);
        myLoc = uc.getLocation();
        uc.println("My loc " + Utils.PrintLoc(myLoc));
        Location[] queens = uc.getMyQueensLocation();
        for (Location queen : queens)
            uc.println("Queen loc: " + Utils.PrintLoc(queen));

        if (Utils.SameLocation(uc.getMyQueensLocation()[0], myLoc)) {
            // I'm the first queen
            uc.write(comm.FIRST_QUEEN_X_CHANNEL, myLoc.x);
            uc.write(comm.FIRST_QUEEN_Y_CHANNEL, myLoc.y);
            comm.InitGame(uc, myLoc.x, myLoc.y);
            uc.println("Base location: " + Utils.PrintLoc(myLoc));
            leader = true;
        }
    }

    @Override
    protected void InitTurn() {
        super.InitTurn();
//        if (leader && round % 10 == 0) uc.println("Round " + round);
    }

    @Override
    protected void ReadMessages() {

    }

    private void Heal() {
        if (!uc.canHeal()) return;
        for (UnitInfo ally: myUnits) {
            if (myLoc.distanceSquared(ally.getLocation()) > GameConstants.QUEEN_HEALING_RANGE) return;
            if (ally.getHealth() < ally.getType().getMaxHealth() && uc.canHeal(ally)) {
                uc.heal(ally);
                return;
            }
        }
    }

    private void Spawn() {
        if (uc.hasSpawned()) return;
        UnitType unitToSpawn;
        boolean inInitQueue = false;
        if (initQueueIndex < initQueue.length) {
            inInitQueue = true;
            unitToSpawn = initQueue[initQueueIndex];
        }
        else {
            unitToSpawn = cyclicQueue[cyclicQueueIndex];
        }
        for(Direction dir : Direction.values()) {
            if (uc.canSpawn(dir, unitToSpawn)) {
                uc.spawn(dir, unitToSpawn);
                if (inInitQueue) initQueueIndex++;
                else cyclicQueueIndex = (cyclicQueueIndex + 1) % cyclicQueue.length;
            }
        }
    }

    @Override
    protected void ExecuteSpecialMechanics(){
        Heal();
        Spawn();
    }

    @Override
    protected void PickTargetToMove() {
        target = uc.getEnemyQueensLocation()[0];
    }

    @Override
    protected void Move() {
		if (!uc.canMove()) return;
		if (inCombat) {
			Direction dir = myLoc.directionTo(enemyUnits[0].getLocation()).opposite();
//			Location target = new Location(myLoc.x + dir.dx * 5, myLoc.y + dir.dy * 5);
			Location target = myLoc.add(dir).add(dir).add(dir).add(dir).add(dir);
			travel.TravelTo(target, obstacles);
		}
		else {
			travel.TravelTo(target, obstacles);
		}
    }


}
