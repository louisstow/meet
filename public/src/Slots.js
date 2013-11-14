var Slots = Spineless.View.extend({
	template: "slots",

	init: function() {
		Slots.super(this, "init", arguments);

		var days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

		for (var i = 0; i < days.length; ++i) {
			var r = new Row({day: days[i]});
			this.addChild(r);
		}
	}
});

var Row = Spineless.View.extend({
	defaults: {
		day: ""
	},

	template: [
		{tag: "tr", container: true, children: [
			{tag: "td", id: "day"},
			{tag: "td", id: "time"}
		]}
	],

	init: function () {
		Row.super(this, "init", arguments);

		this.addChild(new Time({superview: this.time}))
	},

	render: function () {
		this.day.textContent = this.model.day;
	}
});

var Time = Spineless.View.extend({
	template: [
		{id: "track", children: [
			{id: "startIndicator", className: "indicator"},
			{id: "endIndicator", className: "indicator"}
		]}
	],

	startPos: 0,
	lastPos: 0,
	downIndicator: null,
	size: 480,

	events: {
		"mousedown startIndicator": "startDrag",
		"mousedown endIndicator": "startDrag"
	},

	defaults: {
		startTime: 0,
		endTime: 0
	},

	init: function () {
		Time.super(this, "init", arguments);

		this.step = this.size / 48; //24 hours in 30min steps

		this.container.onselectstart = function () { return false; }
		this.container.onmousedown = function () { return false; }
		this.container.oncontextmenu = function () { return false; }
	},

	startDrag: function (e) {
		this.downIndicator = e.target;
		this.startPos = e.clientX;

		$(document).bind("mousemove", this.onMove.bind(this));
		$(document).bind("mouseup", this.endDrag.bind(this));
	},

	onMove: function (e) {
		var diffX = e.clientX - this.startPos;
		var currentPos = this.lastPos || 0;

		currentPos += diffX;
		this.lastPos = currentPos;
		currentPos = Math.max(0, Math.min(currentPos, this.size));
		currentPos = Math.floor(currentPos / this.step) * this.step;

		this.downIndicator.style.left = currentPos + "px";

		var percent = currentPos / 24;
		console.log(percent, currentPos)

		this.startPos = e.clientX;
		
	},

	endDrag: function () {
		$(document).unbind("mousemove");
		$(document).unbind("mouseup");
		this.lastPos = 0;
	}
});

s = new Slots({superview: document.body});