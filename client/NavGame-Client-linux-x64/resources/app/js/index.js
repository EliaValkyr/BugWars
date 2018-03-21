
const rq = require('electron-require');
var Controller = rq("./js/controller.js").Controller;

var controller = null;

// Images
var img_mining_range = new Image();
var img_sight_range = new Image();
var img_attack_range = new Image();
var img_move_delay = new Image();
var img_attack_delay = new Image();
var img_movement = new Image();
var img_attack = new Image();
var img_health = new Image();
var img_ground = new Image();
var img_wall = new Image();
var img_food = new Image();
var img_queen1 = new Image();
var img_ant1 = new Image();
var img_beetle1 = new Image();
var img_spider1 = new Image();
var img_bee1 = new Image();
var img_queen2 = new Image();
var img_ant2 = new Image();
var img_beetle2 = new Image();
var img_spider2 = new Image();
var img_bee2 = new Image();
var img_erase = new Image();

window.onresize = function(event) {
	if (controller != null) controller.resizeElements();
};

window.onload = function(event) {
	img_mining_range.onload = function() {
		controller = new Controller('games');
		controller.resizeElements();
		controller.render();
	};
	img_sight_range.onload  = function() { img_mining_range.src = 'resources/unit_info/mining_range.png'; };
	img_attack_range.onload = function() { img_sight_range.src  = 'resources/unit_info/sight_range.png'; };
	img_move_delay.onload   = function() { img_attack_range.src = 'resources/unit_info/attack_range.png'; };
	img_attack_delay.onload = function() { img_move_delay.src   = 'resources/unit_info/movement_delay.png'; };
	img_movement.onload     = function() { img_attack_delay.src = 'resources/unit_info/attack_delay.png'; };
	img_attack.onload       = function() { img_movement.src     = 'resources/unit_info/movement.png'; };
	img_health.onload       = function() { img_attack.src       = 'resources/unit_info/attack.png'; };
	img_bee2.onload         = function() { img_health.src       = 'resources/unit_info/health.png'; };
	img_bee1.onload         = function() { img_bee2.src         = 'resources/units/bee2.png'; };
	img_spider2.onload      = function() { img_bee1.src         = 'resources/units/bee1.png'; };
	img_spider1.onload      = function() { img_spider2.src      = 'resources/units/spider2.png'; };
	img_beetle2.onload      = function() { img_spider1.src      = 'resources/units/spider1.png'; };
	img_beetle1.onload      = function() { img_beetle2.src      = 'resources/units/beetle2.png'; };
	img_ant2.onload         = function() { img_beetle1.src      = 'resources/units/beetle1.png'; };
	img_ant1.onload         = function() { img_ant2.src         = 'resources/units/ant2.png'; };
	img_queen2.onload       = function() { img_ant1.src         = 'resources/units/ant1.png'; };
	img_queen1.onload       = function() { img_queen2.src       = 'resources/units/queen2.png'; };
	img_wall.onload         = function() { img_queen1.src       = 'resources/units/queen1.png'; };
	img_food.onload         = function() { img_wall.src         = 'resources/wall.png'; };
	img_erase.onload        = function() { img_food.src         = 'resources/food.png'; };
	img_ground.onload       = function() { img_erase.src        = 'resources/erase.png'; };
	img_ground.src = 'resources/ground.png';
};
