const sdMap = {'//meta[@property="og:type"]/@content': 'product'};
const iconUrl = chrome.runtime.getURL('icons/icon48.png');

chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);
		injectIfNeeded();
	}
	}, 1);
});
function injectIfNeeded() {
	chrome.storage.local.get(siteDataKey, function(sitesData) {
		const key = window.location.origin;
		console.log("Checking if we have data for: " + key);
		const siteData = sitesData.injectableSiteData[key];
		if (checkIfDetail(siteData)) {
			console.log("Looks like this is the detail page");
			injectToDetailPage(siteData);
		} else {
			if(checkIfList(siteData)) {
				console.log("Looks like this is a list page");
				injectToList(siteData);
			}
		}
	});
}

function getElementsByXPath(xpath, parent) {
	let results = [];
	if (!xpath || xpath.length == 0) {
		return results;
	}
    let query = document.evaluate(xpath, parent || document,
        null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (let i = 0, length = query.snapshotLength; i < length; ++i) {
        results.push(query.snapshotItem(i));
    }
    return results;
}
function getFirstElementByXPath(xpath, parent) {
	if (!xpath || xpath.length == 0) {
		return null;
	}
	let query = document.evaluate(xpath, parent || document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	if (query.snapshotLength > 0) {
		return query.snapshotItem(0);
	}
	return null;
}

function checkIfDetail(siteData) {
	if (siteData && siteData.itemDetailURLPattern) {
		console.log("Checking if " + window.location.pathname + " matches " + siteData.itemDetailURLPattern);
		if(window.location.pathname.match(new RegExp(siteData.itemDetailURLPattern))) {
			return true;
		}
	}
	return checkIfItem();
}

function checkIfList(siteData) {
	if (!siteData || !siteData.listURLPattern) {
		return false;
	}
	return window.location.pathname.match(new RegExp(siteData.listURLPattern));
}

function checkIfItem() {
	for (let xpath in sdMap) {
		if (sdMap.hasOwnProperty(xpath)) {
			let target = sdMap[xpath];
			let valueEl = getFirstElementByXPath(xpath);
			if (valueEl && valueEl.value === target) {
				return true;
			}
		}
	}
	return false;
}

function injectToDetailPage(siteData) {
	console.log("injecting the Shopinian button to the detail page");
	let injectionXpath = false;
	if (siteData) {
		injectionXpath = siteData.itemDetailInjectionPlaceXpath;
	}
	if (injectionXpath) {
		console.log("We have an injection place xPath");
		let injectionPlace = getFirstElementByXPath(injectionXpath);
		if (injectionPlace) {
			console.log("Found the injection place, adding there");
			let wrp = $("<div/>");
			wrp.css({
				"padding": "5px",
				"text-align": "center"
			})
			$("<a/>", {
				"href": baseURL + "/ext/add?url=" + window.location.href,
				"target": "_blank",
				"text": "Add To List"
			}).appendTo(wrp);
			wrp.appendTo(injectionPlace);
			return;
		}
	}
	console.log("Couldn't find the place to add, adding a popup");
	let addPopup = $("<div/>");
	addPopup.css({
		"display": "inline-block",
		"position": "fixed",
		"top": "121px",
		"right": "0",
		"width": "80px",
		"height": "110px",
		"border-radius": "4px",
		"z-index": "99999",
		"background-color": "#ffe5ff",
		"padding": "10px 10px 10px 17px",
		"text-align": "center"
	});

	let addButton = $("<a/>", {
		"href": baseURL + "/ext/add?url=" + window.location.href,
		"target": "_blank",
	});
	let icon = $("<img/>", {
		"alt": "Shopinian icon",
		"src": iconUrl
	});
	icon.appendTo(addButton);
	let buttonText = $("<span/>", {
		"text": "Add to List"
	});
	buttonText.appendTo(addButton);

	addButton.appendTo(addPopup);
	addPopup.appendTo("body");
}

function injectToList(siteData) {
	let linkXpath = siteData.listItemLinkXpath;
	let injectionPlaceXpath = siteData.listItemInjectionPlaceXpath;
	console.log("Searching for xpath:" + linkXpath);
	let links = getElementsByXPath(linkXpath);
	for (let i=0; i < links.length; i++) {
		let url = links[i].href;
		console.log("Adding the add to pack button for: " + url);
		let addLink = $("<a/>", {
			"href": baseURL + "/ext/add?url=" + url,
			"text": "Add To Pack",
			"target": "_blank"
		})

		if (injectionPlaceXpath) {
			console.log("We have a place xPath for the link");
			let place = getFirstElementByXPath(injectionPlaceXpath, links[i]);
			if (place) {
				console.log("Found the place, inserting to it");
				addLink.appendTo(place);
				continue;
			}
		}
		console.log("We don't know where to insert, injecting after the link");
		addLink.insertAfter(links[i]);
	}
}