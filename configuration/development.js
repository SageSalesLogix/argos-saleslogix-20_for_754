define('configuration/backcompat/development', ['configuration/development', 'Mobile/BackCompat/ApplicationModule'], function(baseConfiguration, BackCompatApplicationModule) {
    return mergeConfiguration(baseConfiguration, {
        modules: [
            new BackCompatApplicationModule()
        ],
        connections: {
            'crm': {
                isDefault: true,
                offline: true,
                url: 'http://localhost/sdata/slx/dynamic/-/',
                json: true
            }
        }
    });
});

