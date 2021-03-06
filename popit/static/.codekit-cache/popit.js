/*
-add a title to the modal window (optional pass-in)
-add notify options, window top, bottom, left, right
-add automatic close after so many seconds
-add maximize modal window button
-add prompt() function with default input
-finilize the .has function to return possible arrays
*/




var com = {
	timeout: 1800, //is 30mins
	jsload: function(info){
		var _this = this;

		$.get(info.url, function(value){
			$.templates("tmpl", value);
			var html = $.render.tmpl(info.data);
			if(info.append){ info.target.append(html); }else{ info.target.html(html); }
		}).done(function(html){
			if(info.run !== undefined && _this.isFunc(info.run)){ info.run(html); }
			if(info.callback !== undefined && _this.isFunc(info.callback)){ info.callback(html); }
		});
	},
	detect: function(data, arr){
		var $data = $(data),
			obj = {};

		$.each(arr, function(i,v){
			if($data.find(v.sel).length > 0){
				obj = { name: v.name, $el: $data.find(v.sel) };
			}
			if($data.filter(v.sel).length > 0){
				obj = { name: v.name, $el: $data.filter(v.sel) };
			}
		});
		return obj;
	},
	waitForIt:function($el, callback){
		var _this = this,
			ignoreUrl = [
				"/ajax/directIgnore.html"
			];

		if($el === undefined || $el === "page"){ $el = $("body"); }
		if($el.get(0) !== $("body").get(0)){ $el.css({"position":"relative"}); }


		$(document).ajaxSend(function(x, y, z){
			function checkUrl(){
				var ignorePartial = [
					"testIgnore"
				];
				for(var i = 0; i < ignorePartial.length; i++){
					if(z.url.indexOf(ignorePartial[i]) > -1){
						return true;
					}
				}
			}

			if($(".waitForIt").length <= 0){
				if(ignoreUrl.indexOf(z.url) <= 0){
					if(!checkUrl()){
						$el.append("<div class='waitForIt' />");
					}
				}
			}
		});
		$(document).ajaxStop(function(){
			setTimeout(function(){
				$.waitForIt.close();
				$("#addItem").removeAttr("disabled").removeAttr("style");
			}, 1000);
		});

		// $(document).ajaxComplete(function(){});

		if(_this.isFunc(callback)){ callback(); }
	},
	checkApiEvents: function(api){
		var _this = this;
		if(!$.isEmptyObject(api.doc)){

			$.each(api.doc, function(k,v){
				if(_this.isFunc(v)){
					$.e.doc[k].push(v);
				}
			});
		}
		if(!$.isEmptyObject(api.win)){
			$.each(api.win, function(k,v){
				if(_this.isFunc(v)){
					$.e.win[k].push(v);
				}
			});
		}
	},
	type: function(name){
		var itis = "";
		switch(typeof name){
			case "function":itis="function";break;
			case "object":
				if($.isArray(name)){
					itis="array";
				}else{
					if(name instanceof jQuery){
						itis="jquery";
					}else{
						itis="object";
					}
				}
			break;
			case "string":itis="string"; break;
			case "number":if(!isNaN(name)){ itis="number";}else{itis="string";}break;
			case "":case "undefined":itis="undefined";break;
			default:itis="undefined";break;
		}
		return itis;
	},
	isFunc: function(name){ if(typeof name == "function"){ return true; } }
};

com.waitForIt();
$.waitForIt = {
	html: "<div class='waitForIt' style='position:absolute;z-index:8000;' />",
	close: function(){
		$(document).find(".waitForIt").fadeOut(function(){
			if($(this).parent().hasClass("saveCart")){
				$(this).parent().removeAttr("style");
			}
			//revisit
			// $(this).parent().css({ position: /(absolute|relative)/.test() ? position : "inherit" });
			$(this).remove();
		});
	},
	me: function($el, relative){
		if($(".waitForIt").length <= 0){
			if(relative){
				$el.css({"position":"relative"}).append(this.html);
			}else{
				$el.append(this.html);
			}
		}
	}
};






/**********************************************************************

               o|                            o
,---.,---.,---..|---     ,---.,---.,---.,---..,---.,---.
|   ||   ||   |||        |   |,---|`---.`---.||   |`---.
|---'`---'|---'``---'    |---'`---^`---'`---'``   '`---'
|         |              |

+------------------------------+    template: an ajax call that loads a htm template from '/static/templates'
|                              |              then runs JSRender to pass in the needed variables. Use with 'info' obj below.
|  Passin Variables            |
|     *dev* - structure = ''   |    structure: although the modal structure is rather simple this option allows you to pass in a new structure
|     target = ''              |    target: this clones an existing element on the page into a modal, pass in the JQuery selector (must be unique) ex: "#myModal" or ".myModal"
|     template = ''            |    href: an ajax call that can point to any file in the system
|     href = ''                |    data: *Not ajax 'data'*. This is used usually as a string to pass in simple messages
|     data = ''                |    cssClass: a unique CSS class to help style the modal / contents
|     cssClass = ''            |    style: the actually style attribute of the $container, usually used for modal width
|     style = ''               |    form: *This IS ajax 'data'. Usually in the format of a serilized form assed in as 'api.opts.form'
|     form = {}                |
|                              |    info: an object that us used in conjunction with 'template'. This object is passed to JSRender
|     info = {                 |             and the template obj. From there it will used the variables inside to render content.
|         *template obj names  |
|        }                     |    close: used in 'dialog' calls. This will allow custom text of the close button. The function is bound to the class
|     close = {                |    continue: used in 'dialog' calls. This will allow custom text of the continue button. The function is bound to the class
|         text: ''             |
|         class: ''            |
|         func: ()             |    type: ajax 'type'. Default is POST.
|        }                     |    dataType: ajax 'dataType'. Default is HTML.
|     continue = {             |    expose: boolen to show the black background.
|         text: ''             |    modalX: boolen to show the modal close 'x' button in top right.
|         class: ''            |
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
+------------------------------+

**********************************************************************/
var popitHelper = {
	_active: [],
	exceptions: {},
	api: {},
	doc: {
		ready:function(){
			$("[data-popit]").popit();

			//check for session object 'popit'
			if(sessionStorage.getItem("popit")){
				$.popit._.info = $.parseJSON(sessionStorage.getItem("popit"));

				$.popit.open($.popit._.info.name, {
					cssClass: "refreshedModal",
					href: "/browse/templates/bcc.jsp?id="+$.popit._.info.bcc
				});

				sessionStorage.removeItem("popit");
			}

			if(sessionStorage.getItem("sessionTimeout") !== null){
				var sessionDate = sessionStorage.getItem("sessionTimeout");
				$.popit.alert("sessionTimeout", {
					data: "<p style='text-align:center;'>Your session expired due to inactivity on "+sessionDate+".<br/>To continue click the 'OK' button below.</p>",
					cssClass: "informationModal",
					closeBtn: "Ok",
					modalX: false,
					exposeClose: false,
					closeBtnFunc: function(){
						window.location.reload();
					}
				});
				com.timeout = null;
				sessionStorage.removeItem("sessionTimeout");
			}

			//check for errorMessage hidden input
			if($("#formHandlerError").length){
				var bypass = [
					"cybersourceError",		//checkout
					"rtgPCIInternalError",	//checkout
					"addressLookup",		//checkout
					"invalidItem"			//full cart
				];
				if(bypass.indexOf($("#formHandlerError").val()) > -1){
				}else{
					$.popit.alert("error", {
						data: $("#errorMessage").val(),
						cssClass: "informationModal",
						closeBtn: "Close",
						modalX: false,
						exposeClose: false,
						msgType: $("#formHandlerError").val()
					});
				}

			}
		}
	},
	win: {
		resizestop:function(){
			if($.popit._._active.length > 0){
				$.each($.popit._._active, function(i){
					$.popit.center($.popit._._active[i]);
				});
			}
		}
	}
};//end popitHelper





function popit(el, opts){
	//default options for all modals
	this.defaults = {
		aria: true,
		cache: true,
		delay: 0,
		cssClass: "",
		modalX: true,
		expose: true,
		exposeClose: true,
		rxMatch: /@{(.*?)\}/
	};

	//el is null when popit is activated on the fly
	if(el === null){
		this.defaults.name = opts.defaults.name;
		this.opts = $.extend({}, this.defaults, opts.opts);
	}else{
		this.$el = $(el);
		this.defaults.name = this.$el.attr("data-popit");
		this.opts = $.extend({}, this.defaults, $(el).data().info, { _linkswitch: $(el).data().linkswitch }, opts);
	}
}//end popit





popit.prototype = {
	init: function(api){
		//code will execute each time a popit link is on the page
		var _this = this;

		//bind any DOM ready events for click handlers or listeners that are not active 'after click'
		if(!$.isEmptyObject(api)){
			if(com.isFunc($.popit.x[_this.defaults.name+"DOMReady"])){
				$.popit.x[_this.defaults.name+"DOMReady"](_this);
			}

			//bind custom events for array $custom
			if(api.opts.info !== undefined){
				if(api.opts.info.$custom !== undefined){
					if($.isArray(api.opts.info.$custom)){
						$.popit.x.customEvents(api);
					}
				}
			}
		}else{
			if(com.isFunc($.popit.x[_this.defaults.name+"DOMReady"])){
				$.popit.x[_this.defaults.name+"DOMReady"](_this);
			}
		}
	},
	fetch: function(api){
		var _this = this;

		//_this will house the ajax request for all modals that require it
		var type = (api.opts.type)? api.opts.type : "POST";
		var dataType = (api.opts.dataType)? api.opts.dataType : "HTML";

		//check to see if href contains a URL variable to switch out
		//useful if switching between checkout, storecart, and payoneline
		function checkLinkswitch(){
			if(api.opts.href.match(api.defaults.rxMatch)){
				var page = "";
				api.opts.href = api.opts.href.replace(api.defaults.rxMatch, page);
			}
		}

		if(api.opts._linkswitch !== undefined){
			checkLinkswitch();
		}

		//before ajax check before exceptions to see if there are any additional modifaction to the object
		if(com.isFunc($.popit.x[api.defaults.name+"BeforeSend"])){
			$.popit.x[api.defaults.name+"BeforeSend"](api);
		}

		if(api.opts.cache === true && api.data !== undefined){
			_this.create(api, api.data);
		}else{
			//remove all functions from api.opts, just incase
			var apiOpts = {};

			$.each(api.opts, function(k,v){
				if(com.type(k) !== "function" && com.type(v) !== "function"){
					apiOpts[k] = v;
				}
			});

			$.ajax({
				type: type,
				url: api.opts.href,
				data: api.opts.form || apiOpts,
				dataType: dataType,
				beforeSend:function(){
					if(com.isFunc(api.opts.before)){
						api.opts.before();
					}
				},
				success:function(data){
					//search data for specific elements
					var hasIt = com.detect(data, [
						{ name: "form", sel: "form" },
						{ name: "iframe", sel: "iframe" },
						{ name: "modal", sel: "[data-popit]" }
					]);
					api[hasIt.name] = hasIt.$el;

					api.successMsg = ($(data).find(".successResponse").length > 0)? $(data).find(".successResponse").html() : null;

					//if forms capture all required inputs
					if(api.form){
						//any elements that are required
						var requiredTypes = [
								".required",
								"[data-required]"
							],
							id = ($(data).find("form").attr("id") !== undefined)? $(data).find("form").attr("id") : $(data).find("form").attr("name");

						api.formId = $("#"+id);
						api.$required = $(data).find(requiredTypes.toString());
					}

					//save the ajax data to the modal object
					if(api.opts.cache !== false){
						api.data = data;
					}

					//runs within this function
					if(com.isFunc(api.opts.insuccess)){
						api.opts.insuccess(data);
					}

					//escapes and runs success on caller
					if(com.isFunc(api.opts.success) && data.result === "success"){
						api.opts.success();
						return true;
					}else{
						//append the data
						_this.create(api, data);
					}
				},
				complete:function(){
					if(api.modal){
						console.log("fetch has modal");
					}

					if(com.isFunc(api.opts.complete)){
						api.opts.complete();
					}
				},
				error:function(){}
			});
		}

	},
	create:function(api, data){
		var _this = this;

		//if the dialog option is on remap variable from object
		if(api.opts.dialog === true){
			data = (com.type(data) === "string")? data : data.errors || data.formErrors;
		}
		//if the prompt option is on remap variable from object
		if(api.opts.prompt === true){
			data = (com.type(data) === "string")? data : data.errors || data.formErrors;
		}

		//show a close button at the top of the modal
		var modalX = (api.opts.modalX)? "<a role='button' aria-label='Close modal' href='javascript:void(0);' class='close'>&otimes;</a>" : "";
		//show a close button at the bottom of the modal
		var closeBtn = (api.opts.closeBtn)? "<a class='closeModal redBtn fakeBtn'>"+api.opts.closeBtn+"</a>" : "";

		//if target is passed in then pull the data from the selector and append into modal
		var targetContent = (api.opts.target)? $(api.opts.target).html() : "";

		//_this will be the append into the modal container div at the end of page **under development**
		var structureDefault = "<div id='"+api.defaults.name+"' class='popup "+api.opts.css+"' style='visibility:hidden;"+api.opts.style+"'>"+modalX+"<div id='modalData'>"+targetContent+"</div>"+closeBtn+"</div>";
		var structure = (api.opts.structure)? "" : structureDefault;

		//append the modal
		$.popit._.$wrap.append(structure);

		//if the modal contains elements then execute needed plugins
		if(api.opts.target){
			//search data for specific elements
			var hasIt = com.detect(api.opts.target, [
				{ name: "modal", sel: "[data-popit]" }
			]);
			api[hasIt.name] = hasIt.$el;

			$("[data-popit='"+hasIt.$el.attr("data-popit")+"']").popit();
		}

		//hide / show expose background
		if(api.opts.expose){
			//double modals exist on "what is bunkie"
			if(api.opts.exposeClose && $("#expose").length <= 0){
				$.popit._.$wrap.append("<div id='expose'/>");
			}

			if(!api.opts.exposeClose && $("#expose-"+api.defaults.name).length <= 0){
				$.popit._.$wrap.append("<div id='expose-"+api.defaults.name+"'/>");
			}
		}

		api.$modal = $("#"+api.defaults.name);
		api.$container = api.$modal.find("#modalData");

		//if data exists then append to the modal
		if(data){
			api.$container.append(data);
		}

		if(api.form && api.$required.length > 0){
			//after appending to the document bind key events for required fields
			//docuble pass in to allow $required 'refference' to be converted to 'object'
			com.keyEvents(api, api.$required);
		}

		_this.paint(api);
	},
	center:function(api){
		var _this = this;

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
		_this.height = height;
		$modal.css({"position":isMobile,"visibility":"visible","top":top,"left":left}).animate({"opacity":"1"}, 300);
	},
	paint:function(api){
		var _this = this;

		//after load of data check to see if there are any unique exceptions for the modals
		if(com.isFunc($.popit.x[api.defaults.name])){
			$.popit.x[api.defaults.name](api);
		}

		//check to see if closeBtn has a unique function bound
		if(com.isFunc(api.opts.closeBtnFunc)){
			$(document).on("click", "a.closeModal", api.opts.closeBtnFunc);
		}

		//always check for dialog insertion
		if(api.opts.dialog){ $.popit.x.dialog(api); }
		//always check for prompt insertion
		if(api.opts.prompt){ $.popit.x.prompt(api); }

		//check for any iframes and $waitForIt() spinner to finish loading
		if(!$.isEmptyObject(api.iframe)){
			$.waitForIt.me(api.$modal);
			api.iframe.load(api.iframe.attr("src"), function(){
				$.waitForIt.close();
			});
		}

		//center the modal
		_this.center(api);

		if(api.form){ //508 focus to first text input
			$(api.formId.selector).find("input[type='text']:visible").first().focus();
		}else{
			api.$container.find("h2:visible").first().focus();
		}

		//runs within this function
		if(com.isFunc(api.opts.runLast)){
			api.opts.runLast(api);
		}

		$.popit._._active.push(api);
	},
	thanks:function(api){
		//this function will replace the matched pattern variable with the required info.
		//api.successMsg can contain replaceable variables such as '@{email}'
		function checkTemplate(){
			if(api.successMsg.match(api.defaults.rxMatch)){
				api.successMsg = api.successMsg.replace(api.defaults.rxMatch, api.captureValue.val());
			}
		}

		var $container = $("#modalData") || api.$container,
			$modal = $("#modalWrap .popup") || api.$modal;

		if(api.captureValue !== undefined){
			checkTemplate();
		}

		$container.fadeOut(function(){
			$modal.addClass("successMsg").append(api.successMsg);
		});
	},
	aria:function($el){
		var tags = ($el.attr("aria-hidden") === "true")? { "aria-hidden":false, "aria-expanded":true } : { "aria-hidden":true, "aria-expanded":false };
		$el.attr(tags);
	},







	alert: function(name, opts){
		var _this = this,
			theseOpts = {
			defaults: {
				name: name,
			},
			opts: $.extend({}, { closeBtn: "Close" }, opts),
		};
		$.popit.close();

		//initialize plugin and send to needed step
		$.popit._.api[name] = new popit(null, theseOpts);
		$.popit._.api[name].init($.popit._.api[name]);

		var go = ($.popit._.api[name].opts.href !== undefined)? "fetch" : "create";
		_this[go]($.popit._.api[name], $.popit._.api[name].opts.data);
	},
	dialog: function(name, opts){
		var _this = this,
			theseOpts = {
				defaults: {
					name: name
				},
				opts: $.extend({}, {
					dialog: true,
					success: (opts.success)? opts.success : null,
					close: {
						text: "Close",
						class: "close",
						func: function(api, $el, e){ $.popit.close(); }
					},
					continue: {
						text: "Ok",
						class: "ok",
						func: function(api, $el, e){}
					},
					runDone: function(data){
						//search data for specific elements
						var hasIt = com.detect(data, [
							{ name: "form", sel: "form" },
							{ name: "iframe", sel: "iframe" },
							{ name: "modal", sel: "[data-popit]" }
						]);

						$("[data-popit='"+hasIt.$el.attr("data-popit")+"']").popit();
					}
				}, opts),
		};
		$.popit.close();

		//initialize plugin and send to needed step
		$.popit._.api[name] = new popit(null, theseOpts);
		$.popit._.api[name].init($.popit._.api[name]);

		var go = ($.popit._.api[name].opts.href !== undefined)? "fetch" : "create";
		_this[go]($.popit._.api[name], $.popit._.api[name].opts.data);
	},
	prompt: function(name, opts){
		var _this = this,
			theseOpts = {
				defaults: {
					name: name
				},
				opts: $.extend({}, {
					prompt: true,
					success: (opts.success)? opts.success : null,
					input: {
						id: "idField",
						class: "classField",
						name: "nameField",
						value: "",
						placeholder: ""
					},
					close: {
						text: "Close",
						class: "close",
						func: function(api, $el, e){ $.popit.close(); }
					},
					continue: {
						text: "Ok",
						class: "ok",
						func: function(api, $el, e){
							alert(api.opts.input.value);
						}
					},
					runDone: function(data){
						//check to see if template containers another modal
						if(_this.contains.modal(data)){
							console.log("really really does")
						}
					}
				}, opts)
		};
		$.popit.close();

		//initialize plugin and send to needed step
		$.popit._.api[name] = new popit(null, theseOpts);
		$.popit._.api[name].init($.popit._.api[name]);

		var go = ($.popit._.api[name].opts.href !== undefined)? "fetch" : "create";
		_this[go]($.popit._.api[name], $.popit._.api[name].opts.data);
	},
	open: function(name, opts){
		var _this = this;

		if(com.type(name) === "object"){
			$.popit._.create($.popit._.api[name], opts);
		}else{
			var theseOpts = {
				defaults: {
					name: name
				},
				opts: opts,
			};
			$.popit.close();

			// //initialize plugin and send to needed step
			$.popit._.api[name] = new popit(null, theseOpts);
			$.popit._.api[name].init($.popit._.api[name]);

			var go = ($.popit._.api[name].opts.href !== undefined)? "fetch" : "create";
			_this[go]($.popit._.api[name], $.popit._.api[name].opts.data);
		}
	},
	close: function(name, opts){
		var _this = this;

		if($.popit._._active.length <= 0){ return true; }

		if(name){
			try{ $.popit._.api[name].$modal.remove(); }catch(e){}
		}else{
			if($.popit._._active.length > 0){
				var $active = $.popit._._active[$.popit._._active.length-1];
				try{
					if(opts.aria !== "false"){ _this.aria($active.$el); }
				}catch(e){}

				try{
					//runs within this function
					if(com.isFunc($active.opts.onClose)){
						$active.opts.onClose($active);
					}
				}catch(e){}

				$active.$modal.animate({"opacity":"0"}, 300, function(){
					$active.$modal.remove();
					$.popit._._active.pop();
					if($.popit._._active.length === 0){
						$.popit._.$wrap.empty();
						$.popit._._active = [];
					}

					//remove button binding so events do not stack
					if($active.opts.close !== undefined){
						$(document).off("click", ".dialog"+$active.opts.close.class+"Btn");
						$(document).off("click", ".dialog"+$active.opts.continue.class+"Btn");
					}
				});
			}else{ /*all active modals are closed*/ }
		}
	}
};


//register name events for prototype global functions
$.popit = {
	_: popitHelper,
	x: popitHelper.exceptions,
	alert:function(name, opts){ popit.prototype.alert(name, opts); },
	dialog:function(name, opts){ popit.prototype.dialog(name, opts); },
	prompt:function(name, opts){ popit.prototype.prompt(name, opts); },
	open:function(name, opts){ popit.prototype.open(name, opts); },
	close:function(name, opts){ popit.prototype.close(name, opts); },
	center:function(name, opts){ popit.prototype.center(name, opts); }
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

		//convert 'string' "true"/"false" -> boolean
		data = $(this).data("info");
		$.each(data, function(_k,_v){
			if(_v === "true"){ data[_k] = true; }
			if(_v === "false"){ data[_k] = false; }
		});

		$.popit._.api[rev.defaults.name] = $.extend({}, $(this).data("popit"), data);
	});

	//populate the holding container for all modals
	if($("#modalWrap").length <= 0){
		$("body").append('<div id="modalWrap"/>');
		$.popit._.$wrap = $("#modalWrap");
	}

	this.close = function(){
		$.popit.close();
	};

	$el.on("click", function(e){
		var $input = $(this),
			name = $input.attr("data-popit"),
			api = $.popit._.api[name];
console.log("in click")
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();

		if(api.opts.dialog == "true"){
			$.popit.dialog(api.opts.name, api.opts);
			return false;
		}
		if(api.opts.prompt == "true"){
			$.popit.prompt(api.opts.name, api.opts);
			return false;
		}

		if(api.opts.aria !== "false"){ api.aria($input); }

		if(api.opts.target !== undefined){
			api.create(api);
		}else{
			api.fetch(api);
		}

	});

	//closes active modal
	$(document).off("click", "#expose, a.close, a.closeModal", this.close);
	$(document).on("click", "#expose, a.close, a.closeModal", this.close);

	//binds ESC key to close active modal
	$(document).off("keydown", function(e){if($.popit._._active.length > -1 && e.keyCode === 27){ $.popit.close(); }});
	$(document).on("keydown", function(e){if($.popit._._active.length > -1 && e.keyCode === 27){ $.popit.close(); }});

};
com.checkApiEvents($.popit._);
/******************************************************* end popit ***************/



























/******************************************************* session timeout ***************/
$.popit.x.sessionWarning = function(api){
	var info = {
		runLast: function(){
			var $count = $(".countDown"),
				time = 60;

			function out(){
				clearInterval(com.sessionTime);
				sessionStorage.setItem("sessionTimeout", new Date().toLocaleString());
				window.location.reload();
			}

			com.sessionTime = setInterval(function(){
				--time;
				if(time === 0){
					out(com.sessionTime);
				}else{
					$count.text(time);
				}
			}, 1000);
		}
	};
	api.opts = $.extend({}, api.opts, info);
};

$.e.doc.ready.push(function(){
	if(com.timeout === null){
		return true;
	}
	setTimeout(function(){
		$.popit.alert("sessionWarning", {
			data: "Your session is about to expire in <span class='countDown' style='font-weight:bold;'>60</span> seconds, to continue please click 'OK' below.",
			css: "informationModal",
			closeBtn: "OK",
			modalX: false,
			exposeClose: false,
			closeBtnFunc: function(){
				window.location.reload();
			}
		});
	}, (com.timeout*1000));
});
/******************************************************* end session timeout ***************/

















/******************************************************* dialog & prompt functions ***************/
/*
$.popit.dialog("example", {
	data: "example dialog",
	close: {
		text: "Close",
		class: "close",
		func: function(api, $el, e){
			*OPTIONAL* Only if you wish to bypass the default $.popit.close()
		}
	},
	continue: {
		text: "Continue",
		class: "continue",
		func: function(api, $el, e){}
	}
});
*/

$.popit.x.dialog = function(api){
	com.jsload({
		url: "static/templates/dialog.htm",
		target: api.$modal.find("#modalData"),
		data: api.opts,
		append: true,
		success: api.opts.success,
		run: api.opts.runDone
	});

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



/*
$.popit.prompt("promptExample", {
	data: "example prompt, enter a value below",
	input: {
		id: "idField",
		class: "classField",
		name: "nameField",
		value: "",
		placeholder: "Place holder text"
	},
	close: {
		text: "Close",
		class: "close",
		func: function(api, $el, e){
			*OPTIONAL* Only if you wish to bypass the default $.popit.close()
		}
	},
	continue: {
		text: "Ok",
		class: "ok",
		func: function(api, $el, e){
			alert(api.opts.input.value)
		}
	}
});
*/
$.popit.x.prompt = function(api){
	com.jsload({
		url: "static/templates/prompt.htm",
		target: api.$modal.find("#modalData"),
		data: api.opts,
		append: true,
		success: api.opts.success,
		run: api.opts.runDone
	});

	$(document).on("click", ".prompt"+api.opts.continue.class+"Btn", function(e){
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();

		api.opts.input.value = $("#prompt"+api.opts.input.id+"Txt").val();

		api.opts.continue.func(api, $(this), e);
	});

	$(document).on("click", ".prompt"+api.opts.close.class+"Btn", function(e){
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();

		api.opts.close.func(api, $(this), e);
	});
};
/******************************************************* end dialog & prompt functions ***************/










/******************************************************* custom event binding ***************/
$.popit.x.customEvents = function(api){
	var arr = api.opts.info.$custom;
	for(var i = 0; i < arr.length; i++){
		$(document).on(arr[i].event, arr[i].$el, arr[i].func);
	}
};
/******************************************************* end custom event binding ***************/





