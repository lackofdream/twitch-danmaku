(function() {

	// show icon
	chrome.runtime.sendMessage({action: "showIcon"}, function(response) {});

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (request.action === "stateChange") {
			stopDanmaku();
			isChatReady = false;
			isPlayerReady = false;
			init();
		}

		if (request.action === "updateColor") {
			updateColor(request.isCorlorful, request.color);
		}		
	});

	var isCorlorful = true;
	var singleColor = "#fff";

	MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

	var chkActionItv = null;
	var chkChatItv = null;
	var chkPlayerItv = null;
	var chkHeightItv = null;

	var chatLines = '.tw-full-height.tw-flex-grow-1.tw-pd-b-1';
	var buttonContainer = ".chat-input__buttons-container"

	var containerH=0;
	var containerW=0;
	var tracks = null;

	var isChatReady = false;
	var isPlayerReady = false;
	var isDanmakuOn = true;

	var chatOb = new MutationObserver(newChatMsgHandler);
	var chatObConfig = { childList: true };

    var dmBtn = '<button id="dmTogglelBtn" class="tw-button"><span class="tw-button__text">Turn Danmaku OFF</span></button>'

	/***************Construct Danmaku Object*********************/
	var Danmaku = function (basicInfo) {
		this.color = isCorlorful?basicInfo.color:singleColor;
		this.content = basicInfo.content;
		this.dmLength = basicInfo.dmLength;
		this.id = "dm" + Date.now();
		this.markUp = "<span>I am a moe danmaku.</span>";
	}

	Danmaku.prototype.updateMarkup = function(top, left) {
		this.markUp = "<div id='"+this.id+"' class='danmaku-item'"+
			" style='color:"+ this.color +";top:"+top+"px;left:"+left+"px;width:"+this.dmLength+"px;'>"+ this.content +"</div>";
	}

	Danmaku.prototype.putOnScreen = function() {
		$(".player-fullscreen-overlay").append(this.markUp);
	};

	/************************************************************/

	/********************** Danmaku dispatcher **********************/

	function initTracks() {
		if (isPlayerReady) {
			containerH = $(".player-fullscreen-overlay").height();
			containerW = $(".player-fullscreen-overlay").width();
			
			tracks = new Array(Math.floor(containerH/28));
			for (var i = 0; i < tracks.length; i++) {
				tracks[i] = {
					ready: true,
					waitTime: 0,
					top: i*28 + 15
				}
			}
		}
	}

	function updateTracks () {
		stopDanmaku();
		tracks = new Array(Math.floor(containerH/28));
		for (var i = 0; i < tracks.length; i++) {
			tracks[i] = {
				ready: true,
				waitTime: 0,
				top: i*28 + 15
			}
		}
		startDanmaku();
	}

	function pushDanmaku(dm) {
		containerW = $(".player-fullscreen-overlay").width();

		var findOneSpot = false;
		var idx = 0;
		for (var i = 0; i < tracks.length; i++) {
			if (tracks[i].ready) {
				idx = i;
				findOneSpot = true;
				break;
			}
		}
		if (!findOneSpot) {
			idx = Math.floor(Math.random()*tracks.length);
		}
		var currentTrack = tracks[idx];
		dm.top = currentTrack.top;
		dm.updateMarkup(currentTrack.top, containerW);
		dm.putOnScreen();
		var currentWaitTime = currentTrack.waitTime;
		//var dm.dmLength = $("#"+dm.id).width();
		var multiplier = dm.dmLength/600;
		multiplier = multiplier<0.9?0.9:multiplier;	// min speed for short text
		multiplier = multiplier>1.5?1.5:multiplier; //max speed for long text
		var dur = 15000 * multiplier;
		
		var thisDmWaitTime = dm.dmLength/(containerW/dur);
		currentTrack.waitTime += thisDmWaitTime;
		var scrollLength = dm.dmLength + containerW;
		
		$("#"+dm.id)
			.animate({
				"left": "-="+scrollLength+"px"
			},{
				specialEasing: {
					left: "linear"
				},
				duration: dur,
				start: function () {
					currentTrack.ready = false;
					setTimeout(function () {
						currentTrack.waitTime -= thisDmWaitTime;
						currentTrack.ready = true;
					}, thisDmWaitTime);
				},
				complete: function () {
					$("#"+dm.id).remove();
				}
			});
	};

	/****************************************************************/
	
	$( document ).ready(function () {
		if(checkCurrURL()){
			init();
		}
	});

	function init () {
		chkActionItv = setInterval(insertToggleBtn, 500);
		chkChatItv = setInterval(checkChat, 500);
		chkPlayerItv = setInterval(checkPlayer, 500);
		queryColor();
	}

	function checkCurrURL () {
		var url = window.location.href;
		var length = url.split('/').length;
		return length===4 && url[3]!="";
	}

	function queryColor () {
		chrome.runtime.sendMessage({action: "queryColor"}, function(response) {});
	}

	function updateColor (isClrfl, clr) {
		isCorlorful = isClrfl;
		singleColor = clr;
		if (!isCorlorful) {
			var currentItems = $(".danmaku-item");
			if (currentItems.length) {
				currentItems.css('color', singleColor);
			};
		};
	}

	function checkPlayer () {
		if ( $(".player-fullscreen-overlay").length ) {
    		clearInterval(chkPlayerItv);
    		isPlayerReady = true;
    		console.log("checkPlayer.....");
    		initTracks();
    	};
	}

	function chkHeight () {
		var currentHeight = $(".player-fullscreen-overlay").height();
		if (currentHeight!==containerH) {
			containerH = currentHeight;
			updateTracks();
		}
	}

	function checkChat () {
		if ( $(chatLines).length ) {
    		clearInterval(chkChatItv);
    		isChatReady = true;
    		console.log("checkChat.....");
    		startDanmaku();
    	};
	}
    
    function insertToggleBtn () {
		if ( $(buttonContainer).length ) {
    		clearInterval(chkActionItv);
    		if ( $("#dmTogglelBtn").length === 0 ) {
	    		$(buttonContainer).append(dmBtn);
	    		$( "#dmTogglelBtn" ).click(toggleDanmu);
    		};
    	};
    }

    function toggleDanmu () {
    	isDanmakuOn = !isDanmakuOn;
    	if (isDanmakuOn) {
    		$( "#dmTogglelBtn span" ).text("Turn Danmaku OFF");
    		startDanmaku();
    	} else {
    		$( "#dmTogglelBtn span" ).text("Turn Danmaku ON");
    		stopDanmaku();
    	}
    }

    function newChatMsgHandler (mutations) {
    	mutations.forEach(function(mutation) {
    		var numOfNodeAdded = mutation.addedNodes.length;
    		
			if ( numOfNodeAdded > 0) {
				for (var i = 0; i < numOfNodeAdded; i++) {
					var currNode= null;
					
					if ((mutation.addedNodes[i].className+'').indexOf('chat-line__message') > -1) {
						currNode = mutation.addedNodes[i];
					}
					if (currNode) {
						var msgNode = currNode;
						var newDanmaku = {
							color: currNode.querySelector(".chat-author__display-name").style.color,
							content: msgNode.querySelector("span[data-a-target='chat-message-text']").innerHTML
						}
						// calculate danmaku length
						var emojiCount = msgNode.querySelectorAll("img").length;
						var pureText = msgNode.textContent;
						var pureTextLength = pureText.length;
						var fontsize = /[\u3400-\u9FBF]/.test(pureText)?35:22;
						newDanmaku.dmLength =  (pureTextLength + emojiCount*4)*fontsize; //22 = fontsize
						if (isDanmakuOn) {
							pushDanmaku(new Danmaku(newDanmaku));
						}
					}
				};
			};
		});
    }

    function startDanmaku () {
    	console.log("Start Danmaku.");
       	var chatRoom = document.querySelector(chatLines);
    	if ( chatRoom !== null ) {
    		chatOb.observe(chatRoom, chatObConfig);
    	}
    	chkHeightItv = setInterval(chkHeight, 500);
    }

    function stopDanmaku () {
    	console.log("Stop Danmaku.");
    	clearInterval(chkHeightItv);
		chatOb.disconnect();
		$(".player-fullscreen-overlay").text(" ");
    }

})();
