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
		"click create": "onCreate",
		"click duplicate": "onDuplicate"
	},

	init: function () {
		Row.super(this, "init", arguments);
	},

	onCreate: function (e) {
		this.addChild(
			new Time({superview: $(e.target).siblings(".slots")[0]})
		);
	},

	onDuplicate: function () {
		// this.addChild(
		// 	new Time({superview: $(e.target).siblings(".slots")[0]})
		// );	
		this.emit("duplicate", this.model.day);
	},

	save: function () {
		var template = [];

		for (var i = 0; i < this.children.length; ++i) {
			template.push(this.children[i].model);
		}

		return template;
	},

	load: function (data) {
		for (var i = 0; i < data.length; ++i) {
			var d = data[i];
			
			var t = new Time({
				superview: this.slots,
				values: [d.startTime, d.endTime],
				comment: d.comment
			});

			this.addChild(t);
		}
	},

	render: function () {
		this.day.textContent = this.model.day;
	}
});

