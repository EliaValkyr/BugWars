package playermaster;

import bugwars.*;

public class Bee extends Troop {

	@Override
	protected void InitTurn() {
		comm.Increment(comm.BEE_COUNT_CHANNEL);
		super.InitTurn();
	}
}
