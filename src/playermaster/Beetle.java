package playermaster;


import bugwars.*;

public class Beetle extends Troop {

	@Override
	protected void InitTurn() {
		comm.Increment(comm.BEETLE_COUNT_CHANNEL);
		super.InitTurn();
	}
}
