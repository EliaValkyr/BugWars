
// Images
var ground = new Image();
var wall = new Image();
var food = new Image();
var queen = [new Image(), new Image()];
var ant = [new Image(), new Image()];
var beetle = [new Image(), new Image()];
var spider = [new Image(), new Image()];
var bee = [new Image(), new Image()];

bee[1].onload = function() { current_game = 0; loadGameList(); };
bee[0].onload = function() { bee[1].src = 'resources/units/bee2.png'; };
spider[1].onload = function() { bee[0].src = 'resources/units/bee1.png'; };
spider[0].onload = function() { spider[1].src = 'resources/units/spider2.png'; };
beetle[1].onload = function() { spider[0].src = 'resources/units/spider1.png'; };
beetle[0].onload = function() { beetle[1].src = 'resources/units/beetle2.png'; };
ant[1].onload = function() { beetle[0].src = 'resources/units/beetle1.png'; };
ant[0].onload = function() { ant[1].src = 'resources/units/ant2.png'; };
queen[1].onload = function() { ant[0].src = 'resources/units/ant1.png'; };
queen[0].onload = function() { queen[1].src = 'resources/units/queen2.png'; };
wall.onload = function() { queen[0].src = 'resources/units/queen1.png'; };
food.onload = function() { wall.src = 'resources/wall.png'; };
ground.onload = function() { food.src = 'resources/food.png'; };
ground.src = 'resources/ground.png';

// Menu
var showing_menu_select = true;

window.onresize = function(event) {
	resizeElements();
};

window.onload = function(event) {
	resizeElements();
	fs.exists(default_games_dir_file, function(exists) {
		if (exists) {
			fs.readFile(default_games_dir_file, 'utf-8', (err, data) => {
				if (err) {
					console.log(err);
					return;
				}
				if (data != "") {
					default_games_dir = data;
					loadGameList();
				}
			});
		}
	});
};

// Canvas and arrow sizes
resizeElements = function() {
	// Game board size
	$('#game-board').css('width', '100%');
	var canvas_size = Math.max(
		Math.min(
			$('#game-board').innerWidth(),
			$('#content').innerHeight() - $('#game-buttons').innerHeight()
		),
		10
	);
	$('#game-board').css('height', canvas_size + 'px');
	
	// Game canvas size
	var board_width = $('#game-board').innerWidth();
	$('#game-area').css('width', canvas_size);
	$('#game-canvas').attr('width', canvas_size);
	$('#game-canvas').attr('height', canvas_size);
	$('#game-buttons').css('width', canvas_size);

	// Turn slider size
	$('#turn-slider').css('width', $('#game-canvas').attr('width') * .3 + 'px');
	
	paintTurn();
};

showMessage = function(message) {
	$('#game-buttons').css('visibility', "hidden");
	$('#game-board').css('visibility', "hidden");
	$('#game-message').html('<h3>' + message + '</h3>');
	$('#game-message').css('display', "inline");
};

showBoard = function() {
	$('#game-message').css('display', "none");
	$('#game-buttons').css('visibility', "visible");
	$('#game-board').css('visibility', "visible");
};

$('#change-menu').click(function() {
	if (showing_menu_select) {
		$('#menu-select').css('display', 'none');
		$('#menu-info').css('display', 'inline');
		$('#change-menu').html('Select game');
	} else {
		$('#menu-select').css('display', 'inline');
		$('#menu-info').css('display', 'none');
		$('#change-menu').html('Show game info');
	}
	showing_menu_select = !showing_menu_select;
});
