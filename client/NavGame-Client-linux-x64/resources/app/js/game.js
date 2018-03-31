var fs = require('fs');
const rq = require('electron-require');

var Painter = rq("./js/painter.js").Painter;

var Board = rq("./js/objects.js").Board;
var Wall = rq("./js/objects.js").Wall;
var Food = rq("./js/objects.js").Food;
var Team = rq("./js/objects.js").Team;
var Unit = rq("./js/objects.js").Unit;
var Action = rq("./js/objects.js").Action;
var Turn = rq("./js/objects.js").Turn;
var TeamTurn = rq("./js/objects.js").TeamTurn;
var unit_types = rq("./js/objects.js").unit_types;

Game = function(game_file = null, game_dir = null) {
	this.game_dir = game_dir;
	if (game_file != null) this.loadGame(game_file);
}

Game.prototype.render = function() {
	this.setGameMetainfo();

	var self = this;
	$("#content-board-canvas").mousedown(function(e) { self.handleMouseDown(e); });
	$('#content-controls-slider-input').on( "input", function() {self.changeTurn($(this).val());} );
	$('#content-controls-slider-input').attr("min", 1);
	$('#content-controls-slider-input').attr("max", this.rounds.length);

	this.ctx = $('#content-board-canvas')[0].getContext('2d');

	this.painter = new Painter(this.ctx, this.board.nr, this.board.nc, 'content-board');

	this.canvas_width = $('#content-board').innerWidth();
	this.canvas_height = $('#content-board').innerHeight();
	$('#content-board-canvas').attr('width', this.canvas_width);
	$('#content-board-canvas').attr('height', this.canvas_height);

	this.paintRound();
}

Game.prototype.loadGame = function(game_file) {
	this.BASIC_SPEED = 500;

	this.board = null;
	this.rounds = null;
	this.winner = null;
	this.win_condition = null;
	this.drawings1 = null;
	this.drawings2 = null;
	this.selectedUnitId = null;
	this.selectedFood = null;
	this.selectedWall = null;

	this.cw = null;
	this.ch = null;

	var game_str = fs.readFileSync(game_file).toString();
	this.parseGame(game_str);
	this.parseDrawings();

	this.curr_round = 0;
	this.curr_repr_speed = this.BASIC_SPEED;
	this.curr_repr_dir = 1;
	clearInterval(this.curr_interval);
	this.curr_interval = null;
}

/***************************** Menu info *************************************/
Game.prototype.setGameMetainfo = function() {
	$('#menu-viewer-userplayer1').html(
		'<font color=' + this.team1.color + '>' +
		this.team1.packageName +
		'</font>'
	);
	$('#menu-viewer-userplayer2').html(
		'<font color=' + this.team2.color + '>' +
		this.team2.packageName +
		'</font>'
	);
	if (this.winner == this.team1) {
		$('#menu-viewer-info1').css('border', '2px');
		$('#menu-viewer-info1').css('border-style', 'solid');
		$('#menu-viewer-info1').css('border-color', this.team1.color);

		$('#menu-viewer-info2').css('border-style', 'none');
	}
	else if (this.winner == this.team2) {
		$('#menu-viewer-info1').css('border-style', 'none');

		$('#menu-viewer-info2').css('border', '2px');
		$('#menu-viewer-info2').css('border-style', 'solid');
		$('#menu-viewer-info2').css('border-color', this.team2.color);
	}
	$('#wincondition').html(this.winCondition);
}

Game.prototype.setUnitsInfo = function(team, id) {
	var n_queen = 0;
	var n_ant = 0;
	var n_beelte = 0;
	var n_spider = 0;
	var n_bee = 0;
	for (var i = 0; i < team.units.length; i++) {
		if (team.units[i].type.name == "Queen") n_queen++;
		else if (team.units[i].type.name == "Ant") n_ant++;
		else if (team.units[i].type.name == "Beetle") n_beelte++;
		else if (team.units[i].type.name == "Spider") n_spider++;
		else if (team.units[i].type.name == "Bee") n_bee++;
	}
	$('#info-queen' + id).html(n_queen);
	$('#info-ant' + id).html(n_ant);
	$('#info-beetle' + id).html(n_beelte);
	$('#info-spider' + id).html(n_spider);
	$('#info-bee' + id).html(n_bee);
}

Game.prototype.setGameInfo = function() {
	var turn = this.rounds[this.curr_round];
	// Resources
	$('#info-resources1').html(turn.team1.resources);
	$('#info-resources2').html(turn.team2.resources);
	// Units
	this.setUnitsInfo(turn.team1, 1);
	this.setUnitsInfo(turn.team2, 2);
}

Game.prototype.setClickedUnitInfo = function(unit, team) {
	var img = null;
	if (team == this.team1) {
		if (unit.type.name == "Queen") img = images.queen1;
		else if (unit.type.name == "Ant") img = images.ant1;
		else if (unit.type.name == "Beetle") img = images.beetle1;
		else if (unit.type.name == "Spider") img = images.spider1;
		else if (unit.type.name == "Bee") img = images.bee1;
	} else if (team == this.team2) {
		if (unit.type.name == "Queen") img = images.queen2;
		else if (unit.type.name == "Ant") img = images.ant2;
		else if (unit.type.name == "Beetle") img = images.beetle2;
		else if (unit.type.name == "Spider") img = images.spider2;
		else if (unit.type.name == "Bee") img = images.bee2;
	}
	$("#info-clicked-image").attr("src", img.src);
	$('#info-clicked-type').html(unit.type.name);
	$('#info-clicked-id').html(unit.id);
	if (unit.cocoon > 0) {
		$('#info-clicked-cocoonbytecodes-lbl').html('Cocoon:');
		$('#info-clicked-cocoonbytecodes').html(unit.cocoon);
	} else {
		$('#info-clicked-cocoonbytecodes-lbl').html('Bytecodes:');
		$('#info-clicked-cocoonbytecodes').html(unit.bytecodes);
	}
	$('#info-clicked-curr_health').html(unit.health);
	$('#info-clicked-health').html(unit.type.max_health);
	$('#info-clicked-cost').html(unit.type.cost);
	$('#info-clicked-attack_range').html(unit.type.attack_range);
	$('#info-clicked-curr_movement_delay').html(Math.round(unit.movement_delay * 100) / 100);
	$('#info-clicked-movement_delay').html(unit.type.movement_delay);
	$('#info-clicked-attack').html(unit.type.attack);
	$('#info-clicked-sight_range').html(unit.type.sight_range);
	$('#info-clicked-curr_attack_delay').html(Math.round(unit.attack_delay * 100) / 100);
	$('#info-clicked-attack_delay').html(unit.type.attack_delay);
	$('#info-clicked-movement').html(unit.type.movement_range);
	$('#info-clicked-mining_range').html(unit.type.mining_range);

	this.setClickedUnitLog(unit);
}

Game.prototype.setClickedUnitLog = function(unit) {
	$('#info-clicked-log').html("");
	var unit_log_file = this.game_dir + '/' + unit.id + ".txt"
	var unit_log;
	try {
		unit_log = fs.readFileSync(unit_log_file).toString();
		var index = unit_log.indexOf("R" + this.curr_round + "> ");
		if (index != -1) {
			unit_log = unit_log.substring(index);
			$('#info-clicked-log').html(unit_log);
		}
	} catch (err) {
	}
	$('#info-clicked-log').css('visibility', 'visible');
}

Game.prototype.setClickedFoodInfo = function(x, y) {
	var quantity = null;
	for (var i = 0; i < this.rounds[this.curr_round].foods.length; i++) {
		var curr_food = this.rounds[this.curr_round].foods[i];
		if (curr_food.x == x && curr_food.y == y) {
			quantity = curr_food.quantity;
		}
	}
	if (quantity == null) return;
	$("#info-clicked-image").attr("src", images.food.src);
	$('#info-clicked-type').html('Food');
	$('#info-clicked-id').html(quantity);

	$('#info-clicked-cocoonbytecodes-lbl').css('visibility', 'hidden');
	$('#info-clicked-cocoonbytecodes').css('visibility', 'hidden');
	$('#info-clicked-table').css('visibility', 'hidden');
	$('#info-clicked-log').css('visibility', 'hidden');
}

Game.prototype.setClickedWallInfo = function(x, y) {
	var health = null;
	for (var i = 0; i < this.rounds[this.curr_round].walls.length; i++) {
		var curr_wall = this.rounds[this.curr_round].walls[i];
		if (curr_wall.x == x && curr_wall.y == y) {
			health = curr_wall.health;
		}
	}
	if (health == null) return;
	$("#info-clicked-image").attr("src", images.wall.src);
	$('#info-clicked-type').html('Rock');
	$('#info-clicked-id').html(health);

	$('#info-clicked-cocoonbytecodes-lbl').css('visibility', 'hidden');
	$('#info-clicked-cocoonbytecodes').css('visibility', 'hidden');
	$('#info-clicked-table').css('visibility', 'hidden');
	$('#info-clicked-log').css('visibility', 'hidden');
}

/***************************** Paint round ***********************************/
Game.prototype.paintRound = function() {
	$('#menu-viewer-infoclicked-content').css('display', 'none');
	$('#menu-viewer-infoclicked-log').css('display', 'none');
	this.cw = this.canvas_width / this.board.nc;
	this.ch = this.canvas_height / this.board.nr;

	this.painter.paintBackground();
	this.painter.paintGrid();

	if (this.rounds == null) return;

	var round = this.rounds[this.curr_round];
	// Obstacles
	for (var i = 0; i < round.walls.length; i++) {
		this.painter.paintElement(images.wall, round.walls[i].x, round.walls[i].y);
	}
	// Food
	for (var i = 0; i < round.foods.length; i++) {
		this.painter.paintElement(images.food, round.foods[i].x, round.foods[i].y);
	}
	// Units player 1
	for (var i = 0; i < round.team1.units.length; i++) {
		this.painter.paintUnit(round.team1.units[i], 1);
	}
	// Units player 2
	for (var i = 0; i < round.team2.units.length; i++) {
		this.painter.paintUnit(round.team2.units[i], 2);
	}
	// Actions player 1
	for (var i = 0; i < round.team1.actions.length; i++) {
		this.painter.paintAction(round.team1.actions[i], this.team1.color);
	}
	// Actions player 2
	for (var i = 0; i < round.team2.actions.length; i++) {
		this.painter.paintAction(round.team2.actions[i], this.team2.color);
	}

	// Selected unit
	if (this.selectedUnitId != null) {
		for (var i = 0; i < round.team1.units.length; i++) {
			var unit = round.team1.units[i];
			if (unit.id == this.selectedUnitId) {
				this.painter.paintRange(unit.x, unit.y, unit.type.sight_range, 0, "green");
				this.painter.paintRange(unit.x, unit.y, unit.type.attack_range, unit.type.min_attack_range, "red");
				this.setClickedUnitInfo(unit, this.team1);
				if (this.drawings1 != null) this.painter.paintDrawings(this.drawings1[this.curr_round], unit.id);
			}
		}
		for (var i = 0; i < round.team2.units.length; i++) {
			var unit = round.team2.units[i];
			if (unit.id == this.selectedUnitId) {
				this.painter.paintRange(unit.x, unit.y, unit.type.sight_range, 0, "green");
				this.painter.paintRange(unit.x, unit.y, unit.type.attack_range, unit.type.min_attack_range, "red");
				this.setClickedUnitInfo(unit, this.team2);
				if (this.drawings2 != null) this.painter.paintDrawings(this.drawings2[this.curr_round], unit.id);
			}
		}
		$('#menu-viewer-infoclicked-content').css('display', 'inline-block');
		$('#menu-viewer-infoclicked-log').css('display', 'inline-block');
	}

	// Selected food
	if (this.selectedFood != null) {
		this.setClickedFoodInfo(this.selectedFood.x, this.selectedFood.y);
		$('#menu-viewer-infoclicked-content').css('display', 'inline-block');
		$('#menu-viewer-infoclicked-log').css('display', 'inline-block');
	}

	// Selected wall
	if (this.selectedWall != null) {
		this.setClickedWallInfo(this.selectedWall.x, this.selectedWall.y);
		$('#menu-viewer-infoclicked-content').css('display', 'inline-block');
		$('#menu-viewer-infoclicked-log').css('display', 'inline-block');
	}

	this.setGameInfo();

	// Round slider
	$('#content-controls-slider-round').html(this.curr_round);
	$('#content-controls-slider-input').val(this.curr_round);
}

/***************************** Parser ****************************************/
Game.prototype.parseGame = function(game_str) {
	// By lines
	var lines = game_str.split('\n');
	var line = 0;
	// User and player 1
	var token = lines[line++];
	this.team1 = new Team("blue", token);
	// User and player 2
	var token = lines[line++];
	this.team2 = new Team("red", token);
	// Board size
	var tokens = lines[line++].split(' ');
	this.board = new Board(parseInt(tokens[0]), parseInt(tokens[1]));
	// Turns
	var n_rounds = parseInt(lines[lines.length - 2]);
	this.rounds = new Array(n_rounds);
	for (var k_round = 0; k_round < n_rounds; k_round++) {
		// Obstacles
		var n_obs = parseInt(lines[line++]);
		var walls = new Array(n_obs);
		for (var k_walls = 0; k_walls < n_obs; k_walls++) {
			var tokens = lines[line++].split(' ');
			walls[k_walls] = new Wall(parseInt(tokens[0]), parseInt(tokens[1]),
											parseInt(tokens[2]));
		}
		// Food
		var n_foods = parseInt(lines[line++]);
		var foods = new Array(n_foods);
		for (var k_food = 0; k_food < n_foods; k_food++) {
			var tokens = lines[line++].split(' ');
			foods[k_food] = new Food(parseInt(tokens[0]), parseInt(tokens[1]),
											parseInt(tokens[2]));
		}
		// Teams
		var team_round = new Array(2);
		for (var i = 0; i < 2; i++) {
			// Resources
			var resources = parseInt(lines[line++]);
			// Units
			var n_units = parseInt(lines[line++]);
			var units = new Array(n_units);
			for (var k_unit = 0; k_unit < n_units; k_unit++) {
				var tokens = lines[line++].split(' ');
				units[k_unit] = new Unit(
					parseInt(tokens[0]), //id
					unit_types[parseInt(tokens[1])], //type
					parseInt(tokens[2]), parseInt(tokens[3]), //location
					parseInt(tokens[4]), parseInt(tokens[5]), //previous location
					parseInt(tokens[6]), //health
					parseFloat(tokens[7]), parseFloat(tokens[8]), //movement and attack delay
					parseInt(tokens[9]), //cocoon
					parseInt(tokens[10]) //bytecodes
				);
			}
			// Actions
			var n_actions = parseInt(lines[line++]);
			var actions = new Array(n_actions);
			for (var k_action = 0; k_action < n_actions; k_action++) {
				var tokens = lines[line++].split(' ');
				actions[k_action] = new Action(
					parseInt(tokens[0]), //type
					parseInt(tokens[1]), parseInt(tokens[2]), //from location
					parseInt(tokens[3]), parseInt(tokens[4]) //to location
				);
			}
			team_round[i] = new TeamTurn(resources, units, actions);
		}
		this.rounds[k_round] = new Turn(walls, foods, team_round[0], team_round[1]);
	}
	// Winner
	var token = lines[line++];
	if (token == 1) this.winner = this.team1;
	else if (token == 2) this.winner = this.team2;
	else this.winner = null;
	this.win_condition = lines[line++];
}

Game.prototype.parseDrawing = function(team_id) {
	var drawings = {};
	var draw_file = this.game_dir + '/draw' + team_id + '.txt'
	try {
		var drawing = fs.readFileSync(draw_file).toString();
		// By lines
		var lines = drawing.split('\n');
		var current = -1;
		for(var line = 0; line < lines.length; line++) {
			// By tokens
			var tokens = lines[line].split(' ');
			var round = parseInt(tokens[0].substring(1, tokens[0].length - 1));
			var unit_id = parseInt(tokens[1]);
			var x = parseInt(tokens[2]);
			var y = parseInt(tokens[3]);
			var color = tokens[4];
			if (round > current) {
				drawings[round] = [];
				current = round;
			}
			drawings[round].push([unit_id, x, y, color]);
		}
	} catch (err) {
	}
	if (team_id == 1) this.drawings1 = drawings;
	else if (team_id == 2) this.drawings2 = drawings;
}

Game.prototype.parseDrawings = function() {
	if (this.game_dir == null) return;
	this.parseDrawing(1);
	this.parseDrawing(2);
}


/***************************** Game controls *********************************/
Game.prototype.decrementSpeed = function() {
	this.pauseReplay();
	if (this.curr_repr_dir == 1) {
		this.curr_repr_speed = this.BASIC_SPEED;
	} else {
		this.curr_repr_speed = this.curr_repr_speed / 2;
	}
	this.curr_repr_dir = -1;
	this.startReplay();
}

Game.prototype.incrementSpeed = function() {
	this.pauseReplay();
	if (this.curr_repr_dir == -1) {
		this.curr_repr_speed = this.BASIC_SPEED;
	} else {
		this.curr_repr_speed = this.curr_repr_speed / 2;
	}
	this.curr_repr_dir = 1;
	this.startReplay();
}
Game.prototype.decrementRound = function() {
	if (this.curr_round > 0) {
		this.curr_round = this.curr_round - 1;
		this.paintRound();
	} else {
		this.pauseReplay();
	}
}

Game.prototype.incrementRound = function() {
	if (this.curr_round < this.rounds.length - 1) {
		this.curr_round = this.curr_round + 1;
		this.paintRound();
	} else {
		this.pauseReplay();
	}
}

Game.prototype.changeTurn = function(new_round) {
	this.curr_round = new_round - 1;
	this.paintRound();
	if (this.curr_round == this.rounds.length - 1) this.pauseReplay();
};

Game.prototype.startReplay = function() {
	var self = this;
	this.curr_interval = setInterval(function() {
		if (self.curr_repr_dir == 1) self.incrementRound();
		else self.decrementRound();
	}, this.curr_repr_speed);
	$('#span_play').css('display', "none");
	$('#span_pause').css('display', "inline");
}

Game.prototype.pauseReplay = function() {
	clearInterval(this.curr_interval);
	this.curr_interval = null;
	$('#span_play').css('display', "inline");
	$('#span_pause').css('display', "none");
}

Game.prototype.stopReplay = function() {
	this.curr_repr_speed = this.BASIC_SPEED;
	this.curr_repr_dir = 1;
	this.pauseReplay();
	this.curr_round = 0;
	this.paintRound();
}

/***************************** handleMouseDown *******************************/
Game.prototype.checkClickedUnit = function(units, mouseX, mouseY) {
	for (var i = 0; i < units.length; i++) {
		var unit = units[i];
		this.painter.define(unit.x, this.board.nr - 1 - unit.y);
		if(this.ctx.isPointInPath(mouseX, mouseY)) {
			this.selectedUnitId = unit.id;
		}
	}
}

Game.prototype.checkClickedFood = function(mouseX, mouseY) {
	for (var i = 0; i < this.rounds[this.curr_round].foods.length; i++) {
		var food = this.rounds[this.curr_round].foods[i];
		this.painter.define(food.x, this.board.nr - 1 - food.y);
		if(this.ctx.isPointInPath(mouseX, mouseY)) {
			this.selectedFood = {'x': food.x, 'y': food.y};
		}
	}
}

Game.prototype.checkClickedWall = function(mouseX, mouseY) {
	for (var i = 0; i < this.rounds[this.curr_round].walls.length; i++) {
		var wall = this.rounds[this.curr_round].walls[i];
		this.painter.define(wall.x, this.board.nr - 1 - wall.y);
		if(this.ctx.isPointInPath(mouseX, mouseY)) {
			this.selectedWall = {'x': wall.x, 'y': wall.y};
		}
	}
}

Game.prototype.handleMouseDown = function(e) {
	e.preventDefault();

	// get the mouse position
	var mouseX = parseInt(e.clientX - $("#content-board-canvas").offset().left);
	var mouseY = parseInt(e.clientY - $("#content-board-canvas").offset().top);

	this.selectedUnitId = null;
	this.selectedFood = null;
	this.selectedWall = null;
	var round = this.rounds[this.curr_round];
	this.checkClickedUnit(round.team1.units, mouseX, mouseY);
	this.checkClickedUnit(round.team2.units, mouseX, mouseY);
	if (this.selectedUnitId == null) this.checkClickedFood(mouseX, mouseY);
	if (this.selectedUnitId == null) this.checkClickedWall(mouseX, mouseY);
	this.paintRound();
}

exports.Game = Game;
