package cerebrus.beetle;

import navgame.Direction;
import navgame.UnitController;
import navgame.UnitType;

public class UnitPlayer {
	
	int t;
	
	public UnitPlayer() {
		t = 0;
	}
	
	public void run(UnitController uc) throws InterruptedException {

		UnitType type = uc.getType();

		if (type == UnitType.QUEEN){
			Queen queen = new Queen();
			queen.run(uc);
		} else if (type == UnitType.BEETLE){
			Beetle beetle = new Beetle();
			beetle.run(uc);
		} else if (type == UnitType.BEE){
			Bee bee = new Bee();
			bee.run(uc);
		} else{
			Spider spider = new Spider();
			spider.run(uc);
		}

	}

	@SuppressWarnings("null")
	void peta(UnitController uc){
		uc.println("peta");
		Direction a = null;
		a = a.rotateRight();
	}

}

