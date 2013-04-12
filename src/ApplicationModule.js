/* Copyright (c) 2012, Sage Software, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define('Mobile/BackCompat/ApplicationModule', [
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom-class',
    'dojo/string',
    'dojo/query',
    'dojo/_base/array',
    'dijit/registry',
    'dojo/aspect',
    'Sage/Platform/Mobile/Convert',
    'Mobile/SalesLogix/Application',
    'Sage/Platform/Mobile/ApplicationModule',
    'Mobile/BackCompat/Views/Activity/Complete',
    'Mobile/BackCompat/Views/Activity/Detail',
    'Mobile/BackCompat/Views/Activity/Edit',
    'Mobile/BackCompat/Views/Calendar/DayView',
    'Mobile/BackCompat/Views/Calendar/WeekView',
    'Mobile/BackCompat/Views/Calendar/MonthView',
    'Mobile/SalesLogix/Views/Activity/List',
    'Mobile/SalesLogix/Views/Home'
], function(
    declare,
    lang,
    domClass,
    string,
    query,
    array,
    registry,
    aspect,
    convert,
    Application,
    ApplicationModule,
    ActivityComplete,
    ActivityDetail,
    ActivityEdit,
    DayView,
    WeekView,
    MonthView,
    ActivityList,
    HomeView
) {

    return declare('Mobile.BackCompat.ApplicationModule', [ApplicationModule], {
        loadViews: function() {
            this.inherited(arguments);

            registry._hash['activity_complete'].destroyRecursive();
            registry._hash['activity_detail'].destroyRecursive();
            registry._hash['activity_edit'].destroyRecursive();
            registry._hash['calendar_daylist'].destroyRecursive();
            registry._hash['calendar_weeklist'].destroyRecursive();
            registry._hash['calendar_monthlist'].destroyRecursive();

            this.registerView(new ActivityComplete());
            this.registerView(new ActivityDetail());
            this.registerView(new ActivityEdit());
            this.registerView(new DayView());
            this.registerView(new WeekView());
            this.registerView(new MonthView());

            ActivityList.prototype.contractName = 'dynamic';
        },

        loadCustomizations: function() {
            this.inherited(arguments);
            var original = Application.prototype.getDefaultViews,
                nodes, widget, originalClear;
            lang.extend(Application, {
                getDefaultViews: function() {
                    var views, index;
                    views = original.apply(this, arguments) || [];
                    // Remove "My Activities" view from default view list (not supported in 7.5.4)
                    index = array.indexOf(views, 'myactivity_list');
                    if (index > -1) {
                        views.splice(index, 1);
                    }

                    return views;
                }
            });

            // Remove "My Activites" from the list of views (not supported in 7.5.4)
            if (window.App && window.App.views && window.App.views.myactivity_list) {
                delete App.views.myactivity_list;
            }

            // Remove the speedsearch widget (speedsearch is not supported in 7.5.4)
            nodes = query('#home > .search-widget.list-search');
            if (nodes.length === 1) {
                widget = registry.byNode(nodes[0]);
                if (widget) {
                    widget.destroyRecursive();
                }

                // Prevent the clear call on the speedsearch widget
                originalClear = HomeView.prototype.clear;
                lang.extend(HomeView, {
                    searchWidget: null,
                    clear: function() {
                        this.searchWidget = null;
                        originalClear.call(this, arguments);
                    }
                });
            }
        }
    });
});

