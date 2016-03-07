(function() {
	// show icon
	chrome.runtime.sendMessage({action: "showIcon"}, function(response) {});

	var chkActionItv = null;
	var chkChatItv = null;

	var isChatReady = false;

	var msgs = $(".chat-lines");
	var dmBtn = "<span><a class='button primary dark' id='dmTogglelBtn'><span>Turn on Danmaku</span></a></span>"
	
	$( document ).ready(function () {
		chkActionItv = setInterval(insertToggleBtn, 500);
		chkChatItv = setInterval(checkChat, 500);
	});

	function checkChat () {
		if ( $(".chat-lines").length ) {
    		clearInterval(chkChatItv);
    		isChatReady = true;
    	};
	}
    
    function insertToggleBtn () {
    	if ( $(".channel-actions").length ) {
    		clearInterval(chkActionItv);
    		$(".channel-actions").append(dmBtn);
    		$( "#dmTogglelBtn" ).click(toggleDanmu);
    	};
    }

    function toggleDanmu () {
    	if (isChatReady) {
    		alert("Chat room ready..");
    	} else{
    		alert("Loading chat room, please wait a second..");
    	}
    }
})();
