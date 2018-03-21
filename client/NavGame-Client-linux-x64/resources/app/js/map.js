var fs = require('fs');
const rq = require('electron-require');

var Painter = rq("./js/painter.js").Painter;

Mapp = function() {
	this.nr = null;
	this.nc = null;
	this.symmetry = null;
	this.offsetx = null;
	this.offsety = null;
	this.selection = null;

	this.board = null;
	this.foods = null;
	this.walls = null;

	this.p_walls = null;
	this.p_foods = null;
	this.p_units1 = null;
	this.p_units2 = null;

	this.ctx = null;
	this.painter = null;
	this.canvas_width = null;
	this.canvas_height = null;
}

Mapp.prototype.render = function() {
	if (this.nr == null) return;

	if (this.ctx == null) {
		var self = this;
		$("#mapeditor-board-canvas").mousedown(function(e) { self.handleMouseDown(e); });
		this.ctx = $('#mapeditor-board-canvas')[0].getContext('2d');
		this.painter = new Painter(this.ctx, this.nr, this.nc, 'mapeditor-board');
	}

	this.canvas_width = $('#mapeditor-board').innerWidth();
	this.canvas_height = $('#mapeditor-board').innerHeight();
	$('#mapeditor-board-canvas').attr('width', this.canvas_width);
	$('#mapeditor-board-canvas').attr('height', this.canvas_height);

	this.paintBoard();
}

Mapp.prototype.setSize = function(nr, nc) {
	this.nr = nr;
	this.nc = nc;

	this.board = new Array(this.nr);
	for (var x = 0; x < this.nc; x++) {
		this.board[x] = new Array(this.nr);
		for (var y = 0; y < this.nr; y++) {
			this.board[x][y] = null;
		}
	}

	this.foods = new Array(this.nr);
	for (var x = 0; x < this.nc; x++) {
		this.foods[x] = new Array(this.nr);
		for (var y = 0; y < this.nr; y++) {
			this.foods[x][y] = null;
		}
	}

	this.walls = new Array(this.nr);
	for (var x = 0; x < this.nc; x++) {
		this.walls[x] = new Array(this.nr);
		for (var y = 0; y < this.nr; y++) {
			this.walls[x][y] = null;
		}
	}
}

Mapp.prototype.setSymmetry = function(symmetry) {
	this.symmetry = symmetry;
}

Mapp.prototype.setOffset = function(x, y) {
	this.offsetx = x;
	this.offsety = y;
}

Mapp.prototype.setSelected = function(selected) {
	this.selected = selected;
}

/***************************** Add element ***********************************/
Mapp.prototype.paintBoard = function() {
	this.painter.paintBackground();
	this.painter.paintGrid();
	for (var x = 0; x < this.nc; x++) {
		for (var y = 0; y < this.nr; y++) {
			if (this.foods[x][y] != null) {
				this.painter.paintElement(img_food, x, this.nr - 1 -y);
			}
		}
	}
	for (var x = 0; x < this.nc; x++) {
		for (var y = 0; y < this.nr; y++) {
			if (this.walls[x][y] != null) {
				this.painter.paintElement(img_wall, x, this.nr - 1 -y);
			}
		}
	}
	for (var x = 0; x < this.nc; x++) {
		for (var y = 0; y < this.nr; y++) {
			if (this.board[x][y] != null) {
				this.painter.paintElement(this.board[x][y], x, this.nr - 1 -y);
			}
		}
	}
}

/***************************** Add element ***********************************/
Mapp.prototype.addElement = function(img, x, y) {
	if (img == img_erase) {
		this.board[x][y] = null;
		this.foods[x][y] = null;
		this.walls[x][y] = null;
	}
	else if (img == img_food) {
		$('#food-quantity').css('border-color', '');
		var quantity = parseInt($('#food-quantity').val());
		if (isNaN(quantity) || quantity <= 0) {
			$('#food-quantity').css('border-color', 'red');
			return;
		}
		this.foods[x][y] = quantity;
		this.walls[x][y] = null;
	}
	else if (img == img_wall) {
		$('#wall-health').css('border-color', '');
		var health = parseInt($('#wall-health').val());
		if (isNaN(health) || health <= 0) {
			$('#wall-health').css('border-color', 'red');
			return;
		}
		this.walls[x][y] = health;
		this.board[x][y] = null;
		this.foods[x][y] = null;
	}
	else {
		this.board[x][y] = img;
		this.walls[x][y] = null;
	}
}

Mapp.prototype.getSymmetricalImage = function() {
	if (this.selected == 'wall') return img_wall;
	if (this.selected == 'food') return img_food;
	if (this.selected == 'queen1') return img_queen2;
	if (this.selected == 'ant1') return img_ant2;
	if (this.selected == 'beetle1') return img_beetle2;
	if (this.selected == 'spider1') return img_spider2;
	if (this.selected == 'bee1') return img_bee2;
	if (this.selected == 'queen2') return img_queen1;
	if (this.selected == 'ant2') return img_ant1;
	if (this.selected == 'beetle2') return img_beetle1;
	if (this.selected == 'spider2') return img_spider1;
	if (this.selected == 'bee2') return img_bee1;
	if (this.selected == 'erase') return img_erase;
}

Mapp.prototype.getImage = function() {
	if (this.selected == 'wall') return img_wall;
	if (this.selected == 'food') return img_food;
	if (this.selected == 'queen1') return img_queen1;
	if (this.selected == 'ant1') return img_ant1;
	if (this.selected == 'beetle1') return img_beetle1;
	if (this.selected == 'spider1') return img_spider1;
	if (this.selected == 'bee1') return img_bee1;
	if (this.selected == 'queen2') return img_queen2;
	if (this.selected == 'ant2') return img_ant2;
	if (this.selected == 'beetle2') return img_beetle2;
	if (this.selected == 'spider2') return img_spider2;
	if (this.selected == 'bee2') return img_bee2;
	if (this.selected == 'erase') return img_erase;
}

Mapp.prototype.checkSymmetryAndAdd = function(x, y) {
	if (this.selected != 'wall' && this.selected != 'food' && this.selected != 'erase') {
		if (this.symmetry == 'horitzonal' && x == Math.floor(this.nc / 2)) return;
		if (this.symmetry == 'vertical' && y == Math.floor(this.nr / 2)) return;
		if (this.symmetry == 'rotational' && x == Math.floor(this.nc / 2) &&
				y == Math.floor(this.nr / 2)) return;
	}
	this.addElement(this.getImage(), x, y);
	if (this.symmetry == 'horitzonal') {
		this.addElement(this.getSymmetricalImage(), this.nc - 1 - x, y);
	} else if (this.symmetry == 'vertical') {
		this.addElement(this.getSymmetricalImage(), x, this.nr - 1 - y);
	} else if (this.symmetry == 'rotational') {
		this.addElement(this.getSymmetricalImage(), this.nc - 1 - x, this.nr - 1 - y);
	}
}

/***************************** handleMouseDown *******************************/
Mapp.prototype.handleMouseDown = function(e) {
	if (this.selected == null) return;
	e.preventDefault();

	// get the mouse position
	var mouseX = parseInt(e.clientX - $("#mapeditor-board-canvas").offset().left);
	var mouseY = parseInt(e.clientY - $("#mapeditor-board-canvas").offset().top);
	
	// All cells
	for (var x = 0; x < this.nc; x++) {
		for (var y = 0; y < this.nr; y++) {
			// define the current shape
			this.painter.define(x, y);
			// test if the mouse is in the current shape
			if (this.ctx.isPointInPath(mouseX, mouseY)) {
				this.checkSymmetryAndAdd(x, y);
				this.paintBoard();
			}
		}
	}
}

/***************************** Save map **************************************/
class Wall {
	constructor(x, y, health) {
		this.x = x;
		this.y = y;
		this.health = health;
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

Mapp.prototype.parseBoard = function() {
	this.p_walls = new Array();
	this.p_foods = new Array();
	this.p_units1 = new Array();
	this.p_units2 = new Array();
	for (var x = 0; x < this.nc; x++) {
		for (var y = 0; y < this.nr; y++) {
			if (this.board[x][y] == img_queen1) this.p_units1.push(new Unit(0, x, y));
			else if (this.board[x][y] == img_ant1) this.p_units1.push(new Unit(1, x, y));
			else if (this.board[x][y] == img_beetle1) this.p_units1.push(new Unit(2, x, y));
			else if (this.board[x][y] == img_spider1) this.p_units1.push(new Unit(3, x, y));
			else if (this.board[x][y] == img_bee1) this.p_units1.push(new Unit(4, x, y));
			else if (this.board[x][y] == img_queen2) this.p_units2.push(new Unit(0, x, y));
			else if (this.board[x][y] == img_ant2) this.p_units2.push(new Unit(1, x, y));
			else if (this.board[x][y] == img_beetle2) this.p_units2.push(new Unit(2, x, y));
			else if (this.board[x][y] == img_spider2) this.p_units2.push(new Unit(3, x, y));
			else if (this.board[x][y] == img_bee2) this.p_units2.push(new Unit(4, x, y));
		}
	}
	for (var x = 0; x < this.nc; x++) {
		for (var y = 0; y < this.nr; y++) {
			if (this.foods[x][y] != null) this.p_foods.push(new Food(x, y, this.foods[x][y]));
		}
	}
	for (var x = 0; x < this.nc; x++) {
		for (var y = 0; y < this.nr; y++) {
			if (this.walls[x][y] != null) this.p_walls.push(new Wall(x, y, this.walls[x][y]));
		}
	}
}

Mapp.prototype.save = function(file) {
	this.parseBoard();

	if (fs.existsSync(file)) fs.unlinkSync(file);
	fs.appendFileSync(file, '' + this.nr + ' ' + this.nc + '\n');
	fs.appendFileSync(file, '' + this.offsetx + ' ' + this.offsety + '\n');
	fs.appendFileSync(file, '' + this.p_walls.length + '\n')
	for (var i = 0; i < this.p_walls.length; i++) {
		fs.appendFileSync(file, '' + this.p_walls[i].x + ' ' + (this.nr - 1 - this.p_walls[i].y) + ' ' + this.p_walls[i].health + '\n')
	}
	fs.appendFileSync(file, '' + this.p_foods.length + '\n')
	for (var i = 0; i < this.p_foods.length; i++) {
		fs.appendFileSync(file, '' + this.p_foods[i].x + ' ' + (this.nr - 1 - this.p_foods[i].y) + ' ' + this.p_foods[i].quantity + '\n')
	}
	fs.appendFileSync(file, '' + this.p_units1.length + '\n')
	for (var i = 0; i < this.p_units1.length; i++) {
		fs.appendFileSync(file, '' + this.p_units1[i].x + ' ' + (this.nr - 1 - this.p_units1[i].y) + ' ' + this.p_units1[i].type + '\n')
	}
	fs.appendFileSync(file, '' + this.p_units2.length + '\n')
	for (var i = 0; i < this.p_units2.length; i++) {
		fs.appendFileSync(file, '' + this.p_units2[i].x + ' ' + (this.nr - 1 - this.p_units2[i].y) + ' ' + this.p_units2[i].type + '\n')
	}

	$('#mapeditor-save-status').html('&#x2714');
	$('#mapeditor-save-status').css('color', 'green');
}

Mapp.prototype.load = function(file) {
	var map_str = fs.readFileSync(file).toString();
	// By lines
	var lines = map_str.split('\n');
	var line = 0;
	// Size
	var tokens = lines[line++].split(' ');
	this.setSize(parseInt(tokens[0]), parseInt(tokens[1]));
	// Offset
	var tokens = lines[line++].split(' ');
	this.setOffset(parseInt(tokens[0]), parseInt(tokens[1]));
	// Symmetry
	var tokens = lines[line++].split(' ');
	this.setSymmetry(tokens[0]);
	// Obstacles
	var n_obs = parseInt(lines[line++]);
	for (var i = 0; i < n_obs; i++) {
		var tokens = lines[line++].split(' ');
		this.walls[parseInt(tokens[0])][parseInt(tokens[1])] = 1000;
	}
	// Food
	var n_food = parseInt(lines[line++]);
	for (var i = 0; i < n_food; i++) {
		var tokens = lines[line++].split(' ');
		this.foods[parseInt(tokens[0])][parseInt(tokens[1])] = parseInt(tokens[2]);
	}
	// Units1
	var n_units1 = parseInt(lines[line++]);
	for (var i = 0; i < n_units1; i++) {
		var tokens = lines[line++].split(' ');
		var img = null;
		if (parseInt(tokens[2]) == 0) img = img_queen1;
		else if (parseInt(tokens[2]) == 1) img = img_ant1;
		else if (parseInt(tokens[2]) == 2) img = img_beetle1;
		else if (parseInt(tokens[2]) == 4) img = img_spider1;
		else if (parseInt(tokens[2]) == 3) img = img_bee1;
		this.board[parseInt(tokens[0])][parseInt(tokens[1])] = img;
	}
	// Units2
	var n_units2 = parseInt(lines[line++]);
	for (var i = 0; i < n_units2; i++) {
		var tokens = lines[line++].split(' ');
		var img = null;
		if (parseInt(tokens[2]) == 0) img = img_queen2;
		else if (parseInt(tokens[2]) == 1) img = img_ant2;
		else if (parseInt(tokens[2]) == 2) img = img_beetle2;
		else if (parseInt(tokens[2]) == 4) img = img_spider2;
		else if (parseInt(tokens[2]) == 3) img = img_bee2;
		this.board[parseInt(tokens[0])][parseInt(tokens[1])] = img;
	}
	this.ctx = null;

}

exports.Mapp = Mapp;