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
        setCtx: function (settingObj) {
            if(settingObj) {
                this.ctx.fillStyle = settingObj.fill_style || app.const.FILL_STYLE;
                this.ctx.strokeStyle = settingObj.stroke_style || app.const.STROKE_STYLE;
            } else {
                this.ctx.fillStyle = app.const.FILL_STYLE;
                this.ctx.strokeStyle = app.const.STROKE_STYLE;
            }
        },
        keyDownController: function (e) {
            if(!this.statePlaying)
                return;

            switch (e.keyCode) {
                case 37:
                    this.moveFigure('left');
                    break;
                case 39:
                    this.moveFigure('right');
                    break;
                case 40:
                    if(this.speed < app.const.SPEED_MAX) {
                        this.speed += app.const.SPEED_STEP;
                        this.play();
                    }
                    break;
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
        },
        gameOver: function () {
            this.stop();
            this.statePlaying = null;
            app.eventDispatcher.trigger('gameover');
            console.log('gameover');
        },

        checkLeft: function () {
            var cell = this.CC.findWhere({left: true});
            var fillCell = this.FC.findWhere({
                x: cell.get('x')-this.cellRect,
                y: cell.get('y')
            });

            if(cell.get('x') == 0 || fillCell)
                return false;

            return true;
        },
        checkRight: function () {
            var cell = this.CC.findWhere({right: true});
            var fillCell = this.FC.findWhere({
                x: cell.get('x')+this.cellRect,
                y: cell.get('y')
            });

            if(cell.get('x')+this.cellRect == app.const.WIDTH || fillCell)
                return false;

            return true;
        },
        // DATA func
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
                if(this.CC.find(function (cell) { return cell.get('y') == 0; })) {
                    this.gameOver();
                } else {
                    this.startLoop();
                }
            }
        },
        startLoop: function () {
            this.CC.createFigure(0);
            this.play();
        },
        endLoop: function () {
            this.CC.each(function (cell) {
                this.FC.add(cell);
            }.bind(this));
        },
        moveFigure: function (direct) {
            if(direct == 'left' && this.checkLeft()) {
                this.CC.each(function (cell) {
                    cell.set('x', cell.get('x')-(app.const.CELL));
                }.bind(this));
            } else if(direct == 'right' && this.checkRight()) {
                this.CC.each(function (cell) {
                    cell.set('x', cell.get('x')+(app.const.CELL));
                }.bind(this));
            }
            else {
                this.CC.each(function (cell) {
                    cell.set('y', cell.get('y')+(app.const.CELL));
                });
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
        clear: function () {
            this.ctx.clearRect(0,0, app.const.WIDTH, app.const.HEIGHT);
        }
    });
})();