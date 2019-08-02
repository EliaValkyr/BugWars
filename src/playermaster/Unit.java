package playermaster;

import bugwars.*;

import java.util.Set;
import java.util.TreeSet;

public abstract class Unit {
    UnitController uc;
    Travel travel;
    Communication comm;
    protected Team myTeam;
    protected Team enemyTeam;

    protected UnitInfo[] myUnits;
    protected UnitInfo[] enemyUnits;
    protected RockInfo[] obstacles;
    protected FoodInfo[] cookies;
	boolean inCombat;

    protected Location myLoc;
    protected Location target;
    protected Location[] enemyQueensStartingLocations;

	int initialMessageSpawningAnt = 0;
	int initialMessageSpawningBeetle = 0;
	int initialMessageSpawningBee = 0;
	int initialMessageSpawningSpider = 0;

    int round = 0;
    int myId;

    Set<Integer> readFoodLocations;

    protected void InitGame(UnitController _uc) {
        uc = _uc;
        myId = uc.getInfo().getID();
        travel = new Travel();
        travel.InitGame(uc);
        comm = new Communication();
        int xBase = uc.read(comm.FIRST_QUEEN_X_CHANNEL);
        int yBase = uc.read(comm.FIRST_QUEEN_Y_CHANNEL);
        comm.InitGame(uc, xBase, yBase);
        myTeam = uc.getTeam();
        enemyTeam = uc.getOpponent();
        enemyQueensStartingLocations = uc.getEnemyQueensLocation();
    }

	private int UpdateUnitCount(int lastRoundChannel, int countChannel, int spawningChannel, int baseSpawningCyclicChannel, int initialMessage) {
    	uc.write(lastRoundChannel, uc.read(countChannel));
		uc.write(countChannel, 0);
		int lastMessage = uc.read(baseSpawningCyclicChannel + comm.CYCLIC_CHANNEL_LENGTH);
		int i = initialMessage;
		int MAX_BYTECODE = 800;
		int initBytecode = uc.getEnergyUsed();
		while (i != lastMessage) {
			if (i >= comm.CYCLIC_CHANNEL_LENGTH) i -= comm.CYCLIC_CHANNEL_LENGTH; //this should go at the end
			if (i == lastMessage) break;
			if (uc.getEnergyUsed() - initBytecode > MAX_BYTECODE) break;
			CyclicMessage message = comm.ReadCyclicMessage(baseSpawningCyclicChannel + i);
			int spawningRound = message.value;
			if (spawningRound < round) initialMessage++;
			i++;
		}
		int spawningUnits = lastMessage - initialMessage;
		if (spawningUnits < 0) spawningUnits += comm.CYCLIC_CHANNEL_LENGTH;
		uc.write(spawningChannel, spawningUnits);
		return initialMessage;
	}

	private void UpdateUnitCount() {
		initialMessageSpawningAnt = UpdateUnitCount(comm.ANT_LAST_ROUND_CHANNEL, comm.ANT_COUNT_CHANNEL,
				comm.ANT_SPAWNING_COUNT_CHANNEL, comm.SPAWNING_ANTS_CHANNEL, initialMessageSpawningAnt);
		initialMessageSpawningBeetle = UpdateUnitCount(comm.BEETLE_LAST_ROUND_CHANNEL, comm.BEETLE_COUNT_CHANNEL,
				comm.BEETLE_SPAWNING_COUNT_CHANNEL, comm.SPAWNING_BEETLES_CHANNEL, initialMessageSpawningBeetle);
		initialMessageSpawningBee = UpdateUnitCount(comm.BEE_LAST_ROUND_CHANNEL, comm.BEE_COUNT_CHANNEL,
				comm.BEE_SPAWNING_COUNT_CHANNEL, comm.SPAWNING_BEES_CHANNEL, initialMessageSpawningBee);
		initialMessageSpawningSpider = UpdateUnitCount(comm.SPIDER_LAST_ROUND_CHANNEL, comm.SPIDER_COUNT_CHANNEL,
				comm.SPIDER_SPAWNING_COUNT_CHANNEL, comm.SPAWNING_SPIDERS_CHANNEL, initialMessageSpawningSpider);
	}

    protected void InitTurn() {
        round = uc.getRound();
        myUnits = uc.senseUnits(myTeam);
        enemyUnits = uc.senseUnits(enemyTeam);
        cookies = uc.senseFood();
		obstacles = uc.senseObstacles();
        myLoc = uc.getLocation();
        readFoodLocations = new TreeSet<>();
		int round2 = uc.read(comm.ROUND_NUM_CHANNEL);
		if (round2 != round) {
			//first unit this round
			uc.write(comm.ROUND_NUM_CHANNEL, round);
			if (round % 10 == 0) uc.println("Round " + round);
			UpdateUnitCount();
		}

        inCombat = false;
        for (UnitInfo enemy : enemyUnits) {
        	if (!uc.isObstructed(myLoc, enemy.getLocation())) {
				inCombat = true;
				break;
			}

		}
    }

    protected abstract void ReadMessages();

    protected abstract void ExecuteSpecialMechanics(boolean firstTime);

    protected abstract void PickTargetToMove();

    protected abstract void Move();

	protected void SendMessages() {
		// Send info about the new cookies.
		for (FoodInfo cookie : cookies) {
			if (uc.getEnergyLeft() < 50 || uc.getRound() != round) return;
			if (!readFoodLocations.contains(Utils.EncodeLocation(cookie.location))) {
				comm.SendCyclicMessage(comm.COOKIE_CHANNEL, uc.getType().ordinal(), cookie.location, cookie.getFood());
			}
		}
	}

    public void run(UnitController _uc) {
        InitGame(_uc);
        boolean DEBUG = false;
        while (true){
        	try {
            if (round > 500) return;
				if (DEBUG) uc.println(uc.getInfo().getID() + " " + round + " Start round " + uc.getEnergyLeft());
				InitTurn();
				if (DEBUG)
					uc.println(uc.getInfo().getID() + " " + round + " Before read messages " + uc.getEnergyLeft());
				ReadMessages();
				if (DEBUG)
					uc.println(uc.getInfo().getID() + " " + round + " Before special mechanics " + uc.getEnergyLeft());
				ExecuteSpecialMechanics(true);
				if (DEBUG) uc.println(uc.getInfo().getID() + " " + round + " before pick target " + uc.getEnergyLeft());
				PickTargetToMove();
				if (DEBUG) uc.println(uc.getInfo().getID() + " " + round + " before move " + uc.getEnergyLeft());
				Move();
				if (DEBUG)
					uc.println(uc.getInfo().getID() + " " + round + " before special mechanics 2 " + uc.getEnergyLeft());
				ExecuteSpecialMechanics(false);
				if (DEBUG)
					uc.println(uc.getInfo().getID() + " " + round + " before send messages " + uc.getEnergyLeft());
				SendMessages();
				if (uc.getRound() == round && uc.getEnergyLeft() > 20)
					uc.yield(); // Don't yield if we used too much bytecode.
			} catch (Exception e) {
        		uc.println("EXCEPTION!!!: " + e.toString());
        		uc.yield();
			}
        }
    }
}
