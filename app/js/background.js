chrome.webNavigation.onHistoryStateUpdated.addListener(function() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
	    chrome.tabs.sendMessage(tabs[0].id, {action: "stateChange"}, function(response) {});  
	});
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.action == "showIcon") {
		chrome.pageAction.show(sender.tab.id);
	}
});