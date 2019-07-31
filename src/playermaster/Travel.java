package playermaster;

import bugwars.*;

//Movement class. Only when the unit is not fighting or is running away
public class Travel {
    private final int FREE = 0;
    private final int CLOCKWISE = 1;
    private final int COUNTER_CLOCKWISE = 2;

    private final int OK = 0;
    private final int REPEAT = 1;

    private RockInfo[] obstacles;
    private boolean[] directionHasRock; //with respect to myLoc

    private UnitController uc;
    private int currentState;
    private Location myLoc;
    private Location target;

    private int minDistObstacleToTarget;
    private Location lastSurroundedObstacle;


    public void InitGame(UnitController _uc) {
        uc = _uc;
        currentState = FREE;
        minDistObstacleToTarget = Integer.MAX_VALUE;
    }

    private void InitTurn(Location _target, RockInfo[] obstacles) {
        myLoc = uc.getLocation();
        target = _target;
        this.obstacles = obstacles;
        directionHasRock = new boolean[8];
        for (RockInfo rock : this.obstacles) {
            if (myLoc.distanceSquared(rock.getLocation()) < 3) {
                directionHasRock[myLoc.directionTo(rock.getLocation()).ordinal()] = true;
            }
        }
    }

    public void Reset() {
        currentState = FREE;
        minDistObstacleToTarget = Integer.MAX_VALUE;
        lastSurroundedObstacle = null;
    }

    private void InvertSurroundingDirection() {
        if (currentState == CLOCKWISE)
            currentState = COUNTER_CLOCKWISE;
        else if (currentState == COUNTER_CLOCKWISE)
            currentState = CLOCKWISE;
    }

    private Direction[] GetOrderedDirections(int state, Direction bestDir) {
        if (state == FREE) {
            return new Direction[]{
                    bestDir,
                    bestDir.rotateLeft(),
                    bestDir.rotateRight(),
                    bestDir.rotateLeft().rotateLeft(),
                    bestDir.rotateRight().rotateRight(),
//                    bestDir.opposite().rotateRight(),
//                    bestDir.opposite().rotateLeft(),
//                    bestDir.opposite()
            };
        } else if (state == CLOCKWISE) {
            Direction dir = bestDir;
            Direction[] ret = new Direction[8];
            for (int i = 0; i < 8; i++) {
                ret[i] = dir;
                dir = dir.rotateRight();
            }
            return ret;
        } else {
            Direction dir = bestDir;
            Direction[] ret = new Direction[8];
            for (int i = 0; i < 8; i++) {
                ret[i] = dir;
                dir = dir.rotateLeft();
            }
            return ret;
        }
    }

    private int DecideSurroundingState() {
        return Math.random() > 0.5 ? CLOCKWISE : COUNTER_CLOCKWISE;
    }

    private int FreeTravel() {
//        uc.drawPoint(target, "0xFF0000");
        Direction bestDir = myLoc.directionTo(target);
        //uc.println(myLoc.x + "," + myLoc.y + " wants to go to " + myLoc.add(bestDir).x + "," + myLoc.add(bestDir).y);
        if (uc.canMove(bestDir)) {
            uc.move(bestDir);
            return OK;
        } else {
            if (directionHasRock[bestDir.ordinal()]) {
                currentState = DecideSurroundingState();
                lastSurroundedObstacle = myLoc.add(bestDir);
                return REPEAT;
            }
            Direction[] dirs = GetOrderedDirections(FREE, bestDir);
            for (Direction dir : dirs)
                if (uc.canMove(dir)) {
                    uc.move(dir);
                }
            return OK;
        }
    }

    private int Surround() {
        Direction firstDir = myLoc.directionTo(lastSurroundedObstacle);
        if (firstDir == Direction.ZERO) {
            //This can happen if I destroy a rock and go to its position
            currentState = FREE;
            return REPEAT;
        }
        Direction targetDir = myLoc.directionTo(target);
        Direction[] dirs = GetOrderedDirections(currentState, firstDir);
        for (int i = 0; i < dirs.length; i++) {
            Location loc = myLoc.add(dirs[i]);
            RockInfo rock = uc.senseObstacle(loc);
            if (rock != null && rock.getDurability() > 0) {
                if (loc.distanceSquared(target) < minDistObstacleToTarget) {
                    minDistObstacleToTarget = loc.distanceSquared(target);
//                    uc.println("New closest rock, position " + loc.x + "," + loc.y + " / my loc " + myLoc.x + "," + myLoc.y);
                }
            }
        }
        Direction[] targetDirs = GetOrderedDirections(currentState, targetDir);
//        uc.println("min obstacle distance: " + minDistObstacleToTarget + " min unit distance " + myLoc.add(targetDir).distanceSquared(target));
        for (int i = 0; i < dirs.length; i++) {
            Direction dir = targetDirs[i];
            if (uc.canMove(dir) && myLoc.add(dir).distanceSquared(target) < minDistObstacleToTarget) {
                currentState = FREE;
                minDistObstacleToTarget = Integer.MAX_VALUE;
                uc.move(dir);
                return OK;
            }
        }
//        uc.println("Last obstacle loc " + lastSurroundedObstacle.x + "," + lastSurroundedObstacle.y);
        for (int i = 0; i < dirs.length; i++) {
            Direction dir = dirs[i];
            Location newLoc = myLoc.add(dir);
//            uc.println("Can I move " + dir + " to " + newLoc.x + "," + newLoc.y + "? " + uc.canMove(dir));
            if (uc.canMove(dir)) {
                uc.move(dir);
                return OK;
            }
            if (directionHasRock[dir.ordinal()]) {
                lastSurroundedObstacle = newLoc;
            }
            if (i <= 3 && uc.isOutOfMap(newLoc)) {
                //If we find the edge of the map, we invert the surrounding direction and repeat
                InvertSurroundingDirection();
                return REPEAT;
            }
        }
//        uc.println("I can't move anywhere!");
        //Can't move anywhere
        return OK;
    }

    public void TravelTo(Location target, RockInfo[] obstacles) {
        if (target == null) return;
        if (!uc.canMove()) return;
        InitTurn(target, obstacles);
//        uc.println("My location: " + myLoc.x + "," + myLoc.y + " Target location: " + target.x + "," + target.y);
        int status = REPEAT;
        int tries = 0;
        while (status != OK && tries < 20) {
            tries++;
            status = currentState == FREE ? FreeTravel() : Surround();
        }
    }
}
