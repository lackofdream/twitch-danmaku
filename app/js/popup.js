var isCorlorful = null;
var color = null;

chrome.storage.sync.get(['isCorlorful','color'], function(object) {
	isCorlorful = object.isCorlorful===undefined?true:object.isCorlorful;
	color = object.color?object.color:"#fff";
	setColor(color);
	setColorPicker(isCorlorful);
	setToggleButton();
});


$("#color-mode-switch-label").on('click', function () {
	isCorlorful = !isCorlorful;
	setColorPicker();
	saveColorfulMode();
	updateContent();
});

function updateContent() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, 
        	{action:"updateColor", isCorlorful:isCorlorful, color:color},
        	function(response){});
    });
}

function setColor (c) {
	color = c.toHexString===undefined?c:c.toHexString();
	$("#dm-color").spectrum({
		color: color,
	    change: setColor
	});
	updateContent();
	chrome.storage.sync.set({'color':color}, function() {
	  console.log('Corlor sync:'+c);
	});
}

function saveColorfulMode() {
	chrome.storage.sync.set({'isCorlorful':isCorlorful}, function() {
	  console.log('Corlor Mode Set:'+isCorlorful);
	});
}

function setToggleButton () {
	$("#color-mode-switch").prop( "checked", isCorlorful );
}

function setColorPicker (isEnable) {
	if (isCorlorful) {
		$("#dm-color").spectrum("disable");
	} else{
		$("#dm-color").spectrum("enable");
	};
}