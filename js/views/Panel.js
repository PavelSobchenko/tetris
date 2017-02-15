var app = app || {};

(function () {
    'use strict';
    app.PanelView = Backbone.View.extend({
        el: '#panel',
        points: 0,
        initialize: function () {
            // TODO: concat this
            app.eventDispatcher.on('endLoop', this.updatePoints, this);
            app.eventDispatcher.on('removeRow', this.updatePoints, this);
        },
        updatePoints: function (points) {
            this.points += points;
            this.$el.find('.points span').text(this.points);
        }
    });
})();