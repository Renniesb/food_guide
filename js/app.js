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

	var terms = new SearchList();

	terms.fetch({
		success: function(response,xhr) {
			 console.log("Inside success");
			 console.log(response.toJSON());
		},
		ERROR: function (errorResponse) {
		       console.log(errorResponse)
		}
	});


	// The main view of the application
	var App = Backbone.View.extend({

		// Base the view on an existing element
		el: $('.container'),

		initialize: function(){

			this.listenTo(this.model, 'sync', this.render);

			// Cache these selectors
			// this.total = $('#total span');
			this.list = $('#listing');


		},

		render: function(){

			// Calculate the total order amount by agregating
			// the prices of only the checked elements
			terms.each(function(term){

				this.list.append("<li>"+ term.get('field[brand_name]')+"</li>");

			}, this);

		}
	});

});