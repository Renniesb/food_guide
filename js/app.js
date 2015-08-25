$(function(){

var Food = Backbone.Model.extend({
        defaults:{
            title: 'no information found',
            brand: 'no information found',
            calories: 'no information found',
            day: 'all'
        }
});

var AllFoods = Backbone.Collection.extend({model: Food});



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

    el: 'body',

    events: {
    "input #searchBox" : "prepCollection",
    "click li" : "track"
    },

    initialize: function () {

        this.model = new SearchList();
        this.foods = new AllFoods();
        this.prepCollection =_.debounce(this.prepCollection, 1000);
        this.$total = $('#total span');
        this.$list = $('#listing');
        this.$tracked =$('#tracked');


    },

    prepCollection: function(){
        var name = $('input').val();
        var newUrl = "https://api.nutritionix.com/v1_1/search/" + name + "?results=0%3A20&cal_min=0&cal_max=50000&fields=item_name,brand_name,item_id,nf_calories&appId=26952a04&appKey=33b9262901d0068d4895736b5af19805";

       if (name == ""){
        this.$list.html("")
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

    track: function(e){


        this.listenTo(this.foods, 'add', this.renderfoods);

        var $target = $(e.currentTarget);
        var item_name = $target.attr('data-name');
        var brand_name = $target.attr('data-brand');
        var calorieString = $target.attr('data-calories');
        var calorieAmt = parseFloat(calorieString);


        this.foods.add(new Food({ title: item_name, brand: brand_name, calories: calorieAmt}));







    },

    renderfoods: function() {
        var total = 0;
        var trackedhtml = '';
       this.foods.each(function(food){
            trackedhtml = trackedhtml + '<li>'+"<strong>" + food.get('title') + '</strong>'+ ' ('+ food.get('brand') + ')'+' - '+ food.get('calories') + ' Calories' + '</li>'
            total += food.get('calories');
       },this)

       this.$tracked.html(trackedhtml);
       this.$total.text(total);



    },

    render: function(){
        var terms = this.model;
        var wordhtml = '';
        terms.each(function (term) {
            wordhtml = wordhtml + '<li data-name=' + '"' + term.get('fields')['item_name'] +'"'+ ' data-brand='+'"' + term.get('fields')['brand_name'] + '"' + ' data-calories='+ '"' + term.get('fields')['nf_calories'] + '"' + '>' +"<strong>" + term.get('fields')["item_name"] + '</strong>'+ ' ('+ term.get('fields')["brand_name"] + ')'+' - '+ term.get('fields')["nf_calories"] + ' Calories' + '</li>'
        }, this);
        this.$list.html(wordhtml);

    }
});
       var app = new App();
});


// TODO: click event triggers render of saved elements with calorie count