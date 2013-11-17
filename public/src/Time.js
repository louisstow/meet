var Time = Spineless.View.extend({
	template: [
		{id: "slider"},
		{id: "preview"},
		{id: "comment", tag: "input", type: "text", placeholder: "Leave a comment about this timeslot..."},
		{id: "clear", tag: "button", text: "X"}
	],

	defaults: {
		startTime: 0,
		endTime: 0,
		comment: ""
	},

	events: {
		"click clear": "removeFromParent"
	},

	init: function (opts) {
		this.tag = "Time";
		Time.super(this, "init", arguments);

		$(this.slider).dragslider({
			range: true,
			rangeDrag: true,
			min: 0,
			max: 48,
			values: opts.values || [18, 34],
			slide: this.onSlide.bind(this)
		});

		this.onSlide(null, {values: opts.values || [18, 34]});
		if (opts.comment) { 
			this.set("comment", opts.comment);
		}
	},

	onSlide: function (e, ui) {
		this.model.startTime = ui.values[0];
		this.model.endTime = ui.values[1];

		this.preview.textContent = Time.decimalToTime(ui.values[0]) + " – " + Time.decimalToTime(ui.values[1]);
	}
});

Time.decimalToTime = function (number) {
	number = number % 48;
	var hours = number / 2;
	var ampm = "am";
	var h = hours | 0, m;

	if (hours > 12) {
		h -= 12;
		ampm = "pm";
	}

	if (hours == 12) { ampm = "pm"; }

	if (h === 0) {
		h = 12;
	}

	m = (hours - (hours | 0) == 0) ? "00" : "30";

	return h + ":" + m + ampm;
};