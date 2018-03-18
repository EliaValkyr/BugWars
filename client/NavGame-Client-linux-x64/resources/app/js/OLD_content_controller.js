const rq = require('electron-require');
var ContentGame = rq("./js/content_game.js").ContentGame;
var ContentMapeditor = rq("./js/content_mapeditor.js").ContentMapeditor;

ContentController = function(active_tab) {
	this.contents = {
		'game': new ContentGame(),
		'mapeditor': new ContentMapeditor()
	};
	if (active_tab == 'games' || active_tab == 'viewer') this.active_tab = 'game';
	else this.active_tab = active_tab;
}

ContentController.prototype.resizeElements = function() {
	this.contents[this.active_tab].resizeElements();
}

ContentController.prototype.render = function() {
	this.contents[this.active_tab].render();
}

ContentController.prototype.setActiveTab = function(active_tab) {
	if (active_tab == 'viewer' || active_tab == 'mapeditor') {
		$('#content').css('visibility', 'visible');
	}
	if (active_tab == 'games' || active_tab == 'viewer') this.active_tab = 'game';
	else this.active_tab = active_tab;
	this.contents[this.active_tab].render();
}

ContentController.prototype.setGameDir = function(game_dir) {
	this.contents['game'].setGameDir(game_dir);
}

ContentController.prototype.setGameFile = function(game_file) {
	this.contents['game'].setGameDir(game_file);
}

ContentController.prototype.setSelected = function(selected) {
	this.contents['mapeditor'].setSelected(selected);
}

ContentController.prototype.initializeMap = function(nr, nc, symmetry, offsetx, offsety) {
	this.contents['mapeditor'].initializeMap(nr, nc, symmetry, offsetx, offsety);
}

ContentController.prototype.saveMap = function(file) {
	this.contents['mapeditor'].saveMap(file);
}

//exports.ContentController = ContentController;
