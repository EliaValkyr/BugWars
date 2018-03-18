package cerebrus.beetle;

import navgame.*;

public class Bugpath {

    final int NO_RESET = 0;
    final int SOFT_RESET = 1;
    final int HARD_RESET = 2;

    final double maxCos = 0.5;

    Location obstacle = null;
    Location target = null;
    boolean left = true;
    UnitController uc;
    boolean dodging = false;

    final double factor = 1.5;

    Location minLocation;
    int minDist = 0;

    int[] cont;
    int[] mindist;
    int bestIndex;

    int DPS;
    UnitType type;

    Direction[] directions = {
            Direction.NORTH, Direction.NORTHWEST, Direction.WEST, Direction.SOUTHWEST,
            Direction.SOUTH, Direction.SOUTHEAST, Direction.EAST, Direction.NORTHEAST, Direction.ZERO
    };

    public Bugpath(UnitController _uc){
        uc = _uc;
        DPS = dps(uc.getType());
        type = uc.getType();
        if (Math.random() > 0.5) left = false;
    }

    void reset(){
        obstacle = null;
        if (target != null){
            minDist = uc.getLocation().distanceSquared(target);
            minLocation = uc.getLocation();
        }
        dodging = false;
    }

    void soft_reset(){
        if (target != null){
            if (minLocation != null)  minDist = minLocation.distanceSquared(target);
            else minDist = uc.getLocation().distanceSquared(target);
        }
    }

    double cosSquare(Location loc1, Location loc2, Location loc3){
        int x1 = loc2.x - loc1.x;
        int y1 = loc2.y - loc1.y;
        int x2 = loc3.x - loc1.x;
        int y2 = loc3.y - loc1.y;

        int prod = (x1*x2 + y1*y2);

        if (prod < 0) return -1;
        if (prod == 0) return 0;

        return ((double)prod*prod)/((x1*x1 + y1*y1)*(x2*x2 + y2*y2));
    }

    int resetType(Location newTarget){
        if (target == null) return HARD_RESET;
        if (target.isEqual(newTarget)) return NO_RESET;
        if (target.distanceSquared(newTarget) <= 8) return SOFT_RESET;
        if (cosSquare(uc.getLocation(), target, newTarget) < maxCos*maxCos) return SOFT_RESET;
        return HARD_RESET;
    }

    boolean moveTo(Location _target){
        if (_target == null) return false;
        int a = resetType(_target);
        if (a == SOFT_RESET){
            target = _target;
            soft_reset();
        } else if (a == HARD_RESET){
            target = _target;
            reset();
        }

        if (target != null && uc.getLocation().distanceSquared(target) < minDist){
            reset();
        }
        return bugPath();
    }

    int getIndex(Direction dir){
        return dir.ordinal();
    }

    boolean isSafe(Direction dir){
        int a = getIndex(dir);
        return !isBetter(cont[a], mindist[a], cont[bestIndex], mindist[bestIndex]);
    }

    boolean bugPath(){
        Location myLoc = uc.getLocation();
        if (target == null) return false;
        if (myLoc.distanceSquared(target) <= uc.getType().attackRangeSquared && !uc.isObstructed(myLoc, target)){
            return isSafe(Direction.ZERO);
        }
        Direction dir;
        if (obstacle == null) dir = myLoc.directionTo(target);
        else dir = myLoc.directionTo(obstacle);
        if (!uc.canMove(dir)) {
            dodging = true;
            int c = 0;
            if (obstacle != null && myLoc.distanceSquared(obstacle) > 2){
                int d = myLoc.distanceSquared(obstacle);
                Direction bestDir = Direction.ZERO;
                for (int i = 0; i < 8; ++i){
                    Location newLoc = myLoc.add(dir);
                    int d2 = newLoc.distanceSquared(obstacle);
                    if (uc.canMove(dir) && d2 < d){
                        d = d2;
                        bestDir = dir;
                    }
                    if (left) dir = dir.rotateLeft();
                    else dir = dir.rotateRight();
                }
                if (bestDir != Direction.ZERO) {
                    dir = bestDir;
                    c = 20;
                }
            }
            boolean unitFound = false;
            while (!uc.canMove(dir) && c++ < 20) {
                if (uc.isOutOfMap(myLoc.add(dir))) left = !left;
                Location newLoc = myLoc.add(dir);
                if (uc.senseUnit(newLoc) != null) unitFound = true;
                if (!unitFound) obstacle = newLoc;
                if (left) dir = dir.rotateLeft();
                else dir = dir.rotateRight();
            }
        } else{
            //reset();
            //dodging = false;
        }
        if (dir != Direction.ZERO && uc.canMove(dir) && isSafe(dir)){
            uc.move(dir);
            return true;
        }
        return false;
    }

    int dps (UnitType type){
        if (type == UnitType.BEETLE) return 6;
        if (type == UnitType.BEE) return 4;
        if (type == UnitType.SPIDER) return 3;
        return 0;
    }

    boolean fightMove(){
        //Integer bc = uc.getBytecode();
        //uc.println(bc.toString());
        UnitInfo[] units = uc.senseUnits(getRange(), uc.getTeam().getOpponent());
        boolean closecombat = uc.getType() == UnitType.BEE || uc.getType() == UnitType.BEETLE;
        boolean bee = uc.getType() == UnitType.BEE;
        cont = new int[9];
        mindist = new int[9];
        for (int i = 0; i < 9; ++i) mindist[i] = 1000;
        for (int i = 0; i < units.length && uc.getEnergyUsed() < 7500; ++i) {
            UnitType type = units[i].getType();
            int dps = dps(type);
            if (dps == 0) continue;
            if (closecombat && type == UnitType.SPIDER) continue;
            if (closecombat && type != UnitType.SPIDER && units[i].getLocation().distanceSquared(uc.getLocation()) > 13) continue;
            int ars = getAttackRange(type);
            int arsmin = type.getMinAttackRangeSquared();
            boolean ignoreDmg = (bee && units[i].getAttackCooldown() >= 2);
            for (int j = 0; j < 9; ++j){
                Location newLoc = uc.getLocation().add(directions[j]);
                Location enemyLoc = units[i].getLocation();
                if (uc.isObstructed(newLoc, enemyLoc)) continue;
                int d = newLoc.distanceSquared(enemyLoc);
                if (mindist[j] > d) mindist[j] = d;
                if (d <= ars && d < arsmin && !ignoreDmg){
                    cont[j]+= dps;
                }
            }
        }

        bestIndex = 8;
        int bestCont = cont[bestIndex];
        int bestdist = mindist[bestIndex];
        for (int i = 7; i >= 0; --i){
            if (uc.canMove(directions[i]) && isBetter(bestCont, bestdist, cont[i], mindist[i])){
                bestIndex = i;
                bestdist = mindist[i];
                bestCont = cont[i];
            }
        }
        //if (uc.getBytecode() > 7500) uc.println("Need more bytecode!!");
        return true;
    }

    boolean isBetter(int prevDPS, int prevDist, int dps, int dist){
        if (prevDPS <= DPS && dps > DPS) return false;
        if (prevDPS > DPS && dps <= DPS) return true;

        int ars = uc.getType().getAttackRangeSquared();
        if (!uc.canAttack()) ars = 100;
        if (dist <= ars){
            if (prevDist > ars) return true;
            if (dps < prevDPS) return true;
            if (dps > prevDPS) return false;
            return (dist > prevDist);
        }
        if (dps < prevDPS) return true;
        if (dps > prevDPS) return false;
        return (dist < prevDist);
    }

    void safeMove(){
        if (bestIndex != 8){
            uc.move(directions[bestIndex]);
            reset();
        }
    }

    int getRange(){
        UnitType type = uc.getType();
        if (type == UnitType.BEE) return 13;
        return type.getSightRangeSquared();
    }

    int getAttackRange(UnitType type){
        return type.getAttackRangeSquared();
        //if (this.type != UnitType.SPIDER) return type.getAttackRangeSquare();
        //if (type == UnitType.BEE || type == UnitType.BEETLE) return 13;
        //return type.getAttackRangeSquare();
    }
}
