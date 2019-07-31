package player4;

import bugwars.*;

public class Communication {

    private UnitController uc;

    //Base location. Initial location of the first queen
    private int xBase = Integer.MAX_VALUE;
    private int yBase = Integer.MAX_VALUE;

    //Unitary channels
    final int FIRST_QUEEN_X_CHANNEL = 0;
    final int FIRST_QUEEN_Y_CHANNEL = 1;


    //Cyclic channels
    final int ENEMY_TROOP_CHANNEL = 1000;
    final int ENEMY_ANT_CHANNEL = 1500;
    final int COOKIE_CHANNEL = 2000;
    final int EMERGENCY_CHANNEL = 2500;
    final int NEED_TROOP_CHANNEL = 3000;
    final int CYCLIC_CHANNEL_LENGTH = 99;

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
            CyclicMessage message = new CyclicMessage(senderType, x, y , value);
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
}
