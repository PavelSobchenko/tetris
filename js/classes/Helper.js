var app = app || {};

(function () {
    "use strict";
    
    app.classes = app.classes || {}; 
    
    app.classes.helper = {
        getRandomInt: function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    };
})();