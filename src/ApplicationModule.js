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
    'Sage/Platform/Mobile/Convert',
    'Sage/Platform/Mobile/ApplicationModule',

    'Mobile/BackCompat/Views/Activity/Complete',
    'Mobile/BackCompat/Views/Activity/Detail',
    'Mobile/BackCompat/Views/Activity/Edit',

    'Mobile/BackCompat/Views/Calendar/DayView',
    'Mobile/BackCompat/Views/Calendar/WeekView',
    'Mobile/BackCompat/Views/Calendar/MonthView'
], function(
    declare,
    lang,
    domClass,
    string,
    query,
    convert,
    ApplicationModule,
    ActivityComplete,
    ActivityDetail,
    ActivityEdit,
    DayView,
    WeekView,
    MonthView
) {

    return declare('Mobile.BackCompat.ApplicationModule', [ApplicationModule], {
        loadViews: function() {
            this.inherited(arguments);

            dijit.registry._hash['activity_complete'].destroyRecursive();
            dijit.registry._hash['activity_detail'].destroyRecursive();
            dijit.registry._hash['activity_edit'].destroyRecursive();
            dijit.registry._hash['calendar_daylist'].destroyRecursive();
            dijit.registry._hash['calendar_weeklist'].destroyRecursive();
            dijit.registry._hash['calendar_monthlist'].destroyRecursive();

            this.registerView(new ActivityComplete());
            this.registerView(new ActivityDetail());
            this.registerView(new ActivityEdit());
            this.registerView(new DayView());
            this.registerView(new WeekView());
            this.registerView(new MonthView());
        },

        loadCustomizations: function() {
        }
    });
});