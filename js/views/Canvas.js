var app = app || {};

(function () {
    "use strict";
    app.CanvasView = app.Canvas.extend({
        el: '#cnvs',
        initialize: function () {
            this.el.height = app.const.HEIGHT;
            this.el.width = app.const.WIDTH;
            
            app.Canvas.prototype.initialize.apply(this);
            this.setCtx();
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";

            this.speed = app.const.SPEED_START;
            this.points = 0;

            this.statePlaying = null;
            this.blockMoveDown = false;
            this.removeRow = false;
            this.nextFigureType = null;
            this.readyToStart = true;

            this.CC = new app.FigureCollection(); // current figure
            this.FC = new app.FigureCollection(); // array of filled cells

            app.eventDispatcher.on('startPlay removedFillRow', this.startLoop, this);
            app.eventDispatcher.on('endLoop', this.updatePoints, this);
            app.eventDispatcher.on('removeRow', this.updatePoints, this);
            $(window).on('keyup', this.keyUpController.bind(this));
            $(window).on('keydown', this.keyDownController.bind(this));

            this.renderCanvasControl();
        },

        updatePoints: function (points) {
            this.points += points;
        },

        render: function () {
            if(!this.statePlaying || this.removeRow)
                return;

            this.moveFigure();
            this.draw();
            this.check();
        },

        renderCanvasControl: function () {
            // prepare
            this.ctx.font = 'bold 30px Monospaced';
            this.setCtx(app.const.GAME_OVER_FILL);
            this.ctx.fillRect(0, 0, app.const.WIDTH, app.const.HEIGHT);

            var message = {}, desc = {};
            if(this.gameOverState) {
                message.text = "GAME OVER!";
                desc.text = 'press space to restart';
                // TODO: remove 120 on x coord
                message.x = 120;
                desc.x = 120;
            } else if(this.readyToStart) {
                message.text = "START!";
                desc.text = 'press space to start';
                message.x = 120;
                desc.x = 120;
            }

            // message.x = (app.const.WIDTH-this.ctx.measureText(message.text).width)/2;
            message.y = app.const.HEIGHT/2 - 15;
            // desc.x = (app.const.WIDTH-this.ctx.measureText(message.text).width)/2;
            desc.y = message.y + 30;

            this.setCtx('#fff');
            this.ctx.fillText(message.text, message.x, message.y);
            this.ctx.font = '16px Monospaced';
            this.ctx.fillText(desc.text, desc.x, desc.y);
        },

        // set func
        keyDownController: function (e) {
            if(!this.statePlaying)
                return;

            if(e.keyCode == 40 && this.speed < app.const.SPEED_MAX) {
                this.speed += app.const.SPEED_STEP;
                this.play();
            }
        },
        keyUpController: function (e) {
            if(e.keyCode == 32 && !this.statePlaying) {
                if(this.gameOverState) {
                    this.gameOverState = false;
                    this.FC.reset();
                    app.eventDispatcher.trigger('startNewGame');
                }
                this.startLoop();
                return;
            }
            if(!this.statePlaying)
                return;

            var ctrl = e.ctrlKey;
            // if(ctrl) { // develop helpers
            //     if(e.keyCode == 81) { // Q
            //         this.endLoop();
            //         if(!this.removeRow && this.statePlaying)
            //             this.startLoop();
            //     }
            //     if(e.keyCode == 88) { // X
            //         this.gameOver();
            //     }
            // }
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
                if(this.rotate()) {
                    console.log('rotate');
                }
            }
        },
        gameOver: function () {
            this.stop();

            this.statePlaying = null;
            this.removeRow = false;
            this.gameOverState = true;

            app.eventDispatcher.trigger('gameover');

            this.renderCanvasControl();
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
                this.startLoop();
            }
        },
        checkFillRow: function () {
            var group = this.FC.groupBy('y');
            var row = _.find(group, function (arr) {
                return arr.length >= app.const.ROW_WIDTH;
            });
            if(row) {
                // TODO: sort wrong
                row = _.sortBy(row, 'x');
                app.eventDispatcher.trigger('removeRow', app.const.REMOVE_ROW);
                this.removeFillRow(row);
            } else if(this.removeRow) {
                this.removeRow = false;
                app.eventDispatcher.trigger('removedFillRow');
            }
        },
        rotate: function () {
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
                tmpCollection.setColor();
                this.CC = tmpCollection;
            }
        },

        // LOOP
        startLoop: function () {
            this.readyToStart = false;
            if(this.removeRow || this.gameOverState)
                return;
            
            if(this.nextFigureType === null) {
                this.CC.createFigure(app.classes.helper.getRandomInt(0, 6));
            } else {
                this.CC.createFigure(this.nextFigureType);
            }
            
            this.nextFigureType = app.classes.helper.getRandomInt(0, 6);
            app.eventDispatcher.trigger('nextFigure', this.nextFigureType);
            this.play();
        },
        endLoop: function () {
            app.eventDispatcher.trigger('endLoop', app.const.END_LOOP);
            if(this.CC.find(function (cell) { return cell.get('y') <= 0; })) {
                this.gameOver();
            }
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
            this.statePlaying = 'play';
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
        removeFillRow: function (row) {
            this.removeRow = true;
            var y = row[0].get('y');
            var interval = setInterval(function () {
                this.clear();
                if(!row.length) {
                    clearInterval(interval);
                    this.FC.each(function (cell) {
                        if(cell.get('y')<y)
                            cell.set('y', cell.get('y')+this.cellRect);
                    }.bind(this));
                    this.FC.each(this.drawCell, this);
                    this.checkFillRow();
                    return;
                }

                this.FC.remove(row[row.length-1]);
                this.FC.each(this.drawCell, this);
                row.pop();
            }.bind(this), app.const.REMOVE_CELL_ANIMATION_TIME);
            this.stop();
        }
    });
})();