package player4;

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

    protected void InitTurn() {
        round = uc.getRound();
        myUnits = uc.senseUnits(myTeam);
        enemyUnits = uc.senseUnits(enemyTeam);
        cookies = uc.senseFood();
		obstacles = uc.senseObstacles();
        myLoc = uc.getLocation();
        readFoodLocations = new TreeSet<>();

        inCombat = false;
        for (UnitInfo enemy : enemyUnits) {
        	if (!uc.isObstructed(myLoc, enemy.getLocation())) {
				inCombat = true;
				break;
			}

		}
    }

    protected abstract void ReadMessages();

    protected abstract void ExecuteSpecialMechanics();

    protected abstract void PickTargetToMove();

    protected abstract void Move();

	protected void SendMessages() {
		// Send info about the new cookies.
		for (FoodInfo cookie : cookies) {
			if (uc.getEnergyLeft() < 50) return;
			if (!readFoodLocations.contains(Utils.EncodeLocation(cookie.location))) {
				comm.SendCyclicMessage(comm.COOKIE_CHANNEL, uc.getType().ordinal(), cookie.location, cookie.getFood());
			}
		}
	}

    public void run(UnitController _uc) {
        InitGame(_uc);
        boolean DEBUG = false;
        while (true){
//            if (round > 500) return;
            if (DEBUG) uc.println(uc.getInfo().getID() + " " + round + " Start round " + uc.getEnergyLeft());
            InitTurn();
            if (DEBUG) uc.println(uc.getInfo().getID() + " " + round + " Before read messages " + uc.getEnergyLeft());
            ReadMessages();
            if (DEBUG) uc.println(uc.getInfo().getID() + " " + round + " Before special mechanics " + uc.getEnergyLeft());
            ExecuteSpecialMechanics();
            if (DEBUG) uc.println(uc.getInfo().getID() + " " + round + " before pick target " + uc.getEnergyLeft());
            PickTargetToMove();
            if (DEBUG) uc.println(uc.getInfo().getID() + " " + round + " before move " + uc.getEnergyLeft());
            Move();
            if (DEBUG) uc.println(uc.getInfo().getID() + " " + round + " before special mechanics 2 " + uc.getEnergyLeft());
            ExecuteSpecialMechanics();
            if (DEBUG) uc.println(uc.getInfo().getID() + " " + round + " before send messages " + uc.getEnergyLeft());
            SendMessages();
            uc.yield();
        }
    }
}
