var app = app || {};

(function () {
    'use strict';
    app.PanelView = Backbone.View.extend({
        el: '#panel',
        points: 0,
        events: {
            'click #playerName span': 'showInputName',
            'click #show_all_score': 'toggleScore',
            'click #reset_score': 'resetScore',
            'blur #playerName input': 'setName',
            'keydown #playerName input': 'keyDownControl'
        },
        initialize: function () {
            this.score = [];
            this.allScore = false;
            this.blocks = {
                name: this.$el.find('#playerName span'),
                input: this.$el.find('#playerName input'),
                score: this.$el.find('#score'),
                all_score: this.$el.find('#show_all_score'),
                reset_score: this.$el.find('#reset_score')
            };

            if(!(this.playerName = localStorage.getItem('playerName')))
                this.playerName = 'Player';

            if(localStorage.getItem('playerScore')) {
                this.score = JSON.parse(localStorage.getItem('playerScore'));
                this.blocks.reset_score.removeClass('hidden');
            }

            this.render();
            // TODO: concat this
            app.eventDispatcher.on('endLoop', this.updatePoints, this);
            app.eventDispatcher.on('removeRow', this.updatePoints, this);
            app.eventDispatcher.on('gameover', this.gameOver, this);
            app.eventDispatcher.on('startNewGame', this.resetPoints, this);
        },
        render: function () {
            this.blocks.name.text(this.playerName);
            this.renderScoreTable();
        },
        renderScoreTable: function () {
            this.blocks.score.html('');

            for(var i = this.score.length-1, j = 0; i>=0; i--, j++) {
                if(j<app.const.SCORE_SIZE_ROW)
                    this.blocks.score.append('<tr><td>'+this.score[i].name+'</td><td>'+this.score[i].points+'</td></tr>');
                else
                    this.blocks.score.append('<tr class="hidden no_top_score"><td>'+this.score[i].name+'</td><td>'+this.score[i].points+'</td></tr>')
            }

            if(this.score.length>app.const.SCORE_SIZE_ROW)
                this.blocks.all_score.removeClass('hidden');

            if(this.score.length)
                this.blocks.reset_score.removeClass('hidden');
        },
        toggleScore: function (e) {
            e.preventDefault();
            this.blocks.score.find('.no_top_score').toggleClass('hidden');
            this.allScore = !this.allScore;
            this.allScore ? this.blocks.all_score.text('hide all'):this.blocks.all_score.text('show all');
        },
        resetScore: function (e) {
            e.preventDefault();
            this.blocks.reset_score.addClass('hidden');
            this.blocks.all_score.addClass('hidden');
            localStorage.removeItem('playerScore');
            this.score = [];
            this.renderScoreTable();
        },
        resetPoints: function () {
            this.points = 0;
            this.updatePoints(0);
        },
        updatePoints: function (points) {
            this.points += points;
            this.$el.find('.points span').text(this.points);
        },
        gameOver: function () {
            this.setScore({name: this.playerName, points: this.points});
            this.renderScoreTable();
        },
        showInputName: function () {
            this.blocks.name.hide();
            this.blocks.input.val(this.playerName).show();
            this.blocks.input[0].setSelectionRange(this.playerName.length, this.playerName.length);
        },
        keyDownControl: function (e) {
            if(e.keyCode == 13) {
                e.preventDefault();
                this.setName();
            }
        },

        setName: function () {
            this.playerName = this.blocks.input[0].value;
            this.blocks.name.text(this.playerName);
            localStorage.setItem('playerName', this.playerName);
            this.blocks.input.hide();
            this.blocks.name.show();
        },
        setScore: function (item) {
            if(this.score.length) {
                var index = _.sortedIndex(this.score, item, 'points');

                if(index == this.score.length)
                    this.score.push(item);
                else {
                    var tmpScore = [];
                    _.each(this.score, function (old_item, i) {
                        if(index == i)
                            tmpScore.push(item);
                        tmpScore.push(old_item);
                    });

                    this.score = tmpScore;
                }
            } else
                this.score.push(item);

            // this.score.reverse();
            localStorage.setItem('playerScore', JSON.stringify(this.score));
        }
    });
})();