define('Mobile/BackCompat/Views/Activity/Detail', [
    'dojo/_base/declare',
    'dojo/string',
    'dojo/query',
    'dojo/dom-class',
    'Mobile/SalesLogix/Template',
    'Mobile/SalesLogix/Format',
    'Sage/Platform/Mobile/Convert',
    'Sage/Platform/Mobile/Detail',
    'moment'
], function(
    declare,
    string,
    query,
    domClass,
    template,
    format,
    convert,
    Detail,
    moment
) {

    return declare('Mobile.BackCompat.Views.Activity.Detail', [Detail], {
        //Templates
        leaderTemplate: template.nameLF,

        //Localization
        activityTypeText: {
            'atToDo': 'To-Do',
            'atPhoneCall': 'Phone Call',
            'atAppointment': 'Meeting',
            'atLiterature': 'Literature Request',
            'atPersonal': 'Personal Activity'
        },
        actionsText: 'Quick Actions',
        completeActivityText: 'Complete Activity',
        alarmText: 'alarm',
        alarmTimeText: 'alarm',
        categoryText: 'category',
        durationText: 'duration',
        leaderText: 'leader',
        longNotesText: 'notes',
        priorityText: 'priority',
        regardingText: 'regarding',
        rolloverText: 'auto rollover',
        recurringText: 'recurring',
        startTimeText: 'start time',
        allDayText: 'all day',
        timelessText: 'timeless',
        titleText: 'Activity',
        typeText: 'type',
        companyText: 'company',
        leadText: 'lead',
        accountText: 'account',
        contactText: 'contact',
        opportunityText: 'opportunity',
        ticketNumberText: 'ticket',
        whenText: 'When',
        whoText: 'Who',
        startDateFormatText: 'M/D/YYYY h:mm:ss A',
        timelessDateFormatText: 'M/D/YYYY',
        alarmDateFormatText: 'M/D/YYYY h:mm:ss A',

        //View Properties
        id: 'activity_detail',
        completeView: 'activity_complete',
        editView: 'activity_edit',
        security: null, //'Entities/Activity/View',
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
            'UserId'
        ],
        resourceKind: 'activities',

        formatActivityType: function(val) {
            return this.activityTypeText[val] || val;
        },
        navigateToCompleteView: function(completionTitle) {
            var view = App.getView(this.completeView);

            if (view)
            {
                this.refreshRequired = true;

                view.show({
                    title: completionTitle,
                    template: {},
                    entry: this.entry
                }, {
                    returnTo: -1
                });

            }
        },
        completeActivity: function() {
            this.navigateToCompleteView(this.completeActivityText);
        },
        isActivityForLead: function(entry) {
            return entry && /^[\w]{12}$/.test(entry['LeadId']);
        },
        isActivityTimeless: function(entry) {
            return entry && convert.toBoolean(entry['Timeless']);
        },
        doesActivityHaveReminder: function(entry) {
            return convert.toBoolean(entry && entry['Alarm']);
        },
        requestLeader: function(userId) {
            var request = new Sage.SData.Client.SDataSingleResourceRequest(this.getService())
                .setResourceKind('users')
                .setResourceSelector(string.substitute("'${0}'", [userId]))
                .setQueryArg('select', [
                    'UserInfo/FirstName',
                    'UserInfo/LastName'
                ].join(','));

            request.allowCacheUse = true;
            request.read({
                success: this.processLeader,
                failure: this.requestLeaderFailure,
                scope: this
            });
        },
        requestLeaderFailure: function(xhr, o) {
        },
        processLeader: function(leader) {
            if (leader)
            {
                this.entry['Leader'] = leader;

                var rowNode = query('[data-property="Leader"]'),
                    contentNode = rowNode && query('[data-property="Leader"] > span', this.domNode);

                if (rowNode)
                    domClass.remove(rowNode[0], 'content-loading');

                if (contentNode)
                    contentNode[0].innerHTML = this.leaderTemplate.apply(leader['UserInfo']);
            }
        },
        checkCanComplete: function(entry) {
            return !entry || (entry['UserId'] !== App.context['user']['$key']) || entry['Recurring'];
        },
        processEntry: function(entry) {
            this.inherited(arguments);

            if (entry && entry['UserId']) this.requestLeader(entry['UserId']);
        },
        createLayout: function() {
            return this.layout || (this.layout = [{
                list: true,
                title: this.actionsText,
                cls: 'action-list',
                name: 'QuickActionsSection',
                children: [{
                    name: 'CompleteActivityAction',
                    property: 'Description',
                    label: this.completeActivityText,
                    icon: 'content/images/icons/Clear_Activity_24x24.png',
                    action: 'completeActivity',
                    disabled: this.checkCanComplete
                }]
            },{
                title: this.detailsText,
                name: 'DetailsSection',
                children: [{
                    name: 'Type',
                    property: 'Type',
                    label: this.typeText,
                    renderer: this.formatActivityType.bindDelegate(this)
                },{
                    name: 'Description',
                    property: 'Description',
                    label: this.regardingText
                },{
                    name: 'Category',
                    property: 'Category',
                    label: this.categoryText
                },{
                    name: 'Priority',
                    property: 'Priority',
                    label: this.priorityText
                },{
                    name: 'Recurring',
                    property: 'Recurring',
                    label: this.recurringText,
                    renderer: format.yesNo
                },{
                    name: 'LongNotes',
                    property: 'LongNotes',
                    label: this.longNotesText
                }]
            },{
                title: this.whenText,
                name: 'WhenSection',
                children: [{
                    name: 'StartDate',
                    property: 'StartDate',
                    label: this.startTimeText,
                    renderer: format.date.bindDelegate(this, this.startDateFormatText, false),
                    exclude: this.isActivityTimeless
                },{
                    name: 'StartDateTimeless',
                    property: 'StartDate',
                    label: this.allDayText,
                    renderer: format.date.bindDelegate(this, this.timelessDateFormatText, true),
                    include: this.isActivityTimeless
                },{
                    name: 'Timeless',
                    property: 'Timeless',
                    label: this.timelessText,
                    type: 'boolean',
                    include: false
                },{
                    name: 'Duration',
                    property: 'Duration',
                    label: this.durationText,
                    renderer: format.timespan,
                    exclude: this.isActivityTimeless
                },{
                    name: 'Alarm',
                    property: 'Alarm',
                    label: this.alarmText,
                    exclude: this.doesActivityHaveReminder
                },{
                    name: 'AlarmTime',
                    property: 'AlarmTime',
                    label: this.alarmTimeText,
                    renderer: format.date.bindDelegate(this, this.alarmDateFormatText, null, true),
                    include: this.doesActivityHaveReminder
                },{
                    name: 'Rollover',
                    property: 'Rollover',
                    label: this.rolloverText,
                    include: this.isActivityTimeless,
                    renderer: format.yesNo
                }]
            },{
                title: this.whoText,
                name: 'WhoSection',
                children: [{
                    name: 'Leader',
                    property: 'Leader',
                    label: this.leaderText,
                    cls: 'content-loading',
                    value: 'loading...'
                },{
                    name: 'ContactName',
                    property: 'ContactName',
                    exclude: this.isActivityForLead,
                    label: this.contactText,
                    view: 'contact_detail',
                    key: 'ContactId',
                    descriptor: 'ContactName'
                },{
                    name: 'AccountName',
                    property: 'AccountName',
                    exclude: this.isActivityForLead,
                    label: this.accountText,
                    view: 'account_detail',
                    key: 'AccountId',
                    descriptor: 'AccountName'
                },{
                    name: 'OpportunityName',
                    property: 'OpportunityName',
                    exclude: this.isActivityForLead,
                    label: this.opportunityText,
                    view: 'opportunity_detail',
                    key: 'OpportunityId',
                    descriptor: 'OpportunityName'
                },{
                    name: 'TicketNumber',
                    property: 'TicketNumber',
                    exclude: this.isActivityForLead,
                    label: this.ticketNumberText,
                    view: 'ticket_detail',
                    key: 'TicketId',
                    descriptor: 'TicketNumber'
                },{
                    name: 'LeadName',
                    property: 'LeadName',
                    include: this.isActivityForLead,
                    label: this.leadText,
                    view: 'lead_detail',
                    key: 'LeadId',
                    descriptor: 'LeadName'
                },{
                    name: 'AccountName',
                    property: 'AccountName',
                    include: this.isActivityForLead,
                    label: this.companyText
                }]
            }]);
        }        
    });
});
