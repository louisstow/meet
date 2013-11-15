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

function toTimestamp (hours, day, timezone) {
	timezone = parseInt(timezone, 10) || 0;

	var h = hours / 2;
	var mins = (h - h | 0) == 0 ? 0 : 30;

	var now = new Date;
	var distance = daysHash[day] - now.getDay();
	
	//now.setTimezoneOffset(timezone * 1000)
	now.setDate(now.getDate() + distance);
	now.setHours(h | 0);
	now.setMinutes(mins);
	now.setSeconds(0);
	now.setHours(now.getHours() - timezone);

	return +now;
}

var Meeting = Spineless.View.extend({
	template: "events",

	profiles: {"52856d2b6d90e8a15e000003":{"Mon":[{"startTime":18,"endTime":34,"comment":""}],"Tue":[{"startTime":18,"endTime":34,"comment":""}],"Wed":[{"startTime":18,"endTime":34,"comment":""}],"Thu":[{"startTime":18,"endTime":34,"comment":""}],"Fri":[{"startTime":18,"endTime":34,"comment":""}],"Sat":[],"Sun":[],"timezone":"10.0"},"52856d3a6d90e8a15e000004":{"Mon":[{"startTime":18,"endTime":34,"comment":""}],"Tue":[{"startTime":18,"endTime":34,"comment":""}],"Wed":[{"startTime":18,"endTime":34,"comment":""}],"Thu":[{"startTime":18,"endTime":34,"comment":""}],"Fri":[{"startTime":18,"endTime":34,"comment":""}],"Sat":[],"Sun":[],"timezone":"-8.0"}},

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

					console.log(from, day, profile.timezone)
					normals[p].push({
						from: toTimestamp(from, day, profile.timezone),
						to: toTimestamp(to, day, profile.timezone)
					});
				}
			}
		}

		return normals;
	},

	crunch: function () {
		var normals = this.normalize();
		var results = [];

		for (var p in normals) {
			var slots = normals[p];

			for (var i = 0; i < slots.length; ++i) {
				for (var p2 in normals) {
					if (p2 == p) continue;

					var slots2 = normals[p2];

					for (var j = 0; j < slots2.length; ++j) {
						var timeslot1 = slots[i];
						var timeslot2 = slots2[j];

						console.log("TESTING", timeslot1, timeslot2, i, j, p2, p)
						// overlap!
						if (timeslot1.from < timeslot2.to &&
							timeslot1.to > timeslot2.from) {

							console.log("OVERLAP", timeslot1, timeslot2)

							var maxFrom = Math.max(timeslot1.from, timeslot2.from);
							// var maxTo = Math.max(timeslot1.to, timeslot2.to);
							// var minFrom = Math.min(timeslot1.from, timeslot2.from);
							var minTo = Math.min(timeslot1.to, timeslot2.to);


							results.push({
								from: maxFrom,
								to: minTo
							});
						}
					}
				}
			}

		}

		var dupes = {};
		var cleaned = [];
		for (var i = 0; i < results.length; ++i) {
			var key = results[i].from + "," + results[i].from;
			if (!dupes[key]) {
				cleaned.push(results[i]);
			}

			dupes[key] = true;
		}

		this.printResults(cleaned)

		return results;
	},

	printResults: function (results) {
		for (var i = 0; i < results.length; ++i) {
			var overlap = results[i];
			var from = new Date(overlap.from);
			from.setHours(from.getHours() + 10);
			var to = new Date(overlap.to);
			to.setHours(to.getHours() + 10);

			document.body.innerHTML += "<p>" + from.toString() + " - " + to.toString() + "</p>";	
		}
	}
});