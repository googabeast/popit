/*
+------------------------------+    template: an ajax call that loads a htm template from '/static/templates'
|                              |              then runs JSRender to pass in the needed variables. Use with 'info' obj below.
|  Passin Variables            |
|     template = ''            |    href: an ajax call that can point to any file in the system
|     href = ''                |    data: *Not ajax 'data'*. This is used usually as a string to pass in simple messages
|     data = ''                |    css: a unique CSS class to help style the modal / contents
|     css = ''                 |    style: the actually style attribute of the $container, usually used for modal width
|     style = ''               |    form: *This IS ajax 'data'. Usually in the format of a serilized form assed in as 'api.opts.form'
|     form = {}                |
|                              |    info: an object that us used in conjunction with 'template'. This object is passed to JSRender
|     info = {                 |             and the template obj. From there it will used the variables inside to render content.
|         *template obj names  |
|        }                     |    close: used in 'dialog' calls. THis will allow custom text and function of the close button
|     close = {                |    continue: used in 'dialog' calls. This will allow custom text and function of the continue button
|         text: ''             |
|         func: ()             |    type: ajax 'type'. Default is POST.
|        }                     |    dataType: ajax 'dataType'. Default is HTML.
|     continue = {             |    expose: boolen to show the black background.
|         text: ''             |    modalX: boolen to show the modal close 'x' button in top right.
|         func: ()             |    closeBtn: null by default, unless used in 'alert' calls. Default text is "Close", but pass
|        }                     |                    in any string to customize the text of the red close button at the bottom of the modal.
|                              |    exposeClose: boolen to close modals by clicking on the expose. true by default.
|     type = 'POST'            |
|     dataType = 'HTML'        |    closeBtnFunc: If 'closeBtn' is active, the default function is to close the modal.
|     expose = true            |                          by passing in a custom function this can be overwritten.
|     modalX = true            |
|     closeBtn = ''            |    before: ajax 'beforeSend'. Passed in as api.opts.before.
|     exposeClose = true       |    insuccess: ajax 'success'. Passed in as api.opts.insuccess will always run is ajax is successful.
|                              |               NOTE* after form submit, this will run regardless of returned 'data.result' obj.
|  Passin Functions()          |    success: ajax 'success' & data.result == "success". Will run on 'success' of BOTH ajax & 'data.result'.
|     closeBtnFunc             |    complete: ajax 'complete'. Is the standard complete function of ajax.
|                              |    onClose: additional function passin for close modal. ex: 'stop video' & close modal.
|  Callback Functions()        |
|     before                   |    * = name: these are unique modal exceptions defined under the popitHelper.exceptions.
|     insuccess                |              use a modal exception to define additional JavaScript to allow the various
|     success                  |              modal's UI to function. ex: 'popitHelper.exceptions.seeInStore'
|     complete                 |
|     runLast                  |    *DOMReady: sometimes elements exist that interact with the modal before the modal is loaded.
|     onClose                  |               these elements can be bound at the time of DOMReady, so the live within the modal
|                              |               code and do not consume plugin's 'happy path'. ex: 'popitHelper.exceptions.emailSignupDOMReady'
|  Exception Functions()       |
|     * = name of modal        |   *BeforeSend: sometimes the popit links do not know what pare they are on. Or the ajax needs to be
|     *DOMReady                |                different based off rtgSeo.type. Rather then muddy the popit link json with conditional
|     *BeforeSend              |                data we can modify the API at time of execuition with additional passins or logic.
|                              |                ex: 'popitHelper.exceptions.creditTermsBannerBeforeSend'
+------------------------------+*/










/******************************************************* popit ***************/
popitHelper = {
	_active: [],
	exceptions: {},
	api: {},
	doc: {
		ready:function(){
			$("[data-popit]").popit();

			//check for session object 'popit'
			if(sessionStorage.getItem("popit")){
				popitHelper.info = $.parseJSON(sessionStorage.getItem("popit"));

				$.popit.open(popitHelper.info.name, {
					css: "refreshedModal",
					href: "/browse/templates/bcc.jsp?id="+popitHelper.info.bcc
				});

				sessionStorage.removeItem("popit");
			};
		}
	},
	win: {
		resizestop:function(){
			if(popitHelper._active.length > 0){
				$.each(popitHelper._active, function(i){
					popitHelper.center(popitHelper._active[i]);
				});
			};
		}
	},
	fetch:function(api){
		//this will house the ajax request for all modals that require it
		type = (api.opts.type)? api.opts.type : "POST";
		dataType = (api.opts.dataType)? api.opts.dataType : "HTML";

		//check to see if href contains a URL variable to switch out
		//useful if switching between checkout, storecart, and payoneline
		function checkLinkswitch(){
			if(api.opts.href.match(api.defaults.rxMatch)){
				var page = "";

				api.opts.href = api.opts.href.replace(api.defaults.rxMatch, page);
			};
		};
		if(api.opts._linkswitch !== undefined){
			checkLinkswitch();
		};

		//before ajax check before exceptions to see if there are any additional modifaction to the object
		if(typeof popitHelper.exceptions[api.defaults.name+"BeforeSend"] == "function"){
			popitHelper.exceptions[api.defaults.name+"BeforeSend"](api);
		};

		if(api.opts.cache == true && api.data != undefined){
			this.create(api, api.data);
		}else{
			//remove all functions from api.opts, just incase
			var apiOpts = {};

			$.each(api.opts, function(k,v){
				if(typeof k !== "function" && typeof v != "function"){
					apiOpts[k] = v;
				};
			});

			$.ajax({
				type: type,
				url: api.opts.href,
				data: api.opts.form || apiOpts,
				dataType: api.opts.dataType,
				beforeSend:function(){
					if(typeof api.opts.before == "function"){
						api.opts.before();
					};
				},
				success:function(data){
					if(data.result == "error" && data.errors !== ""){
						var error = data.errors.split(",");
						com.postError(error[1], $("#"+error[0]));
					}else{

						//search data for iframes and forms
						api.iframe = ($(data).find("iframe").length > 0)? true : false;
						api.form = ($(data).find("form").length > 0)? true : false;
						api.successMsg = ($(data).find(".successResponse").length > 0)? $(data).find(".successResponse").html() : null;

						//if forms capture all required inputs
						if(api.form){
							//any elements that are required
							var requiredTypes = [
									"[data-required]",
									"textarea.required" //atg does not allow custom data attributes to textarea
								],
								id = ($(data).find("form").attr("id") !== undefined)? $(data).find("form").attr("id") : $(data).find("form").attr("name");

							api.formId = $("#"+id);
							api.$required = $(data).find(requiredTypes.toString());
						};

						//save the ajax data to the modal object
						if(api.opts.cache !== false){
							api.data = data;
						};

						//runs within this function
						if(typeof api.opts.insuccess == "function"){
							api.opts.insuccess(data);
						};

						//escapes and runs success on caller
						if(typeof api.opts.success == "function" && data.result == "success"){
							api.opts.success();
							return true;
						}else{
							//append the data
							popitHelper.create(api, data);
						};
					};
				},
				complete:function(){
					if(typeof api.opts.complete == "function"){
						api.opts.complete();
					};
				},
				error:function(){}
			});
		};
	},
	create:function(api, data){

		//if the dialog option is on remap variable from object
		if(api.opts.dialog == true){
			data = (typeof data == "string")? data : data.errors || data.formErrors;
		};

		//show a close button at the top of the modal
		modalX = (api.opts.modalX)? "<a role='button' aria-label='Close modal' href='javascript:void(0);' class='close'></a>" : "";
		//show a close button at the bottom of the modal
		closeBtn = (api.opts.closeBtn)? "<a class='closeModal redBtn fakeBtn'>"+api.opts.closeBtn+"</a>" : "";

		//this will be the append into the modal container div at the end of page
		this.$wrap.append("<div id='"+api.defaults.name+"' class='popup "+api.opts.css+"' style='visibility:hidden;"+api.opts.style+"'>"+modalX+"<div id='modalData'></div>"+closeBtn+"</div>");

		//hide / show expose background
		if(api.opts.expose){
			//double modals exist on "what is bunkie"
			if(api.opts.exposeClose && $("#expose").length <= 0){
				this.$wrap.append("<div id='expose'/>");
			};
			if(!api.opts.exposeClose && $("#expose-"+api.defaults.name).length <= 0){
				this.$wrap.append("<div id='expose-"+api.defaults.name+"'/>");
			};
		};

		api.$modal = $("#"+api.defaults.name);
		api.$container = api.$modal.find("#modalData");
		api.$container.append(data);

		if(api.form && api.$required.length > 0){
			//after appending to the document bind key events for required fields
			//docuble pass in to allow $required 'refference' to be converted to 'object'
			com.keyEvents(api, api.$required);
		};

		this.style(api);
	},
	center:function(api){
		//gather screen data for height / width auto center
		var $modal = $("#"+api.defaults.name),
			width = $modal.width(),
			height = $modal.height(),
			winW = $(window).width(),
			winH = $(window).height(),
			top = (winH-height)/2,
			left = (winW-width)/2,
			isMobile = "fixed"; // revisit - ($(window).height() >= 930)? "fixed" : "absolute";

		//ensure all modals are dynamic in height and centered vertical and horizontal
		this.api[api.defaults.name].height = height;
		$modal.css({"position":isMobile,"visibility":"visible","top":top,"left":left}).animate({"opacity":"1"}, 300);
	},
	style:function(api){
		//after load of data check to see if there are any unique exceptions for the modals
		if(typeof popitHelper.exceptions[api.defaults.name] == "function"){
			popitHelper.exceptions[api.defaults.name](api);
		};
		//check to see if closeBtn has a unique function bound
		if(typeof api.opts.closeBtnFunc == "function"){
			$(document).on("click", "a.closeModal", api.opts.closeBtnFunc);
		};

		//always check for dialog insertion
		if(api.opts.dialog == true){
			popitHelper.exceptions.dialog(api);
		};

		//check for any iframes and wait for it spinner to finish loading
		if(api.iframe){
			$.waitForIt.me(api.$modal);
			this.$wrap.find("iframe").load(function(){
				$.waitForIt.close();
			});
		};

		//center the modal
		this.center(api);

		if(api.form){ //508 focus to first text input
			$(api.formId.selector).find("input[type='text']:visible").first().focus();
		}else{
			api.$container.find("h2:visible").first().focus();
		};

		//runs within this function
		if(typeof api.opts.runLast == "function"){
			api.opts.runLast(api);
		};

		popitHelper._active.push(api);
	},
	thanks:function(api){
		//this function will replace the matched pattern variable with the required info.
		//api.successMsg can contain replaceable variables such as '@{email}'
		function checkTemplate(){
			if(api.successMsg.match(api.defaults.rxMatch)){
				api.successMsg = api.successMsg.replace(api.defaults.rxMatch, api.captureValue.val());
			};
		};

		var $container = $("#modalData") || api.$container,
			$modal = $("#modalWrap .popup") || api.$modal;

		if(api.captureValue !== undefined){
			checkTemplate();
		};

		$container.fadeOut(function(){
			$modal.addClass("successMsg").append(api.successMsg);
		});
	},
	aria:function($el){
		tags = ($el.attr("aria-hidden") == "true")? { "aria-hidden":false, "aria-expanded":true } : { "aria-hidden":true, "aria-expanded":false };
		$el.attr(tags)
	}
};//end popitHelper

function popit(el, opts){
	//default options for all modals
	this.defaults = {
		aria: true,
		cache: true,
		delay: 0,
		css: "",
		modalX: true,
		expose: true,
		exposeClose: true,
		rxMatch: /@{(.*?)\}/
	};

	//el is null when popit is activated on the fly
	if(el == null){
		this.defaults.name = opts.defaults.name;
		this.opts = $.extend({}, this.defaults, opts.opts);
	}else{
		this.$el = $(el);
		this.defaults.name = this.$el.attr("data-popit");
		this.opts = $.extend({}, this.defaults, $(el).data().info, { _linkswitch: $(el).data().linkswitch }, opts);
	};

};//end popit

popit.prototype = {
	init: function(api){
		//code will execute each time a popit link is on the page
		var _this = this;

		//bind any DOM ready events for click handlers or listeners that are not active 'after click'
		if(!$.isEmptyObject(api)){}else{
			if(typeof popitHelper.exceptions[_this.defaults.name+"DOMReady"] == "function"){
				popitHelper.exceptions[_this.defaults.name+"DOMReady"](_this);
			};
		};
	},
	alert: function(name, opts){
		var _this = this;

		theseOpts = {
			defaults: {
				name: name,
			},
			opts: $.extend({}, { closeBtn: "Close" }, opts),
		};
		$.popit.close();

		//initialize plugin and send to needed step
		popitHelper.api[name] = new popit(null, theseOpts);
		popitHelper.api[name].init(popitHelper.api[name]);

		if(popitHelper.api[name].opts.href !== undefined){
			popitHelper.fetch(popitHelper.api[name], popitHelper.api[name].opts.data)
		}else{
			popitHelper.create(popitHelper.api[name], popitHelper.api[name].opts.data);
		};
	},
	dialog: function(name, opts){
		var _this = this;

		if(opts.close.func == undefined){ opts.close.func = function(){ $.popit.close(); } };
		if(opts.close.class == undefined){ opts.close.class = "close" };
		if(opts.continue.class == undefined){ opts.continue.class = "continue" };

		theseOpts = {
			defaults: {
				name: name
			},
			opts: $.extend({}, { dialog: true }, opts),
		};
		$.popit.close();

		//initialize plugin and send to needed step
		popitHelper.api[name] = new popit(null, theseOpts);
		popitHelper.api[name].init(popitHelper.api[name]);

		if(popitHelper.api[name].opts.href !== undefined){
			popitHelper.fetch(popitHelper.api[name], popitHelper.api[name].opts.data)
		}else{
			popitHelper.create(popitHelper.api[name], popitHelper.api[name].opts.data);
		};
	},
	open: function(name, opts){
		var _this = this;

		if(typeof name == "object"){
			popitHelper.create(popitHelper.api[name], opts);
		}else{
			theseOpts = {
				defaults: {
					name: name
				},
				opts: opts,
			};
			$.popit.close();

			// //initialize plugin and send to needed step
			popitHelper.api[name] = new popit(null, theseOpts);
			popitHelper.api[name].init(popitHelper.api[name]);

			if(popitHelper.api[name].opts.href !== undefined){
				popitHelper.fetch(popitHelper.api[name], popitHelper.api[name].opts.data)
			}else{
				popitHelper.create(popitHelper.api[name], popitHelper.api[name].opts.data);
			};

			//bind custom events for array $custom
			if(popitHelper.api[name].opts.info !== undefined){
				if(popitHelper.api[name].opts.info.$custom !== undefined){
					if(typeof popitHelper.api[name].opts.info.$custom == "object" && $.isArray(popitHelper.api[name].opts.info.$custom)){
						popitHelper.exceptions.customEvents(popitHelper.api[name]);
					};
				};
			};
		};
	},
	close: function(name, opts){
		var _this = this;

		if(popitHelper._active.length <= 0){ return true; }

		if(name){
			try{ popitHelper.api[name].$modal.remove(); }catch(e){};
		}else{
			var $active = popitHelper._active[popitHelper._active.length-1];
			try{
				if(opts.aria !== "false"){ popitHelper.aria($active.$el); };
			}catch(e){};

			try{
				//runs within this function
				if(typeof $active.opts.onClose == "function"){
					$active.opts.onClose($active);
				};
			}catch(e){}

			$active.$modal.animate({"opacity":"0"}, 300, function(){
				$active.$modal.remove();
				popitHelper._active.pop();
				if(popitHelper._active.length == 0){
					popitHelper.$wrap.empty();
					popitHelper._active = [];
				};
			});
		};
	}
};





//register name events for prototype global functions
$.popit = {
	alert:function(name, opts){ popit.prototype.alert(name, opts) },
	dialog:function(name, opts){ popit.prototype.dialog(name, opts) },
	open:function(name, opts){ popit.prototype.open(name, opts) },
	close:function(name, opts){ popit.prototype.close(name, opts) }
};


$.fn.popit = function(opts){
	//code will execute only once
	var $el = $(this),
		rev = {};

	this.each(function(){
		//code will execute each time a popit link is on the page
		rev = new popit(this, opts);
		rev.init();
		$(this).data("popit", rev);

		popitHelper.api[rev.defaults.name] = $.extend({}, $(this).data("popit"), $(this).data("info"));
	});

	//populate the holding container for all modals
	if($("#modalWrap").length <= 0){
		$("body").append('<div id="modalWrap"/>');
		popitHelper.$wrap = $("#modalWrap");
	};

	this.close = function(){
		$.popit.close();
	};

	$el.on("click", function(e){
		var $input = $(this),
			name = $input.attr("data-popit"),
			api = popitHelper.api[name];

		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();

		if(api.opts.aria !== "false"){ popitHelper.aria($input); };
		popitHelper.fetch(api);
	});

	//closes active modal
	$(document).on("click", "#expose, a.close, a.closeModal", this.close);
};
com.checkApiEvents(popitHelper);
/******************************************************* end popit ***************/










/******************************************************* request dialog functions ***************/
/*
	$.popit.dialog("example", {
		data: "example dialog",
		close: {
			text: "Close",
			class: "close",
			func: function(){} //default is $.popit.close()
		},
		continue: {
			text: "Continue",
			class: "continue",
			func: function(){}
		},
		success: function(){}
	});
*/
popitHelper.exceptions.dialog = function(api){
	com.load("/static/templates/dialog.htm", api.$modal.find("#modalData"), api.opts, true);

	$(document).on("click", ".dialog"+api.opts.continue.class+"Btn", function(e){
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();

		api.opts.continue.func(api, $(this), e);
	});

	$(document).on("click", ".dialog"+api.opts.close.class+"Btn", function(e){
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();

		api.opts.close.func(api, $(this), e);
	});
};
/******************************************************* end request dialog functions ***************/










/******************************************************* custom event binding ***************/
popitHelper.exceptions.customEvents = function(api){
	var arr = api.opts.info.$custom;
	for(var i = 0; i < arr.length; i++){
		$(document).on(arr[i].event, arr[i].$el, arr[i].func);
	};
};
/******************************************************* end custom event binding ***************/


