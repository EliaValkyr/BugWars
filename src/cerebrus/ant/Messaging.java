package cerebrus.ant;

import navgame.*;
/**
 * Created by Ivan on 2/4/2018.
 */
public class Messaging {

    UnitController uc;
    int attackRangeExpanded = 5;

    final int maxBaseX = 100;
    final int maxBaseY = 100;

    int baseX;
    int baseY;

    public Messaging(UnitController _uc){
        uc = _uc;
        Location[] initLoc = uc.getTeam().getInitialLocations();
        baseX = initLoc[0].x;
        baseY = initLoc[0].y;
        attackRangeExpanded = uc.getType().getAttackRangeSquared() + 9;
    }

    final int MAX_CYCLE = 300;

    final int FIRST_MINING_MESSAGE = 10000;
    final int FIRST_MINING_LOC_MESSAGE = 21000;

    final int QUEEN = 0;
    final int ANT = 1;
    final int BEETLE = 2;
    final int BEE = 3;
    final int SPIDER = 4;

    final int ENEMY = 0;
    final int MINE = 1;

    int encode(int target_type, int x, int y, int extra){
        return (((((target_type << 8) | (x-baseX + maxBaseX)) << 8) | (y - baseY + maxBaseY)) << 12) | extra;
    }

    Target getTarget(int code){
        Target ans = new Target();
        ans.type = (code >> 28)&0xF;

        ans.loc = new Location();
        ans.loc.x = (code >> 20)&0xFF;
        ans.loc.x += baseX - maxBaseX;
        ans.loc.y = (code >> 12)&0xFF;
        ans.loc.y += baseY - maxBaseY;

        ans.value = code&0xFFF;

        ans.mes = this;

        return ans;
    }

    void sendMessage(Integer mes){
        if (uc.getEnergyUsed() >= 9800) return;
        Integer latestMessage = uc.read(MAX_CYCLE);
        //uc.println("Sending message " + mes.toString() + " at potision " + latestMessage.toString());
        uc.write(latestMessage, mes);
        ++latestMessage;
        if (latestMessage >= MAX_CYCLE) latestMessage = 0;
        uc.write(MAX_CYCLE, latestMessage);
    }

    int getFirstMiningMessage(){
        int latestMine = uc.read(FIRST_MINING_MESSAGE);
        if (latestMine == 0){
            latestMine = 1;
            uc.write(FIRST_MINING_MESSAGE, latestMine);
        }
        return latestMine;

    }

    int encodeLocation(Location loc){
        return FIRST_MINING_LOC_MESSAGE + (((loc.x-baseX + maxBaseX) << 8) | (loc.y - baseY + maxBaseY));
    }

    Location getLocation(int code){
        Location loc = new Location();
        loc.y = (code&0xFF) + baseY - maxBaseY;
        loc.x = ((code >> 8)&0xFF) + baseX - maxBaseX;
        return loc;
    }

    void putMine(FoodInfo f){
        int channel = encodeLocation(f.location);
        int latestMine = getFirstMiningMessage();
        int channelInfo = uc.read(channel)&0xFFFF;
        int mes = encode(MINE, f.location.x, f.location.y, f.food);
        if (channelInfo == 0){
            channelInfo = latestMine;
            uc.write(channel, (((uc.read(channel) >> 16)&0xFFFF) << 16) | channelInfo);
            uc.write(FIRST_MINING_MESSAGE + channelInfo, mes);
            uc.write( FIRST_MINING_MESSAGE, latestMine+1);
        } else{
            uc.write(FIRST_MINING_MESSAGE + channelInfo, mes);
        }
    }

    void putAnt(Location loc){
        int channel = encodeLocation(loc);
        int channelInfo = (uc.read(channel))&0xFFFF;
        uc.write(channel, (uc.getRound() << 16) | channelInfo);
    }

    void putVisibleMines(){
        FoodInfo[] food = uc.senseFood();
        for (int i = 0; i < food.length && uc.getEnergyUsed() < 14500; ++i){
            putMine(food[i]);
        }
    }

    void putMyLocation(){
        Location[] visibleLocations = uc.getVisibleLocations();
        for (int i = 0; i < visibleLocations.length && uc.getEnergyUsed() < 14500; ++i){
            putAnt(visibleLocations[i]);
        }
    }

    boolean isMineFree(Location loc) {
        int code = encodeLocation(loc);
        int inf = uc.read(code);
        if (inf == 0) return false;
        int info = (inf >> 16) & 0xFFFF;
        return uc.getRound() - info > 5;
    }

}
