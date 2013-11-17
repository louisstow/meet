var daysHash = {
	"Mon": 1,
	"Tue": 2,
	"Wed": 3,
	"Thu": 4,
	"Fri": 5,
	"Sat": 6,
	"Sun": 7
};

function formatDateRange (from, to) {
	return from.toString("ddd d MMM h:mmtt") + " – " + to.toString("h:mmtt");
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

function merge (obj1, obj2){
    var merged = {};
    for (var a in obj1) { merged[a] = obj1[a]; }
    for (var b in obj2) { merged[b] = obj2[b]; }
    return merged;
}

function makeKey (obj) {
	return [
		obj.from,
		obj.to,
		Object.keys(obj.comments).sort().join("|")
	].join("|");
}

var profileNames = {};

var Meeting = Spineless.View.extend({
	template: "events",

	profiles: {},

	defaults: {
		"profile": ""
	},

	events: {
		"click include-button": "onInclude",
		"click crunch-button": "onCrunch",
		"click save-button": "onSave"
	},

	init: function () {
		Meeting.super(this, "init", arguments);

		var id = location.pathname.substr(7);
		console.log(id)
		if (id) {
			var e = this.sync("get", "/data/events/_id/" + id);
			this.once("sync:" + e, function (events) {
				var ev = events[0];
				if (!ev) { return; }

				var profiles = JSON.parse(ev.profiles);

				for (var i = 0; i < profiles.length; ++i) {
					this.onInclude(profiles[i]);
				}
			})
		}
	},

	onInclude: function (profile) {
		if (typeof profile !== "string")
			profile = this.model.profile;

		var id = this.sync("get", "/data/profiles/_id/" + profile);
		this.once("sync:" + id, function (profiles) {
			var p = profiles[0];
			if (!p || !p.slots) { 
				return console.error("No response", profiles) 
			}
			
			this.profiles[profile] = (JSON.parse(p.slots))
			profileNames[profile] = p.name;

			var name = p.name ? p.name + " (" + profile + ")" : profile;
			Spineless.View.toDOM(
				{tag: "li", text: name}
			, this.participants)

			this.set("profile", "");
		});		
	},

	normalize: function () {
		var normals = [];

		for (var p in this.profiles) {
			var profile = this.profiles[p];

			for (var day in daysHash) {
				for (var i = 0; i < profile[day].length; ++i) {
					var from = profile[day][i].startTime;
					var to = profile[day][i].endTime;

					var c = {};
					c[p] = profile[day][i].comment;

					console.log(from, day, profile.timezone)
					normals.push({
						from: toTimestamp(from, day, profile.timezone),
						to: toTimestamp(to, day, profile.timezone),
						comments: c
					});
				}
			}
		}

		return normals;
	},

	crunch: function (normals) {
		var crunched = [];
		var changed = false;
		var duped = {};

		for (var i = 0; i < normals.length; ++i) {
			for (var j = 0; j < normals.length; ++j) {
				if (i == j) { continue; }

				var ts1 = normals[i];
				var ts2 = normals[j];

				// var key1 = makeKey(ts1);
				// var key2 = makeKey(ts2);

				if (ts1.from < ts2.to && ts1.to > ts2.from) {
					var maxFrom = Math.max(ts1.from, ts2.from);
					var minTo = Math.min(ts1.to, ts2.to);

					var normal = {
						from: maxFrom,
						to: minTo,
						comments: merge(ts1.comments, ts2.comments)
					};

					var key = makeKey(normal);
					console.log(key, duped[key])
					if (!duped[key]) {
						duped[key] = true;
						crunched.push(normal);
						changed = true;
					}
				}
			}
		}

		// nothing happened
		if (!crunched.length) { 
			crunched = normals;
		}

		return {
			normals: crunched,
			changed: changed
		};
	},

	doit: function () {
		var normals = this.normalize() || [];

		while (true) {
			var result = this.crunch(normals);
			normals = result.normals;

			if (!result.changed) { break; }
		}

		return normals
	},

	printResults: function (results) {
		console.log(results)
		for (var i = 0; i < results.length; ++i) {
			var overlap = results[i];

			this.addChild(new OverlapTable({
				superview: "results",
				overlap: overlap,
				profiles: this.profiles
			}))
		}
	},

	onCrunch: function () {
		this.removeChildren();

		var results = this.doit();
		this.printResults(results)
	},

	onSave: function () {
		this.post("/data/events/", {
			profiles: JSON.stringify(Object.keys(this.profiles))
		});

		this.once("sync:post", function (resp) {
			this.link.innerHTML = "Your unique link: <strong><a href='/event/" + resp[0]._id + "'>"+resp[0]._id+"</a></strong>"
		});
	}
});

var OverlapTable = Spineless.View.extend({
	init: function (opts) {
		this.tag = "OverlapTable";

		this.template = [
			{tag: "h3"},
			{tag: "table", children: []}
		]

		var o = opts.overlap;

		for (var p in o.comments) {
			var timezone = parseInt(opts.profiles[p].timezone, 10) || 0;

			var from = new Date(o.from);
			var to = new Date(o.to);
			var name = profileNames[p] || p;

			console.log("NAME", opts.profiles[p].name)
			from.setHours(from.getHours() + timezone);
			to.setHours(to.getHours() + timezone);

			this.template[0].text = Math.round((o.to - o.from) / 1000 / 60 / 60) + " hours overlap";

			this.template[1].children.push({
				tag: "tr", children: [
					{tag: "td", text: name},
					{tag: "td", text: formatDateRange(from, to)},
					{tag: "td", text: o.comments[p]}
				]
			});
		}

		OverlapTable.super(this, "init", arguments);
	}
})