package playermaster;


import bugwars.*;

public class Bee extends Troop {
//todo change these arrays
    int[][] vsBee = new int[][]{
            {  0, 10,  0,-10, -2},
            { 10,  5,  0,-10, -2},
            {  0,  0,-10, -5, -1},
            {-10,-10, -5, -1,  0},
            { -2, -2, -1,  0,  0},
    };

    int[][] vsSpider = new int[][]{
            {  0, 15, 10, -5,-10},
            { 15, 10, 10, -5,-10},
            { 10, 10, -5, -8,  0},
            { -5, -5, -8,-10,  0},
            {-10,-10,  0,  0,  0},
    };

    int[][] vsBeetle = new int[][]{
            {  0,  0,  0, -5,  0},
            {  0,  0,  0, -5,  0},
            {  0,  0, -5, -2,  0},
            { -5, -5, -2,  0,  0},
            {  0,  0,  0,  0,  0},
    };

    int[][] vsAnt = new int[][]{
            {  0,  8,  6,  4,  2},
            {  8,  7,  5,  3,  1},
            {  6,  5,  4,  2,  0},
            {  4,  3,  2,  1,  0},
            {  2,  1,  0,  0,  0},
    };

    int[][] vsQueen = new int[][]{
            {  0,  4,  3,  2,  1},
            {  4,  3,  3,  2,  1},
            {  3,  3,  2,  2,  1},
            {  2,  2,  2,  1,  0},
            {  1,  1,  1,  0,  0},
    };

    @Override
    int GetCellValue(UnitType type, int dx, int dy) {
        if (type == UnitType.BEETLE) return vsBeetle[dx][dy];
        else if (type == UnitType.BEE) return vsBee[dx][dy];
        else if (type == UnitType.SPIDER) return vsSpider[dx][dy];
        else if (type == UnitType.ANT) return vsAnt[dx][dy];
        else return vsQueen[dx][dy];
    }

    @Override
    protected void Attack() {
        AttackEnemy();
        AttackRock();
    }

    @Override
    protected void ReadMessages() {

    }

    @Override
    protected void Move() {
		if (!uc.canMove()) return;
        travel.TravelTo(target, obstacles);
    }
}
