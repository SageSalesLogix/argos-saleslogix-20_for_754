define('Mobile/BackCompat/Views/Calendar/DayView', [
    'dojo/_base/declare',
    'dojo/string',
    'dojo/dom-class',
    'dojo/dom-construct',
    'Sage/Platform/Mobile/Convert',
    'Mobile/SalesLogix/Views/Calendar/DayView'
], function(
    declare,
    string,
    domClass,
    domConstruct,
    convert,
    BaseDayView
) {

    return declare('Mobile.BackCompat.Views.Calendar.DayView', [BaseDayView], {
        rowTemplate: new Simplate([
            '<li data-action="activateEntry" data-key="{%= $.Activity.$key %}" data-descriptor="{%: $.Activity.Description %}" data-activity-type="{%: $.Activity.Type %}">',
            '<table class="calendar-entry-table"><tr>',
            '<td class="entry-table-icon">',
            '<button data-action="selectEntry" class="list-item-selector button">',
            '<img src="{%= $$.activityIconByType[$.Activity.Type] || $$.icon || $$.selectIcon %}" class="icon" />',
            '</button>',
            '</td>',
            '<td class="entry-table-time">{%! $$.timeTemplate %}</td>',
            '<td class="entry-table-description">{%! $$.itemTemplate %}</td>',
            '</tr></table>',
            '</li>'
        ]),
        timeTemplate: new Simplate([
            '{% if ($.Activity.Timeless) { %}',
            '<span class="p-time">{%= $$.allDayText %}</span>',
            '{% } else { %}',
            '<span class="p-time">{%: Mobile.SalesLogix.Format.date($.Activity.StartDate, $$.startTimeFormatText) %}</span>',
            '{% } %}'
        ]),
        nameTemplate: new Simplate([
            '{% if ($.Activity.ContactName) { %}',
            '{%: $.Activity.ContactName %} / {%: $.Activity.AccountName %}',
            '{% } else if ($.Activity.AccountName) { %}',
            '{%: $.Activity.AccountName %}',
            '{% } else { %}',
            '{%: $.Activity.LeadName %}',
            '{% } %}'
        ]),
        contractName: 'dynamic',
        resourceKind: 'useractivities',
        queryOrderBy: 'Activity.Timeless desc, Activity.StartDate',
        querySelect: [
            'Activity/Description',
            'Activity/StartDate',
            'Activity/Type',
            'Activity/AccountName',
            'Activity/ContactName',
            'Activity/LeadId',
            'Activity/LeadName',
            'UserId',
            'Activity/Timeless',
            'Activity/Recurring'
        ],
        processFeed: function(feed) {
            var r = feed['$resources'],
                feedLength = r.length,
                o = [], remaining;

            this.feed = feed;
            for (var i = 0; i < feedLength; i++) {
                var row = r[i];
                row.isEvent = false;
                this.entries[row.Activity.$key] = row;
                o.push(this.rowTemplate.apply(row, this));
            }

            if (feedLength === 0) {
                this.set('listContent', this.noDataTemplate.apply(this));
                return false;
            }

            if (o.length > 0) {
                domConstruct.place(o.join(''), this.contentNode, 'last');
            }

            if (typeof this.feed['$totalResults'] !== 'undefined') {
                remaining = this.feed['$totalResults'] - (this.feed['$startIndex'] + this.feed['$itemsPerPage'] - 1);
                this.set('remainingContent', string.substitute(this.remainingText, [remaining]));
            }

            domClass.toggle(this.domNode, 'list-has-more', this.hasMoreData());

            if (this.options.allowEmptySelection) {
                domClass.add(this.domNode, 'list-has-empty-opt');
            }

            this._loadPreviousSelections();
        },
        formatQueryForActivities: function() {
            var queryWhere = [
                'UserId eq "${0}" and Activity.Type ne "atLiterature" and (',
                '(Activity.Timeless eq false and Activity.StartDate between @${1}@ and @${2}@) or ',
                '(Activity.Timeless eq true and Activity.StartDate between @${3}@ and @${4}@))'
            ].join('');

            var startDate = this.currentDate.clone().startOf('day').toDate(),
                endDate = this.currentDate.clone().endOf('day').toDate();

            return string.substitute(
                queryWhere,
                [App.context['user'] && App.context['user']['$key'],
                convert.toIsoStringFromDate(startDate),
                convert.toIsoStringFromDate(endDate),
                this.currentDate.format('YYYY-MM-DDT00:00:00[Z]'),
                this.currentDate.format('YYYY-MM-DDT23:59:59[Z]')]
            );
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
