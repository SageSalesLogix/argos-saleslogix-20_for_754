define('Mobile/BackCompat/Views/Activity/Detail', [
    'dojo/_base/declare',
    'dojo/_base/array',
    'Mobile/SalesLogix/Views/Activity/Detail'
], function(
    declare,
    array,
    BaseDetail
) {

    return declare('Mobile.BackCompat.Views.Activity.Detail', [BaseDetail], {
        contractName: 'dynamic',
        querySelect: [
            'AccountId',
            'AccountName',
            'Alarm',
            'AlarmTime',
            'Category',
            'Company',
            'ContactId',
            'ContactName',
            'Description',
            'Duration',
            'LeadId',
            'LeadName',
            'LongNotes',
            'OpportunityId',
            'OpportunityName',
            'Priority',
            'Recurring',
            'Rollover',
            'StartDate',
            'TicketId',
            'TicketNumber',
            'Timeless',
            'Type',
            'UserId',
            'PhoneNumber'
        ],
        checkCanComplete: function(entry) {
            return !entry || (entry['UserId'] !== App.context['user']['$key']) || entry['Recurring'];
        },
        processEntry: function(entry) {
            // The base implementation looks for Leader.$key which is used in 8.0
            if (entry && entry['UserId']) {
                entry.Leader = {
                    '$key': entry.UserId
                };
            }

            this.inherited(arguments);
        },
        createLayout: function() {
            var layout = this.inherited(arguments),
                quickActions,
                details;

            quickActions = layout[0];
            details = layout[1];

            if (quickActions && quickActions.name === 'QuickActionsSection') {
                // Remove other quick actions except complete
                quickActions.children.splice(1, 2);
                quickActions.children = array.filter(quickActions.children, function(item) {
                    return item && item.name === 'CompleteActivityAction';
                });
            }

            if (details && details.name === 'DetailsSection') {
                details.children = array.filter(details.children, function(item) {
                    if (!item) {
                        return false;
                    }

                    return item.name !== 'Location' && item.name;
                });
            }

            return layout;
        }
    });
});

