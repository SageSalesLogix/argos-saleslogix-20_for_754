define('Mobile/BackCompat/Views/Calendar/WeekView', [
    'dojo/_base/declare',
    'dojo/query',
    'dojo/string',
    'dojo/dom-class',
    'Sage/Platform/Mobile/ErrorManager',
    'Sage/Platform/Mobile/Convert',
    'Sage/Platform/Mobile/List',
    'Mobile/SalesLogix/Format',
    'moment'
], function(
    declare,
    query,
    string,
    domClass,
    ErrorManager,
    convert,
    List,
    format,
    moment
) {

    return declare('Mobile.BackCompat.Views.Calendar.WeekView', [List], {
        //Localization
        titleText: 'Calendar',
        weekTitleFormatText: 'MMM D, YYYY',
        dayHeaderLeftFormatText: 'dddd',
        dayHeaderRightFormatText: 'MMM D, YYYY',
        startTimeFormatText: 'h:mm A',
        todayText: 'Today',
        dayText: 'Day',
        weekText: 'Week',
        monthText: 'Month',
        allDayText: 'All Day',
        eventHeaderText: 'Events',
        eventMoreText: 'View ${0} More Event(s)',
        toggleCollapseText: 'toggle collapse',

        // Templates
        widgetTemplate: new Simplate([
            '<div id="{%= $.id %}" title="{%= $.titleText %}" class="{%= $.cls %}" {% if ($.resourceKind) { %}data-resource-kind="{%= $.resourceKind %}"{% } %}>',
            '<div data-dojo-attach-point="searchNode"></div>',
            '{%! $.navigationTemplate %}',
            '<div style="clear:both"></div>',
            '<div class="event-content event-hidden" data-dojo-attach-point="eventContainerNode">',
                '<h2 data-action="toggleGroup">{%= $.eventHeaderText %}<button class="collapsed-indicator" aria-label="{%: $$.toggleCollapseText %}"></button></h2>',
                '<ul class="list-content" data-dojo-attach-point="eventContentNode"></ul>',
                '{%! $.eventMoreTemplate %}',
            '</div>',
            '<div class="list-content" data-dojo-attach-point="contentNode">',
            '{%! $.moreTemplate %}',
            '</div>'
        ]),
        navigationTemplate: new Simplate([
            '<div class="split-buttons">',
            '<button data-tool="today" data-action="getThisWeekActivities" class="button">{%: $.todayText %}</button>',
            '<button data-tool="selectdate" data-action="selectDate" class="button"><span></span></button>',
            '<button data-tool="day" data-action="navigateToDayView" class="button">{%: $.dayText %}</button>',
            '<button data-tool="week" class="button">{%: $.weekText %}</button>',
            '<button data-tool="month" data-action="navigateToMonthView" class="button">{%: $.monthText %}</button>',
            '</div>',
            '<div class="nav-bar">',
            '<button data-tool="next" data-action="getNextWeekActivities" class="button button-next"><span></span></button>',
            '<button data-tool="prev" data-action="getPrevWeekActivities" class="button button-prev"><span></span></button>',
            '<h3 class="date-text" data-dojo-attach-point="dateNode"></h3>',
            '</div>'
        ]),
        groupTemplate: new Simplate([
            '<h2 data-action="activateDayHeader" class="dayHeader {%= $.Activity.headerClass %}" data-date="{%: moment($.Activity.StartDate).format(\'YYYY-MM-DD\') %}">',
                '<span class="dayHeaderLeft">{%: moment($.Activity.StartDate).format($$.dayHeaderLeftFormatText) %}</span>',
                '<span class="dayHeaderRight">{%: moment($.Activity.StartDate).format($$.dayHeaderRightFormatText) %}</span>',
                '<div style="clear:both"></div>',
            '</h2>',
            '<ul class="list-content">'
        ]),
        groupEndTemplate: new Simplate([
            '</ul>'
        ]),
        rowTemplate: new Simplate([
            '<li data-action="activateEntry" data-key="{%= $.Activity.$key %}" data-descriptor="{%: $.$descriptor %}" data-activity-type="{%: $.Activity.Type %}">',
            '<table class="calendar-entry-table"><tr>',
            '<td class="entry-table-icon"><div data-action="selectEntry" class="list-item-selector"></div></td>',
            '<td class="entry-table-time">{%! $$.timeTemplate %}</td>',
            '<td class="entry-table-description">{%! $$.itemTemplate %}</td>',
            '</tr></table>',
            '</li>'
        ]),
        eventRowTemplate: new Simplate([
            '<li data-action="activateEntry" data-key="{%= $.$key %}" data-descriptor="{%: $.$descriptor %}" data-activity-type="Event">',
            '<table class="calendar-entry-table"><tr>',
            '<td class="entry-table-icon"><div data-action="selectEntry" class="list-item-selector"></div></td>',
            '<td class="entry-table-description">{%! $$.eventItemTemplate %}</td>',
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
        eventItemTemplate: new Simplate([
            '<h3 class="p-description">{%: $.Description %} ({%: $.Type %})</h3>',
            '<h4>{%! $$.eventNameTemplate %}</h4>'
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
        eventNameTemplate: new Simplate([
            '{%: Mobile.SalesLogix.Format.date($.StartDate, $$.eventDateFormatText) %}',
            '&nbsp;-&nbsp;',
            '{%: Mobile.SalesLogix.Format.date($.EndDate, $$.eventDateFormatText) %}'
        ]),
        eventMoreTemplate: new Simplate([
            '<div class="list-more" data-dojo-attach-point="eventMoreNode">',
            '<button class="button" data-action="activateEventMore">',
            '<span data-dojo-attach-point="eventRemainingContentNode">{%= $$.eventMoreText %}</span>',
            '</button>',
            '</div>'
        ]),
        noDataTemplate: new Simplate([
            '<div class="no-data"><h3>{%= $.noDataText %}</h3></div>'
        ]),
        attributeMap:{
            listContent:{
                node: 'contentNode',
                type: 'innerHTML'
            },
            dateContent: {
                node: 'dateNode',
                type: 'innerHTML'
            },
            eventListContent: {
                node: 'eventContentNode',
                type: 'innerHTML'
            },
            eventRemainingContent: {
                node: 'eventRemainingContentNode',
                type: 'innerHTML'
            }
        },

        //View Properties
        id: 'calendar_weeklist',
        cls: 'list activities-for-week',
        activityDetailView: 'activity_detail',
        eventDetailView: 'event_detail',
        monthView: 'calendar_monthlist',
        datePickerView: 'generic_calendar',
        activityListView: 'calendar_daylist',
        insertView: 'activity_types_list',
        userWeekStartDay: 0, // 0-6, Sun-Sat
        userWeekEndDay: 6,
        currentDate: null,
        enableSearch: false,
        expose: false,
        entryGroups: {},
        weekStartDate: null,
        weekEndDate: null,
        todayDate: null,
        typeIcons: {
            'defaultIcon': 'content/images/icons/To_Do_24x24.png',
            'atAppointment': 'content/images/icons/Meeting_24x24.png',
            'atPhoneCall': 'content/images/icons/Call_24x24.png',
            'atToDo': 'content/images/icons/To_Do_24x24.png',
            'atPersonal': 'content/images/icons/Personal_24x24.png'
        },

        queryWhere: null,
        queryOrderBy: 'Activity.StartDate asc',
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
        eventQuerySelect: [
            'StartDate',
            'EndDate',
            'Description',
            'Type'
        ],

        pageSize: 105, // gives 15 activities per day
        eventPageSize: 5,
        resourceKind: 'useractivities',

        _onRefresh: function(o) {
            this.inherited(arguments);
            if (o.resourceKind === 'activities' || o.resourceKind === 'events')
            {
                this.refreshRequired = true;
            }
        },
        init: function() {
            this.inherited(arguments);
            this.todayDate = moment().startOf('day').toDate();
            this.currentDate = moment(this.todayDate).toDate();
        },
        toggleGroup: function(params) {
            var node = query(params.$source);
            if (node && node.parent()) {
                domClass.toggle(node, 'collapsed');
                domClass.toggle(node.parent(), 'collapsed-event');
            }
        },
        activateDayHeader: function(params) {
            this.currentDate = moment(params.date, 'YYYY-MM-DD').toDate();
            this.navigateToDayView();
        },
        getThisWeekActivities: function() {
            if (!this.isInCurrentWeek(this.todayDate))
            {
                this.currentDate = moment(this.todayDate).toDate();
                this.refresh();
            }
        },
        getStartDay: function(date) {
            return moment(date).startOf('week').toDate();
        },
        getEndDay: function(date) {
            return moment(date).endOf('week').toDate();
        },
        getNextWeekActivities: function() {
            this.currentDate = this.getStartDay(moment(this.weekEndDate).add({days:1}).toDate());
            this.refresh();
        },
        getPrevWeekActivities: function() {
            this.currentDate = this.getStartDay(moment(this.weekStartDate).subtract({days:1}).toDate());
            this.refresh();
        },
        getTypeIcon: function(type) {
            return this.typeIcons[type] || this.typeIcons['defaultIcon'];
        },
        setWeekQuery: function() {
            var setDate = this.currentDate || this.todayDate;
            this.weekStartDate = this.getStartDay(setDate);
            this.weekEndDate = this.getEndDay(setDate);
            this.queryWhere =  string.substitute(
                    [
                        'UserId eq "${0}" and Activity.Type ne "atLiterature" and (',
                        '(Activity.Timeless eq false and Activity.StartDate between @${1}@ and @${2}@) or ',
                        '(Activity.Timeless eq true and Activity.StartDate between @${3}@ and @${4}@))'
                    ].join(''),[
                    App.context['user'] && App.context['user']['$key'],
                    convert.toIsoStringFromDate(this.weekStartDate),
                    convert.toIsoStringFromDate(this.weekEndDate),
                    moment(this.weekStartDate).format('YYYY-MM-DDT00:00:00[Z]'),
                    moment(this.weekEndDate).format('YYYY-MM-DDT23:59:59[Z]')]
                );
        },
        setWeekTitle: function() {
            var start = this.getStartDay(this.currentDate),
                end = this.getEndDay(this.currentDate);

            this.set('dateContent', string.substitute('${0}-${1}',[
                moment(start).format(this.weekTitleFormatText),
                moment(end).format(this.weekTitleFormatText)
                ]));
        },
        isInCurrentWeek: function(date) {
            date = moment(date);
            return (date.valueOf() > this.weekStartDate.valueOf() && date.valueOf() < this.weekEndDate.valueOf());
        },
        processFeed: function(feed) {
            this.feed = feed;

            if (this.feed['$totalResults'] === 0)
            {
                query(this.contentNode).append(this.noDataTemplate.apply(this));
            }
            else if (feed['$resources'])
            {
                var todayNode = this.addTodayDom(),
                    startDate,
                    currentEntry,
                    entryGroups = this.entryGroups,
                    currentGroup,
                    entryOrder = [],
                    entryOrderLength,
                    dateCompareString = 'YYYY-MM-DD',
                    o = [];

                if (todayNode && !entryGroups[moment(this.todayDate).format(dateCompareString)])
                    entryGroups[moment(this.todayDate).format(dateCompareString)] = [todayNode];

                for (var i = 0; i < feed['$resources'].length; i++)
                {
                    currentEntry = feed['$resources'][i];
                    startDate = convert.toDateFromString(currentEntry.Activity.StartDate);
                    if (currentEntry.Activity.Timeless)
                    {
                        startDate = this.dateToUTC(startDate);
                    }
                    currentEntry.Activity.StartDate = startDate;
                    currentEntry.isEvent = false;
                    this.entries[currentEntry.Activity.$key] = currentEntry;

                    currentGroup = entryGroups[moment(currentEntry.Activity.StartDate).format(dateCompareString)];
                    if (currentGroup)
                    {
                        if (currentEntry.Activity.Timeless)
                        {
                            currentGroup.splice(1, 0, this.rowTemplate.apply(currentEntry, this));
                        }
                        else
                        {
                            currentGroup.push(this.rowTemplate.apply(currentEntry, this));
                        }
                        continue;
                    }
                    currentGroup = [];
                    currentGroup.push(this.groupTemplate.apply(currentEntry, this));
                    currentGroup.push(this.rowTemplate.apply(currentEntry, this));
                    entryGroups[moment(currentEntry.Activity.StartDate).format(dateCompareString)] = currentGroup;
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
                for (var i = 0; i < entryOrderLength; i++)
                {
                    o.push(entryGroups[entryOrder[i].format(dateCompareString)].join('') + this.groupEndTemplate.apply(this));
                }

                if (o.length > 0)
                    this.set('listContent', o.join(''));
            }

            if (this.remainingContentNode)
                this.set('remainingContent', string.substitute(this.remainingText,[
                    this.feed['$totalResults'] - (this.feed['$startIndex'] + this.feed['$itemsPerPage'] - 1)
                ]));

            domClass.toggle(this.domNode, 'list-has-more', this.hasMoreData());
        },
        addTodayDom: function() {
            if (!this.isInCurrentWeek(this.todayDate)) return null;

            var todayEntry = {
                    Activity: {
                        StartDate: this.todayDate,
                        headerClass: 'currentDate'
                    }
                };

            return this.groupTemplate.apply(todayEntry, this);
        },
        dateToUTC: function(date) {
            return new Date(date.getUTCFullYear(),
                date.getUTCMonth(),
                date.getUTCDate(),
                date.getUTCHours(),
                date.getUTCMinutes(),
                date.getUTCSeconds()
            );
        },
        requestEventData: function() {
            var request = this.createEventRequest();
            request.read({
                success: this.onRequestEventDataSuccess,
                failure: this.onRequestEventDataFailure,
                aborted: this.onRequestEventDataAborted,
                scope: this
            });
        },
        onRequestEventDataFailure: function(response, o) {
            alert(string.substitute(this.requestErrorText, [response, o]));
            ErrorManager.addError(response, o, this.options, 'failure');
        },
        onRequestEventDataAborted: function(response, o) {
            this.options = false; // force a refresh
            ErrorManager.addError(response, o, this.options, 'aborted');
        },
        onRequestEventDataSuccess: function(feed) {
            this.processEventFeed(feed);
        },
        createEventRequest: function() {
            var querySelect = this.eventQuerySelect,
                queryWhere = this.getEventQuery(),
                request = new Sage.SData.Client.SDataResourceCollectionRequest(this.getService())
                .setCount(this.eventPageSize)
                .setStartIndex(1)
                .setResourceKind('events')
                .setQueryArg(Sage.SData.Client.SDataUri.QueryArgNames.Select, this.expandExpression(querySelect).join(','))
                .setQueryArg(Sage.SData.Client.SDataUri.QueryArgNames.Where, queryWhere);
            return request;
        },
        getEventQuery: function() {
            var startDate = this.weekStartDate,
                endDate = this.weekEndDate;
            return string.substitute(
                    [
                        'UserId eq "${0}" and (',
                            '(StartDate gt @${1}@ or EndDate gt @${1}@) and ',
                            'StartDate lt @${2}@',
                        ')'
                    ].join(''),
                    [App.context['user'] && App.context['user']['$key'],
                    moment(startDate).format('YYYY-MM-DDT00:00:00[Z]'),
                    moment(endDate).format('YYYY-MM-DDT23:59:59[Z]')]
                );
        },
        hideEventList: function() {
            domClass.add(this.eventContainerNode, 'event-hidden');
        },
        showEventList: function() {
            domClass.remove(this.eventContainerNode, 'event-hidden');
        },
        processEventFeed: function(feed) {
            var o = [],
                feedLength = feed['$resources'].length;

            if (feedLength === 0)
            {
                this.hideEventList();
                return false;
            }
            else
            {
                this.showEventList();
            }

            for (var i = 0; i < feedLength; i++)
            {
                var event = feed['$resources'][i];
                event.isEvent = true;
                event.StartDate = convert.toDateFromString(event.StartDate);
                event.EndDate = convert.toDateFromString(event.EndDate);
                this.entries[event.$key] = event;
                o.push(this.eventRowTemplate.apply(event, this));
            }

            if (feed['$totalResults'] > feedLength)
            {
                domClass.add(this.eventContainerNode, 'list-has-more');
                this.set('eventRemainingContent', string.substitute(this.eventMoreText, [feed['$totalResults'] - feedLength]));
            }
            else
            {
                domClass.remove(this.eventContainerNode, 'list-has-more');
                this.set('eventRemainingContent', '');
            }

            this.set('eventListContent', o.join(''));
        },
        refresh: function() {
            var startDate = this.currentDate;
            this.currentDate = moment(startDate).toDate();
            this.weekStartDate = this.getStartDay(startDate);
            this.weekEndDate = this.getEndDay(startDate);
            this.setWeekTitle();
            this.setWeekQuery();

            this.clear();
            this.requestData();
            this.requestEventData();
        },
        show: function(options) {
            if (options)
                this.processShowOptions(options);
            
            this.setDefaultOptions();
            this.inherited(arguments);
        },
        processShowOptions: function(options) {
            if (options.currentDate) {
                this.currentDate = moment(options.currentDate).startOf('day').toDate() || moment().startOf('day').toDate();
                this.refreshRequired = true;
            }
        },
        setDefaultOptions: function() {
            if (typeof this.options === 'undefined')
                this.options = {};

            if (typeof this.options['startDay'] === 'undefined')
            {
                this.options['startDay'] = (App.context.userOptions)
                    ? parseInt(App.context.userOptions['Calendar:FirstDayofWeek'])
                    : this.userWeekStartDay;
            }
        },
        activateEventMore: function() {
            var view = App.getView("event_related"),
                where = this.getEventQuery();
            if (view)
                view.show({"where": where});
        },
        clear: function() {
            this.inherited(arguments);
            this.entryGroups = {};
            this.set('eventContent', '');
        },
        selectEntry: function(params) {
            var row = query(params.$source).closest('[data-key]')[0],
                key = row ? row.getAttribute('data-key') : false;

            this.navigateToDetailView(key);
        },
        selectDate: function() {
            var options = {
                date: this.currentDate,
                showTimePicker: false,
                timeless: false,
                tools: {
                    tbar: [{
                        id: 'complete',
                        fn: this.selectDateSuccess,
                        scope: this
                    },{
                        id: 'cancel',
                        side: 'left',
                        fn: ReUI.back,
                        scope: ReUI
                    }]
                    }
                },
                view = App.getView(this.datePickerView);
            if (view)
                view.show(options);
        },
        selectDateSuccess: function() {
            var view = App.getPrimaryActiveView();
            this.currentDate = view.getDateTime().clearTime();
            this.refresh();
            ReUI.back();
        },
        navigateToDayView: function() {
            var view = App.getView(this.activityListView),
                options = {currentDate: moment(this.currentDate).format('YYYY-MM-DD') || Date.today()};
            view.show(options);
        },
        navigateToMonthView: function() {
            var view = App.getView(this.monthView),
                options = {currentDate: moment(this.currentDate).format('YYYY-MM-DD') || Date.today()};
            view.show(options);
        },
        navigateToInsertView: function(el) {
            var view = App.getView(this.insertView || this.editView);
            if (view)
            {
                view.show({
                    negateHistory: true,
                    returnTo: this.id,
                    insert: true
                });
            }
        },
        navigateToDetailView: function(key, descriptor) {
            var entry = this.entries[key],
                detailView = (entry.isEvent) ? this.eventDetailView : this.activityDetailView,
                view = App.getView(detailView);

            descriptor = (entry.isEvent) ? descriptor : entry.Activity.Description;

            if (view)
                view.show({
                    descriptor: descriptor,
                    key: key
                });
        }
    });
});
