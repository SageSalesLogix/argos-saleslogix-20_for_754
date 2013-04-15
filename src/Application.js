define('Mobile/BackCompat/Application', [
    'dojo/_base/declare',   
    'Mobile/SalesLogix/Application'
], function(
    declare,
    Application
) {

    return declare('Mobile.BackCompat.Application', [Application], {
        serverVersion: {
            'major': 7,
            'minor': 5,
            'revision': 4
        }
    });
});

