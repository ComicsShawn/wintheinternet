$(document).ready(function(){
	$('body').append("<div id='wti_panel'></div>");
	var p = $('#wti_panel');
	$.get(chrome.extension.getURL("panel.html"), function(data){
		p.html(data);
	});
});
