package cerebrus.beetle;

import navgame.Location;
import navgame.UnitController;

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

    final int QUEEN = 0;
    final int ANT = 1;
    final int BEETLE = 2;
    final int BEE = 3;
    final int SPIDER = 4;

    final int ENEMY = 0;

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



}
