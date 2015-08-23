$(function(){

var SearchList = Backbone.Collection.extend({

    initialize: function(){
        this.bind("reset", function(model, options){
        console.log("Inside event");
        console.log(model);
        });
    },
    //** 1. Function "parse" is a Backbone function to parse the response properly
    parse:function(response){
        //** return the array inside response, when returning the array
        //** we left to Backone populate this collection
        return response.hits;
    }

});

// The main view of the application
var App = Backbone.View.extend({



    initialize: function () {

        this.model = new SearchList();

        this.list = $('#listing');

    },
    el: 'input',

    events: {

    "keyup" : "prepCollection"
    },
    prepCollection: function(){
        var name = $('input').val();
        var newUrl = "https://api.nutritionix.com/v1_1/search/" + name + "?results=0%3A20&cal_min=0&cal_max=50000&fields=item_name%2Cbrand_name%2Citem_id%2Cbrand_id&appId=26952a04&appKey=33b9262901d0068d4895736b5af19805";

       if (name == ""){
        this.list.html("")
       }
       else{
        this.model.url = newUrl;
        this.model.fetch({
            success: function (response, xhr) {
                console.log("Inside success");
                console.log(response.toJSON());
            },
            error: function (errorResponse) {
                console.log(errorResponse)
            }
        });
        this.listenTo(this.model, 'sync', this.render);
       }

    },

    render: function(){
        var terms = this.model;
        var wordhtml = "";
        terms.each(function (term) {
            wordhtml = wordhtml + "<li>" +"Food Name: " + term.get('fields')["item_name"] + '<br/>' +'Brand Name: '+ term.get('fields')["brand_name"] + "</li>"
        }, this);
        this.list.html(wordhtml);

    }
});
       var app = new App();
});