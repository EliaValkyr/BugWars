package playermaster;

import bugwars.*;

import java.util.HashSet;
import java.util.Set;

public class Travel {
	private final boolean DEBUG = false;

	// Constants to indicate if we're free, or what direction we're circling.
	private final int FREE = 0;
	private final int CLOCKWISE = 1;
	private final int COUNTER_CLOCKWISE = 2;

	// Return codes for the Travel function. OK means we don't need to do anything else, REPEAT means we try to travel again.
	private final int OK = 0;
	private final int REPEAT = 1;

	private UnitController uc;

	// Current location of the unit that's moving. Updated every turn.
	private Location myLoc;
	// Contains whether the directions (with respect to myLoc) have an immovable obstacle.
	// Updated at the beginning of every turn.
	private boolean[] immovableObstacleDirections;

	// Target location. Every turn it might change for an adjacent location, to account for a unit that's moving.
	// If at any time the new target isn't adjacent, we reset all parameters and restart the bug path.
	private Location currentTarget;

	// Whether we're free travelling, surrounding clockwise or surrounding counter clockwise.
	private int currentSurroundingState;

	// Minimum distance from an adjacent obstacle (in any direction) to our target since we started surrounding.
	private int minDistObstacleToTarget;

	// Location of the last obstacle we've tried to surround.
	private Location lastSurroundedObstacle;

	// To encode locations for the hashset of visited locations.
	// This is where this unit started, it's not the same as the xBase, yBase in Communication.
	private int xBase;
	private int yBase;

	// Positions where I have been since I started surrounding.
	// The values are encoded, and contain the location x and y, the surrounding state,
	// and the direction to the last surrounded obstacle.
	private Set<Integer> visitedLocations;

	// Initializes the class with the unit controller and the base positions.
	public void InitGame(UnitController _uc) {
		uc = _uc;
		xBase = uc.getLocation().x;
		yBase = uc.getLocation().y;
		ResetState();
	}

	// Initializes the turn: updates the target and the obstacle directions.
	private void InitTurn(Location _target, RockInfo[] obstacles) {
		myLoc = uc.getLocation();
		if (currentTarget != null && currentTarget.distanceSquared(_target) > 2) {
			// If the new target has moved more than to an adjacent cell, we count it as a new unit.
			// So we reset it.
			if (DEBUG) uc.println("Our target changed, we reset");
			ResetState();
		}
		// Assign the new target.
		currentTarget = _target;

		// Compute which directions have an immovable obstacle.
		immovableObstacleDirections = new boolean[8];
		for (RockInfo obstacle : obstacles) {
			if (myLoc.distanceSquared(obstacle.getLocation()) < 3)
				immovableObstacleDirections[myLoc.directionTo(obstacle.getLocation()).ordinal()] = true;
			else break;
		}
	}

	// Resets the current state, starts the bug path from scratch.
	// Called when changing target, or when changing to free travel, or to surrounding.
	public void ResetState() {
		currentSurroundingState = FREE;
		minDistObstacleToTarget = Integer.MAX_VALUE;
		lastSurroundedObstacle = null;
		visitedLocations = new HashSet<>();
	}

	/**
	 * Encodes the current location to store it to the visitedLocations hashset.
	 * Bits position in bitmap:
	 * <p>
	 * - Bit 0: Surrounding state (clockwise/counter-clockwise)
	 * - Bits 1-4: Direction to last surrounded obstacle
	 * - Bits 5-13: y position (with respect to yBase)
	 * - Bits 14-22: x position (with respect to xBase)
	 */
	private int EncodeCurrentLocation() {
		return (((myLoc.x + 127 - xBase) & 0xFF) << 14)
				| (((myLoc.y + 127 - yBase) & 0xFF) << 5)
				| ((myLoc.directionTo(lastSurroundedObstacle).ordinal() & 0xF) << 1)
				| (currentSurroundingState & 0x1);
	}

	private boolean HaveVisitedCurrentLocation() {
		return visitedLocations.contains(EncodeCurrentLocation());
	}

	private void AddCurrentLocationToVisited() {
		visitedLocations.add(EncodeCurrentLocation());
	}

	// Returns whether it's better to start surrounding clockwise or counter-clockwise.
	private int ComputeBestSurroundingState() {
		int minDistClockwise = Integer.MAX_VALUE;
		int minDistCounterClockwise = Integer.MAX_VALUE;
		Direction targetDir = myLoc.directionTo(currentTarget);
		for (Direction dir: GetSideDirections(targetDir, /*clockwise*/ true)) {
			if (!uc.canMove(dir)) continue;
			minDistClockwise = myLoc.add(dir).distanceSquared(currentTarget);
			break;
		}
		for (Direction dir: GetSideDirections(targetDir, /*clockwise*/ false)) {
			if (!uc.canMove(dir)) continue;
			minDistCounterClockwise = myLoc.add(dir).distanceSquared(currentTarget);
			break;
		}
		return minDistClockwise < minDistCounterClockwise ? CLOCKWISE : COUNTER_CLOCKWISE;
	}

	private void SetSurroundingState() {
		currentSurroundingState = ComputeBestSurroundingState();
	}

	// When we touch the map edge, invert the surrounding direction.
	private void InvertSurroundingDirection() {
		if (currentSurroundingState == CLOCKWISE)
			currentSurroundingState = COUNTER_CLOCKWISE;
		else if (currentSurroundingState == COUNTER_CLOCKWISE)
			currentSurroundingState = CLOCKWISE;
	}

	// todo make static move to utils?
	// Returns the directions to one of the two sides of the given direction.
	private Direction[] GetSideDirections(Direction dir, boolean clockwise) {
		return clockwise
				? new Direction[]{
				dir.rotateRight(),
				dir.rotateRight().rotateRight(),
				dir.opposite().rotateLeft()}
				: new Direction[]{
				dir.rotateLeft(),
				dir.rotateLeft().rotateLeft(),
				dir.opposite().rotateRight()};
	}

	// todo make static move to utils?
	// Returns the directions ordered from best to worst, depending on the current surrounding state.
	private Direction[] GetOrderedDirections(int surroundingState, Direction bestDir) {
		if (surroundingState == FREE) {
			return Utils.GetDirectionsOrderedByClosest(bestDir);
		} else if (surroundingState == CLOCKWISE) {
			return new Direction[]{
					bestDir,
					bestDir.rotateRight(),
					bestDir.rotateRight().rotateRight(),
					bestDir.opposite().rotateLeft(),
					bestDir.opposite(),
					bestDir.opposite().rotateRight(),
					bestDir.rotateLeft().rotateLeft(),
					bestDir.rotateLeft(),
			};
		} else {
			return new Direction[]{
					bestDir,
					bestDir.rotateLeft(),
					bestDir.rotateLeft().rotateLeft(),
					bestDir.opposite().rotateRight(),
					bestDir.opposite(),
					bestDir.opposite().rotateLeft(),
					bestDir.rotateRight().rotateRight(),
					bestDir.rotateRight(),
			};
		}
	}

	private int FreeTravel() {
		if (DEBUG) uc.println("Free travel");
		Direction bestDir = myLoc.directionTo(currentTarget);
		if (uc.canMove(bestDir)) {
			//If we can go to the target, we do that.
			if (DEBUG) uc.println("Moves in the target direction, " + bestDir);
			uc.move(bestDir);
			return OK;
		} else {
			// We check if we can move in another direction.
			Direction[] dirs = GetOrderedDirections(FREE, bestDir);
			// While it encounters movable obstacles, tries to go around them without getting into surrounded state.
			// If it hits an immovable obstacle, it starts surrounding.
			for (Direction dir : dirs) {
				if (uc.canMove(dir)) {
					if (DEBUG) uc.println("Moves " + dir + ", best direction was " + bestDir);
					uc.move(dir);
					break;
				} else {
					if (immovableObstacleDirections[dir.ordinal()]) {
						//If we hit an obstacle, we set our state to surrounding and repeat, trying to surround it.
						if (DEBUG) uc.println("We hit an obstacle " + dir + ", start surrounding");
						SetSurroundingState();
						lastSurroundedObstacle = myLoc.add(dir);
						return REPEAT;
					}
				}
			}
			return OK;
		}
	}

	private int Surround() {
		Direction targetDir = myLoc.directionTo(currentTarget);
		if (DEBUG) uc.println("Start surrounding " + (currentSurroundingState == CLOCKWISE ? "clockwise" : "counterclockwise") + ", target dir is " + targetDir);
		if (HaveVisitedCurrentLocation()) {
			//Something went wrong and we completed a loop around the obstacle. We try surrounding again.
			if (DEBUG) uc.println("Oops, we had already visited this location. Restarting.");
			ResetState();
			return REPEAT;
		}
		Direction dirToObstacle = myLoc.directionTo(lastSurroundedObstacle);
		if (dirToObstacle == Direction.ZERO) {
			// This can happen if I destroy a tree and go to its position.
			// Sets the state to free because it means there's no obstacle anymore, and try moving again.
			if (DEBUG) uc.println("I'm at the location of my obstacle. Restarting.");
			ResetState();
			return REPEAT;
		}
		Direction[] dirsToObstacle = GetOrderedDirections(currentSurroundingState, dirToObstacle);
		for (int i = 0; i < dirsToObstacle.length; i++) {
			// Update closest obstacle to target with the adjacent obstacles, to know when we finish surrounding.
			if (!immovableObstacleDirections[i]) continue;
			Location loc = myLoc.add(dirsToObstacle[i]);
			if (loc.distanceSquared(currentTarget) < minDistObstacleToTarget) {
				minDistObstacleToTarget = loc.distanceSquared(currentTarget);
				if (DEBUG) uc.println("Updates min dist obstacle to currentTarget to " + minDistObstacleToTarget + " " + Utils.PrintLoc(loc));
			}
		}
		Direction[] targetDirs = GetOrderedDirections(currentSurroundingState, targetDir);
		for (int i = 0; i < targetDirs.length; i++) {
			Direction dir = targetDirs[i];
			if (uc.canMove(dir) && myLoc.add(dir).distanceSquared(currentTarget) < minDistObstacleToTarget) {
				// If we have finished surrounding, we set state to free.
				if (DEBUG) uc.println("I finished surrounding, yay!");
				ResetState();
				uc.move(dir);
				return OK;
			}
		}
		// We have not finished surrounding the obstacle.
		if (DEBUG) uc.println("I have not finished surrounding. Dist to currentTarget " + myLoc.distanceSquared(currentTarget) + ", obstacle to currentTarget " + minDistObstacleToTarget);
		for (int i = 0; i < dirsToObstacle.length; i++) {
			Direction dir = dirsToObstacle[i];
			Location newLoc = myLoc.add(dir);
			// If I can move in the direction, I do that, because the directions are ordered from best to worst.
			if (uc.canMove(dir)) {
				if (DEBUG) uc.println("Move " + dir + " to surround.");
				uc.move(dir);
				return OK;
			}

			// If I encounter an immovable obstacle, mark it as the last one surrounded.
			if (immovableObstacleDirections[dir.ordinal()]) {
				lastSurroundedObstacle = newLoc;
				if (DEBUG) uc.println("Update surrounded obstacle to " + Utils.PrintLoc(lastSurroundedObstacle));
			}

			// Limit to i <= 3 (i.e directions that aren't going backwards from the surrounding direction)
			// because the directions that are going backwards from the obstacle don't really matter if they are out of the map.
			if (i <= 3 && uc.isOutOfMap(newLoc)) {
				if (DEBUG) uc.println("Hit the edge of the map. Restarting.");
				//If we find the edge of the map, we invert the surrounding direction and repeat
				InvertSurroundingDirection();
				return REPEAT;
			}
		}
		// Can't move anywhere.
		if (DEBUG) uc.println("I can't move anywhere");
		return OK;
	}

	public void TravelTo(Location _target, RockInfo[] obstacles, boolean shouldStopAtAdjacentTile) {
		if (_target == null) return;
		if (!uc.canMove()) return;
		InitTurn(_target, obstacles);
		if (shouldStopAtAdjacentTile && myLoc.distanceSquared(_target) < 3) return;
		if (DEBUG) uc.println("===================== " + Utils.PrintLoc(myLoc) + " Travels to target " + Utils.PrintLoc(currentTarget) + " at distance " + myLoc.distanceSquared(currentTarget));
		int status = REPEAT;
		int tries = 20;
		// Try to travel a handful of times, because if the unit is in a small space it might return REPEAT a few times.
		while (status != OK && tries-- > 0) {
			if (currentSurroundingState == FREE) {
				status = FreeTravel();
			} else {
				status = Surround();
				if (status == OK && currentSurroundingState != FREE) {
					// Add current location to hashset
					AddCurrentLocationToVisited();
				}
			}
		}
	}

	public void TravelTo(Location _target, RockInfo[] obstacles) {
		TravelTo(_target, obstacles, true);
	}
}
