var Snack = Backbone.Firebase.Collection.extend({
        model: Food,
        url: "https://blinding-torch-8751.firebaseio.com/snack"

    });