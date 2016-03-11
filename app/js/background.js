var reservedURL = 'directory jobs settings login signup logout';
chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
	var urlParams = details.url.split('/');

	if (urlParams.length===4 && reservedURL.indexOf(urlParams[3])===-1) {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		    chrome.tabs.sendMessage(tabs[0].id, {action: "stateChange"}, function(response) {});  
		});
	}
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.action == "showIcon") {
		chrome.pageAction.show(sender.tab.id);
	}

	if (request.action == "queryColor") {
		console.log("got queryColor");
		chrome.storage.sync.get(['isCorlorful','color'], function(object) {
			var isCorlorful = object.isCorlorful===undefined?true:object.isCorlorful;
			var color = object.color?object.color:"#fff";
			chrome.tabs.sendMessage(sender.tab.id, 
	        	{action:"updateColor", isCorlorful:isCorlorful, color:color},
	        	function(response){}
	        );
		});
	}
});
