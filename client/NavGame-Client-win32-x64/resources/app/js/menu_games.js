var fs = require('fs');

MenuGames = function() {
	this.games_dir = null;
	this.default_games_dir_file = "default_games_dir.txt";
	this.active_game = null;
}

MenuGames.prototype.resizeElements = function() {
	var list_height = $('#menu-content').innerHeight() -
						 $('#menu-games-workingdir').innerHeight() - 100;
	$('#menu-games-list').css('height', list_height + 'px');
}

MenuGames.prototype.selectGamesDirWrapper = function() {
	var self = this;
	var func = function(evt) {
		if (evt.target.files.length == 0) return;
		self.games_dir = evt.target.files[0]['path'];
		fs.writeFile(self.default_games_dir_file, self.games_dir, (err) => {
			if (err) {
				console.log(err);
				return;
			}
		});
		self.loadGameList();
	}
	return func;
}

MenuGames.prototype.render = function() {
	var self = this;
	$('#menu-content').load('views/menu_games.html', function(data) {
		$('#games-dir-input').change(self.selectGamesDirWrapper());
		$('#games-file-input').change(self.selectFileWrapper());
		fs.exists(self.default_games_dir_file, function(exists) {
			if (exists) {
				fs.readFile(self.default_games_dir_file, 'utf-8', (err, data) => {
					if (err) {
						console.log(err);
						return;
					}
					if (data != "") {
						self.games_dir = data;
						self.loadGameList();
					}
				});
			}
		});
	});
}

MenuGames.prototype.isValidGamePath = function(gameFile) {
	var gameFileRegex = /^[0-9]{8}\-[0-9]{6}(?:\-[a-zA-Z0-9_]+){2}$/;
	return gameFileRegex.test(gameFile)
}

MenuGames.prototype.loadGameList = function() {
	$('#menu-games-list').empty();
	if (this.games_dir == null) return;
	$('#games-dir').val(this.games_dir);
	var self = this;
	fs.readdir(this.games_dir, function(err, files) {
		if (files) {
			for (let file of files.sort().reverse()) {
				if (self.isValidGamePath(file)) {
					var name = file.replace(/\.[^.]+$/, "");
					var datetime_str = name.replace(/(?:\-[a-zA-Z0-9_]+){2}$/, "");
					var player1 = name.replace(/^[0-9]{8}\-[0-9]{6}\-/, "").replace(/(?:\-[a-zA-Z0-9_]+){2}$/, "");
					var player2 = name.replace(/^[0-9]{8}\-[0-9]{6}(?:\-[a-zA-Z0-9_]+){2}\-/, "");

					var year = datetime_str.substring(0, 4);
					var month = datetime_str.substring(4, 6);
					var day = datetime_str.substring(6, 8);
					var hour = datetime_str.substring(9, 11);
					var minute = datetime_str.substring(11, 13);
					var second = datetime_str.substring(13, 15);

					var name_datetime;
					var game_datetime = new Date(year, parseInt(month)-1, day);
					if (game_datetime.setHours(0,0,0,0) == (new Date()).setHours(0,0,0,0)) {
						name_datetime = hour + ":" + minute + ":" + second;
					} else {
						name_datetime = year + "-" + month + "-" + day;
					}

					var btn =
						"<button id='" + name + "' class='list-group-item games'>" +
							player1 + "<br/>" +
							player2 + "<br/>" +
							"<small>" + name_datetime + "</small>" +
						"</button>";
					$('#menu-games-list').append(btn);
					$('#' + name).click(self.selectFileFromListWrapper(name));
				}
			}
			if (self.active_game != null) $('#' + self.active_game).addClass('active');
		}
		self.resizeElements();
	});
}

MenuGames.prototype.selectFileFromListWrapper = function(filename) {
	var self = this;
	var func = function() {
		$('.games').removeClass('active');
		self.active_game = filename;
		$('#' + filename).addClass('active');
		controller.setGameDir(self.games_dir + "/" + filename);
		$('#menu-tab-viewer').css('display', 'inline');
	}
	return func;
}

MenuGames.prototype.selectFileWrapper = function() {
	var self = this;
	var func = function(evt) {
		if (evt.target.files.length == 0) return;
		$('.games').removeClass('active');
		controller.setGameFile(evt.target.files[0]['path']);
		$('#menu-tab-viewer').css('display', 'inline');
		$('#games-file-input').val("");
	}
	return func;
}

exports.MenuGames = MenuGames;
