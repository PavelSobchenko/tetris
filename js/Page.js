var app = app || {};

(function () {
    "use strict";

    var Page = Backbone.View.extend({
       initialize: function () {
           console.log('app is initialized'); 
       }
    });

    app.page = new Page();
})();