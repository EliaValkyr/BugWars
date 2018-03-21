const rq = require('electron-require');
var MenuGames = rq("./js/menu_games.js").MenuGames;
var MenuViewer = rq("./js/menu_viewer.js").MenuViewer;
var MenuMapeditor = rq("./js/menu_mapeditor.js").MenuMapeditor;

MenuController = function(active_tab) {
	this.menus = {
		'games': new MenuGames(),
		'viewer': new MenuViewer(),
		'mapeditor': new MenuMapeditor()
	};

	this.active_tab = active_tab;
	$('#menu-tab-games').mousedown(()=>this.setActiveTab('games'));
	$('#menu-tab-viewer').mousedown(()=>this.setActiveTab('viewer'));
	$('#menu-tab-newgame').mousedown(()=>this.setActiveTab('newgame'));
	$('#menu-tab-mapeditor').mousedown(()=>this.setActiveTab('mapeditor'));
}

MenuController.prototype.resizeElements = function() {
	var menucontent_height = $('#menu').innerHeight() -
							 $('#menu-tab').innerHeight();
	$('#menu-content').css('height', menucontent_height + 'px');
	this.menus[this.active_tab].resizeElements();
}

MenuController.prototype.render = function() {
	this.menus[this.active_tab].render();
}

MenuController.prototype.setActiveTab = function(active_tab) {
	$('#menu-tab-' + this.active_tab).removeClass('active');
	this.active_tab = active_tab;
	$('#menu-tab-' + this.active_tab).addClass('active');
	this.menus[this.active_tab].render();

	body.content_controller.setActiveTab(this.active_tab);
}

//exports.MenuController = MenuController;
