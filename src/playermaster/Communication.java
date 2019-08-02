package playermaster;

import bugwars.*;

public class Communication {

    private UnitController uc;

    //Base location. Initial location of the first queen
    private int xBase = Integer.MAX_VALUE;
    private int yBase = Integer.MAX_VALUE;

    //Unitary channels
    final int FIRST_QUEEN_X_CHANNEL = 0;
    final int FIRST_QUEEN_Y_CHANNEL = 1;
	final int ROUND_NUM_CHANNEL = 10; //to know who is the first unit to execute

	/**
	 * - [UNIT] last round channel: how many units I had last round of that type
	 * - [UNIT] count channel: counting how many units I have this round
	 * - [UNIT] spawning channel: how many units are currently spawning
	 */
	int UNIT_COUNT = 20;
	final int ANT_LAST_ROUND_CHANNEL = UNIT_COUNT++;
	final int ANT_COUNT_CHANNEL = UNIT_COUNT++;
	final int ANT_SPAWNING_COUNT_CHANNEL = UNIT_COUNT++;
	final int BEETLE_LAST_ROUND_CHANNEL = UNIT_COUNT++;
	final int BEETLE_COUNT_CHANNEL = UNIT_COUNT++;
	final int BEETLE_SPAWNING_COUNT_CHANNEL = UNIT_COUNT++;
	final int BEE_LAST_ROUND_CHANNEL = UNIT_COUNT++;
	final int BEE_COUNT_CHANNEL = UNIT_COUNT++;
	final int BEE_SPAWNING_COUNT_CHANNEL = UNIT_COUNT++;
	final int SPIDER_LAST_ROUND_CHANNEL = UNIT_COUNT++;
	final int SPIDER_COUNT_CHANNEL = UNIT_COUNT++;
	final int SPIDER_SPAWNING_COUNT_CHANNEL = UNIT_COUNT++;

    //Cyclic channels
	int CYCLIC_CHANNELS = 1000; //Cyclic channels start at 1100 because of how += works
	final int CYCLIC_CHANNEL_LENGTH = 99;
    final int ENEMY_TROOP_CHANNEL = CYCLIC_CHANNELS += CYCLIC_CHANNEL_LENGTH + 1;
    final int ENEMY_ANT_CHANNEL = CYCLIC_CHANNELS += CYCLIC_CHANNEL_LENGTH + 1;
    final int COOKIE_CHANNEL = CYCLIC_CHANNELS += CYCLIC_CHANNEL_LENGTH + 1;
    final int EMERGENCY_CHANNEL = CYCLIC_CHANNELS += CYCLIC_CHANNEL_LENGTH + 1;
    final int NEED_TROOP_CHANNEL = CYCLIC_CHANNELS += CYCLIC_CHANNEL_LENGTH + 1;
	final int SPAWNING_ANTS_CHANNEL = CYCLIC_CHANNELS += CYCLIC_CHANNEL_LENGTH + 1;
	final int SPAWNING_BEETLES_CHANNEL = CYCLIC_CHANNELS += CYCLIC_CHANNEL_LENGTH + 1;
	final int SPAWNING_BEES_CHANNEL = CYCLIC_CHANNELS += CYCLIC_CHANNEL_LENGTH + 1;
	final int SPAWNING_SPIDERS_CHANNEL = CYCLIC_CHANNELS += CYCLIC_CHANNEL_LENGTH + 1;

    //This takes 25281 channels, holy shit
    final int ASSIGNED_TILES = 50000;
    final int HALF_MAP_SIDE = 79;
    final int MAX_MAP_SIDE = 2 * HALF_MAP_SIDE + 1; //159


    void InitGame(UnitController _uc, int x, int y){
        uc = _uc;
        xBase = x;
        yBase = y;
    }

    int GetAssignedTileChannel(int x, int y) {
        int xOffset = x - xBase;
        int yOffset = y - yBase;
        return ASSIGNED_TILES + (xOffset+HALF_MAP_SIDE)*MAX_MAP_SIDE + (yOffset+HALF_MAP_SIDE);
    }

    void SendAssignedTileMessage(int x, int y, int antId, int round) {
        if (xBase == Integer.MAX_VALUE) uc.println("ERROR: Tried to send message without first setting the base");
        int channel = GetAssignedTileChannel(x,y);
        AssignedTileMessage message = new AssignedTileMessage(antId, round);
        uc.write(channel, message.Encode());
    }

    AssignedTileMessage ReadAssignedTileMessage(int x, int y) {
        int channel = GetAssignedTileChannel(x,y);
        return new AssignedTileMessage(uc.read(channel));
    }

    //Send a message in one of the cyclic channels
    private void SendCyclicMessage(int baseChannel, int senderType, int x, int y, int value) {
            if (xBase == Integer.MAX_VALUE) uc.println("ERROR: Tried to send message without first setting the base");
            int lastMessage = uc.read(baseChannel + CYCLIC_CHANNEL_LENGTH);
            CyclicMessage message = new CyclicMessage(senderType, x, y, value);
            int bitmap = message.Encode(xBase, yBase);
            uc.write(baseChannel + lastMessage, bitmap);
            uc.write(baseChannel + CYCLIC_CHANNEL_LENGTH, (lastMessage + 1) % CYCLIC_CHANNEL_LENGTH);
    }

    void SendCyclicMessage(int baseChannel, int senderType, Location location, int value) {
        SendCyclicMessage(baseChannel, senderType, location.x, location.y, value);
    }

    CyclicMessage ReadCyclicMessage(int channel) {
        return new CyclicMessage(uc.read(channel), xBase, yBase);
    }

	void Increment(int channel) {
		uc.write(channel, uc.read(channel) + 1);
	}
	int GetUnitCount(UnitType type) {
		int count = 0;
		if (type == UnitType.ANT) count = uc.read(ANT_LAST_ROUND_CHANNEL) + uc.read(ANT_SPAWNING_COUNT_CHANNEL);
		if (type == UnitType.BEETLE) count = uc.read(BEETLE_LAST_ROUND_CHANNEL) + uc.read(BEETLE_SPAWNING_COUNT_CHANNEL);
		if (type == UnitType.BEE) count = uc.read(BEE_LAST_ROUND_CHANNEL) + uc.read(BEE_SPAWNING_COUNT_CHANNEL);
		if (type == UnitType.SPIDER) count = uc.read(SPIDER_LAST_ROUND_CHANNEL) + uc.read(SPIDER_SPAWNING_COUNT_CHANNEL);
//        uc.println(count + " units of type " + type);
		return count;
	}
}
