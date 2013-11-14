var Row = Spineless.View.extend({
	defaults: {
		day: ""
	},

	template: [
		{tag: "tr", container: true, children: [
			{tag: "th", id: "day"},
			{tag: "td", className: "time", children: [
				{id: "create", className: "main-button", tag: "button", text: "Create Timeslot"},
				{id: "duplicate", className: "main-button", tag: "button", text: "Duplicate Down"},
				{id: "slots"}
			]}
		]}
	],

	events: {
		"click create": "onCreate"
	},

	init: function () {
		Row.super(this, "init", arguments);
		console.log("WTF")
		//this.addChild(new Time({superview: this.time}))
	},

	onCreate: function (e) {
		this.addChild(
			new Time({superview: $(e.target).siblings(".slots")[0]})
		);
	},

	save: function () {
		var template = [];

		for (var i = 0; i < this.children.length; ++i) {
			template.push(this.children[i].model);
		}

		return template;
	},

	render: function () {
		this.day.textContent = this.model.day;
	}
});

