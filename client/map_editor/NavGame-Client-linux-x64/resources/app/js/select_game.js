
var fs = require('fs');

// Game ID
var default_games_dir_file = "default_games_dir.txt";
var default_games_dir = null;
var game_dir = null;

$('#games-default-dir').change(selectDefaultDir);
$('#game-input-file').change(selectFile);

function isValidGamePath(gameFile) {
	var gameFileRegex = /^[0-9]{8}\-[0-9]{6}(?:\-[a-zA-Z0-9_]+){4}$/;
	return gameFileRegex.test(gameFile)
}

function loadGameList() {
	$('#game-list').empty();
	if (default_games_dir == null) return;
	fs.readdir(default_games_dir, function(err, files) {
		if (files) {
			for (let file of files.sort().reverse()) {
				if (isValidGamePath(file)) {
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
						"<button id='" + name + "' class='list-group-item games' onclick=\"selectFileFromList('" + name + "')\">" +
							player1 + "<br/>" +
							player2 + "<br/>" +
							"<small>" + name_datetime + "</small>" +
						"</button>";
					$('#game-list').append(btn);
				}
			}
		}
	});
}

function selectDefaultDir(evt) {
	if (evt.target.files.length == 0) return;
	default_games_dir = evt.target.files[0]['path'];
	fs.writeFile(default_games_dir_file, default_games_dir, (err) => {
		if (err) {
			console.log(err);
			return;
		}
	});
	loadGameList();
}

function loadGame(game_file, game_dir) {
	// Change menu to game info
	$('#change-menu').css('display', 'inline');
	$('#change-menu').click();

	// Deselect game from the list
	$('.games').removeClass('active');

	// Pause replay
	pauseReplay();

	// Show loading message
	showMessage("Loading...");

	// Load game replay
	startGameReplay(game_file, game_dir);
}

function selectFileFromList(filename) {
	var game_dir = default_games_dir + "/" + filename
	var game_file = game_dir + "/game.txt";
	loadGame(game_file, game_dir);
	$('#' + filename).addClass('active');
}

function selectFile(evt) {
	if (evt.target.files.length == 0) return;
	var game_file = evt.target.files[0]['path'];
	loadGame(game_file);
	$('#game-input-file').val("");
}
