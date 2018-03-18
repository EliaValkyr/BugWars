const rq = require('electron-require');
var Mapp = rq("./js/map.js").Mapp;

ContentMapeditor = function() {
	this.mapp = new Mapp();
}

ContentMapeditor.prototype.resizeElements = function() {
	var board_size = Math.min(
		$('#content').innerWidth(),
		$('#content').innerHeight()
	);
	$('#mapeditor-board').css('height', board_size + 'px');
	$('#mapeditor-board').css('width', board_size + 'px');

	if (this.mapp != null) this.mapp.render();
}

ContentMapeditor.prototype.render = function() {
	var self = this;
	$('#content').load('views/content_mapeditor.html', function() {
		self.resizeElements();
	});
}

ContentMapeditor.prototype.setSelected = function(selected) {
	this.mapp.setSelected(selected);
}

ContentMapeditor.prototype.initializeMap = function(nr, nc, offsetx, offsety, symmetry) {
	this.mapp.setSize(nr, nc);
	this.mapp.setOffset(offsetx, offsety);
	this.mapp.setSymmetry(symmetry);
	this.mapp.render();
}

ContentMapeditor.prototype.saveMap = function(file) {
	this.mapp.save(file);
}

ContentMapeditor.prototype.loadMap = function(map_file) {
	this.mapp.load(map_file);
	controller.menus['mapeditor'].initializeMap(this.mapp.nr, this.mapp.nr,
			this.mapp.offsetx, this.mapp.offsety, this.mapp.symmetry);
	controller.contents['mapeditor'].render();
}

exports.ContentMapeditor = ContentMapeditor;
