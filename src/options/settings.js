window.addEvent("domready", function () {
    new FancySettings.initWithManifest(function (settings) {
        settings.manifest.logoutButton.addEvent("action", function () {
            clearAuthentication();
        });
    });

});
