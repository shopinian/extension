function checkAuthTokenPage() {
	if (location.href.endsWith(tokenPageSuffix)) {
		useAuthTokenPage();
	}
}
function useAuthTokenPage() {
    let token = $("#" + authTokenInputId).val();
    if (token) {
        console.log("User's auth token is: " + token);
        let data = {};
        data[authStorageKey] = token;
        chrome.storage.sync.set(data, function() {
            console.log('Auth token saved');
          });
    }
}

chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);
		checkAuthTokenPage();
	}
	}, 1);
});