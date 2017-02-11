var app = app || {};

(function () {
    "use strict";
    app.FigureCollection = Backbone.Collection.extend({
        model: app.CellModel,
        initialize: function () {
            var r = app.const.CELL, c = (app.const.WIDTH/2)-(r/2);
            this.figure = [
                [{x:(c-(r*2)), y:0-r, left: true}, {x:(c-r), y:0-r}, {x:c, y:0-r}, {x:(c+r), y:0-r, right: true}], // row
                [{x:(c-r),y:0-r}, {x:c,y:0-r}, {x:(c-r),y:0}, {x:c,y:0}], // rect
                [{x:c,y:-(r*2)}, {x:c,y:-r}, {x:c,y:0}, {x:(c+r),y:0}], // L
                [{x:c,y:0-r}, {x:(c-r),y:0-(r*2)}, {x:c,y:0-(r*2)}, {x:(c+r),y:0-(r*2)}] // T
            ]
        },
        createFigure: function (intg) {
            this.reset(this.figure[intg]);
        }
    });
})();