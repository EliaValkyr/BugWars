const rq = require('electron-require');
var Controller = rq("./js/controller.js").Controller;
var Images = rq("./js/images.js").Images;

var images = null;
var controller = null;

window.onresize = function(event) {
	if (controller != null) controller.resizeElements();
};

window.onload = function(event) {
	images = new Images();
	controller = new Controller('games');
	images.load(() => {
		controller.resizeElements();
		controller.render();
	});
};
