function readjust(panel) {
	panel = $(panel).get(0);
	panel = $(panel);
	var left = panel.children('.dl-left');
	var right = panel.children('.dl-right');
	var top = panel.children('.dl-top');
	var bottom = panel.children('.dl-bottom');
	var center = panel.children('.dl-center');
	var w = panel.width() - left.outerWidth() - right.outerWidth();
	var h = panel.height() - top.outerHeight() - bottom.outerHeight();
	console.log( panel.width() + ":" + left.outerWidth() + ":" + right.outerWidth());
	console.log(left);
	console.log(center);
	center.width(w);
	center.height(h);
	// fix the bottom offset
	if(bottom.length > 0) {
		var btop = top.outerHeight() + center.outerHeight(); 
		bottom.offset({top: btop});
	}
	// fix the right offset
	/*var moffset = $(".middle").offset(); 
	var roffset = $(".right").offset(); 
	$(".right").offset({left: moffset.left + mwidth - 10});
	*/
	panel.find(".dl-panel").each(function() {
		readjust($(this));
	});
}

jQuery(function() {
	$(".dl-left").resizable( {	handles : "e"});
	$(".dl-right").resizable( {	handles : "w"});
	$(".dl-bottom").resizable( {handles : "n"});
	readjust($("body").find(".dl-panel"));
	$(".dl-left, .dl-right, .dl-bottom").live("resize", function(event, ui) {
		readjust($(this).parent(".dl-panel"));
	});
	$(window).resize(function() {
		readjust($("body").find(".dl-panel"));
	});
	$("#nodes").tree( {	plugins : {	contextmenu : {}}});
	$("#tabs").tabs();
});