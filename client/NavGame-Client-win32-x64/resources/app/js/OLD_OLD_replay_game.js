
const rq = require('electron-require');
var Board = rq("./js/objects.js").Board;
var Wall = rq("./js/objects.js").Wall;
var Food = rq("./js/objects.js").Food;
var Team = rq("./js/objects.js").Team;
var Unit = rq("./js/objects.js").Unit;
var Action = rq("./js/objects.js").Action;
var Turn = rq("./js/objects.js").Turn;
var TeamTurn = rq("./js/objects.js").TeamTurn;
var unit_types = rq("./js/objects.js").unit_types;

var teams = null;
var board = null;
var winner = null;
var winCondition = null;
var walls = null;

var turns = null;

var drawings1 = null;
var drawings2 = null;

var game_dir = null;

// Containers, canvas and context
var ctx = $('#game-canvas')[0].getContext('2d');

// Game replay
var current_turn = 0;
var current_interval = null;
var BASIC_SPEED = 500;
var current_speed = BASIC_SPEED;
var current_dir = 1;

var selectedUnitId = null;
var selectedFood = null;

startGameReplay = function(game_file, _game_dir) {
	teams = null;
	board = null;
	winner = null;
	winCondition = null;
	walls = null;
	foods = null;
	turns = null;
	drawings1 = null;
	drawings2 = null;
	selectedUnitId = null;
	selectedFood = null;

	game_dir = _game_dir;
	var game_str = fs.readFileSync(game_file).toString();

	parseGame(game_str);
	setGameMetainfo();
	parseDrawings();

	// Turn slider
	$('#turn-slider').attr("min", 1);
	$('#turn-slider').attr("max", turns.length);

	// Game replay variables
	current_turn = 0;
	current_speed = BASIC_SPEED;
	current_dir = 1;
	clearInterval(current_interval);
	current_interval = null;
	
	paintTurn();

	// Game play/pause button, and visibility
	$('#span_play').css('display', 'inline');
	$('#span_pause').css('display', 'none');

	showBoard();
}

/*****************************************************************************/
/***************************** Parser game ***********************************/
/*****************************************************************************/

function parseGame(game_str) {
	// By lines
	var lines = game_str.split('\n');
	var line = 0;
	// User and player 1
	var tokens = lines[line++].split(' ');
	team1 = new Team("blue", tokens[0], tokens[1]);
	// User and player 2
	var tokens = lines[line++].split(' ');
	team2 = new Team("red", tokens[0], tokens[1]);
	// Board size
	var tokens = lines[line++].split(' ');
	board = new Board(parseInt(tokens[0]), parseInt(tokens[1]));
	// Obstacles
	var n_obs = parseInt(lines[line++]);
	walls = new Array(n_obs);
	for (var i = 0; i < n_obs; i++) {
		var tokens = lines[line++].split(' ');
		walls[i] = new Wall(parseInt(tokens[0]), parseInt(tokens[1]));
	}
	// Turns
	var n_turns = parseInt(lines[lines.length - 2]);
	turns = new Array(n_turns);
	for (var k_turn = 0; k_turn < n_turns; k_turn++) {
		// Food
		var n_foods = parseInt(lines[line++]);
		var foods = new Array(n_foods);
		for (var k_food = 0; k_food < n_foods; k_food++) {
			var tokens = lines[line++].split(' ');
			foods[k_food] = new Food(parseInt(tokens[0]), parseInt(tokens[1]), parseInt(tokens[2]));
		}
		// Teams
		var team_turn = new Array(2);
		for (var i = 0; i < 2; i++) {
			// Resources
			var resources = parseInt(lines[line++]);
			// Units
			var n_units = parseInt(lines[line++]);
			units = new Array(n_units);
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
			actions = new Array(n_actions);
			for (var k_action = 0; k_action < n_actions; k_action++) {
				var tokens = lines[line++].split(' ');
				actions[k_action] = new Action(
					parseInt(tokens[0]), //type
					parseInt(tokens[1]), parseInt(tokens[2]), //from location
					parseInt(tokens[3]), parseInt(tokens[4]) //to location
				);
			}
			team_turn[i] = new TeamTurn(resources, units, actions);
		}
		turns[k_turn] = new Turn(foods, team_turn[0], team_turn[1]);
	}
	// Winner
	var token = lines[line++];
	if (token == 1) winner = team1;
	else if (token == 2) winner = team2;
	else winner = null;
	winCondition = lines[line++];
}

function parseDrawing(team_id) {
	drawings = {};
	var draw_file = game_dir + '/draw' + team_id + '.txt'
	try {
		drawing = fs.readFileSync(draw_file).toString();
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
	if (team_id == 1) drawings1 = drawings;
	else if (team_id == 2) drawings2 = drawings;
}

function parseDrawings() {
	parseDrawing(1);
	parseDrawing(2);
}

/*****************************************************************************/
/***************************** handleMouseDown *******************************/
/*****************************************************************************/

function define(x, y) {
	var cw = $('#game-canvas').attr('width') / board.nc;
	var ch = $('#game-canvas').attr('height') / board.nr;
	ctx.beginPath();
	ctx.moveTo(x * cw, (board.nr - 1 - y) * ch);
	ctx.lineTo(x * cw, (board.nr - 1 - y + 1) * ch);
	ctx.lineTo((x + 1) * cw, (board.nr - 1 - y + 1) * ch);
	ctx.lineTo((x + 1) * cw, (board.nr - 1 - y) * ch);
	ctx.lineTo(x * cw, (board.nr - 1 - y) * ch);
}

function checkClickedUnit(team, mouseX, mouseY) {
	for (var i = 0; i < team.units.length; i++) {
		var unit = team.units[i];
		// define the current shape
		define(unit.x, unit.y);
		// test if the mouse is in the current shape
		if(ctx.isPointInPath(mouseX, mouseY)) {
			// if inside, display the shape's message
			selectedUnitId = unit.id;
		}
	}
}

function checkClickedFood(mouseX, mouseY) {
	// Food
	for (var i = 0; i < turns[current_turn].foods.length; i++) {
		var food = turns[current_turn].foods[i];
		// define the current shape
		define(food.x, food.y);
		// test if the mouse is in the current shape
		if(ctx.isPointInPath(mouseX, mouseY)) {
			// if inside, display the shape's message
			selectedFood = {'x': food.x, 'y': food.y};
		}
	}
}

function handleMouseDown(e) {
	e.preventDefault();

	// get the mouse position
	var mouseX = parseInt(e.clientX - $("#game-canvas").offset().left);
	var mouseY = parseInt(e.clientY - $("#game-canvas").offset().top);
	
	selectedUnitId = null;
	selectedFood = null;
	var turn = turns[current_turn];
	checkClickedUnit(turn.team1, mouseX, mouseY);
	checkClickedUnit(turn.team2, mouseX, mouseY);
	if (selectedUnitId == null) checkClickedFood(mouseX, mouseY);
	paintTurn();
}

$("#game-canvas").mousedown(function(e) { handleMouseDown(e); });

/*****************************************************************************/
/***************************** Paint functions *******************************/
/*****************************************************************************/
paintBackground = function() {
	ctx.drawImage(ground, 0, 0, $('#game-canvas').attr('width'), $('#game-canvas').attr('height'));
}

paintGrid = function() {
	var cw = $('#game-canvas').attr('width') / board.nc;
	var ch = $('#game-canvas').attr('height') / board.nr;
	ctx.beginPath();
	for (var x = 0; x <= $('#game-canvas').attr('width'); x += cw) {
		ctx.moveTo(x, 0);
		ctx.lineTo(x, $('#game-canvas').attr('height'));
	}
	for (var y = 0; y <= $('#game-canvas').attr('height'); y += ch) {
		ctx.moveTo(0, y);
		ctx.lineTo($('#game-canvas').attr('width'), y);
	}
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'gray';
	ctx.stroke();
}

paintHealth = function(health, x, y) {
	var cw = $('#game-canvas').attr('width') / board.nc;
	var ch = $('#game-canvas').attr('height') / board.nr;
	fromx = (x) * cw;
	fromy = (board.nr - 1 - y + 0.1) * ch;
	tox = (x + 1) * cw;
	toy = (board.nr - 1 - y + 0.1) * ch;

	ctx.beginPath();
	ctx.moveTo(fromx, fromy);
	ctx.lineTo(fromx + (tox - fromx) * health, toy);

	ctx.lineWidth = 3;
	ctx.strokeStyle = 'green';
	ctx.stroke();
}

paintCocoon = function(cocoon, x, y) {
	var cw = $('#game-canvas').attr('width') / board.nc;
	var ch = $('#game-canvas').attr('height') / board.nr;
	fromx = (x) * cw;
	fromy = (board.nr - 1 - y + 0.1) * ch;
	tox = (x + 1) * cw;
	toy = fromy;

	ctx.beginPath();
	ctx.moveTo(fromx, fromy);
	ctx.lineTo(fromx + (tox - fromx) * cocoon, toy);

	ctx.lineWidth = 3;
	ctx.strokeStyle = 'dimgrey';
	ctx.stroke();
}

paintBytecodes = function(bytecodes, x, y) {
	if (bytecodes <= 10000) return;
	var cw = $('#game-canvas').attr('width') / board.nc;
	var ch = $('#game-canvas').attr('height') / board.nr;
	x = (x + 0.85) * cw;
	y = (board.nr - 1 - y + 0.85) * ch;

	ctx.beginPath();
	ctx.arc(x, y, cw / 8, 0, 2 * Math.PI, false);
	ctx.fillStyle = 'black';
	ctx.fill();
}

paintMovement = function(fromx, fromy, tox, toy) {
	if (typeof fromx == 'undefined') return;
	if (fromx == tox && fromy == toy) return;

	var cw = $('#game-canvas').attr('width') / board.nc;
	var ch = $('#game-canvas').attr('height') / board.nr;
	var fromy = board.nr - 1 - fromy;
	var toy = board.nr - 1 - toy;
	var auxx = fromx;
	var auxy = fromy;
	fromx = (fromx + 0.5 + 0.35 * (tox - fromx)) * cw;
	fromy = (fromy + 0.5 + 0.35 * (toy - fromy)) * ch;
	tox = (tox + 0.5 + 0.35 * (auxx - tox)) * cw;
	toy = (toy + 0.5 + 0.35 * (auxy - toy)) * ch;

	ctx.beginPath();
	ctx.moveTo(fromx, fromy);
	ctx.lineTo(tox, toy);
	ctx.lineWidth = 2;
	ctx.strokeStyle = "orange";
	ctx.stroke();
}

paintElement = function(img, x, y) {
	var cw = $('#game-canvas').attr('width') / board.nc;
	var ch = $('#game-canvas').attr('height') / board.nr;
	ctx.drawImage(img, x * cw, (board.nr - 1 - y) * ch, cw, ch);
}

paintUnit = function(unit, color) {
	var cw = $('#game-canvas').attr('width') / board.nc;
	var ch = $('#game-canvas').attr('height') / board.nr;
	
	if (color == "blue") id = 0;
	else if (color == "red") id = 1;
	else id = -1;
	if (unit.type.name == "Queen") img = queen[id];
	else if (unit.type.name == "Ant") img = ant[id];
	else if (unit.type.name == "Beetle") img = beetle[id];
	else if (unit.type.name == "Spider") img = spider[id];
	else if (unit.type.name == "Bee") img = bee[id];
	else img = null;
	
	paintMovement(unit.prevx, unit.prevy, unit.x, unit.y);
	ctx.drawImage(img, unit.x * cw, (board.nr - 1 - unit.y) * ch, cw, ch);
	if (unit.cocoon > 0) {
		paintCocoon(unit.cocoon / 10, unit.x, unit.y)
	} else {
		paintHealth(unit.health / unit.type.max_health, unit.x, unit.y);
	}
	paintBytecodes(unit.bytecodes, unit.x, unit.y)
}

paintAction = function(action, color) {
	var cw = $('#game-canvas').attr('width') / board.nc;
	var ch = $('#game-canvas').attr('height') / board.nr;

	fromx = (action.fromx + 0.5) * cw;
	fromy = (board.nr - 1 - action.fromy + 0.5) * ch;
	tox = (action.tox + 0.5) * cw;
	toy = (board.nr - 1 - action.toy + 0.5) * ch;
	var headlen = cw / 4;
	var angle = Math.atan2(toy - fromy, tox - fromx);

	ctx.beginPath();
	ctx.moveTo(fromx, fromy);
	ctx.lineTo(tox, toy);
	ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6),
				toy - headlen * Math.sin(angle - Math.PI / 6));
	ctx.moveTo(tox, toy);
	ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6),
				toy - headlen * Math.sin(angle + Math.PI / 6));
	ctx.lineWidth = 1;
	ctx.strokeStyle = color;
	ctx.stroke();
}

paintRange = function(x, y, range, min_range, color) {
	if (range == 0) return;
	var cw = $('#game-canvas').attr('width') / board.nc;
	var ch = $('#game-canvas').attr('height') / board.nr;
	
	ctx.globalAlpha = 0.2;
	ctx.fillStyle = color;
	for (i = x - range; i <= x + range; i++) { 
		for (j = y - range; j <= y + range; j++) {
			var square_dist = Math.pow((x - i), 2) + Math.pow((y - j), 2);
			if (square_dist >= min_range) {
				if (square_dist <= range) {
					if (i >= 0 && j >= 0 && i < board.nc && j < board.nr) {
						ctx.fillRect(i * cw, (board.nr - 1 - j) * ch, cw, ch);
					}
				}
			}
		}
	}
	ctx.globalAlpha = 1.0;
}

paintDrawings = function(drawings, unit_id = null) {
	var cw = $('#game-canvas').attr('width') / board.nc;
	var ch = $('#game-canvas').attr('height') / board.nr;

	drawings = drawings[current_turn];
	if(typeof drawings == "undefined") return;
	for (var i = 0; i < drawings.length; i++) {
		if (unit_id == null || drawings[i][0] == unit_id) {
			var x = (drawings[i][1] + 0.5) * cw;
			var y = (board.nr - 1 - drawings[i][2] + 0.5) * ch;
			var color = drawings[i][3];

			var radius = cw / 4;
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
			ctx.fillStyle = color;
			ctx.fill();
		}
	}
}

setUnitsInfo = function(team, id) {
	n_queen = 0; n_ant = 0; n_beelte = 0; n_spider = 0; n_bee = 0;
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

setGameMetainfo = function() {
	$('#req-user-player').html(
		'<font color=' + team1.color + '>' +
		team1.user + " (" + team1.player + ")" +
		'</font>'
	);
	$('#res-user-player').html(
		'<font color=' + team2.color + '>' +
		team2.user + " (" + team2.player + ")" +
		'</font>'
	);
	if (winner == team1) {
		$('#info1').css('border', '2px');
		$('#info1').css('border-style', 'solid');
		$('#info1').css('border-color', team1.color);

		$('#info2').css('border-style', 'none');
	}
	else if (winner == team2) {
		$('#info1').css('border-style', 'none');

		$('#info2').css('border', '2px');
		$('#info2').css('border-style', 'solid');
		$('#info2').css('border-color', team2.color);
	}
	$('#wincondition').html(winCondition);
}

setGameInfo = function() {
	var turn = turns[current_turn];
	// Resources
	$('#info-resources1').html(turn.team1.resources);
	$('#info-resources2').html(turn.team2.resources);
	// Units
	setUnitsInfo(turn.team1, 1);
	setUnitsInfo(turn.team2, 2);
}

setUnitInfo = function(unit, team_id) {
	var img;
	if (unit.type.name == "Queen") img = queen[team_id - 1].src;
	else if (unit.type.name == "Ant") img = ant[team_id - 1].src;
	else if (unit.type.name == "Beetle") img = beetle[team_id - 1].src;
	else if (unit.type.name == "Spider") img = spider[team_id - 1].src;
	else if (unit.type.name == "Bee") img = bee[team_id - 1].src;
	else img = null;
	$("#info-clicked-image").attr("src", img);
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
	$('#info-clicked-curr_movement_delay').html(unit.movement_delay);
	$('#info-clicked-movement_delay').html(unit.type.movement_delay);
	$('#info-clicked-attack').html(unit.type.attack);
	$('#info-clicked-sight_range').html(unit.type.sight_range);
	$('#info-clicked-curr_attack_delay').html(unit.attack_delay);
	$('#info-clicked-attack_delay').html(unit.type.attack_delay);
	$('#info-clicked-movement').html(unit.type.movement_range);
	$('#info-clicked-mining_range').html(unit.type.mining_range);
	$('#info_clicked').css('display', 'inline');
	$('#info-clicked-table').css('visibility', 'visible');
	setUnitLog(unit);
}

setFoodInfo = function(x, y) {
	var quantity = null;
	for (var i = 0; i < turns[current_turn].foods.length; i++) {
		var cur_food = turns[current_turn].foods[i];
		if (cur_food.x == x && cur_food.y == y) {
			quantity = cur_food.quantity;
		}
	}
	if (quantity == null) return;
	$("#info-clicked-image").attr("src", food.src);
	$('#info-clicked-type').html('Food');
	$('#info-clicked-id').html(quantity);

	$('#info_clicked').css('display', 'inline');
	$('#info-clicked-cocoonbytecodes-lbl').css('visibility', 'hidden');
	$('#info-clicked-cocoonbytecodes').css('visibility', 'hidden');
	$('#info-clicked-table').css('visibility', 'hidden');
	$('#info-clicked-log').css('visibility', 'hidden');
}

setUnitLog = function(unit) {
	$('#info-clicked-log').html("");
	var unit_log_file = game_dir + '/' + unit.id + ".txt"
	var unit_log;
	try {
		unit_log = fs.readFileSync(unit_log_file).toString();
		var index = unit_log.indexOf("R" + current_turn + "> ");
		if (index != -1) {
			unit_log = unit_log.substring(index);
			$('#info-clicked-log').html(unit_log);
		}
	} catch (err) {
	}
	$('#info-clicked-log').css('visibility', 'visible');
}

paintTurn = function() {
	if (turns == null) return;
	$('#info_clicked').css('display', 'none');

	paintBackground();
	paintGrid();
	
	// Obstacles
	for (var i = 0; i < walls.length; i++) {
		paintElement(wall, walls[i].x, walls[i].y);
	}
	
	var turn = turns[current_turn];
	// Food
	for (var i = 0; i < turn.foods.length; i++) {
		paintElement(food, turn.foods[i].x, turn.foods[i].y);
	}
	// Units player 1
	for (var i = 0; i < turn.team1.units.length; i++) {
		paintUnit(turn.team1.units[i], team1.color);
	}
	// Units player 2
	for (var i = 0; i < turn.team2.units.length; i++) {
		paintUnit(turn.team2.units[i], team2.color);
	}
	// Actions player 1
	for (var i = 0; i < turn.team1.actions.length; i++) {
		paintAction(turn.team1.actions[i], team1.color);
	}
	// Actions player 2
	for (var i = 0; i < turn.team2.actions.length; i++) {
		paintAction(turn.team2.actions[i], team2.color);
	}

	// Selected unit
	if (selectedUnitId != null) {
		for (var i = 0; i < turn.team1.units.length; i++) {
			unit = turn.team1.units[i];
			if (unit.id == selectedUnitId) {
				paintRange(unit.x, unit.y, unit.type.sight_range, 0, "green");
				paintRange(unit.x, unit.y, unit.type.attack_range, unit.type.min_attack_range, "red");
				setUnitInfo(unit, 1);
				paintDrawings(drawings1, unit.id);
			}
		}
		for (var i = 0; i < turn.team2.units.length; i++) {
			unit = turn.team2.units[i];
			if (unit.id == selectedUnitId) {
				paintRange(unit.x, unit.y, unit.type.sight_range, 0, "green");
				paintRange(unit.x, unit.y, unit.type.attack_range, unit.type.min_attack_range, "red");
				setUnitInfo(unit, 2);
				paintDrawings(drawings2, unit.id);
			}
		}
	}
	// Selected food
	if (selectedFood != null) {
		setFoodInfo(selectedFood.x, selectedFood.y);
	}

	setGameInfo();

	// Turn slider
	$('#turn-label').html("Turn: " + current_turn);
	$('#turn-slider').val(current_turn);
}

/*****************************************************************************/
/***************************** Turn management *******************************/
/*****************************************************************************/
decrementTurn = function() {
	if (current_turn > 0) {
		current_turn = current_turn - 1;
		paintTurn();
	} else {
		pauseReplay();
	}
}

incrementTurn = function() {
	if (current_turn < turns.length - 1) {
		current_turn = current_turn + 1;
		paintTurn();
	} else {
		pauseReplay();
	}
}

changeTurn = function(new_turn) {
	current_turn = new_turn - 1;
	paintTurn();
	if (current_turn == turns.length - 1) pauseReplay();
};

startReplay = function() {
	current_interval = setInterval(function() {
		if (current_dir == 1) incrementTurn();
		else decrementTurn();
	}, current_speed);
	$('#span_play').css('display', "none");
	$('#span_pause').css('display', "inline");
}

pauseReplay = function() {
	clearInterval(current_interval);
	current_interval = null;
	$('#span_play').css('display', "inline");
	$('#span_pause').css('display', "none");
}

stopReplay = function() {
	current_speed = BASIC_SPEED;
	current_dir = 1;
	pauseReplay();
	current_turn = 0;
	paintTurn();
}

$('#play_pause').click(function() {
	current_speed = BASIC_SPEED;
	current_dir = 1;
	if (current_interval == null) {
		startReplay();
	} else {
		pauseReplay();
	}
});

$('#stop').click(function() {
	stopReplay();
});

$('#backward').click(function() {
	pauseReplay();
	if (current_dir == 1) {
		current_speed = BASIC_SPEED;
	} else {
		current_speed = current_speed / 2;
	}
	current_dir = -1;
	startReplay();
});

$('#forward').click(function() {
	pauseReplay();
	if (current_dir == -1) {
		current_speed = BASIC_SPEED;
	} else {
		current_speed = current_speed / 2;
	}
	current_dir = 1;
	startReplay();
});

$('#step_backward').click(function() {
	pauseReplay();
	decrementTurn();
});

$('#step_forward').click(function() {
	pauseReplay();
	incrementTurn();
});
