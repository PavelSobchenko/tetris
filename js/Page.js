var app = app || {};

(function () {
    "use strict";
    var Page = Backbone.View.extend({
        el: '#page',

        initialize: function () {
            app.views = {};
            app.models = {};
            app.collections = {};
            app.eventDispatcher = _.extend({}, Backbone.Events );

            app.views.canvas = new app.CanvasView();
            app.views.panel = new app.PanelView();
            app.views.next_figure = new app.NextFigureView();

            // this.startPlay();
        }
        // startPlay: function () {
        //     app.eventDispatcher.trigger('startPlay');
        // }
    });

    $(document).ready(function () {
        app.page = new Page();
    });
})();