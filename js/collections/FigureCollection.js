var app = app || {};

(function () {
    "use strict";
    app.FigureCollection = Backbone.Collection.extend({
        model: app.CellModel,
        initialize: function () {

        },
        createFigure: function (intg) {
            var r = app.const.CELL, c = (app.const.WIDTH/2)-(r/2);
            this.currentState = 0;
            this.type = app.const.TYPE_MAP[intg];
            this.reset(app.const.FIGURE[intg]);
            this.setColor();
        },
        moveToCenter: function () {
            var coords = app.const.NEXT_FIGURE_POSITION[this.type];
            this.each(function (cell, i) {
                cell.set({
                    'x': coords[i][0],
                    'y': coords[i][1]
                });
            });
        },
        setColor: function () {
            this.each(function (cell) {
                cell.set({
                    'fill': app.const.FIGURE_COLORS[this.type][0],
                    'stroke': app.const.FIGURE_COLORS[this.type][1]
                });
            }.bind(this));
        },
        getNewArr: function () {
            if(this.currentState > 3)
                this.currentState = 0;

            var data = app.const.TRANSFORM_MAP[this.type][this.currentState];
            var position = app.const.POSITION_MAP[this.type][this.currentState];
            var map = {
                'l': 'left',
                'r': 'right',
                'c': 'center'
            };
            var tmp = [];
            var r = app.const.CELL;

            this.each(function (cell, i) {
                var item = {};

                if(data[i]) {
                    if(_.isString(data[i])) {
                        item.x = this.at(data[i]).get('x');
                        item.y = this.at(data[i]).get('y');
                    } else {
                        item.x = cell.get('x') + (data[i][0]*r);
                        item.y = cell.get('y') + (data[i][1]*r);
                    }
                } else {
                    item.x = cell.get('x');
                    item.y = cell.get('y');
                }

                if(position[i]) {
                    if(_.isString(position[i])) {
                        item[map[position[i]]] = true;
                    } else {
                        _.each(position[i], function (name) {
                            item[map[name]] = true;
                        });
                    }
                }
                tmp.push(item);
            }.bind(this));

            return tmp;
        },
        rotateSuccess: function () {
            ++this.currentState;
        },
        getCustom: function () {
            return {
                type: this.type,
                currentState: this.currentState
            }
        },
        setCustom: function (config) {
            this.type = config.type;
            this.currentState = config.currentState;
        }
    });
})();