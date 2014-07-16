define('Mobile/BackCompat/Views/Calendar/WeekView', [
    'dojo/_base/declare',
    'dojo/query',
    'dojo/string',
    'dojo/dom-class',
    'Sage/Platform/Mobile/Convert',
    'moment',
    'Mobile/SalesLogix/Views/Calendar/WeekView'
], function(
    declare,
    query,
    string,
    domClass,
    convert,
    moment,
    BaseWeekView
) {

    return declare('Mobile.BackCompat.Views.Calendar.WeekView', [BaseWeekView], {
        groupTemplate: new Simplate([
            '<h2 data-action="activateDayHeader" class="dayHeader {%= $.Activity.headerClass %}" data-date="{%: moment($.Activity.StartDate).format(\'YYYY-MM-DD\') %}">',
            '<span class="dayHeaderLeft">{%: moment($.Activity.StartDate).format($$.dayHeaderLeftFormatText) %}</span>',
            '<span class="dayHeaderRight">{%: moment($.Activity.StartDate).format($$.dayHeaderRightFormatText) %}</span>',
            '<div style="clear:both"></div>',
            '</h2>',
            '<ul class="list-content">'
        ]),
        rowTemplate: new Simplate([
            '<li data-action="activateEntry" data-key="{%= $.Activity.$key %}" data-descriptor="{%: $.$descriptor %}" data-activity-type="{%: $.Activity.Type %}">',
            '<table class="calendar-entry-table"><tr>',
            '<td class="entry-table-icon">',
            '<button data-action="selectEntry" class="list-item-selector button"><img src="{%= $$.activityIconByType[$.Activity.Type] || $$.selectIcon %}" class="icon" /></button>',
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
        itemTemplate: new Simplate([
            '<h3 class="p-description">{%: $.Activity.Description %}</h3>',
            '<h4>{%= $$.nameTemplate.apply($) %}</h4>'
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
        queryOrderBy: 'Activity.StartDate desc',
        querySelect: [
            'Activity/Description',
            'Activity/StartDate',
            'Activity/Type',
            'Activity/AccountName',
            'Activity/ContactName',
            'Activity/LeadId',
            'Activity/LeadName',
            'UserId',
            'Activity/Timeless'
        ],
        resourceKind: 'useractivities',
        contractName: 'dynamic',
        setWeekQuery: function() {
            var setDate = this.currentDate || this.todayDate;
            this.weekStartDate = this.getStartDay(setDate);
            this.weekEndDate = this.getEndDay(setDate);
            this.queryWhere = string.substitute(
                [
                    'UserId eq "${0}" and Activity.Type ne "atLiterature" and (',
                    '(Activity.Timeless eq false and Activity.StartDate between @${1}@ and @${2}@) or ',
                    '(Activity.Timeless eq true and Activity.StartDate between @${3}@ and @${4}@))'
                ].join(''), [
                    App.context['user'] && App.context['user']['$key'],
                    convert.toIsoStringFromDate(this.weekStartDate.toDate()),
                    convert.toIsoStringFromDate(this.weekEndDate.toDate()),
                    this.weekStartDate.format('YYYY-MM-DDT00:00:00[Z]'),
                    this.weekEndDate.format('YYYY-MM-DDT23:59:59[Z]')]
            );
        },
        processFeed: function(feed) {
            this.feed = feed;

            var todayNode = this.addTodayDom(),
                entryGroups = this.entryGroups,
                entryOrder = [],
                dateCompareString = 'YYYY-MM-DD',
                o = [],
                i,
                currentEntry,
                entryOrderLength,
                remaining,
                startDate;

            // If we fetched a page that has no data due to un-reliable counts,
            // check if we fetched anything in the previous pages before assuming there is no data.
            if (feedLength === 0 && Object.keys(this.entries).length === 0) {
                query(this.contentNode).append(this.noDataTemplate.apply(this));
            } else if (feed['$resources']) {

                if (todayNode && !entryGroups[this.todayDate.format(dateCompareString)]) {
                    entryGroups[this.todayDate.format(dateCompareString)] = [todayNode];
                }

                for (i = 0; i < feed['$resources'].length; i++) {
                    currentEntry = feed['$resources'][i];
                    startDate = convert.toDateFromString(currentEntry.Activity.StartDate);
                    if (currentEntry.Timeless) {
                        startDate = this.dateToUTC(startDate);
                    }
                    currentEntry['Activity']['StartDate'] = startDate;
                    currentEntry['isEvent'] = false;
                    this.entries[currentEntry.Activity.$key] = currentEntry;

                    var currentDateCompareKey = moment(currentEntry.Activity.StartDate).format(dateCompareString);
                    var currentGroup = entryGroups[currentDateCompareKey];
                    if (currentGroup) {
                        if (currentEntry.Activity.Timeless) {
                            currentGroup.splice(1, 0, this.rowTemplate.apply(currentEntry, this));
                        } else {
                            currentGroup.push(this.rowTemplate.apply(currentEntry, this));
                        }
                        continue;
                    }
                    currentGroup = [this.groupTemplate.apply(currentEntry, this)];
                    currentGroup.push(this.rowTemplate.apply(currentEntry, this));
                    entryGroups[currentDateCompareKey] = currentGroup;
                }

                for (var entryGroup in entryGroups) {
                    entryOrder.push(moment(entryGroup, dateCompareString));
                }

                entryOrder.sort(function(a, b) {
                    if (a.valueOf() < b.valueOf()) {
                        return 1;
                    } else if (a.valueOf() > b.valueOf()) {
                        return -1;
                    }

                    return 0;
                });

                entryOrderLength = entryOrder.length;
                for (i = 0; i < entryOrderLength; i++) {
                    o.push(entryGroups[entryOrder[i].format(dateCompareString)].join('') + this.groupEndTemplate.apply(this));
                }

                if (o.length > 0) {
                    this.set('listContent', o.join(''));
                }
            }

            this.set('remainingContent', '');// Feed does not return reliable data, don't show remaining

            domClass.toggle(this.domNode, 'list-has-more', this.hasMoreData());
            this._loadPreviousSelections();
        },
        addTodayDom: function() {
            if (!this.isInCurrentWeek(this.todayDate)) {
                return null;
            }

            var todayEntry = {
                Activity: {
                    StartDate: this.todayDate.toDate(),
                    headerClass: 'currentDate'
                }
            };

            return this.groupTemplate.apply(todayEntry, this);
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
