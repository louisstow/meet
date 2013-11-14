var daysHash = {
	"Mon": 1,
	"Tue": 2,
	"Wed": 3,
	"Thu": 4,
	"Fri": 5,
	"Sat": 6,
	"Sun": 7
};

function convertDateToUTC (date) { 
	return new Date(
		date.getUTCFullYear(), 
		date.getUTCMonth(), 
		date.getUTCDate(), 
		date.getUTCHours(), 
		date.getUTCMinutes(), 
		date.getUTCSeconds()
	); 
}

var Meeting = Spineless.View.extend({
	template: "events",

	profiles: {},

	defaults: {
		"profile": ""
	},

	events: {
		"click include-button": "onInclude"
	},

	init: function () {
		Meeting.super(this, "init", arguments);
	},

	onInclude: function () {
		console.log(this.model.profile)
		this.sync("get", "/data/profiles/_id/" + this.model.profile);
		this.once("sync:get", function (profiles) {
			var profile = profiles[0];
			this.profiles[this.model.profile] = (JSON.parse(profile.slots))
		})
	},

	normalize: function () {
		var normals = {};
		var now = new Date;

		for (var p in this.profiles) {
			var profile = this.profiles[p];
			normals[p] = [];

			for (var day in daysHash) {
				for (var i = 0; i < profile[day].length; ++i) {
					var from = profile[day][i].startTime;
					var to = profile[day][i].endTime;

					//fuck this
					// normals[p].push({
					// 	from: 0,
					// 	to: 0
					// });
				}
			}
		}
	},

	crunch: function () {
		for (var p in this.profiles) {
			var profile = this.profiles[p];

		}
	}
});