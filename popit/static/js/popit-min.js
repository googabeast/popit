function e(e,t){this.defaults={aria:!0,cache:!0,delay:0,css:"",modalX:!0,expose:!0,exposeClose:!0,rxMatch:/@{(.*?)\}/},null===e?(this.defaults.name=t.defaults.name,this.opts=$.extend({},this.defaults,t.opts)):(this.$el=$(e),this.defaults.name=this.$el.attr("data-popit"),this.opts=$.extend({},this.defaults,$(e).data().info,{_linkswitch:$(e).data().linkswitch},t))}var t={load:function(e,o,i,p,a){$.get(e,function(e){$.templates("tmpl",e);var t=$.render.tmpl(i);p?o.append(t):o.html(t)}).done(function(){void 0!==a&&"function"===t.type(a)&&a()})},checkApiEvents:function(e){$.isEmptyObject(e.doc)||$.each(e.doc,function(e,o){"function"===t.type(o)&&$.e.doc[e].push(o)}),$.isEmptyObject(e.win)||$.each(e.win,function(e,o){"function"===t.type(o)&&$.e.win[e].push(o)})},type:function(e){switch(e){case"function":return"function";break;case"object":return $.isArray(e)?"array":"object";break;case"string":return"string";break;case"number":return isNaN(e)?"string":"number";break;case"":case"undefined":default:return"undefined";break}}},o={_active:[],exceptions:{},api:{},doc:{ready:function(){if($("[data-popit]").popit(),sessionStorage.getItem("popit")&&(o.info=$.parseJSON(sessionStorage.getItem("popit")),$.popit.open(o.info.name,{css:"refreshedModal",href:"/browse/templates/bcc.jsp?id="+o.info.bcc}),sessionStorage.removeItem("popit")),sessionStorage.getItem("sessionTimeout")){var e=sessionStorage.getItem("sessionTimeout");$.popit.alert("sessionTimeout",{data:"<p style='text-align:center;'>Your session expired due to inactivity on "+e+".<br/>To continue click the 'OK' button below.</p>",css:"informationModal",closeBtn:"Ok",modalX:!1,exposeClose:!1,closeBtnFunc:function(){$.go.reload()}}),clearInterval(1800),sessionStorage.removeItem("sessionTimeout")}if($("#formHandlerError").length){["cybersourceError","rtgPCIInternalError","addressLookup","invalidItem"].indexOf($("#formHandlerError").val())>-1||$.popit.alert("error",{data:$("#errorMessage").val(),css:"informationModal",closeBtn:"Close",modalX:!1,exposeClose:!1,msgType:$("#formHandlerError").val()})}}},win:{resizestop:function(){o._active.length>0&&$.each(o._active,function(e){o.center(o._active[e])})}},fetch:function(e){function o(){if(e.opts.href.match(e.defaults.rxMatch)){var t="";e.opts.href=e.opts.href.replace(e.defaults.rxMatch,"")}}var i=this,p=e.opts.type?e.opts.type:"POST",a=e.opts.dataType?e.opts.dataType:"HTML";if(void 0!==e.opts._linkswitch&&o(),"function"===t.type(i.exceptions[e.defaults.name+"BeforeSend"])&&i.exceptions[e.defaults.name+"BeforeSend"](e),!0===e.opts.cache&&void 0!==e.data)i.create(e,e.data);else{var s={};$.each(e.opts,function(e,o){"function"!==t.type(e)&&"function"!==t.type(o)&&(s[e]=o)}),$.ajax({type:p,url:e.opts.href,data:e.opts.form||s,dataType:a,beforeSend:function(){"function"===t.type(e.opts.before)&&e.opts.before()},success:function(o){if("error"===o.result&&""!==o.errors){var p=o.errors.split(",");t.postError(p[1],$("#"+p[0]))}else{if(e.iframe=$(o).find("iframe").length>0,e.form=$(o).find("form").length>0,e.successMsg=$(o).find(".successResponse").length>0?$(o).find(".successResponse").html():null,e.form){var a=["[data-required]","textarea.required"],s=void 0!==$(o).find("form").attr("id")?$(o).find("form").attr("id"):$(o).find("form").attr("name");e.formId=$("#"+s),e.$required=$(o).find(a.toString())}if(!1!==e.opts.cache&&(e.data=o),"function"===t.type(e.opts.insuccess)&&e.opts.insuccess(o),"function"===t.type(e.opts.success)&&"success"===o.result)return e.opts.success(),!0;i.create(e,o)}},complete:function(){"function"===t.type(e.opts.complete)&&e.opts.complete()},error:function(){}})}},create:function(e,o){var i=this;!0===e.opts.dialog&&(o="string"===t.type(o)?o:o.errors||o.formErrors);var p=e.opts.modalX?"<a role='button' aria-label='Close modal' href='javascript:void(0);' class='close'></a>":"",a=e.opts.closeBtn?"<a class='closeModal redBtn fakeBtn'>"+e.opts.closeBtn+"</a>":"";i.$wrap.append("<div id='"+e.defaults.name+"' class='popup "+e.opts.css+"' style='visibility:hidden;"+e.opts.style+"'>"+p+"<div id='modalData'></div>"+a+"</div>"),e.opts.expose&&(e.opts.exposeClose&&$("#expose").length<=0&&i.$wrap.append("<div id='expose'/>"),!e.opts.exposeClose&&$("#expose-"+e.defaults.name).length<=0&&i.$wrap.append("<div id='expose-"+e.defaults.name+"'/>")),e.$modal=$("#"+e.defaults.name),e.$container=e.$modal.find("#modalData"),e.$container.append(o),e.form&&e.$required.length>0&&t.keyEvents(e,e.$required),i.style(e)},center:function(e){var t=this,o=$("#"+e.defaults.name),i=o.width(),p=o.height(),a=$(window).width(),s=$(window).height(),n=(s-p)/2,r=(a-i)/2,c="fixed";t.api[e.defaults.name].height=p,o.css({position:"fixed",visibility:"visible",top:n,left:r}).animate({opacity:"1"},300)},style:function(e){var o=this;"function"===t.type(o.exceptions[e.defaults.name])&&o.exceptions[e.defaults.name](e),"function"===t.type(e.opts.closeBtnFunc)&&$(document).on("click","a.closeModal",e.opts.closeBtnFunc),!0===e.opts.dialog&&o.exceptions.dialog(e),e.iframe&&($.waitForIt.me(e.$modal),o.$wrap.find("iframe").load(function(){$.waitForIt.close()})),o.center(e),e.form?$(e.formId.selector).find("input[type='text']:visible").first().focus():e.$container.find("h2:visible").first().focus(),"function"===t.type(e.opts.runLast)&&e.opts.runLast(e),o._active.push(e)},thanks:function(e){function t(){e.successMsg.match(e.defaults.rxMatch)&&(e.successMsg=e.successMsg.replace(e.defaults.rxMatch,e.captureValue.val()))}var o=$("#modalData")||e.$container,i=$("#modalWrap .popup")||e.$modal;void 0!==e.captureValue&&t(),o.fadeOut(function(){i.addClass("successMsg").append(e.successMsg)})},aria:function(e){var t="true"===e.attr("aria-hidden")?{"aria-hidden":!1,"aria-expanded":!0}:{"aria-hidden":!0,"aria-expanded":!1};e.attr(t)}};e.prototype={init:function(e){var o=this;$.isEmptyObject(e)?"function"===t.type($.popit.x[o.defaults.name+"DOMReady"])&&$.popit.x[o.defaults.name+"DOMReady"](o):("function"===t.type($.popit.x[o.defaults.name+"DOMReady"])&&$.popit.x[o.defaults.name+"DOMReady"](o),void 0!==e.opts.info&&void 0!==e.opts.info.$custom&&$.isArray(e.opts.info.$custom)&&$.popit.x.customEvents(e))},alert:function(t,o){var i={defaults:{name:t},opts:$.extend({},{closeBtn:"Close"},o)};$.popit.close(),$.popit.helper.api[t]=new e(null,i),$.popit.helper.api[t].init($.popit.helper.api[t]),void 0!==$.popit.helper.api[t].opts.href?$.popit.helper.fetch($.popit.helper.api[t],$.popit.helper.api[t].opts.data):$.popit.helper.create($.popit.helper.api[t],$.popit.helper.api[t].opts.data)},dialog:function(t,o){void 0===o.close.func&&(o.close.func=function(){$.popit.close()}),void 0===o.close.class&&(o.close.class="close"),void 0===o.continue.class&&(o.continue.class="continue");var i={defaults:{name:t},opts:$.extend({},{dialog:!0},o)};$.popit.close(),$.popit.helper.api[t]=new e(null,i),$.popit.helper.api[t].init($.popit.helper.api[t]),void 0!==$.popit.helper.api[t].opts.href?$.popit.helper.fetch($.popit.helper.api[t],$.popit.helper.api[t].opts.data):$.popit.helper.create($.popit.helper.api[t],$.popit.helper.api[t].opts.data)},open:function(o,i){if("object"===t.type(o))$.popit.helper.create($.popit.helper.api[o],i);else{var p={defaults:{name:o},opts:i};$.popit.close(),$.popit.helper.api[o]=new e(null,p),$.popit.helper.api[o].init($.popit.helper.api[o]),void 0!==$.popit.helper.api[o].opts.href?$.popit.helper.fetch($.popit.helper.api[o],$.popit.helper.api[o].opts.data):$.popit.helper.create($.popit.helper.api[o],$.popit.helper.api[o].opts.data)}},close:function(e,o){if($.popit.helper._active.length<=0)return!0;if(e)try{$.popit.helper.api[e].$modal.remove()}catch(e){}else if($.popit.helper._active.length>0){var i=$.popit.helper._active[$.popit.helper._active.length-1];try{"false"!==o.aria&&$.popit.helper.aria(i.$el)}catch(e){}try{"function"===t.type(i.opts.onClose)&&i.opts.onClose(i)}catch(e){}i.$modal.animate({opacity:"0"},300,function(){i.$modal.remove(),$.popit.helper._active.pop(),0===$.popit.helper._active.length&&($.popit.helper.$wrap.empty(),$.popit.helper._active=[]),void 0!==i.opts.close&&($(document).off("click",".dialog"+i.opts.close.class+"Btn"),$(document).off("click",".dialog"+i.opts.continue.class+"Btn"))})}}},$.popit={helper:o,x:o.exceptions,alert:function(t,o){e.prototype.alert(t,o)},dialog:function(t,o){e.prototype.dialog(t,o)},open:function(t,o){e.prototype.open(t,o)},close:function(t,o){e.prototype.close(t,o)}},$.fn.popit=function(t){var o=$(this),i={};this.each(function(){i=new e(this,t),i.init(),$(this).data("popit",i),$.popit.helper.api[i.defaults.name]=$.extend({},$(this).data("popit"),$(this).data("info"))}),$("#modalWrap").length<=0&&($("body").append('<div id="modalWrap"/>'),$.popit.helper.$wrap=$("#modalWrap")),this.close=function(){$.popit.close()},o.on("click",function(e){var t=$(this),o=t.attr("data-popit"),i=$.popit.helper.api[o];e.preventDefault(),e.stopPropagation(),e.stopImmediatePropagation(),"false"!==i.opts.aria&&$.popit.helper.aria(t),$.popit.helper.fetch(i)}),$(document).on("click","#expose, a.close, a.closeModal",this.close)},t.checkApiEvents($.popit.helper),$.popit.x.dialog=function(e){t.load("/static/templates/dialog.htm",e.$modal.find("#modalData"),e.opts,!0),$(document).on("click",".dialog"+e.opts.continue.class+"Btn",function(t){t.preventDefault(),t.stopPropagation(),t.stopImmediatePropagation(),e.opts.continue.func(e,$(this),t)}),$(document).on("click",".dialog"+e.opts.close.class+"Btn",function(t){t.preventDefault(),t.stopPropagation(),t.stopImmediatePropagation(),e.opts.close.func(e,$(this),t)})},$.popit.x.customEvents=function(e){for(var t=e.opts.info.$custom,o=0;o<t.length;o++)$(document).on(t[o].event,t[o].$el,t[o].func)};