package cerebrus.beespider;

import navgame.Location;
import navgame.UnitInfo;
import navgame.UnitType;

/**
 * Created by Ivan on 2/4/2018.
 */
public class Target {
    Location loc;
    int type;
    int value;
    Messaging mes;

    public Target(){
    }

    public Target(Location _loc, int _type, int _value, Messaging _mes){
        loc = _loc;
        type = _type;
        value = _value;
        mes = _mes;
    }

    public int encode(){
        return mes.encode(type, loc.x, loc.y, value);
    }

    public Target(Messaging _mes, UnitInfo u){
        mes = _mes;
        type = mes.ENEMY;
        loc = u.getLocation();
        if (u.getType() == UnitType.ANT) value = mes.ANT;
        else if (u.getType() == UnitType.BEETLE) value = mes.BEETLE;
        else if (u.getType() == UnitType.QUEEN) value = mes.QUEEN;
        else if (u.getType() == UnitType.BEE) value = mes.BEE;
        else value = mes.SPIDER;
        value = (value << 8) | u.getHealth();
    }

    boolean isBetterThan(Target B, Location myLoc){
        if (B == null) return true;
        int d1 = myLoc.distanceSquared(loc);
        int d2 = myLoc.distanceSquared(B.loc);

        if (d1 <= mes.attackRangeExpanded && d2 <= mes.attackRangeExpanded){
            int HP1 = value&0xFF;
            int HP2 = B.value&0xFF;
            return HP1 < HP2;
        }

        return d1 < d2;

    }

}
