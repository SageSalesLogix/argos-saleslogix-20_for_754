define('configuration/backcompat/development', ['configuration/development', 'Mobile/BackCompat/ApplicationModule'], function(baseConfiguration, BackCompatApplicationModule) {
    return mergeConfiguration(baseConfiguration, {
        modules: [
            new BackCompatApplicationModule()
        ],
        connections: {
            'crm': {
                isDefault: true,
                offline: true,
                url: 'http://10.40.241.251/sdata/slx/dynamic/-/',
                json: true
            }
        }
    });
});

