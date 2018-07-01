const rq = require('electron-require');
var Game = rq("./js/game.js").Game;

ContentGame = function(active_tab) {
	this.active_tab = active_tab;
	this.game = null;
}

ContentGame.prototype.resizeElements = function() {
	var controls_min_height = 45;
	var controls_slider_round_min_width = 80;
	var board_size = Math.min(
		$('#content').innerWidth(),
		$('#content').innerHeight() - controls_min_height
	);
	$('#content-board').css('height', board_size + 'px');
	$('#content-board').css('width', board_size + 'px');
	$('#content-controls').css('width', board_size + 'px');

	$('#content-controls-slider').css('width', $('#content-board').innerWidth() * .3 + 'px');
	$('#content-controls-slider-input').css(
		'width',
		$('#content-board').innerWidth() * .3 - controls_slider_round_min_width + 'px'
	);
	if (this.game != null) this.game.render();
}

ContentGame.prototype.render = function() {
	var self = this;
	$('#content').load('views/content_game.html', function() {
		$('#play_pause').click(function() {
			if ($("#span_pause").css('display') == "none") {
				$('#span_play').css('display', "none");
				$('#span_pause').css('display', "inline");
				self.game.startReplay();
			}
			else {
				$('#span_play').css('display', "inline");
				$('#span_pause').css('display', "none");
				self.game.pauseReplay();
			}
		});
		$('#stop').click(function() { self.game.stopReplay(); });
		$('#backward').click(function() { self.game.decrementSpeed(); });
		$('#forward').click(function() { self.game.incrementSpeed(); });
		$('#step_backward').click(function() {
			self.game.pauseReplay();
			self.game.decrementRound();
		});
		$('#step_forward').click(function() {
			self.game.pauseReplay();
			self.game.incrementRound();
		});

		self.resizeElements();
	});
}

ContentGame.prototype.refreshBoard = function() {
	if (this.game != null) this.game.render();
}

ContentGame.prototype.loadGame = function(game_file, game_dir = null) {
	if (this.game != null) this.game.stopReplay();
	this.game = new Game(game_file, game_dir);

	// Game play/pause button, and visibility
	$('#span_play').css('display', 'inline');
	$('#span_pause').css('display', 'none');
}

ContentGame.prototype.setGameDir = function(game_dir) {
	this.loadGame(game_dir);
}

exports.ContentGame = ContentGame;
