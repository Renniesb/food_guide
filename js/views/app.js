    var App = Backbone.View.extend({

        el: 'body',

        events: {
            "input #searchBox": "prepCollection",
            "click #listing li": "track",
            "click #add": "addClicked",
            "click #remove": "removeClicked"

        },

        initialize: function() {
            //set up variables used more globally
            this.foodid = "";
            this.model = new SearchList();
            this.foods = new AllFoods();
            this.breakfastlist = new Breakfast();
            this.lunchlist = new Lunch();
            this.dinnerlist = new Dinner();
            this.snacklist = new Snack();
            this.$total = $('#total span');
            this.$list = $('#listing');
            this.$instruct = $('#instruct');
            this.$tracked = $('#tracked');
            //code to respond to changes in the collections
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
            //code to not fire off a request right away
            this.prepCollection = _.debounce(this.prepCollection, 1000);

        },

        addClicked: function(e) {
            var $target = $(e.currentTarget).parent();
            var $selected = $target.find('#mySelect').val();
            var location = $target.attr('data-id');
            //tracks the model selected in all of the collections
            var currentFood = this.foods.get(location);
            var currentBreakfast = this.breakfastlist.get(location);
            var currentLunch = this.lunchlist.get(location);
            var currentDinner = this.dinnerlist.get(location);
            var currentSnack = this.snacklist.get(location);
            //provides the html for the view
            var currenthtml = currentFood.get('html');

            switch ($selected) {

                //case statements make sure model is added to the proper meal collection
                //if elseif statements insure that no other collection except tracked has the same id-No duplicates
                case 'Breakfast':
                    this.breakfastlist.create(currentFood);

                    if (currentLunch) {
                        this.lunchlist.remove(currentLunch);
                    } else if (currentDinner) {
                        this.dinnerlist.remove(currentDinner);
                    } else if (currentSnack) {
                        this.snacklist.remove(currentSnack);
                    }
                    break;
                case 'Lunch':
                    this.lunchlist.create(currentFood)

                    if (currentBreakfast) {
                        this.breakfastlist.remove(currentBreakfast);
                    } else if (currentDinner) {
                        this.dinnerlist.remove(currentDinner);
                    } else if (currentSnack) {
                        this.snacklist.remove(currentSnack);
                    }
                    break;
                case 'Dinner':
                    this.dinnerlist.create(currentFood);

                    if (currentBreakfast) {
                        this.breakfastlist.remove(currentBreakfast);
                    } else if (currentLunch) {
                        this.lunchlist.remove(currentLunch);
                    } else if (currentSnack) {
                        this.snacklist.remove(currentSnack);
                    }
                    break;
                case 'Snack':
                    this.snacklist.create(currentFood);

                    if (currentBreakfast) {
                        this.breakfastlist.remove(currentBreakfast);
                    } else if (currentLunch) {
                        this.lunchlist.remove(currentLunch);
                    } else if (currentDinner) {
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
            //tracks the models in all of the collections
            var modelRemoved = this.foods.get(removeid);
            var breakfastRemoved = this.breakfastlist.get(removeid);
            var lunchRemoved = this.lunchlist.get(removeid);
            var dinnerRemoved = this.dinnerlist.get(removeid);
            var snackRemoved = this.snacklist.get(removeid);

            this.foods.remove(modelRemoved);
            //remove the model if it exists in a collection
            if (breakfastRemoved) {
                this.breakfastlist.remove(breakfastRemoved);
            } else if (lunchRemoved) {
                this.lunchlist.remove(lunchRemoved);
            } else if (dinnerRemoved) {
                this.dinnerlist.remove(dinnerRemoved);
            } else if (snackRemoved) {
                this.snacklist.remove(snackRemoved);
            }
        },

        prepCollection: function() {
            var name = $('input').val();
            var newUrl = "https://api.nutritionix.com/v1_1/search/" + name + "?results=0%3A20&cal_min=0&cal_max=50000&fields=item_name,brand_name,item_id,nf_calories&appId=26952a04&appKey=33b9262901d0068d4895736b5af19805";

            //populate the collection with models and provide instruction html
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
            this.foodid = this.foodid + "1";

            var chooseday = '<form>What meal was this part of?: <select id="mySelect"> <option value="Breakfast">Breakfast</option><option value="Lunch">Lunch</option><option value="Dinner">Dinner</option><option value="Snack">Snack</option></select></form><button id="add" type="button">Add To Meal</button><button id="remove" type="button">Remove From Tracked</button>';

            var trackedhtml = '<li' + ' data-id=' + '"' + this.foodid + '"' + "<strong>" + item_name + '</strong>' + ' (' + brand_name + ')' + ' - ' + calorieAmt + ' Calories' + chooseday + '</li>'


            this.foods.create({
                id: this.foodid,
                title: item_name,
                brand: brand_name,
                calories: calorieAmt,
                html: trackedhtml
            });

        },

        rendertracked: function() {
            var total = 0;
            var trackedhtml = '';
            //resets the foodid variable when collection is empty to prevent long id names
            if (this.foods.length == 0) {
                this.foodid = ""
            };

            this.foods.each(function(food) {
                trackedhtml = trackedhtml + food.get('html');
                total += food.get('calories');
            }, this)
            this.$tracked.html(trackedhtml);
            this.$total.html(total);

        },
        renderbreakfast: function() {
            var total = 0;
            var breakfasthtml = '';

            this.breakfastlist.each(function(dish) {
                breakfasthtml = breakfasthtml + dish.get('html');
                total += dish.get('calories');
            }, this)
            $('#breakfast').html(breakfasthtml);
            $('#totalbreak span').html(total);


        },
        renderlunch: function() {
            var total = 0;
            var lunchtml = '';

            this.lunchlist.each(function(dish) {
                lunchtml = lunchtml + dish.get('html');
                total += dish.get('calories');
            }, this)
            $('#lunch').html(lunchtml);
            $('#totalunch span').html(total);
        },
        renderdinner: function() {
            var total = 0;
            var dinnerhtml = '';

            this.dinnerlist.each(function(dish) {
                dinnerhtml = dinnerhtml + dish.get('html');
                total += dish.get('calories');
            }, this)
            $('#dinner').html(dinnerhtml);
            $('#totaldinner span').html(total);
        },
        rendersnack: function() {
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
                wordhtml = wordhtml + '<li' + ' data-name=' + '"' + term.get('fields')['item_name'] + '"' + ' data-brand=' + '"' + term.get('fields')['brand_name'] + '"' + ' data-calories=' + '"' + term.get('fields')['nf_calories'] + '"' + '>' + "<strong>" + term.get('fields')["item_name"] + '</strong>' + ' (' + term.get('fields')["brand_name"] + ')' + ' - ' + term.get('fields')["nf_calories"] + ' Calories' + '</li>'
            }, this);
            this.$list.html(wordhtml);

        }
    });
    var app = new App();