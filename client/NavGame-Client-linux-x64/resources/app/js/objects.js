
exports.Board = class {
	constructor(nr, nc) {
		this.nr = nr;
		this.nc = nc;
	}
}

exports.Wall = class {
	constructor(x, y, health) {
		this.x = x;
		this.y = y;
		this.health = health;
	}
}

exports.Food = class {
	constructor(x, y, quantity) {
		this.x = x;
		this.y = y;
		this.quantity = quantity;
	}
}

exports.Team = class {
	constructor(color, user, player) {
		this.color = color;
		this.user = user;
		this.player = player;
		this.resources = 0;
		this.units = [];
		this.actions = [];
	}
}

exports.Unit = class {
	constructor(id, type, x, y, prevx, prevy, health, movement_delay,
		attack_delay, cocoon, bytecodes) {
		this.id = id;
		this.type = type;
		this.x = x;
		this.y = y;
		this.prevx = prevx;
		this.prevy = prevy;
		this.health = health;
		this.movement_delay = movement_delay;
		this.attack_delay = attack_delay;
		this.cocoon = cocoon;
		this.bytecodes = bytecodes;
	}
}

exports.Action = class {
	constructor(type, fromx, fromy, tox, toy) {
		this.type = type;
		this.fromx = fromx;
		this.fromy = fromy;
		this.tox = tox;
		this.toy = toy;
	}
}

class UnitType {
	constructor(name, cost, max_health, attack, attack_range, min_attack_range,
		sight_range, movement_range, mining_range, attack_delay, movement_delay) {
		this.name = name;
		this.cost = cost;
		this.max_health = max_health;
		this.attack = attack;
		this.attack_range = attack_range;
		this.min_attack_range = min_attack_range;
		this.sight_range = sight_range;
		this.movement_range = movement_range;
		this.mining_range = mining_range;
		this.attack_delay = attack_delay;
		this.movement_delay = movement_delay;
	}
}
exports.unit_types = [
	new UnitType("Queen",    0, 250, 0,  0, 0, 36, 2, 0, 1, 3),
	new UnitType("Ant",    150,  15, 1,  5, 0, 24, 2, 2, 2, 2),
	new UnitType("Beetle", 200,  45, 4,  5, 0, 24, 2, 0, 2, 2),
	new UnitType("Spider", 280,  10, 3, 18, 9, 32, 2, 0, 2, 2),
	new UnitType("Bee",    300, 100, 1,  5, 0, 36, 2, 0, 1, 1)
];

exports.Turn = class {
	constructor(walls, foods, team_turn1, team_turn2) {
		this.walls = walls;
		this.foods = foods;
		this.team1 = team_turn1;
		this.team2 = team_turn2;
	}
}

exports.TeamTurn = class {
	constructor(resources, units, actions) {
		this.resources = resources;
		this.units = units;
		this.actions = actions;
	}
}
