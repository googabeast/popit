$.e = {
	doc: { ready:[], custom:[] },
	win: { scroll:[], scrollstart:[], scrollstop:[], load:[], resize:[], resizestart:[], resizestop:[], orientationchange:[] }
};


(function($){
	var slice = Array.prototype.slice;
	$.extend($.event.special, {
		scrollstop:{
			add: function(handle){
				var handler = handle.handler;

				$(this).scroll(function(e){
					clearTimeout(handler._timer);
					e.type = "scrollstop";

					var _proxy = $.proxy(handler, this, e);
					handler._timer = setTimeout(_proxy, handle.data || 200);
				});
			}
		},
		scrollstart:{
			add: function(handle){
				var handler = handle.handler;

				$(this).on("scroll", function(e){
					clearTimeout(handler._timer);
					if (!handler._started) {
						e.type = "scrollstart";
						handler.apply(this, arguments);
						handler._started = true;
					}
					handler._timer = setTimeout($.proxy(function(){
						handler._started = false;
					}, this), handle.data || 300);
				});
			}
		},
		resizestop:{
			add: function(handle){
				var handler = handle.handler;

				$(this).resize(function(e){
					clearTimeout(handler._timer);
					e.type = "resizestop";

					var _proxy = $.proxy(handler, this, e);
					handler._timer = setTimeout(_proxy, handle.data || 200);
				});
			}
		},
		resizestart:{
			add: function(handle){
				var handler = handle.handler;

				$(this).on("resize", function(e){
					clearTimeout(handler._timer);
					if (!handler._started) {
						e.type = "resizestart";
						handler.apply(this, arguments);
						handler._started = true;
					}
					handler._timer = setTimeout($.proxy(function(){
						handler._started = false;
					}, this), handle.data || 300);
				});
			}
		}
	});

	$.extend($.fn, {
		resizestop: function() {
			$(this).on.apply(this, ["resizestop"].concat(slice.call(arguments)));
		},
		resizestart: function() {
			$(this).on.apply(this, ["resizestart"].concat(slice.call(arguments)));
		}
	});
})(jQuery);