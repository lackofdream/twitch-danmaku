chrome.webNavigation.onHistoryStateUpdated.addListener(function() {
	chrome.tabs.executeScript(null,{file:"js/content.js"});
});

 chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {               
   if (request.action == "showIcon") {
      chrome.pageAction.show(sender.tab.id);
   }
});