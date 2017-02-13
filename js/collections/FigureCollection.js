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
            var figure = [
                [
                    {x:(c-(r*2)), y:0-r, left: true},
                    {x:(c-r), y:0-r},
                    {x:c, y:0-r, center: true},
                    {x:(c+r), y:0-r, right: true}
                ], // row
                [
                    {x:(c-r), y:0-r, left: true},
                    {x:c, y:0-r, right: true},
                    {x:(c-r), y:0, left: true},
                    {x:c, y:0, right:true}
                ], // rect
                [
                    {x:c, y:-(r*2), left: true},
                    {x:c, y:-r, left: true, center: true},
                    {x:c, y:0, left: true},
                    {x:(c+r), y:0, right: true}
                ], // L
                [
                    {x:c,y:0-r, right: true, left: true},
                    {x:(c-r),y:0-(r*2) , left: true},
                    {x:c,y:0-(r*2), center: true},
                    {x:(c+r),y:0-(r*2), right: true}
                ], // T
                [
                    {x:c-r, y: 0-(r*2), left: true},
                    {x:c, y: 0-(r*2), right: true, center: true},
                    {x:c, y: 0-r, left: true},
                    {x:c+r, y: 0-r, right: true}
                ] // Z
                // TODO: add reverse Z
            ];
            var type_map = ['I', 'C', 'L', 'T', 'Z'];

            this.type = type_map[intg];
            this.reset(figure[intg]);
        },
        rotateFigure: function () {

        },
        getNewArr: function () {
            if(this.currentState > 3)
                this.currentState = 0;

            var transform_map = {
                'I': [
                    [[2, -2], [1, -1], null, [-1, 1]],
                    [[-2, 2], [-1, 1], null, [1, -1]],
                    [[2, -2], [1, -1], null, [-1, 1]],
                    [[-2, 2], [-1, 1], null, [1, -1]]
                ],
                'L': [
                    [[1, 1], null, [-1, -1], [-2, 0]],
                    [[-1, 1], null, [1, -1], [0, -2]],
                    [[-1, -1], null, [1, 1], [2, 0]],
                    [[1, -1], null, [-1, 1], [0, 2]]
                ],
                'T': [
                    ['1', [1, -1], null, '0'],
                    ['1', [1, 1], null, '0'],
                    ['1', [-1, 1], null, '0'],
                    ['1', [-1, -1], null, '0']
                ],
                'Z': [
                    [[1, -1], null, '0', [-2, 0]],
                    [[-1, 1], null, [1, 1], [2, 0]],
                    [[1, -1], null, '0', [-2, 0]],
                    [[-1, 1], null, [1, 1], [2, 0]]
                ]
            };

            var position_map = {
                'I': [
                    [['left', 'right'], ['left', 'right'], ['left', 'right', 'center'], ['left', 'right']],
                    [['left'], null, ['center'], ['right']],
                    [['left', 'right'], ['left', 'right'], ['left', 'right', 'center'], ['left', 'right']],
                    [['left'], null, ['center'], ['right']]
                ],
                // TODO: fix right border
                'L': [
                    [['right'], ['center'], ['left'], ['left', 'right']],
                    [['left', 'right'], ['left', 'right', 'center'], ['right'], ['left']],
                    [['left'], ['center'], ['right'], ['left', 'right']],
                    [['left', 'right'], ['left', 'right', 'center'], ['left'], ['right']]
                ],
                'T': [
                    [['left'], ['left', 'right'], ['center', 'right'], ['left', 'right']],
                    [['left', 'right'], ['right'], ['center'], ['left']],
                    [['right'], ['left', 'right'], ['left', 'center'], ['left', 'right']],
                    [['left', 'right'], ['left'], ['center'], ['right']]
                ],
                'Z': [
                    [['left', 'right'], ['center', 'right'], ['left'], ['left', 'right']],
                    [['left'], ['center', 'right'], ['left'], ['right']],
                    [['left', 'right'], ['center', 'right'], ['left'], ['left', 'right']],
                    [['left'], ['center', 'right'], ['left'], ['right']]
                ]
            };

            var data = transform_map[this.type][this.currentState];
            var position = position_map[this.type][this.currentState];
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
                    _.each(position[i], function (name) {
                       item[name] = true;
                    });
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