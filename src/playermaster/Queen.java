package playermaster;

import bugwars.*;

public class Queen extends Unit{
    boolean leader = false;

    int initQueueIndex = 0;
    UnitType[] initQueue = new UnitType[]{
            UnitType.ANT,
            UnitType.BEETLE,
            UnitType.ANT,
            UnitType.BEETLE
    };
    int cyclicQueueIndex = 0;
    UnitType[] cyclicQueue = new UnitType[] {
            UnitType.BEETLE,
            UnitType.BEE,
            UnitType.BEETLE,
			UnitType.ANT,
            UnitType.BEE,
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
        if (leader && round % 100 == 0) uc.println("Round " + round);
    }

    @Override
    protected void ReadMessages() {

    }

	// Value of healing an allyunit of the given type
	private int GetAllyUnitTypeHealValue(UnitType type) {
		if (type == UnitType.BEETLE) return 4;
		if (type == UnitType.ANT) return 3;
		if (type == UnitType.BEE) return 2;
		if (type == UnitType.SPIDER) return 5;
		return 0;
	}

	private UnitInfo CompareTargetsToHeal(UnitInfo u1, UnitInfo u2) {
		if (u1 == null) return u2;
		if (u2 == null) return u1;

		// Compare by type.
		int u1TypeValue = GetAllyUnitTypeHealValue(u1.getType());
		int u2TypeValue = GetAllyUnitTypeHealValue(u2.getType());
		if (u1TypeValue != u2TypeValue)
			return u1TypeValue > u2TypeValue ? u1 : u2;

		// Lowest health
		int u1Health = u1.getHealth();
		int u2Health = u2.getHealth();
		if (u1Health != u2Health)
			return u1Health < u2Health ? u1 : u2;

		// Unit furthest away
		int u1Distance = myLoc.distanceSquared(u1.getLocation());
		int u2Distance = myLoc.distanceSquared(u2.getLocation());
		if (u1Distance != u2Distance)
			return u1Distance > u2Distance ? u1 : u2;

		return u1;
	}

    private void Heal() {
        if (!uc.canHeal()) return;

		UnitInfo bestUnit = null;
		for (UnitInfo unitInfo : myUnits) {
			if (!uc.canHeal(unitInfo)) break;
			bestUnit = CompareTargetsToHeal(bestUnit, unitInfo);
		}
		if (bestUnit != null) {
			uc.heal(bestUnit);
		}
    }

    private boolean TrySpawnDirection(UnitType type, Direction direction, boolean inInitQueue) {
		if (uc.canSpawn(direction, type)) {
			int channel = -1;
			if (type == UnitType.BEETLE) channel = comm.SPAWNING_BEETLES_CHANNEL;
			else if (type == UnitType.ANT) channel = comm.SPAWNING_ANTS_CHANNEL;
			else if (type == UnitType.BEE) channel = comm.SPAWNING_BEES_CHANNEL;
			else if (type == UnitType.SPIDER) channel = comm.SPAWNING_SPIDERS_CHANNEL;
			comm.SendCyclicMessage(channel, uc.getType().ordinal(), myLoc, round + GameConstants.COCOON_TURNS);
			uc.spawn(direction, type);
			if (inInitQueue) initQueueIndex++;
			else cyclicQueueIndex = (cyclicQueueIndex + 1) % cyclicQueue.length;
			return true;
		}
		return false;
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

        if (uc.getResources() < unitToSpawn.cost) return;

		Direction mainDir = target == null ? myLoc.directionTo(uc.getEnemyQueensLocation()[0]) : myLoc.directionTo(target);
		Direction[] dirs = Utils.GetDirectionsOrderedByClosest(mainDir);
		for (int i = 1; i < dirs.length; ++i) {
			TrySpawnDirection(unitToSpawn, dirs[i], inInitQueue);
		}
		// We don't want to spawn right at the target direction, so we check it at the end.
		TrySpawnDirection(unitToSpawn, dirs[0], inInitQueue);
    }

    @Override
    protected void ExecuteSpecialMechanics(boolean firstTime){
        Heal();
        if (!firstTime) Spawn(); // This hopefully spawns units 1 closer to the target.
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
		myLoc = uc.getLocation();
    }


}
