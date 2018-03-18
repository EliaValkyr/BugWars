package grassmann.random;

import navgame.*;

public class UnitPlayer {
	
	public void run(UnitController uc) throws InterruptedException {

		UnitType type = uc.getType();
		Direction[] directions = {
			Direction.NORTH, Direction.NORTHWEST, Direction.WEST, Direction.SOUTHWEST,
			Direction.SOUTH, Direction.SOUTHEAST, Direction.EAST, Direction.NORTHEAST
		};
		UnitType[] spawnTypes  = {UnitType.BEE, UnitType.SPIDER, UnitType.BEETLE};

		
		
		while (true) {
			if (type == UnitType.QUEEN) {
				for (int i = 0; i < 8; ++i) {
					int newSpawn = (int)Math.floor(3.0f * Math.random());
					if (uc.canSpawn(directions[i], spawnTypes[newSpawn])) {
						uc.spawn(directions[i], spawnTypes[newSpawn]);
						break;
					}
				}
			} else {
				// Move to random direction
				for (int x = 0; x < 10 && uc.canMove(); ++x){
					int i = (int)Math.floor(8.0f * Math.random());
					if (uc.canMove(directions[i])) uc.move(directions[i]);
				}
				// Attack enemy
				UnitInfo[] sensedUnits = uc.senseUnits();
				for (UnitInfo unit : sensedUnits) {
					if (unit.getTeam() != uc.getTeam()) {
						if (uc.canAttack(unit)) {
							uc.attack(unit);
							break;
						}
					}
				}
			}
			uc.yield();
		}
	}
}
