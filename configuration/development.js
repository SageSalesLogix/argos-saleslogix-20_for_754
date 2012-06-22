define('configuration/backcompat/development', ['configuration/development', 'Mobile/BackCompat/ApplicationModule'], function(baseConfiguration, BackCompatApplicationModule) {
    return mergeConfiguration(baseConfiguration, {
        modules: [
            new BackCompatApplicationModule()
        ]
    });
});