package playermaster;


import bugwars.*;

public class Spider extends Troop {

	@Override
	protected void InitTurn() {
		comm.Increment(comm.SPIDER_COUNT_CHANNEL);
		super.InitTurn();
	}
}
