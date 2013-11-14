var days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

var Slots = Spineless.View.extend({
	template: "slots",

	events: {
		"click save-button": "onSave"
	},

	defaults: {
		"timezone": "0"
	},

	init: function() {
		Slots.super(this, "init", arguments);

		for (var i = 0; i < days.length; ++i) {
			console.log("RW")
			var r = new Row({day: days[i], superview: this.table});
			this.addChild(r);
		}

		var timezone = new Date().getTimezoneOffset();
		this.set("timezone", (-1 * (timezone / 60)).toFixed(1));
		$(this.timezone).val(this.model.timezone);

	},

	save: function () {
		var template = {};

		for (var i = 0; i < this.children.length; ++i) {
			template[days[i]] = this.children[i].save();
		}

		template['timezone'] = this.model.timezone;

		return template;
	},

	onSave: function () {
		this.post("/data/profiles/", {
			slots: JSON.stringify(this.save())
		});

		this.once("sync:post", function () {
			console.log("SYNC", arguments);
		})
	}
});

