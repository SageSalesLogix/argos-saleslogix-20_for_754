define('Mobile/BackCompat/Views/Activity/Edit', [
    'dojo/_base/declare',
    'dojo/_base/array',
    'Mobile/SalesLogix/Views/Activity/Edit'
], function(
    declare,
    array,
    BaseEdit
) {

    return declare('Mobile.BackCompat.Views.Activity.Edit', [BaseEdit], {
        contractName: 'dynamic',
        querySelect: [
            'AccountId',
            'AccountName',
            'Alarm',
            'AlarmTime',
            'Category',
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
            'Regarding',
            'Rollover',
            'StartDate',
            'TicketId',
            'TicketNumber',
            'Timeless',
            'Type',
            'UserId'
        ],
        resetRecurrence: function() {},
        isActivityRecurring: function() {
            return false;
        },
        currentUserCanEdit: function(entry) {
            return !!entry && (entry['UserId'] === App.context['user']['$key']);
        },
        currentUserCanSetAlarm: function(entry) {
            return !!entry && (entry['UserId'] === App.context['user']['$key']);
        },
        createLayout: function() {
            var layout = this.inherited(arguments),
                removeItems = [
                    'Location',
                    'Recurrence',
                    'RecurPeriod',
                    'RecurPeriodSpec',
                    'RecurrenceState',
                    'Recurring',
                    'RecurIterations'
                ];

            layout = array.filter(layout, function(item) {
                if (!item) {
                    return false;
                }

                return removeItems.indexOf(item.name) === -1;
            });

            array.forEach(layout, function(item) {
                if (item.name === 'RecurrenceUI') {
                    item.type = 'hidden';
                }
            });

            return layout;
        }
    });
});

