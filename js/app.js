$(function() {

    var Food = Backbone.Model.extend({

        defaults: {
            title: 'no information found',
            brand: 'no information found',
            calories: 'no information found',
        }
    });

    var AllFoods = Backbone.Firebase.Collection.extend({
        model: Food,
    });


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


    var App = Backbone.View.extend({

        el: 'body',

        events: {
            "input #searchBox": "prepCollection",
            "click #listing li": "track",
            "click #add": "addClicked",
            "click #remove": "removeClicked"

        },

        initialize: function() {

            this.model = new SearchList();
            this.foods = new AllFoods();
            this.foods.url = "https://blinding-torch-8751.firebaseio.com/allfoods"
            this.breakfastlist = new AllFoods();
            this.breakfastlist.url = "https://blinding-torch-8751.firebaseio.com/breakfast";
            this.lunchlist = new AllFoods();
            this.lunchlist.url = "https://blinding-torch-8751.firebaseio.com/lunch";
            this.dinnerlist = new AllFoods();
            this.dinnerlist.url = "https://blinding-torch-8751.firebaseio.com/dinner";
            this.snacklist = new AllFoods();
            this.snacklist.url = "https://blinding-torch-8751.firebaseio.com/snack";
            this.prepCollection = _.debounce(this.prepCollection, 1000);
            this.$total = $('#total span');
            this.$list = $('#listing');
            this.$instruct = $('#instruct');
            this.$tracked = $('#tracked');
            this.listenTo(this.foods, 'add', this.rendertracked);
            this.listenTo(this.foods, 'remove', this.rendertracked);
            this.listenTo(this.breakfastlist, 'add', this.renderbreakfast);
            this.listenTo(this.breakfastlist, 'remove', this.renderbreakfast);
            this.listenTo(this.lunchlist, 'add', this.renderlunch);
            this.listenTo(this.lunchlist, 'remove', this.renderlunch);
            this.listenTo(this.dinnerlist, 'add', this.renderdinner);
            this.listenTo(this.dinnerlist, 'remove', this.renderdinner);
            this.listenTo(this.snacklist, 'add', this.rendersnack);
            this.listenTo(this.snacklist, 'remove', this.rendersnack);

        },

        addClicked: function(e) {
            var $target = $(e.currentTarget).parent();
            var $selected = $target.find('#mySelect').val();
            var mealClass= $target.attr('class');
            var location = $target.attr('data-id');
            var currentFood = this.foods.get(location);
            var currentBreakfast = this.breakfastlist.get(location) ;
            var currentLunch = this.lunchlist.get(location);
            var currentDinner = this.dinnerlist.get(location);
            var currentSnack = this.snacklist.get(location);
            var currenthtml = currentFood.get('html');

            //replaces class in order to use it later to specifically target items in a specific meal collection
            //currenthtml.removeClass('alltracked').addClass($selected);

            switch ($selected) {
                case 'Breakfast':
                    this.breakfastlist.create(currentFood);

                    if (currentLunch) {
                        this.lunchlist.remove(currentLunch);
                    }
                    else if (currentDinner) {
                        this.dinnerlist.remove(currentDinner);
                    }
                    else if (currentSnack) {
                        this.snacklist.remove(currentSnack);
                    }
                    break;
                case 'Lunch':
                    this.lunchlist.create(currentFood)

                    if (currentBreakfast) {
                        this.breakfastlist.remove(currentBreakfast);
                    }
                    else if (currentDinner) {
                        this.dinnerlist.remove(currentDinner);
                    }
                    else if (currentSnack) {
                        this.snacklist.remove(currentSnack);
                    }
                    break;
                case 'Dinner':
                    this.dinnerlist.create(currentFood);

                    if (currentBreakfast) {
                        this.breakfastlist.remove(currentBreakfast);
                    }
                    else if (currentLunch) {
                        this.lunchlist.remove(currentLunch);
                    }
                    else if (currentSnack) {
                        this.snacklist.remove(currentSnack);
                    }
                    break;
                case 'Snack':
                    this.snacklist.create(currentFood);

                    if (currentBreakfast) {
                        this.breakfastlist.remove(currentBreakfast);
                    }
                    else if (currentLunch) {
                        this.lunchlist.remove(currentLunch);
                    }
                    else if (currentDinner) {
                        this.dinnerlist.remove(currentDinner);
                    }
                    break;
                default:
                    alert("Error: try again");

            }



        },

        removeClicked: function(e) {
            var $target = $(e.currentTarget).parent();
            var removeid = $target.attr('data-id');
            var modelRemoved = this.foods.get(removeid);
            var currentmeal = $target.parent();
            var currentid = currentmeal.attr('id');
            this.foods.remove(modelRemoved);


            switch (currentid) {
                case 'breakfast':
                    modelRemoved = this.breakfastlist.get(removeid);
                   this.breakfastlist.remove(modelRemoved);
                   break;
                case 'lunch':
                    modelRemoved = this.lunchlist.get(removeid);
                    this.lunchlist.remove(modelRemoved);
                    break;
                case 'dinner':
                    modelRemoved = this.dinnerlist.get(removeid);
                    this.dinnerlist.remove(modelRemoved);
                    break;
                case 'snack':
                    modelRemoved = this.snacklist.get(removeid);
                    this.snacklist.remove(modelRemoved);
                    break;

            }
        },

        prepCollection: function() {
            var name = $('input').val();
            var newUrl = "https://api.nutritionix.com/v1_1/search/" + name + "?results=0%3A20&cal_min=0&cal_max=50000&fields=item_name,brand_name,item_id,nf_calories&appId=26952a04&appKey=33b9262901d0068d4895736b5af19805";

            if (name == "") {
                this.$list.html("")
                this.$instruct.html("")
            } else {
                this.$instruct.html("Click On A Food Item To Track It");
                this.model.url = newUrl;
                this.model.fetch({
                    success: function(response, xhr) {
                        console.log("Inside success");
                        console.log(response.toJSON());
                    },
                    error: function(errorResponse) {
                        console.log(errorResponse)
                    }
                });
                this.listenTo(this.model, 'sync', this.render);
            }

        },

        track: function(e) {

            var $target = $(e.currentTarget);
            var item_name = $target.attr('data-name');
            var brand_name = $target.attr('data-brand');
            var calorieString = $target.attr('data-calories');
            var calorieAmt = parseFloat(calorieString);
            var foodid = $target.attr('data-id');

            var chooseday = '<form>What meal was this part of?: <select id="mySelect"> <option value="Breakfast">Breakfast</option><option value="Lunch">Lunch</option><option value="Dinner">Dinner</option><option value="Snack">Snack</option></select></form><button id="add" type="button">Add To Meal</button><button id="remove" type="button">Remove From Tracked</button>';

            var trackedhtml = '<li' + ' data-id=' + '"' + foodid + '"' + "<strong>" + item_name + '</strong>' + ' (' + brand_name + ')' + ' - ' + calorieAmt + ' Calories' + chooseday + '</li>'


            this.foods.create({
                id: foodid,
                title: item_name,
                brand: brand_name,
                calories: calorieAmt,
                html: trackedhtml
            });

        },

        rendertracked: function() {
            var total = 0;
            var trackedhtml = '';

            this.foods.each(function(food) {
                trackedhtml = trackedhtml + food.get('html');
                total += food.get('calories');
            }, this)
            this.$tracked.html(trackedhtml);
            this.$total.html(total);

        },
        renderbreakfast: function(){
            var total = 0;
            var breakfasthtml = '';

            this.breakfastlist.each(function(dish) {
                breakfasthtml = breakfasthtml + dish.get('html');
                total += dish.get('calories');
            }, this)
            $('#breakfast').html(breakfasthtml);
            $('#totalbreak span').html(total);


        },
        renderlunch: function(){
            var total = 0;
            var lunchtml = '';

            this.lunchlist.each(function(dish) {
                lunchtml = lunchtml + dish.get('html');
                total += dish.get('calories');
            }, this)
            $('#lunch').html(lunchtml);
            $('#totalunch span').html(total);
        },
        renderdinner: function(){
            var total = 0;
            var dinnerhtml = '';

            this.dinnerlist.each(function(dish) {
                dinnerhtml = dinnerhtml + dish.get('html');
                total += dish.get('calories');
            }, this)
            $('#dinner').html(dinnerhtml);
            $('#totaldinner span').html(total);
        },
        rendersnack: function(){
            var total = 0;
            var snackhtml = '';

            this.snacklist.each(function(dish) {
                snackhtml = snackhtml + dish.get('html');
                total += dish.get('calories');
            }, this)
            $('#snack').html(snackhtml);
            $('#totalsnack span').html(total);
        },

        render: function() {
            var terms = this.model;
            var wordhtml = '';
            terms.each(function(term) {
                wordhtml = wordhtml + '<li' + ' data-id=' + '"' + term.get('_id') + '"' + ' data-name=' + '"' + term.get('fields')['item_name'] + '"' + ' data-brand=' + '"' + term.get('fields')['brand_name'] + '"' + ' data-calories=' + '"' + term.get('fields')['nf_calories'] + '"' + '>' + "<strong>" + term.get('fields')["item_name"] + '</strong>' + ' (' + term.get('fields')["brand_name"] + ')' + ' - ' + term.get('fields')["nf_calories"] + ' Calories' + '</li>'
            }, this);
            this.$list.html(wordhtml);

        }
    });
    var app = new App();
});