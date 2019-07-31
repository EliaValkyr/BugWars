package player3;


import bugwars.*;

public class Utils {
//    static int GetIndex(UnitType type){
//        if (type == UnitType.BEE) return 0;
//        else if (type == UnitType.BEETLE) return 1;
//        else if (type == UnitType.SPIDER) return 2;
//        else if (type == UnitType.ANT) return 3;
//        else if (type == UnitType.QUEEN) return 4;
//        return -1;
//    }

    static String PrintLoc(Location location) {
        return "[" + location.x + "," + location.y + "]";
    }

    static boolean SameLocation(Location l1, Location l2) {
        return l1.x == l2.x && l1.y == l2.y;
    }


    //This is just to store locations as ints in a Treeset
    static int EncodeLocation (Location location) {
        return
                (location.x & 0xFFFF) << 16
                | (location.y & 0xFFFF);
    }

    static Location DecodeLocation(int bitmap) {
        return new Location((bitmap & 0xFFFF0000) >> 16, bitmap & 0x0000FFFF);
    }
}
