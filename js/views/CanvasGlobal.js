var app = app || {};

(function () {
    app.Canvas = Backbone.View.extend({

        initialize: function () {
            this.ctx = this.el.getContext("2d");
            this.cellRect = app.const.CELL;
        },

        setCtx: function (fill, stroke) {
            this.ctx.fillStyle = fill || app.const.FILL_STYLE;
            this.ctx.strokeStyle = stroke || app.const.STROKE_STYLE;
        },

        drawCell: function (cell) {
            var x = cell.get('x'),
                y = cell.get('y');
            this.setCtx(cell.get('fill'), cell.get('stroke'));
            this.ctx.strokeRect(x, y, this.cellRect-0.5, this.cellRect-0.5);
            this.ctx.fillRect(x, y, this.cellRect-2, this.cellRect-2);
        },

        clear: function () {
            this.ctx.clearRect(0,0, app.const.WIDTH, app.const.HEIGHT);
        }
    });
})();