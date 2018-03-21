
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
		$("#menu-viewer-info1-food").attr("src", img_food.src);
		$("#menu-viewer-info1-queen").attr("src", img_queen1.src);
		$("#menu-viewer-info1-ant").attr("src", img_ant1.src);
		$("#menu-viewer-info1-beetle").attr("src", img_beetle1.src);
		$("#menu-viewer-info1-spider").attr("src", img_spider1.src);
		$("#menu-viewer-info1-bee").attr("src", img_bee1.src);
		$("#menu-viewer-info2-food").attr("src", img_food.src);
		$("#menu-viewer-info2-queen").attr("src", img_queen2.src);
		$("#menu-viewer-info2-ant").attr("src", img_ant2.src);
		$("#menu-viewer-info2-beetle").attr("src", img_beetle2.src);
		$("#menu-viewer-info2-spider").attr("src", img_spider2.src);
		$("#menu-viewer-info2-bee").attr("src", img_bee2.src);

		$("#clicked-health-img").attr("src", img_health.src);
		$("#clicked-food-img").attr("src", img_food.src);
		$("#clicked-attack-img").attr("src", img_attack.src);
		$("#clicked-movement-img").attr("src", img_movement.src);
		$("#clicked-movement_delay-img").attr("src", img_move_delay.src);
		$("#clicked-attack_delay-img").attr("src", img_attack_delay.src);
		$("#clicked-attack_range-img").attr("src", img_attack_range.src);
		$("#clicked-sight_range-img").attr("src", img_sight_range.src);
		$("#clicked-mining_range-img").attr("src", img_mining_range.src);
		self.resizeElements();
	});
}

exports.MenuViewer = MenuViewer;
