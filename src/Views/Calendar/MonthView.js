define('Mobile/BackCompat/Views/Calendar/MonthView', [
    'dojo/_base/declare',
    'dojo/string',
    'dojo/dom-class',
    'Mobile/SalesLogix/Views/Calendar/MonthView',
    'Sage/Platform/Mobile/Convert',
    'moment'
], function(
    declare,
    string,
    domClass,
    BaseMonthView,
    convert,
    moment
) {

    return declare('Mobile.BackCompat.Views.Calendar.MonthView', [BaseMonthView], {
        activityRowTemplate: new Simplate([
            '<li data-action="activateEntry" data-key="{%= $.Activity.$key %}" data-descriptor="{%: $.$descriptor %}" data-activity-type="{%: $.Activity.Type %}">',
            '<table class="calendar-entry-table"><tr>',
            '<td class="entry-table-icon">',
            '<button data-action="selectEntry" class="list-item-selector button"><img src="{%= $$.activityIconByType[$.Activity.Type] || $$.selectIcon %}" class="icon" /></button>',
            '</td>',
            '<td class="entry-table-time">{%! $$.activityTimeTemplate %}</td>',
            '<td class="entry-table-description">{%! $$.activityItemTemplate %}</td>',
            '</tr></table>',
            '</li>'
        ]),
        activityTimeTemplate: new Simplate([
            '{% if ($.Activity.Timeless) { %}',
            '<span class="p-time">{%= $$.allDayText %}</span>',
            '{% } else { %}',
            '<span class="p-time">{%: Mobile.SalesLogix.Format.date($.Activity.StartDate, $$.startTimeFormatText) %}</span>',
            '{% } %}'
        ]),
        activityItemTemplate: new Simplate([
            '<h3 class="p-description">{%: $.Activity.Description %}</h3>',
            '<h4>{%= $$.activityNameTemplate.apply($) %}</h4>'
        ]),
        activityNameTemplate: new Simplate([
            '{% if ($.Activity.ContactName) { %}',
            '{%: $.Activity.ContactName %} / {%: $.Activity.AccountName %}',
            '{% } else if ($.Activity.AccountName) { %}',
            '{%: $.Activity.AccountName %}',
            '{% } else { %}',
            '{%: $.Activity.LeadName %}',
            '{% } %}'
        ]),
        queryOrderBy: 'Activity.StartDate desc',
        querySelect: [
            'Activity/StartDate',
            'Activity/Timeless',
            'Activity/Type'
        ],
        activityQuerySelect: [
            'Activity/StartDate',
            'Activity/Description',
            'Activity/Type',
            'Activity/AccountName',
            'Activity/ContactName',
            'Activity/LeadId',
            'Activity/LeadName',
            'UserId',
            'Activity/Timeless',
            'Activity/Recurring'
        ],
        resourceKind: 'useractivities',
        contractName: 'dynamic',
        getActivityQuery: function() {
            var startDate = this.getFirstDayOfCurrentMonth(),
                endDate = this.getLastDayOfCurrentMonth();
            return string.substitute(
                    [
                        'UserId eq "${0}" and Activity.Type ne "atLiterature" and (',
                        '(Activity.Timeless eq false and Activity.StartDate',
                        ' between @${1}@ and @${2}@) or ',
                        '(Activity.Timeless eq true and Activity.StartDate',
                        ' between @${3}@ and @${4}@))'
                    ].join(''),
                    [App.context['user'] && App.context['user']['$key'],
                    convert.toIsoStringFromDate(startDate.toDate()),
                    convert.toIsoStringFromDate(endDate.toDate()),
                    startDate.format('YYYY-MM-DDT00:00:00[Z]'),// TODO: Check
                    endDate.format('YYYY-MM-DDT23:59:59[Z]')] // TODO: Check
                );
        },
        processFeed: function(feed) {
            if (!feed) {
                return;
            }

            var r, row, i, dateIndex, startDay, isEvent;

            r = feed['$resources'];
            this.feed = feed;

            for (i = 0; i < r.length; i++) {
                row = r[i];

                // Preserve the isEvent flag if we have an existing entry for it already,
                // the order of processFeed and processEventFeed is not predictable
                row.isEvent = isEvent = this.entries[row.Activity.$key] && this.entries[row.Activity.$key].isEvent;

                this.entries[row.Activity.$key] = row;

                startDay = moment(convert.toDateFromString(row.Activity.StartDate));
                if (r[i].Activity.Timeless)
                    startDay.add({minutes: startDay.zone()});

                dateIndex = startDay.format('YYYY-MM-DD');
                this.dateCounts[dateIndex] = (this.dateCounts[dateIndex])
                    ? this.dateCounts[dateIndex] + 1
                    : 1;
            }

            this.highlightActivities();
        },
        requestSelectedDateActivities: function() {
            this.cancelRequests(this.selectedDateRequests);
            this.selectedDateRequests = [];

            var request = this.createSelectedDateRequest({
                pageSize: this.activityPageSize,
                resourceKind: 'useractivities',
                contractName: 'dynamic',
                querySelect: this.activityQuerySelect,
                queryWhere: this.getSelectedDateActivityQuery()
            });
            var xhr = request.read({
                    success: this.onRequestSelectedDateActivityDataSuccess,
                    failure: this.onRequestDataFailure,
                    aborted: this.onRequestDataAborted,
                    scope: this
                });
            this.selectedDateRequests.push(xhr);
        },
        requestSelectedDateEvents: function() {
            this.cancelRequests(this.selectedDateEventRequests);
            this.selectedDateEventRequests = [];

            var request = this.createSelectedDateRequest({
                pageSize: this.eventPageSize,
                resourceKind: 'events',
                querySelect: this.eventQuerySelect,
                queryWhere: this.getSelectedDateEventQuery(),
                queryOrderBy: 'StartDate desc'
            });
            var xhr = request.read({
                    success: this.onRequestSelectedDateEventDataSuccess,
                    failure: this.onRequestDataFailure,
                    aborted: this.onRequestDataAborted,
                    scope: this
                });
            this.selectedDateEventRequests.push(xhr);
        },
        getSelectedDateActivityQuery: function() {
            var activityQuery = [
                'UserId eq "${0}" and Activity.Type ne "atLiterature" and (',
                '(Activity.Timeless eq false and Activity.StartDate between @${1}@ and @${2}@) or ',
                '(Activity.Timeless eq true and Activity.StartDate between @${3}@ and @${4}@))'
            ].join('');
            return string.substitute(
                activityQuery,
                [App.context['user'] && App.context['user']['$key'],
                convert.toIsoStringFromDate(this.currentDate.toDate()),
                convert.toIsoStringFromDate(this.currentDate.clone().add({days: 1, seconds: -1}).toDate()),
                this.currentDate.format('YYYY-MM-DDT00:00:00[Z]'),
                this.currentDate.format('YYYY-MM-DDT23:59:59[Z]')
                ]
            );
        },
        onRequestSelectedDateActivityDataSuccess: function(feed) {
            if (!feed) {
                return;
            }

            domClass.remove(this.activityContainerNode, 'list-loading');

            var r = feed['$resources'],
                feedLength = r.length,
                o = [];

            for (var i = 0; i < feedLength; i++) {
                var row = r[i];
                row.isEvent = false;
                this.entries[row.Activity.$key] = row;
                o.push(this.activityRowTemplate.apply(row, this));
            }

            if (feedLength === 0) {
                this.set('activityContent', this.noDataTemplate.apply(this));
                return false;
            }

            if (feed['$totalResults'] > feedLength) {
                domClass.add(this.activityContainerNode, 'list-has-more');
                this.set('activityRemainingContent', this.countMoreText);
            } else {
                domClass.remove(this.activityContainerNode, 'list-has-more');
                this.set('activityRemainingContent', '');
            }

            this.set('activityContent', o.join(''));
        },
        navigateToDetailView: function(key, descriptor) {
            var entry = this.entries[key],
                detailView = (entry.isEvent) ? this.eventDetailView : this.activityDetailView,
                view = App.getView(detailView);
            descriptor = (entry.isEvent) ? descriptor : entry.Activity.Description;
            if (view) {
                view.show({
                    descriptor: descriptor,
                    key: key
                });
            }
        }
    });
});
