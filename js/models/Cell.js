var app = app || {};

(function () {
    'use strict';
    app.CellModel = Backbone.Model.extend({
        defaults: {
            x: 0,
            y: 0,
            left: false,
            right: false,
            center: false
        }
    });
})();