var SearchList = Backbone.Collection.extend({

        initialize: function() {
            this.bind("reset", function(model, options) {
                console.log("Inside event");
                console.log(model);
            });
        },

        //** 1. Function "parse" is a Backbone function to parse the response properly
        parse: function(response) {
            //** return the array hits inside response, when returning the array
            //** we let Backone populate this collection
            return response.hits;
        }

});
