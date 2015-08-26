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
    "click #listing li" : "track",
    "click #add": "addClicked",
    "click #remove": "removeClicked"
    },

    initialize: function () {

        this.model = new SearchList();
        this.foods = new AllFoods();
        this.prepCollection =_.debounce(this.prepCollection, 1000);
        this.$total = $('#total span');
        this.$list = $('#listing');
        this.$instruct = $('#instruct');
        this.$tracked =$('#tracked');


    },

    addClicked: function(e) {
        var $target = $(e.currentTarget).parent();
       var $selected = $target.find('#mySelect').val();

        var location = $target.attr('data-id');
        var currentFood = this.foods.get(location);


        switch($selected) {
            case 'Breakfast':
                $('#breakfast').append(currentFood.get('html'));
                break;
            case 'Lunch':
                $('#lunch').append(currentFood.get('html'));
                break;
            case 'Dinner':
                $('#dinner').append(currentFood.get('html'));
                break;
            case 'Snack':
                $('#snack').append(currentFood.get('html'));
                break;
            default:
                alert("Error: try again");
        }




    },

    removeClicked: function (e) {
        var $target = $(e.currentTarget).parent();
        var removeid = $target.attr('data-id');
        $target.remove();
        this.foods.remove(removeid);
    },

    prepCollection: function(){
        var name = $('input').val();
        var newUrl = "https://api.nutritionix.com/v1_1/search/" + name + "?results=0%3A20&cal_min=0&cal_max=50000&fields=item_name,brand_name,item_id,nf_calories&appId=26952a04&appKey=33b9262901d0068d4895736b5af19805";

       if (name == ""){
        this.$list.html("")
        this.$instruct.html("")
       }
       else{
        this.$instruct.html("Click On A Food Item To Track It")
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
        var foodid = $target.attr('data-id');

        var chooseday ='<form>What meal was this part of?: <select id="mySelect"> <option value="Breakfast">Breakfast</option><option value="Lunch">Lunch</option><option value="Dinner">Dinner</option><option value="Snack">Snack</option></select></form><button id="add" type="button">Add To Meal</button><button id="remove" type="button">Remove From Tracked</button>';

        var trackedhtml = '<li'+' data-id='+'"'+ foodid +'"'+'>' +"<strong>" + item_name + '</strong>'+ ' ('+ brand_name + ')'+' - '+ calorieAmt + ' Calories' + chooseday + '</li>'


        this.foods.add(new Food({ id: foodid, title: item_name, brand: brand_name, calories: calorieAmt, html: trackedhtml}));

    },

    renderfoods: function() {
        var total = 0;
        var trackedhtml = '';

       this.foods.each(function(food){
            trackedhtml = trackedhtml + food.get('html');
            total += food.get('calories');
       },this)
        this.$tracked.html(trackedhtml);
         this.$total.html(total);



    },

    render: function(){
        var terms = this.model;
        var wordhtml = '';
        terms.each(function (term) {
            wordhtml = wordhtml + '<li' + ' data-id=' + '"' + term.get('_id') +'"'+' data-name=' + '"' + term.get('fields')['item_name'] +'"'+ ' data-brand='+'"' + term.get('fields')['brand_name'] + '"' + ' data-calories='+ '"' + term.get('fields')['nf_calories'] + '"' + '>' +"<strong>" + term.get('fields')["item_name"] + '</strong>'+ ' ('+ term.get('fields')["brand_name"] + ')'+' - '+ term.get('fields')["nf_calories"] + ' Calories' + '</li>'
        }, this);
        this.$list.html(wordhtml);

    }
});
       var app = new App();
});


// TODO: click event triggers render of saved elements with calorie count