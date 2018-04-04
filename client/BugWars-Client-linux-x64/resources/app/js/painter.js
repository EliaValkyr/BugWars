var fs = require('fs');
const rq = require('electron-require');

Painter = function(ctx, nr, nc, canvas_div_id) {
	this.ctx = ctx;
	this.nr = nr;
	this.nc = nc;
	this.canvas_div = $('#' + canvas_div_id);
}

Painter.prototype.updateVariables = function() {
	this.canvas_width = this.canvas_div.innerWidth();
	this.canvas_height = this.canvas_div.innerHeight();
	this.cw = this.canvas_width / this.nc;
	this.ch = this.canvas_height / this.nr;
}

Painter.prototype.paintBackground = function() {
	this.updateVariables();
	/*this.ctx.drawImage(
		images.ground, 0, 0,
		$('#content-board-canvas').innerWidth(),
		$('#content-board-canvas').innerHeight()
	);*/
	this.ctx.fillStyle = "#9BC150";
	this.ctx.fillRect(0, 0, this.canvas_width, this.canvas_height);
}

Painter.prototype.paintGrid = function() {
	this.updateVariables();
	this.ctx.beginPath();
	for (var x = 0; x <= this.canvas_width; x += this.cw) {
		this.ctx.moveTo(x, 0);
		this.ctx.lineTo(x, this.canvas_height);
	}
	for (var y = 0; y <= this.canvas_height; y += this.ch) {
		this.ctx.moveTo(0, y);
		this.ctx.lineTo(this.canvas_width, y);
	}
	this.ctx.lineWidth = 1;
	this.ctx.strokeStyle = 'gray';
	this.ctx.stroke();
}

Painter.prototype.paintElement = function(img, x, y) {
	this.updateVariables();
	this.ctx.drawImage(img, x * this.cw, (this.nr - 1 - y) * this.ch, this.cw, this.ch);
}

Painter.prototype.paintHealth = function(health, x, y) {
	this.updateVariables();
	var fromx = (x) * this.cw;
	var fromy = (this.nr - 1 - y + 0.1) * this.ch;
	var tox = (x + 1) * this.cw;
	var toy = (this.nr - 1 - y + 0.1) * this.ch;

	this.ctx.beginPath();
	this.ctx.moveTo(fromx, fromy);
	this.ctx.lineTo(fromx + (tox - fromx) * health, toy);

	this.ctx.lineWidth = 3;
	this.ctx.strokeStyle = 'green';
	this.ctx.stroke();
}

Painter.prototype.paintCocoon = function(cocoon, x, y) {
	this.updateVariables();
	var fromx = (x) * this.cw;
	var fromy = (this.nr - 1 - y + 0.1) * this.ch;
	var tox = (x + 1) * this.cw;
	var toy = fromy;

	this.ctx.beginPath();
	this.ctx.moveTo(fromx, fromy);
	this.ctx.lineTo(fromx + (tox - fromx) * cocoon, toy);

	this.ctx.lineWidth = 3;
	this.ctx.strokeStyle = 'dimgrey';
	this.ctx.stroke();
}

Painter.prototype.paintBytecodes = function(bytecodes, x, y) {
	this.updateVariables();
	if (bytecodes <= 15000) return;
	var x = (x + 0.85) * this.cw;
	var y = (this.nr - 1 - y + 0.85) * this.ch;

	this.ctx.beginPath();
	this.ctx.arc(x, y, this.cw / 8, 0, 2 * Math.PI, false);
	this.ctx.fillStyle = 'black';
	this.ctx.fill();
}

Painter.prototype.paintMovement = function(fromx, fromy, tox, toy) {
	this.updateVariables();
	if (typeof fromx == 'undefined') return;
	if (fromx == tox && fromy == toy) return;
	var fromy = this.nr - 1 - fromy;
	var toy = this.nr - 1 - toy;
	var auxx = fromx;
	var auxy = fromy;
	var fromx = (fromx + 0.5 + 0.35 * (tox - fromx)) * this.cw;
	var fromy = (fromy + 0.5 + 0.35 * (toy - fromy)) * this.ch;
	var tox = (tox + 0.5 + 0.35 * (auxx - tox)) * this.cw;
	var toy = (toy + 0.5 + 0.35 * (auxy - toy)) * this.ch;

	this.ctx.beginPath();
	this.ctx.moveTo(fromx, fromy);
	this.ctx.lineTo(tox, toy);
	this.ctx.lineWidth = 2;
	this.ctx.strokeStyle = "orange";
	this.ctx.stroke();
}

Painter.prototype.paintUnit = function(unit, team) {
	this.updateVariables();
	var img = null;
	if (team == 1) {
		if (unit.type.name == "Queen") img = images.queen1;
		else if (unit.type.name == "Ant") img = images.ant1;
		else if (unit.type.name == "Beetle") img = images.beetle1;
		else if (unit.type.name == "Spider") img = images.spider1;
		else if (unit.type.name == "Bee") img = images.bee1;
	} else if (team == 2) {
		if (unit.type.name == "Queen") img = images.queen2;
		else if (unit.type.name == "Ant") img = images.ant2;
		else if (unit.type.name == "Beetle") img = images.beetle2;
		else if (unit.type.name == "Spider") img = images.spider2;
		else if (unit.type.name == "Bee") img = images.bee2;
	}

	this.paintMovement(unit.prevx, unit.prevy, unit.x, unit.y);
	this.ctx.drawImage(img, unit.x * this.cw, (this.nr - 1 - unit.y) * this.ch, this.cw, this.ch);
	if (unit.cocoon > 0) {
		this.paintCocoon(unit.cocoon / 10, unit.x, unit.y)
	} else {
		this.paintHealth(unit.health / unit.type.max_health, unit.x, unit.y);
	}
	this.paintBytecodes(unit.bytecodes, unit.x, unit.y)
}

Painter.prototype.paintAction = function(action, color) {
	this.updateVariables();
	var fromx = (action.fromx + 0.5) * this.cw;
	var fromy = (this.nr - 1 - action.fromy + 0.5) * this.ch;
	var tox = (action.tox + 0.5) * this.cw;
	var toy = (this.nr - 1 - action.toy + 0.5) * this.ch;
	var headlen = this.cw / 4;
	var angle = Math.atan2(toy - fromy, tox - fromx);

	this.ctx.beginPath();
	this.ctx.moveTo(fromx, fromy);
	this.ctx.lineTo(tox, toy);
	this.ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6),
				toy - headlen * Math.sin(angle - Math.PI / 6));
	this.ctx.moveTo(tox, toy);
	this.ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6),
				toy - headlen * Math.sin(angle + Math.PI / 6));
	this.ctx.lineWidth = 1;
	this.ctx.strokeStyle = color;
	this.ctx.stroke();
}

Painter.prototype.paintRange = function(x, y, range, min_range, color) {
	this.updateVariables();
	if (range == 0) return;
	this.ctx.globalAlpha = 0.2;
	this.ctx.fillStyle = color;
	for (i = x - range; i <= x + range; i++) {
		for (j = y - range; j <= y + range; j++) {
			var square_dist = Math.pow((x - i), 2) + Math.pow((y - j), 2);
			if (square_dist >= min_range) {
				if (square_dist <= range) {
					if (i >= 0 && j >= 0 && i < this.nc && j < this.nr) {
						this.ctx.fillRect(
							i * this.cw,
							(this.nr - 1 - j) * this.ch,
							this.cw,
							this.ch
						);
					}
				}
			}
		}
	}
	this.ctx.globalAlpha = 1.0;
}

Painter.prototype.paintDrawings = function(drawings, unit_id = null) {
	this.updateVariables();
	if(typeof drawings == "undefined") return;
	for (var i = 0; i < drawings.length; i++) {
		if (unit_id == null || drawings[i][0] == unit_id) {
			var x = (drawings[i][1] + 0.5) * this.cw;
			var y = (this.nr - 1 - drawings[i][2] + 0.5) * this.ch;
			var color = drawings[i][3];

			var radius = this.cw / 4;
			this.ctx.beginPath();
			this.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
			this.ctx.fillStyle = color;
			this.ctx.fill();
		}
	}
}

Painter.prototype.define = function(x, y) {
	this.updateVariables();
	this.ctx.beginPath();
	this.ctx.moveTo(x * this.cw, y * this.ch);
	this.ctx.lineTo((x + 1) * this.cw, y * this.ch);
	this.ctx.lineTo((x + 1) * this.cw, (y + 1) * this.ch);
	this.ctx.lineTo(x * this.cw, (y + 1) * this.ch);
	this.ctx.lineTo(x * this.cw, y * this.ch);
}

exports.Painter = Painter;
