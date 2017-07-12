//This JS file must load last across the entire system - it controls all custom events, document ready and window event binds.

//bind custom document events
for(var i = 0; i < $.e.doc.custom.length; i++){ var c = $.e.doc.custom[i]; $(document).on(c.name, c.func); }

//new plugins have api's and push events with these functions
$(document).ready(function(){ for(var i = 0; i < $.e.doc.ready.length; i++){ $.e.doc.ready[i](); }});

//bind all custom window events from custom $.e.win object
$.each($.e.win, function(_k,_v){
	$(window).on(_k, function(){
		for(var i = 0; i < $.e.win[_k].length; i++){ $.e.win[_k][i](); };
	})
});