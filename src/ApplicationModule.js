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
    'Mobile/SalesLogix/Views/Home',
    'Mobile/SalesLogix/Views/LeftDrawer',
    'Mobile/SalesLogix/Views/User/List'
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
    HomeView,
    LeftDrawer,
    UserList
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

            this.clearMetricPrefs();
            this.removeViews();
            this.removeSpeedSearch();
            this.removeAttachments();
            this.removeKPIS();
            this.changeUserListQuery();

        },
        clearMetricPrefs: function() {
            // Required if the user happend to load metric/KPI widgets on an 8.0 version (developer, QA, etc)
            var app = window.App
            if (app) {
                app._loadPreferences();
                if (app.preferences && app.preferences.metrics) {
                    delete app.preferences.metrics;
                    app.persistPreferences();
                }

                // Disable loading of the default metrics payload
                lang.extend(Application, {
                     setDefaultMetricPreferences: function() {
                     }
                });
            }
        },
        removeViews: function() {
            var originalGetDefaultViews = Application.prototype.getDefaultViews,
                originalNavigateToInitialView = Application.prototype.navigateToInitialView;

            lang.extend(Application, {
                getDefaultViews: function() {
                    var views, removeView;
                    removeView = function(views, viewId) {
                        var index;
                        index = array.indexOf(views, viewId);
                        if (index > -1) {
                            views.splice(index, 1);
                        }
                    };

                    views = originalGetDefaultViews.apply(this, arguments) || [];

                    // Remove views not supported in 7.5.4
                    removeView(views, 'myactivity_list');
                    removeView(views, 'speedsearch_list');
                    removeView(views, 'myattachment_list');
                    return views;
                },
                navigateToInitialView: function() {
                    originalNavigateToInitialView.apply(this, arguments);
                    var view = this.getView('account_list');
                    if (view) {
                        view.show();
                    }
                }
            });

            if (window.App && window.App.views) {
                // Remove lists registered that are not supported
                delete App.views.myactivity_list;
                delete App.views.speedsearch_list;
                delete App.views.myattachment_list;
            }

        },
        removeSpeedSearch: function() {
            var originalShow = LeftDrawer.prototype.show;
            lang.extend(Mobile.SalesLogix.Views.LeftDrawer, {
                show: function() {
                    domClass.toggle(this.domNode, 'list-hide-search', true);
                    originalShow.apply(this, arguments);
                }
            });

        },
        changeUserListQuery: function() {
            // 8.0+ you can use the enum value, 7.5.4 requires the string
            lang.extend(UserList, {
                queryWhere: 'Enabled eq true and (Type ne "WebViewer" AND Type ne "Retired" AND Type ne "Template" AND Type ne "AddOn")',
            });
        },
        removeKPIS: function() {
            this.registerCustomization('right_drawer', 'right_drawer', {
                at: function(row) { return row.id === 'kpi'; },
                type: 'remove'
            });
        },
        removeAttachments: function() {
            var attachmentRelatedViews, attachmentQuickActions;

            attachmentRelatedViews = [
                'account_detail',
                'activity_detail',
                'contact_detail',
                'history_detail',
                'lead_detail',
                'opportunity_detail',
                'ticket_detail'
            ];

            attachmentQuickActions = [
                'account_list',
                'activity_list',
                'myactivity_list',
                'activity_related',
                'contact_list',
                'history_list',
                'lead_list',
                'opportunity_list',
                'ticket_list'
            ];

            array.forEach(attachmentRelatedViews, function (view) {
                this.registerCustomization('detail', view, {
                    at: function(row) { return row.name === 'AttachmentRelated'; },
                    type: 'remove'
                });
            }, this);

            array.forEach(attachmentQuickActions, function(view) {
                this.registerCustomization('list/actions', view, {
                    at: function(row) {
                        return row.id === 'addAttachment' || row.id === 'complete';
                    },
                    type: 'remove'
                });
            }, this);
        }
    });
});

