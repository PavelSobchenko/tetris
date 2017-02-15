var app = app || {};

(function () {
    'use strict';
    app.NextFigureView = app.Canvas.extend({
        el: '#nextFigure',
        initialize: function () {
            this.el.height = app.const.CELL*6;
            this.el.width = app.const.CELL*6;

            app.Canvas.prototype.initialize.apply(this);

            this.NF = new app.FigureCollection();

            app.eventDispatcher.on('nextFigure', this.render, this);
        },

        render: function (type) {
            this.NF.createFigure(type);
            this.NF.moveToCenter();
            this.clear();
            this.NF.each(this.drawCell, this);
        }
    });
})();