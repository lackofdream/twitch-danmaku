(function() {

	// show icon
	chrome.runtime.sendMessage({action: "showIcon"}, function(response) {});

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (request.action == "stateChange") {
			stopDanmaku();
			isChatReady = false;
			isPlayerReady = false;
			init();
		}
	});
	var testCounter = 0;
	MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

	var chkActionItv = null;
	var chkChatItv = null;
	var chkPlayerItv = null

	var isChatReady = false;
	var isPlayerReady = false;
	var isDanmakuOn = true;

	var chatOb = new MutationObserver(newChatMsgHandler);
	var chatObConfig = { childList: true };

	var disp = null;

	var dmBtn = "<span><a class='button primary dark' id='dmTogglelBtn'><span>Turn Danmaku OFF</span></a></span>"

	/***************Construct Danmaku Object*********************/
	var Danmaku = function (basicInfo) {
		this.color = basicInfo.color;
		this.content = basicInfo.content;
		this.speed = 50;
		this.id = "dm" + Date.now();
		this.markUp = "<span>I am a moe danmaku.</span>";
	}

	Danmaku.prototype.updateMarkup = function(top, left) {
		this.markUp = "<span id='"+this.id+"' class='danmaku-item'"+
			" style='color:"+ this.color +";top:"+top+"px;left:"+left+"px;'>"+ this.content +"</span>";
	}

	Danmaku.prototype.putOnScreen = function() {
		$(".player-fullscreen-overlay").append(this.markUp);
	};

	/************************************************************/

	/********************** Danmaku dispatcher **********************/
	var DMDispatcher = function () {
		this.containerH = $(".player-fullscreen-overlay").height();
		this.containerW = $(".player-fullscreen-overlay").width();

		this.tracks = new Array(Math.floor(this.containerH/25));
		for (var i = 0; i < this.tracks.length; i++) {
			this.tracks[i] = {
				ready: true,
				waitTime: 0,
				top: i*25 + 15
			}
		}
	}

	DMDispatcher.prototype.enterQ = function(dm) {
		var findOneSpot = false;
		var idx = 0;
		for (var i = 0; i < this.tracks.length; i++) {
			if (this.tracks[i].ready) {
				idx = i;
				findOneSpot = true;
				break;
			}
		}
		if (!findOneSpot) {
			idx = Math.floor(Math.random()*this.tracks.length);
		}
		dm.top = this.tracks[idx].top;
		dm.updateMarkup(this.tracks[idx].top, this.containerW);
		dm.putOnScreen();
		var currentWaitTime = this.tracks[idx].waitTime;
		var dmLength = $("#"+dm.id).width();
		var thisDmWaitTime = dmLength/(this.containerW/10000);
		this.tracks[idx].waitTime += thisDmWaitTime;
		var scrollLength = dmLength + this.containerW;
		$("#"+dm.id)
			.delay(currentWaitTime)
			.animate({
				"left": "-="+scrollLength+"px"
			},{
				specialEasing: {
					left: "linear"
				},
				duration: 10000,
				start: function () {
					var startTime = new Date().getTime();
					var interval = setInterval(function(){
						this.tracks[idx].ready = false;
					    if(new Date().getTime() - startTime > thisDmWaitTime){
					    	this.tracks[idx].ready = true;
					        clearInterval(interval);
					        return;
					    }
					    this.tracks[idx].waitTime -= 1000;
					}, 1000); 
					
				},
				complete: function () { $(this).remove(); }
			});
	};

	/****************************************************************/
	
	$( document ).ready(function () {
		init();
	});

	function init () {
		chkActionItv = setInterval(insertToggleBtn, 500);
		chkChatItv = setInterval(checkChat, 500);
		chkPlayerItv = setInterval(checkPlayer, 500);
	}

	function checkPlayer () {
		if ( $("#player").length ) {
    		clearInterval(chkPlayerItv);
    		isPlayerReady = true;
    	};
	}

	function checkChat () {
		if ( $(".chat-lines").length ) {
    		clearInterval(chkChatItv);
    		isChatReady = true;
    		startDanmaku();
    	};
	}
    
    function insertToggleBtn () {
    	if ( $(".channel-actions").length ) {
    		clearInterval(chkActionItv);
    		if ( $("#dmTogglelBtn").length === 0 ) {
	    		$(".channel-actions").append(dmBtn);
	    		$( "#dmTogglelBtn" ).click(toggleDanmu);
    		};
    	};
    }

    function toggleDanmu () {
    	if (isDanmakuOn) {
    		stopDanmaku();
    		$( "#dmTogglelBtn span" ).text("Turn Danmaku ON");
    	} else {
    		startDanmaku();
    		$( "#dmTogglelBtn span" ).text("Turn Danmaku OFF");
    	}
    }

    function newChatMsgHandler (mutations) {
    	mutations.forEach(function(mutation) {
    		var numOfNodeAdded = mutation.addedNodes.length;
    		var currNode= null;
			if ( numOfNodeAdded > 0) {
				for (var i = 0; i < numOfNodeAdded; i++) {
					if (mutation.addedNodes[i].className === 'ember-view') {
						currNode = mutation.addedNodes[i];
						var newDanmaku = {
							color: currNode.querySelector("li .from").style.color,
							content: currNode.querySelector("li .message").innerHTML
						}
						// calculate danmaku length
						// var emojiCount = currNode.querySelector("li .message").querySelectorAll("img").length;
						// var pureTextLength = currNode.querySelector("li .message").textContent.length;
						// newDanmaku.dmLength =  pureTextLength + emojiCount*2;
						disp.enterQ(new Danmaku(newDanmaku));
						//new Danmaku(newDanmaku).emit();
					}
				};
			};
		});
    }

    function startDanmaku () {
    	console.log("Start Danmaku.");
    	isDanmakuOn = true;
    	disp = new DMDispatcher();
       	var chatRoom = document.querySelector('.chat-lines');
    	if ( chatRoom !== null ) {
    		console.log("Start observing.");
    		chatOb.observe(chatRoom, chatObConfig);
    	}
    }

    function stopDanmaku () {
    	console.log("Stop Danmaku.");
    	isDanmakuOn = false;
		chatOb.disconnect();
		$(".player-fullscreen-overlay").text(" ");
    }

})();
