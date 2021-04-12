const tokenPageSuffix = "/auth/token";
const authTokenInputId = "pack-jwt-token";
const authStorageKey = "pack-auth-token";

function clearAuthentication() {
    chrome.storage.sync.remove(authStorageKey, function() {
        $(document).ajaxSend(function(e, xhr, options) {
          xhr.setRequestHeader("Authorization", "");
        });
        console.log('Auth token cleared');
      });
}