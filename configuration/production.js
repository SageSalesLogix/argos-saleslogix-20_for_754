define('configuration/backcompat/production', ['configuration/production', 'Mobile/BackCompat/ApplicationModule'], function(baseConfiguration, BackCompatApplicationModule) {
    return mergeConfiguration(baseConfiguration, {
        modules: [
            new BackCompatApplicationModule()
        ]
    });
});