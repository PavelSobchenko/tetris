var app = app || {};

(function () {
    "use strict";
    app.CanvasView = Backbone.View.extend({
        el: '#cnvs',
        initialize: function () {
            this.el.style.border = '1px solid #333';
            this.el.height = app.const.HEIGHT;
            this.el.width = app.const.WIDTH;

            this.ctx = this.el.getContext("2d");
            this.setCtx();

            this.speed = app.const.SPEED_START;
            this.cellRect = app.const.CELL;
            this.statePlaying = null;
            this.blockMoveDown = false;
            this.CC = new app.FigureCollection(); // current figure
            this.FC = new app.FigureCollection(); // array of filled cells

            app.eventDispatcher.on('startPlay', this.startLoop, this);
            $(window).on('keyup', this.keyUpController.bind(this));
            $(window).on('keydown', this.keyDownController.bind(this));
        },
        render: function () {
            if(!this.statePlaying)
                return;

            this.moveFigure();
            this.draw();
            this.check();
        },

        // set func
        setCtx: function (config) {
            if(config) {
                this.ctx.fillStyle = config.fill_style || app.const.FILL_STYLE;
                this.ctx.strokeStyle = config.stroke_style || app.const.STROKE_STYLE;
            } else {
                this.ctx.fillStyle = app.const.FILL_STYLE;
                this.ctx.strokeStyle = app.const.STROKE_STYLE;
            }
        },
        keyDownController: function (e) {
            if(!this.statePlaying)
                return;

            if(e.keyCode == 40 && this.speed < app.const.SPEED_MAX) {
                this.speed += app.const.SPEED_STEP;
                this.play();
            }
        },
        keyUpController: function (e) {
            if(!this.statePlaying)
                return;

            var ctrl = e.ctrlKey;
            if(ctrl) { // develop helpers
                if(e.keyCode == 81) { // Q
                    this.endLoop();
                    this.startLoop();
                }
                if(e.keyCode == 88) { // X
                    this.gameOver();
                }
            }
            if(e.keyCode == 40) {
                this.speed = app.const.SPEED_START;
                this.play();
            }

            if(e.keyCode == 37) {
                this.blockMoveDown = true;
                this.moveFigure('left');
                this.blockMoveDown = false;
            }
            if(e.keyCode == 39) {
                this.blockMoveDown = true;
                this.moveFigure('right');
                this.blockMoveDown = false;
            }
            if(e.keyCode == 38) {
                if(this.checkRotate()) {
                    console.log('rotate');
                }
            }
        },
        gameOver: function () {
            this.stop();
            this.statePlaying = null;
            app.eventDispatcher.trigger('gameover');
            console.log('gameover');
        },

        // check func
        // contain logic for collision
        // right/left/bottom border
        // check for gameover
        checkLeft: function (collection) {
            var cells = collection.where({left: true}), result = true;

            _.each(cells, function (cell) {
                var fillCell = this.FC.findWhere({
                    x: cell.get('x')-this.cellRect,
                    y: cell.get('y')
                });

                if(cell.get('x') <= 0 || fillCell) {
                    result = false;
                    return true; // break _.each
                }
            }.bind(this));

            return result;
        },
        checkRight: function (collection) {
            var cells = collection.where({right: true}), result = true;

            _.each(cells, function (cell) {
                var fillCell = this.FC.findWhere({
                    x: cell.get('x')+this.cellRect,
                    y: cell.get('y')
                });

                if(cell.get('x')+this.cellRect >= app.const.WIDTH || fillCell) {
                    result = false;
                    return true;
                }
            }.bind(this));

            return result;
        },
        check: function () {
            var cont = true; // continue?

            // check for bottom border
            this.CC.find(function (cell) {
                if(cell.get('y')+this.cellRect == app.const.HEIGHT) {
                    cont = false;
                    return cell;
                }
            }.bind(this));

            if(!cont) {
                this.endLoop();
                this.startLoop();
                return;
            }

            // check for fill cells
            this.CC.find(function (cell) {
                var x = cell.get('x'), y = cell.get('y')+this.cellRect;

                if(this.FC.findWhere({x: x, y: y})) {
                    cont = false;
                    return cell;
                }
            }.bind(this));

            if(!cont) {
                this.endLoop();
                // check for gameover
                if(this.CC.findWhere({y: 0})) {
                    this.gameOver();
                } else {
                    this.startLoop();
                }
            }
        },
        checkFillRow: function () {
            var group = this.FC.groupBy('y');
            _.each(group, function (arr, y) {
                if(arr.length === app.const.ROW_WIDTH) {
                    // this.removeFillRow(y);
                    // this.checkFillRow();
                }
            }.bind(this));
        },
        checkRotate: function () {
            if(this.CC.type == 'C') // cube is figure without rotate
                return false;

            var tmpCollection = new app.FigureCollection();
            tmpCollection.add(this.CC.getNewArr());
            if(this.checkLeft(tmpCollection) && this.checkRight(tmpCollection)) {
                var no_valid_cell = tmpCollection.find(function (cell) {
                    if(cell.get('y')+this.cellRect >= app.const.HEIGHT) {
                        return cell;
                    }
                }.bind(this));

                if(no_valid_cell)
                    return;

                this.CC.rotateSuccess();
                tmpCollection.setCustom(this.CC.getCustom());
                this.CC = tmpCollection;
            }
        },

        // LOOP
        startLoop: function () {
            // var rand = app.classes.helper.getRandomInt(0, 4);
            this.CC.createFigure(3);
            this.play();
        },
        endLoop: function () {
            this.CC.each(function (cell) {
                this.FC.add(cell);
            }.bind(this));
            this.checkFillRow();
        },
        moveFigure: function (direct) {
            if(direct == 'left') {
                if(this.checkLeft(this.CC)) {
                    this.CC.each(function (cell) {
                        cell.set('x', cell.get('x')-this.cellRect);
                    }.bind(this));
                } else
                    this.blockMoveDown = false; // unblock move down
            } else if(direct == 'right') {
                if(this.checkRight(this.CC)) {
                    this.CC.each(function (cell) {
                        cell.set('x', cell.get('x')+this.cellRect);
                    }.bind(this));
                } else
                    this.blockMoveDown = false;
            }
            else if(!this.blockMoveDown) {
                this.CC.each(function (cell) {
                    cell.set('y', cell.get('y')+this.cellRect);
                }.bind(this));
            }
        },
        play: function () {
            if(this.playId)
                this.stop();
            this.playId = setInterval(this.render.bind(this), 1000 / this.speed);
            this.statePlaying = 'play'
        },
        stop: function () {
            clearInterval(this.playId);
        },

        // Render func
        draw: function () {
            this.clear();
            this.drawFigures();
        },
        drawFigures: function () {
            this.CC.each(this.drawCell, this);
            this.FC.each(this.drawCell, this);
        },
        drawCell: function (cell) {
            var x = cell.get('x'),
                y = cell.get('y');

            this.ctx.strokeRect(x, y, this.cellRect-0.5, this.cellRect-0.5);
            this.ctx.fillRect(x, y, this.cellRect-2, this.cellRect-2);
        },
        removeFillRow: function (y) {
            var removeModels = this.FC.where({y: parseInt(y)});
            console.log(removeModels);
        },
        clear: function () {
            this.ctx.clearRect(0,0, app.const.WIDTH, app.const.HEIGHT);
        }
    });
})();