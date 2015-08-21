$(function(){

var SearchList = Backbone.Collection.extend({
    url: "https://api.nutritionix.com/v1_1/search/taco?results=0%3A20&cal_min=0&cal_max=50000&fields=item_name%2Cbrand_name%2Citem_id%2Cbrand_id&appId=26952a04&appKey=78e2b31849de080049d26dc6cf4f338c",

    initialize: function(){
        this.bind("reset", function(model, options){
        console.log("Inside event");
        console.log(model);
        });
    }

});

// The main view of the application
var App = Backbone.View.extend({

    initialize: function () {

        this.collection = new SearchList();

        this.collection.fetch({
            success: function (response, xhr) {
                console.log("Inside success");
                console.log(response.toJSON());
            },
            ERROR: function (errorResponse) {
                console.log(errorResponse)
            }
        });

        this.listenTo(this.collection, 'sync', this.render);


        this.list = $('#listing');


    },

    render: function(){

        var context = this;
        this.collection.each(function (term) {
            _.each(term.get('hits'), function (item) {
                context.list.append("<li>" + item.fields.brand_name + "</li>");
            });

        }, this);

    }
});
        new App();
});