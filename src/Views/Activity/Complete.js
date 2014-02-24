define('Mobile/BackCompat/Views/Activity/Complete', [
    'dojo/_base/declare',
    'dojo/_base/connect',
    'Mobile/SalesLogix/Views/Activity/Complete'
], function(
    declare,
    connect,
    BaseComplete
) {

    return declare('Mobile.BackCompat.Views.Activity.Complete', [BaseComplete], {
    querySelect: [
            'AccountId',
            'AccountName',
            'Alarm',
            'AlarmTime',
            'Category',
            'ContactId',
            'ContactName',
            'CompletedDate',
            'Description',
            'Duration',
            'LeadId',
            'LeadName',
            'LongNotes',
            'OpportunityId',
            'OpportunityName',
            'Priority',
            'Regarding',
            'Result',
            'Rollover',
            'StartDate',
            'TicketId',
            'TicketNumber',
            'Timeless',
            'Type',
            'UserId'
        ],
        contractName: 'dynamic',
        completeActivity: function(entry, callback) {
            var completeActivityEntry = {
                "$name": "ActivityComplete",
                "request": {
                    "entity": { '$key': entry['$key'] },
                    "ActivityId": entry['$key'],
                    "userId": entry['UserId'],
                    "result": this.fields['Result'].getValue(),
                    "resultCode": this.fields['ResultCode'].getValue(),
                    "completeDate":  this.fields['CompletedDate'].getValue()
                }
            };

            var success = (function(scope, callback, entry) {
                return function() {
                    connect.publish('/app/refresh',[{
                        resourceKind: 'history'
                    }]);

                    callback.apply(scope, [entry]);
                };
            })(this, callback, entry);

            var request = new Sage.SData.Client.SDataServiceOperationRequest(this.getService())
                .setResourceKind('activities')
                .setOperationName('Complete');

            request.execute(completeActivityEntry, {
                success: success,
                failure: this.onRequestFailure,
                scope: this
            });
        }
    });
});
