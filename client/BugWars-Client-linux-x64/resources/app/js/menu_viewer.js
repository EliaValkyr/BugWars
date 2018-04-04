var fs = require('fs');

MenuViewer = function() {
}

MenuViewer.prototype.resizeElements = function() {
	var infoclicked_height = $('#menu-content').innerHeight() -
							 $('#menu-viewer-wincondition').innerHeight() -
							 $('#menu-viewer-info1').innerHeight() -
							 $('#menu-viewer-info2').innerHeight();
	$('#menu-viewer-infoclicked').css('height', infoclicked_height + 'px');
	var infoclicked_log_height = $('#menu-viewer-infoclicked').innerHeight() -
								 $('#menu-viewer-infoclicked-content').innerHeight() -
					 			 25;
	$('#menu-viewer-infoclicked-log').css('height', infoclicked_log_height + 'px');
}

MenuViewer.prototype.render = function() {
	var self = this;
	$('#menu-content').load('views/menu_viewer.html', function(data) {
		images.updateImages();
		self.resizeElements();
	});
}

exports.MenuViewer = MenuViewer;
