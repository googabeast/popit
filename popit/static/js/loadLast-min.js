for(var n=0;n<$.e.doc.custom.length;n++){var e=$.e.doc.custom[n];$(document).on(e.name,e.func)}$(document).ready(function(){for(var n=0;n<$.e.doc.ready.length;n++)$.e.doc.ready[n]()}),$.each($.e.win,function(n,e){$(window).on(n,function(){for(var e=0;e<$.e.win[n].length;e++)$.e.win[n][e]()})});