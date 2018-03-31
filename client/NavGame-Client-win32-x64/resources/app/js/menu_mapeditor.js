var fs = require('fs');

MenuMapeditor = function() {
	this.maps_dir = null;
	this.default_maps_dir_file = "defaults/maps_dir.txt";
  if (!fs.existsSync('defaults')) fs.mkdirSync('defaults');
	this.active_map = null;
}

MenuMapeditor.prototype.resizeElements = function() {
}

MenuMapeditor.prototype.render = function() {
	var self = this;
	$('#menu-content').load('views/menu_mapeditor.html', function(data) {
		images.updateImages();

		$('#symmetry-horitzonal').click(()=>self.checkAndInitializeMap('horitzonal'));
		$('#symmetry-vertical').click(()=>self.checkAndInitializeMap('vertical'));
		$('#symmetry-rotational').click(()=>self.checkAndInitializeMap('rotational'));

		$('#mapeditor-wall-layer').click(()=>self.selectPalette('wall'));
		$('#mapeditor-food-layer').click(()=>self.selectPalette('food'));
		$('#mapeditor-queen1-layer').click(()=>self.selectPalette('queen1'));
		$('#mapeditor-ant1-layer').click(()=>self.selectPalette('ant1'));
		$('#mapeditor-beetle1-layer').click(()=>self.selectPalette('beetle1'));
		$('#mapeditor-spider1-layer').click(()=>self.selectPalette('spider1'));
		$('#mapeditor-bee1-layer').click(()=>self.selectPalette('bee1'));
		$('#mapeditor-queen2-layer').click(()=>self.selectPalette('queen2'));
		$('#mapeditor-ant2-layer').click(()=>self.selectPalette('ant2'));
		$('#mapeditor-beetle2-layer').click(()=>self.selectPalette('beetle2'));
		$('#mapeditor-spider2-layer').click(()=>self.selectPalette('spider2'));
		$('#mapeditor-bee2-layer').click(()=>self.selectPalette('bee2'));
		$('#mapeditor-erase-layer').click(()=>self.selectPalette('erase'));

		$('#mapeditor-new').click(self.newWrapper());
		$('#mapeditor-save').click(self.saveWrapper());
		$('#maps-dir-input').change(self.selectMapsDirWrapper());
		fs.exists(self.default_maps_dir_file, function(exists) {
			if (exists) {
				fs.readFile(self.default_maps_dir_file, 'utf-8', (err, data) => {
					if (err) {
						console.log(err);
						return;
					}
					if (data != "") {
						self.maps_dir = data;
						self.loadMapList();
					}
				});
			}
		});
	});
}

MenuMapeditor.prototype.isValidMapPath = function(mapFile) {
	var mapFileRegex = /^[a-zA-Z0-9_]+.txt$/;
	return mapFileRegex.test(mapFile)
}

MenuMapeditor.prototype.loadMapList = function() {
	$('#menu-mapeditor-list').empty();
	if (this.maps_dir == null) return;
	$('#maps-dir').val(this.maps_dir);
	var self = this;
	fs.readdir(this.maps_dir, function(err, files) {
		if (files) {
			for (let file of files.sort()) {
				if (self.isValidMapPath(file)) {
					var name = file.replace(/\.[^.]+$/, "");

					var btn =
						"<button id='" + name + "' class='list-group-item maps'>" +
							name +
						"</button>";
					$('#menu-mapeditor-list').append(btn);
					$('#' + name).click(self.selectMapFromListWrapper(name));
				}
			}
			if (self.active_map != null) $('#' + self.active_map).addClass('active');
		}
		self.resizeElements();
	});
}

MenuMapeditor.prototype.selectMapFromListWrapper = function(filename) {
	var self = this;
	var func = function() {
		$('.maps').removeClass('active');
		self.active_map = filename;
		$('#' + filename).addClass('active');
		controller.setMapFile(self.maps_dir + "/" + filename);
	}
	return func;
}

MenuMapeditor.prototype.initializeMap = function(nr, nc, offsetx, offsety, symmetry) {
	$('#mapeditor-board-size').val(nr);
	$('#mapeditor-offsetx').val(offsetx);
	$('#mapeditor-offsety').val(offsety);

	$('#mapeditor-board-size').prop('disabled', true);
	$('#mapeditor-offsetx').prop('disabled', true);
	$('#mapeditor-offsety').prop('disabled', true);

	$('#symmetry-horitzonal').css('display', 'none');
	$('#symmetry-vertical').css('display', 'none');
	$('#symmetry-rotational').css('display', 'none');
	$('#mapeditor-symmetry').html($('#symmetry-' + symmetry).html());
	$('#mapeditor-symmetry-div').css('display', 'inline-block');

	$('#menu-mapeditor-info2').css('display', 'inline');
	$('#menu-mapeditor-palette').css('display', 'inline');
	$('#menu-mapeditor-export').css('display', 'inline');
}

MenuMapeditor.prototype.checkAndInitializeMap = function(symmetry) {
	$('#mapeditor-board-size').css('border-color', '');
	$('#mapeditor-offsetx').css('border-color', '');
	$('#mapeditor-offsety').css('border-color', '');

	var board_size = parseInt($('#mapeditor-board-size').val());
	if (isNaN(board_size) || board_size < 2 || board_size > 50) {
		$('#mapeditor-board-size').css('border-color', 'red');
		return;
	}
	var offsetx = parseInt($('#mapeditor-offsetx').val());
	if (isNaN(offsetx) || offsetx < 0) {
		$('#mapeditor-offsetx').css('border-color', 'red');
		return;
	}
	var offsety = parseInt($('#mapeditor-offsety').val());
	if (isNaN(offsety) || offsety < 0) {
		$('#mapeditor-offsety').css('border-color', 'red');
		return;
	}

	this.initializeMap(board_size, board_size, offsetx, offsety, symmetry);
	controller.contents['mapeditor'].initializeMap(board_size, board_size,
 																									offsetx, offsety, symmetry);
}

MenuMapeditor.prototype.removeAllSelections = function() {
	$('#mapeditor-wall-layer').css('background-color', '');
	$('#mapeditor-food-layer').css('background-color', '');
	$('#mapeditor-queen1-layer').css('background-color', '');
	$('#mapeditor-ant1-layer').css('background-color', '');
	$('#mapeditor-beetle1-layer').css('background-color', '');
	$('#mapeditor-spider1-layer').css('background-color', '');
	$('#mapeditor-bee1-layer').css('background-color', '');
	$('#mapeditor-queen2-layer').css('background-color', '');
	$('#mapeditor-ant2-layer').css('background-color', '');
	$('#mapeditor-beetle2-layer').css('background-color', '');
	$('#mapeditor-spider2-layer').css('background-color', '');
	$('#mapeditor-bee2-layer').css('background-color', '');
	$('#mapeditor-erase-layer').css('background-color', '');
}

MenuMapeditor.prototype.selectPalette = function(selected) {
	this.removeAllSelections();
	$('#mapeditor-' + selected + '-layer').css('background-color', 'rgba(155, 193, 80, 1)');
	controller.setSelected(selected);
}

MenuMapeditor.prototype.selectMapsDirWrapper = function() {
	var self = this;
	var func = function(evt) {
		if (evt.target.files.length == 0) return;
		self.maps_dir = evt.target.files[0]['path'];
		$('#maps-dir').css('border-color', '');
		fs.writeFile(self.default_maps_dir_file, self.maps_dir, (err) => {
			if (err) {
				console.log(err);
				return;
			}
		});
		self.loadMapList();
	}
	return func;
}

MenuMapeditor.prototype.newWrapper = function() {
	var self = this;
	var func = function() {
		self.active_map = null;
		controller.newMap();
	}
	return func;
}

MenuMapeditor.prototype.saveWrapper = function() {
	var self = this;
	var func = function() {
		// Check working directoru
		$('#maps-dir').css('border-color', '');
		if (self.maps_dir == null) {
			$('#maps-dir').css('border-color', 'red');
			$('#mapeditor-save-status').html('&#x2714');
			return;
		}

		// Check map name
		$('#map-name').css('border-color', '');
		var map_name = $('#map-name').val().trim();
		if (map_name == '') {
			$('#map-name').css('border-color', 'red');
			$('#mapeditor-save-status').html('&#x2716');
			$('#mapeditor-save-status').css('color', 'red');
			return;
		}

		var file = self.maps_dir + '/' + map_name + '.txt';
		controller.saveMap(file);
	}
	return func;
}

exports.MenuMapeditor = MenuMapeditor;
