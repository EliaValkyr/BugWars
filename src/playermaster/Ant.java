package playermaster;


import bugwars.*;

import java.util.Arrays;

public class Ant extends Attacker {
    private int initialMessageCookie = 0;
    private AssignedTiles myTiles = new AssignedTiles();

    private class AssignedTiles {
		final int MAX_TILES = 3;
        Location[] tiles = new Location[MAX_TILES];
        int count = 0; // Number of assigned tiles.

        public void Reset() {
            tiles = new Location[3];
            count = 0;
        }

        public void AssignTile(Location tile) {
            if (count == MAX_TILES) return;
            if (count == 0) {
                tiles[0] = tile;
                count++;
                uc.println(round + " " + Utils.PrintLoc(myLoc) + " assigns tile " + Utils.PrintLoc(tile));
                return;
            }
            if (IsAdjacent(tile)) {
                tiles[count] = tile;
                count++;
                uc.println(round + " " + Utils.PrintLoc(myLoc) + " assigns tile " + Utils.PrintLoc(tile));
                return;
            }
            uc.println("Error: Tried to assign a tile that is not adjacent. Shouldn't happen");
        }

        public void UnassignTile(int index) {
            for (int i = index + 1; i < count - 1; i++) {
                tiles[i] = tiles[i+1];
            }
            tiles[count - 1] = null;
            count--;
        }

        public Location GetCenter() {
            // Any assigned tile that is adjacent to all other assigned tiles
            if (count == 0) return null;
            for (int i = 0; i < count; i++) {
                Location centerCandidate = tiles[i];
                boolean canBeCenter = true;
                for (int j = 0; j < count && canBeCenter; j++) {
                    if (centerCandidate.distanceSquared(tiles[j]) > 2)
                        canBeCenter = false;
                }
                if (canBeCenter) return centerCandidate;
            }
            uc.println("This ant doesn't have a proper center. Shouldn't happen");
            return null;
        }

        public int GetDistance() {
            int minDist = Integer.MAX_VALUE;
            for(int i = 0; i < count; i++) {
                minDist = Math.min(minDist, myLoc.distanceSquared(tiles[i]));
            }
            return minDist;
        }

        public Location[] GetTiles() {
            return Arrays.copyOfRange(tiles, 0, count);
        }

        public boolean IsFull() {
            return count == MAX_TILES;
        }

        public boolean IsEmpty() {
            return count == 0;
        }

        public boolean IsAdjacent(Location location) {
            if (count == 0) return true;
            boolean isAdjacent = false;
            for (int i = 0; i < count; i++) {
                if (tiles[i].distanceSquared(location) < 3)
                    isAdjacent = true;
            }
            return isAdjacent;
        }
    }

    protected boolean IsCookieFree(Location location) {
        AssignedTileMessage message = comm.ReadAssignedTileMessage(location.x, location.y);
        return message.GetAntId() == 0 || round - message.GetRound() > 5;
    }

    protected void ReadCookieLocations() {
        int baseChannel = comm.COOKIE_CHANNEL;
        int lastMessage = uc.read(baseChannel + comm.CYCLIC_CHANNEL_LENGTH);
        int i = initialMessageCookie;
        Location closestCookie = null;
        int closestCookieDist = Integer.MAX_VALUE;
        int MAX_BYTECODE = 5000;
        int initBytecode = uc.getEnergyUsed();
        while (i != lastMessage) {
            if (i >= comm.CYCLIC_CHANNEL_LENGTH) i -= comm.CYCLIC_CHANNEL_LENGTH; //this should go at the end
            if (i == lastMessage) break;
            if (uc.getEnergyUsed() - initBytecode > MAX_BYTECODE) break;
            CyclicMessage message = comm.ReadCyclicMessage(baseChannel + i);
            Location cookieLocation = new Location(message.x, message.y);
            readFoodLocations.add(Utils.EncodeLocation(cookieLocation));
//            uc.println(uc.getInfo().getID() + " " + Utils.PrintLoc(myLoc) + " reads food on " + Utils.PrintLoc(cookieLocation));
            int distanceToCookie = myLoc.distanceSquared(cookieLocation);
            if (distanceToCookie < closestCookieDist && IsCookieFree(cookieLocation)) {
                closestCookieDist = distanceToCookie;
                closestCookie = cookieLocation;
            }
            i++;
        }
        if (closestCookie != null) {
//            uc.println(Utils.PrintLoc(myLoc) + " closest cookie: " + Utils.PrintLoc(closestCookie) + " at dist " + closestCookieDist + " dist to my tiles " + myTiles.GetDistance());
            if (myTiles.IsAdjacent(closestCookie)) myTiles.AssignTile(closestCookie);
            else if (myLoc.distanceSquared(closestCookie) < myTiles.GetDistance()) {
                myTiles.Reset();
                uc.println(Utils.PrintLoc(myLoc) + " resets tiles.");
                myTiles.AssignTile(closestCookie);
            }
        }
        initialMessageCookie = lastMessage;
    }

    protected boolean ShouldSearchForFood() {
        return !myTiles.IsFull();
    }

    protected void ReadMessages() {
        if (ShouldSearchForFood()) ReadCookieLocations();
    }

    // Mines the cookie with the most food.
    private void Mine() {
    	if (!uc.canMine()) return;
        int maxFood = -1;
        Location maxFoodLocation = null;
        for (int i = 0; i < cookies.length; i++) {
            if (!uc.canMine(cookies[i])) break; // Break because they're sorted by distance.
            if (cookies[i].getFood() > maxFood) {
                maxFood = cookies[i].getFood();
                maxFoodLocation = cookies[i].location;
            }
        }
        if (maxFoodLocation != null) uc.mine(maxFoodLocation);
    }

    @Override
    protected void Attack() {
        AttackEnemy();
        AttackRock();
    }

    @Override
    protected void ExecuteSpecialMechanics() {
		Mine();
		super.ExecuteSpecialMechanics();
    }

    @Override
    protected void PickTargetToMove() {
        if (myTiles.IsEmpty()) target = null;
        else target = myTiles.GetCenter();
//        uc.println(Utils.PrintLoc(myLoc) + " has target " + Utils.PrintLoc(target));
    }

    @Override
    protected void SendMessages() {
        super.SendMessages();
        Location[] tiles = myTiles.GetTiles();
        for (int i = 0; i < tiles.length; i++) {
            comm.SendAssignedTileMessage(tiles[i].x, tiles[i].y, uc.getInfo().getID(), round);
        }
    }

    @Override
    protected void Move() {
		if (!uc.canMove()) return;
        travel.TravelTo(target, obstacles, false);
    }
}
