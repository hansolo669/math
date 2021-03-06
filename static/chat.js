//globals
"use strict";
var nick,
chat_init = false;
var chan = io.connect(window.location.origin+'/chat');
var room = window.location.pathname.slice(6);

function start(){
	elem("nickform").addEventListener("submit", function(event){
		event.stopPropagation();
		event.preventDefault();
		nick = elem("nick").value;
		chan.emit('nick', nick);
		elem("overlay").classList.add("hide");
		chat.start();
		elem("in").focus();
	});
}

//in the future everyone will log in with (fb,g+,reddit,twitter)? mimmicing irc is nice, but really isnt what this is about.
var chat = {
	start : function(){
		chat_init = true;
		console.log(chat_init)
		if (typeof nick != "undefined" && chat_init === true) {
			chan.emit('sub', {"room":room});
			chan.emit('users', {"room":room});
			chan.on('news', function (data) {
				console.log(data);
			});

			//message listeners
			chan.on('sys', function(data){
				console.log(data);
				if (data.users){
					chat.sysmsg(('users connected: ' + data.users.join(', ')));
				}
				
				if(data.msg){
					chat.sysmsg(data.msg);
				}

				if(data.title){
					console.log(data);
					elem("title").textContent = data.title;
				}
			});

			chan.on('message', function(data){
				if (chat_init === true){
					console.log(data);
					chat.msg(data.msg, data.nick);
				}
			});

			elem("in").addEventListener("keyup", math);

			elem("title").addEventListener("click", function(){
				var title = elem("title");
				if (title.firstChild.nodeName !== "INPUT") {
					var text = title.textContent;
					title.innerHTML = '<input type="text" placeholder="'+text+'"/>';
					title.firstChild.focus();
					title.firstChild.addEventListener("keyup", function(event){
						if (event.keyCode === 13 && title.firstChild.value != "") {
							title.textContent = title.firstChild.value;
							chan.emit('title', {"title":title.textContent, "room":room});
							elem("in").focus();
						} else if (event.keyCode === 13 && title.firstChild.value == "") {
							title.textContent = text;
							elem("in").focus();
						}
					});
				}
			});

		}
	},
	sendmessage : function(msg){
		if (typeof nick != "undefined" && chat_init === true) {
			chan.emit('message', {'msg': msg, 'nick':nick, 'room':room});
			chat.msg(msg, '');
		}
	},
	//not a fan of these because they build html strings and thats kinda unsafe
	msg : function(msg, nick){
		var time = new Date();
		time = time.toLocaleTimeString('en-US', {hour:"numeric", minute:"numeric"});
		var type = nick === ''?'you':'them';
		elem("log").insertAdjacentHTML('beforeend', '<span class="message '+ type +'"><span class="time">' + time +'</span><span class="nick">'+ nick +': </span><span class="message_txt">'+ msg + '</span></span>');
		render("log");
		scroll();
	},
	sysmsg : function(msg){
		elem("log").insertAdjacentHTML('beforeend', '<span class="message sys"><span class="nick">sys: </span><span class="message_txt">'+ msg + '</span></span>');
		scroll();
	}
};

//utility functions. 
function math(event){
	if (AMnames.length==0) initSymbols();//"symbolizes" math
	var input = document.getElementById("in").value;
	var out = document.getElementById("out");
	if (event.keyCode === 13 && event.shiftKey === false && input !== "") {
		input = input.replace(/\n/g, '<br>');
		elem("out").innerHTML = "";
		elem("in").value = "";
		chat.sendmessage(input);
		return false;
	} else{
		input = input.replace(/\n/g, '<br>');//only convert \n to <br> if event.shiftKey === true. or perhaps just prevent enterkey default (ie: inserting \n)
		out.innerHTML = input;
		AMprocessNode(out);
	}
}

function render(elem){
	if (AMnames.length==0) initSymbols();//"symbolizes" math
	var out = document.getElementById(elem);
	AMprocessNode(out);//renders basic math
}

function elem(el){
	return document.getElementById(el);
}

function scroll(){
	var scroll = elem("log").scrollHeight - elem("log").offsetHeight;
	var scrolltop = elem("log").scrollTop;
	if (scrolltop < scroll - 100 && scroll > 100) {
	} else{
		elem("log").scrollTop = scroll;
	}
}


//kick off the party when the DOM is ready.
document.addEventListener("DOMContentLoaded", function(event) {
	//and now a bunch of render calls so the basic help doesnt look SUPER DUMB
	render("demo_eq");
	render("demo_sy");
	//go go
	start();
});