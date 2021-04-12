function handleLoginRequiredActions() {
    chrome.storage.sync.get(authStorageKey, function(authToken) {
        let token = authToken[authStorageKey];
        if(token) {
            showMainPopup(token);
        } else {
            showLoginPart();
        }
    });
  }
  function showLoginPart() {
      $("#login-button").attr("href", baseURL + "/auth/token");
    $("#login").show();
    $('#mainPopup').hide();
  }

  function showSuccessPart(listId) {
    $("#success-list-link").attr("href", baseURL + "/l/" + listId + "/");
    $('#mainPopup').hide();
    $('#success').show();
  }
  
  function showMainPopup(authToken) {
    console.dir(authToken);
    $("#login").hide();
    $('#mainPopup').show();
    setTokenHeader(authToken);
    fetchUserLists();
    connectButtonClicks();
  }

  function connectButtonClicks() {
      $("#reload-button").click(fetchUserLists);
      $("#add-to-new-pack-button").click(function() {
        addCurrentUrlToList();
      });
  }
function setTokenHeader(token) {
    $(document).ajaxSend(function(e, xhr, options) {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
    });
}
function fetchUserLists() {
    const endpoint = baseURL + "/api/ext/l/";
    $.ajax({
        type: "GET",
        url: endpoint,
        success: function (lists, textStatus, xhr) {
            if (Array.isArray(lists)) {
                drawExistingLists(lists);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.status === 401) {
                showLoginPart();
                return;
            }
            console.log(errorThrown);
        }
    });
}

function drawExistingLists(listsData) {
    let packsWrp = $("#existing-packs");
    packsWrp.empty();
    for (let list of listsData) {
        let listLi = $("<li/>", {
            "text": list["name"],
            "class": "list-li"
        });
        if (list["draft"]) {
            let draftTitle = $("<span/>", {
                "text": " (Draft)"
            });
            draftTitle.appendTo(listLi);
        }
        if (!list["full"]) {
            let addButton = $("<button/>", {
                "class": "uk-button",
                "text": "Add",
            });
            addButton.css({"float": "right"});
            addButton.click(function() {
                addCurrentUrlToList(list["id"]);
            })
            addButton.appendTo(listLi);
        } else {
            let fullButton = $("<button/>", {
                "class": "uk-button",
                "text": "Full",
            });
            fullButton.css({"float": "right"});
            fullButton.attr("disabled", true);
            fullButton.appendTo(listLi);
        }

        listLi.appendTo(packsWrp);
    }
}

function addCurrentUrlToList(optListId) {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
        let url = tabs[0].url;
        console.log("Will use " + url + " as the page url for additions");
        addUrlToList(url, optListId);
    });
}
function addUrlToList(url, optListId) {
    let encodedUrl = encodeURIComponent(url);
    let endpoint = baseURL + "/api/ext/accept?url=" + encodedUrl;
    if (optListId) {
        endpoint = endpoint + "&listId=" + optListId;
    }
    $.ajax({
        type: "GET",
        url: endpoint,
        success: function (message) {
            console.dir(message);
            if (message["success"]) {
                showSuccessPart(message["item"]);
            } else {
                alert(message["message"]);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
            alert("An error happened. Please try again");
        }
    });
}

window.addEventListener("load", function () {
    handleLoginRequiredActions();
});
