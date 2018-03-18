package cerebrus.ant;

import navgame.Direction;
import navgame.UnitController;
import navgame.UnitType;

public class UnitPlayer {
	
	public void run(UnitController uc) throws InterruptedException {

		UnitType type = uc.getType();

		try {
			if (type == UnitType.QUEEN) {
				Queen queen = new Queen();
				queen.run(uc);
			} else if (type == UnitType.BEETLE) {
				Beetle beetle = new Beetle();
				beetle.run(uc);
			} else if (type == UnitType.BEE) {
				Bee bee = new Bee();
				bee.run(uc);
			} else if (type == UnitType.SPIDER) {
				Spider spider = new Spider();
				spider.run(uc);
			} else if (type == UnitType.ANT) {
				Ant ant = new Ant();
				ant.run(uc);
			}
		} catch (Exception e){

		}

	}

}

