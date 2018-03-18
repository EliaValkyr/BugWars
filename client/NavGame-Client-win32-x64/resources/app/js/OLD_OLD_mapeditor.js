const fs = require('fs');

// Images
var ground = new Image();
var wall = new Image();
var food = new Image();
var queen = [new Image(), new Image()];
var ant = [new Image(), new Image()];
var beetle = [new Image(), new Image()];
var spider = [new Image(), new Image()];
var bee = [new Image(), new Image()];

bee[1].onload = function() { erase.src = 'resources/erase.png'; };
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
var nr = null, nc = null;
var r1 = null, r2 = null;

var selectedImage = null;
var symmetry = null;
var board = null;
var foods = null;

var parsed_walls = null;
var parsed_food = null;
var parsed_units1 = null;
var parsed_units2 = null;

window.onresize = function(event) {
	resizeElements();
};

window.onload = function(event) {
	resizeElements();
};

// Canvas and arrow sizes
resizeElements = function() {
	// Game board size
	$('#game-board').css('width', '100%');
	var canvas_size = Math.max(
		Math.min(
			$('#game-board').innerWidth(),
			$('#content').innerHeight()
		),
		10
	);
	$('#game-board').css('height', canvas_size + 'px');
	
	// Game canvas size
	var board_width = $('#game-board').innerWidth();
	$('#game-area').css('width', canvas_size);
	$('#game-canvas').attr('width', canvas_size);
	$('#game-canvas').attr('height', canvas_size);
	$('#game-board').css('visibility', "visible");
	
	paintBackground();
	paintGrid();
};

// Containers, canvas and context
var ctx = $('#game-canvas')[0].getContext('2d');

paintBackground = function() {
	ctx.drawImage(ground, 0, 0, $('#game-canvas').attr('width'), $('#game-canvas').attr('height'));
}

paintGrid = function() {
	if (nr == null) return;
	var cw = $('#game-canvas').attr('width') / nc;
	var ch = $('#game-canvas').attr('height') / nr;
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

paintElement = function(img, x, y) {
	var cw = $('#game-canvas').attr('width') / nc;
	var ch = $('#game-canvas').attr('height') / nr;
	ctx.drawImage(img, x* cw, y * ch, cw, ch);
}

paintBoard = function() {
	paintBackground();
	paintGrid();
	for (var x = 0; x < nc; x++) {
		for (var y = 0; y < nr; y++) {
			if (foods[x][y] != null) {
				paintElement(food, x, y);
			}
		}
	}
	for (var x = 0; x < nc; x++) {
		for (var y = 0; y < nr; y++) {
			if (board[x][y] != null) {
				paintElement(board[x][y], x, y);
			}
		}
	}
}

addElement = function(img, x, y) {
	if (img == erase) {
		board[x][y] = null;
		foods[x][y] = null;
	}
	else if (img == food) {
		var quantity = parseInt($('#food-quantity').val());
		if (isNaN(quantity)) return;
		if (quantity < 1) return;
		foods[x][y] = quantity;
	}
	else if (img == wall) {
		board[x][y] = img;
		foods[x][y] = null;
	}
	else board[x][y] = img;
}

getSymmetricalImage = function(img) {
	if (img == wall) return wall;
	if (img == food) return food;
	if (img == queen[0]) return queen[1];
	if (img == ant[0]) return ant[1];
	if (img == beetle[0]) return beetle[1];
	if (img == spider[0]) return spider[1];
	if (img == bee[0]) return bee[1];
	if (img == queen[1]) return queen[0];
	if (img == ant[1]) return ant[0];
	if (img == beetle[1]) return beetle[0];
	if (img == spider[1]) return spider[0];
	if (img == bee[1]) return bee[0];
	if (img == erase) return erase;
}

applySymmetry = function(img, x, y) {
	if (img != wall && img != food && img != erase) {
		if (symmetry == 'horitzonal' && x == Math.floor(nc / 2)) return;
		if (symmetry == 'vertical' && y == Math.floor(nr / 2)) return;
		if (symmetry == 'rotacional' && x == Math.floor(nc / 2) && y == Math.floor(nr / 2)) return;
	}
	addElement(img, x, y);
	if (symmetry == 'horitzonal') {
		addElement(getSymmetricalImage(img), nc - 1 - x, y);
	} else if (symmetry == 'vertical') {
		addElement(getSymmetricalImage(img), x, nr - 1 - y);
	} else if (symmetry == 'rotacional') {
		addElement(getSymmetricalImage(img), nc - 1 - x, nr - 1 - y);
	}
}

function define(x, y) {
	var cw = $('#game-canvas').attr('width') / nc;
	var ch = $('#game-canvas').attr('height') / nr;
	ctx.beginPath();
	ctx.moveTo(x * cw, y * ch);
	ctx.lineTo((x + 1) * cw, y * ch);
	ctx.lineTo((x + 1) * cw, (y + 1) * ch);
	ctx.lineTo(x * cw, (y + 1) * ch);
	ctx.lineTo(x * cw, y * ch);
}

function handleMouseDown(e) {
	if (selectedImage == null) return;
	e.preventDefault();

	// get the mouse position
	var mouseX = parseInt(e.clientX - $("#game-canvas").offset().left);
	var mouseY = parseInt(e.clientY - $("#game-canvas").offset().top);
	
	// All
	for (var x = 0; x < nc; x++) {
		for (var y = 0; y < nr; y++) {
			// define the current shape
			define(x, y);
			// test if the mouse is in the current shape
			if (ctx.isPointInPath(mouseX, mouseY)) {
				applySymmetry(selectedImage, x, y);
				paintBoard();
			}
		}
	}
}

function startEdition(_symmetry) {
	nr = $('#board-size').val();
	nc = nr;
	symmetry = _symmetry;

	board = new Array(nr);
	for (var x = 0; x < nc; x++) {
		board[x] = new Array(nr);
		for (var y = 0; y < nr; y++) {
			board[x][y] = null;
		}
	}

	foods = new Array(nr);
	for (var x = 0; x < nc; x++) {
		foods[x] = new Array(nr);
		for (var y = 0; y < nr; y++) {
			foods[x][y] = null;
		}
	}

	$('#palette').css('display', 'inline');
	$('#meta-info').css('display', 'inline');
	$('#save_div').css('display', 'inline');
	$('#board-size').prop('disabled', true);

	paintBackground();
	paintGrid();
}

(function () {
	var oldVal;
	$('#board-size').on('change textInput input', function () {
		var val = this.value;
		if (val !== oldVal) {
			oldVal = val;
			var board_size = parseInt(val);
			if (isNaN(board_size) || board_size < 2 || board_size > 50) {
				$('#symmetry-horitzonal').prop('disabled', true);
				$('#symmetry-vertical').prop('disabled', true);
				$('#symmetry-rotacional').prop('disabled', true);
			} else {
				$('#symmetry-horitzonal').prop('disabled', false);
				$('#symmetry-vertical').prop('disabled', false);
				$('#symmetry-rotacional').prop('disabled', false);
			}
		}
	});
}());

$("#game-canvas").mousedown(function(e) { handleMouseDown(e); });

function removeAllSelections() {
	$('#wall').css('border-style', 'none');
	$('#food').css('border-style', 'none');
	$('#queen1').css('border-style', 'none');
	$('#ant1').css('border-style', 'none');
	$('#beetle1').css('border-style', 'none');
	$('#spider1').css('border-style', 'none');
	$('#bee1').css('border-style', 'none');
	$('#queen2').css('border-style', 'none');
	$('#ant2').css('border-style', 'none');
	$('#beetle2').css('border-style', 'none');
	$('#spider2').css('border-style', 'none');
	$('#bee2').css('border-style', 'none');
	$('#erase').css('border-style', 'none');
}

function selectPalette(id) {
	removeAllSelections();
	$('#' + id).css('border', '1px');
	$('#' + id).css('border-style', 'solid');
	$('#' + id).css('border-color', 'green');
}

$('#wall').click(function() { selectedImage = wall; selectPalette('wall'); });
$('#food').click(function() { selectedImage = food; selectPalette('food'); });
$('#queen1').click(function() { selectedImage = queen[0]; selectPalette('queen1'); });
$('#ant1').click(function() { selectedImage = ant[0]; selectPalette('ant1'); });
$('#beetle1').click(function() { selectedImage = beetle[0]; selectPalette('beetle1'); });
$('#spider1').click(function() { selectedImage = spider[0]; selectPalette('spider1'); });
$('#bee1').click(function() { selectedImage = bee[0]; selectPalette('bee1'); });
$('#queen2').click(function() { selectedImage = queen[1]; selectPalette('queen2'); });
$('#ant2').click(function() { selectedImage = ant[1]; selectPalette('ant2'); });
$('#beetle2').click(function() { selectedImage = beetle[1]; selectPalette('beetle2'); });
$('#spider2').click(function() { selectedImage = spider[1]; selectPalette('spider2'); });
$('#bee2').click(function() { selectedImage = bee[1]; selectPalette('bee2'); });
$('#erase').click(function() { selectedImage = erase; selectPalette('erase'); });

$('#symmetry-horitzonal').click(function() {
	$('#symmetry-horitzonal').prop('disabled', true);
	$('#symmetry-vertical').css('display', 'none');
	$('#symmetry-rotacional').css('display', 'none');
	startEdition('horitzonal');
});

$('#symmetry-vertical').click(function() {
	$('#symmetry-horitzonal').css('display', 'none');
	$('#symmetry-vertical').prop('disabled', true);
	$('#symmetry-rotacional').css('display', 'none');
	startEdition('vertical');
});

$('#symmetry-rotacional').click(function() {
	$('#symmetry-horitzonal').css('display', 'none');
	$('#symmetry-vertical').css('display', 'none');
	$('#symmetry-rotacional').prop('disabled', true);
	startEdition('rotacional');
});

class Wall {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

class Food {
	constructor(x, y, quantity) {
		this.x = x;
		this.y = y;
		this.quantity = quantity;
	}
}

class Unit {
	constructor(type, x, y) {
		this.type = type;
		this.x = x;
		this.y = y;
	}
}

function parse_board() {
	parsed_walls = new Array();
	parsed_foods = new Array();
	parsed_units1 = new Array();
	parsed_units2 = new Array();
	for (var x = 0; x < nc; x++) {
		for (var y = 0; y < nr; y++) {
			if (board[x][y] == wall) parsed_walls.push(new Wall(x, y));
			else if (board[x][y] == queen[0]) parsed_units1.push(new Unit(0, x, y));
			else if (board[x][y] == ant[0]) parsed_units1.push(new Unit(1, x, y));
			else if (board[x][y] == beetle[0]) parsed_units1.push(new Unit(2, x, y));
			else if (board[x][y] == spider[0]) parsed_units1.push(new Unit(3, x, y));
			else if (board[x][y] == bee[0]) parsed_units1.push(new Unit(4, x, y));
			else if (board[x][y] == queen[1]) parsed_units2.push(new Unit(0, x, y));
			else if (board[x][y] == ant[1]) parsed_units2.push(new Unit(1, x, y));
			else if (board[x][y] == beetle[1]) parsed_units2.push(new Unit(2, x, y));
			else if (board[x][y] == spider[1]) parsed_units2.push(new Unit(3, x, y));
			else if (board[x][y] == bee[1]) parsed_units2.push(new Unit(4, x, y));
		}
	}
	for (var x = 0; x < nc; x++) {
		for (var y = 0; y < nr; y++) {
			if (foods[x][y] != null) parsed_foods.push(new Food(x, y, foods[x][y]));
		}
	}
}

$('#maps-folder').change(function(evt) {
	if (evt.target.files.length == 0) return;
	var dir = evt.target.files[0]['path'];

	parse_board();

	if ($('#offsetx').val() == '' || $('#offsety').val() == '') return;
	r1 = parseInt($('#offsetx').val());
	r2 = parseInt($('#offsety').val());

	var map_name = $('#map-name').val();
	if (map_name == '') return;
	file = dir + '/' + map_name + '.txt';

	if (fs.existsSync(file)) fs.unlinkSync(file);
	fs.appendFileSync(file, '' + nr + ' ' + nc + '\n');
	fs.appendFileSync(file, '' + r1 + ' ' + r2 + '\n');
	fs.appendFileSync(file, '' + parsed_walls.length + '\n')
	for (var i = 0; i < parsed_walls.length; i++) {
		fs.appendFileSync(file, '' + parsed_walls[i].x + ' ' + (nr - 1 - parsed_walls[i].y) + '\n')
	}
	fs.appendFileSync(file, '' + parsed_foods.length + '\n')
	for (var i = 0; i < parsed_foods.length; i++) {
		fs.appendFileSync(file, '' + parsed_foods[i].x + ' ' + (nr - 1 - parsed_foods[i].y) + ' ' + parsed_foods[i].quantity + '\n')
	}
	fs.appendFileSync(file, '' + parsed_units1.length + '\n')
	for (var i = 0; i < parsed_units1.length; i++) {
		fs.appendFileSync(file, '' + parsed_units1[i].x + ' ' + (nr - 1 - parsed_units1[i].y) + ' ' + parsed_units1[i].type + '\n')
	}
	fs.appendFileSync(file, '' + parsed_units2.length + '\n')
	for (var i = 0; i < parsed_units2.length; i++) {
		fs.appendFileSync(file, '' + parsed_units2[i].x + ' ' + (nr - 1 - parsed_units2[i].y) + ' ' + parsed_units2[i].type + '\n')
	}
});
