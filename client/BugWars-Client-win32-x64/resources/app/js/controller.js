const rq = require('electron-require');
var MenuGames = rq("./js/menu_games.js").MenuGames;
var MenuViewer = rq("./js/menu_viewer.js").MenuViewer;
var MenuMapeditor = rq("./js/menu_mapeditor.js").MenuMapeditor;
var ContentGame = rq("./js/content_game.js").ContentGame;
var ContentMapeditor = rq("./js/content_mapeditor.js").ContentMapeditor;

Controller = function(active_tab) {
	this.active_tab = active_tab;
	this.menus = {
		'games': new MenuGames(),
		'viewer': new MenuViewer(),
		'mapeditor': new MenuMapeditor()
	};
	this.contents = {
		'game': new ContentGame(),
		'mapeditor': new ContentMapeditor()
	};
	$('#menu-tab-games').mousedown(()=>this.setActiveTab('games'));
	$('#menu-tab-viewer').mousedown(()=>this.setActiveTab('viewer'));
	//$('#menu-tab-newgame').mousedown(()=>this.setActiveTab('newgame'));
	$('#menu-tab-mapeditor').mousedown(()=>this.setActiveTab('mapeditor'));

	var self = this;
	$('#palette-drawings').click(
		images.changeImagesWrapper('drawings', self.refreshBoardWrapper()));
	$('#palette-circles').click(
		images.changeImagesWrapper('circles', self.refreshBoardWrapper()));
}

Controller.prototype.start = function() {
}

Controller.prototype.resizeElements = function() {
	var menu_min_width = 325;
	var content_width = Math.min(
		$('#body').outerHeight(),
		$('#body').outerWidth() - menu_min_width
	);
	$('#content').css('width', content_width + 'px');
	$('#menu').css('width', $('#body').outerWidth() - content_width + 'px');

	var menucontent_height = $('#menu').innerHeight() -
							 $('#menu-tab').innerHeight() -
							 $('#menu-images').innerHeight();
	$('#menu-content').css('height', menucontent_height + 'px');
	this.menus[this.active_tab].resizeElements();

	if (this.active_tab == 'games' || this.active_tab == 'viewer') {
		this.contents['game'].resizeElements();
	} else this.contents[this.active_tab].resizeElements();
}

Controller.prototype.setActiveTab = function(active_tab) {
	$('#menu-tab-' + this.active_tab).removeClass('active');
	this.active_tab = active_tab;
	$('#menu-tab-' + this.active_tab).addClass('active');

	this.menus[this.active_tab].render();

	if (this.active_tab == 'viewer' || this.active_tab == 'mapeditor') {
		$('#content').css('visibility', 'visible');
	}
	if (this.active_tab == 'games' || this.active_tab == 'viewer') {
		this.contents['game'].render();
	} else this.contents[this.active_tab].render();
}

Controller.prototype.render = function() {
	this.menus[this.active_tab].render();
	if (this.active_tab == 'games' || this.active_tab == 'viewer') {
		this.contents['game'].render();
	} else this.contents[this.active_tab].render();
}

Controller.prototype.refreshBoardWrapper = function() {
	var self = this;
	var func = function() {
		if (self.active_tab == 'games' || self.active_tab == 'viewer') {
			self.contents['game'].refreshBoard();
		} else self.contents[self.active_tab].refreshBoard();
	};
	return func;
}

Controller.prototype.setGameDir = function(game_dir) {
	this.contents['game'].setGameDir(game_dir);
	this.setActiveTab('viewer');
}

Controller.prototype.setGameFile = function(game_file) {
	this.contents['game'].setGameFile(game_file);
	this.setActiveTab('viewer');
}

Controller.prototype.setMapFile = function(map_file) {
	this.contents['mapeditor'].loadMap(map_file + '.txt');
}

Controller.prototype.setSelected = function(selected) {
	this.contents['mapeditor'].setSelected(selected);
}

Controller.prototype.saveMap = function(file) {
	this.contents['mapeditor'].saveMap(file);
}

Controller.prototype.newMap = function() {
	this.contents['mapeditor'].newMap();
	this.menus['mapeditor'].render();
	this.contents['mapeditor'].render();
}

exports.Controller = Controller;
