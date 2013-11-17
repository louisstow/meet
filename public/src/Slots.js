var days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

var Slots = Spineless.View.extend({
	template: "slots",

	events: {
		"click save-button": "onSave"
	},

	defaults: {
		"timezone": "0",
		"name": ""
	},

	init: function() {
		Slots.super(this, "init", arguments);

		for (var i = 0; i < days.length; ++i) {
			var r = new Row({day: days[i], superview: this.table});
			this.addChild(r);
		}

		var timezone = new Date().getTimezoneOffset();
		this.set("timezone", (-1 * (timezone / 60)).toFixed(1));
		$(this.timezone).val(this.model.timezone);

		this.on("duplicate", this.onDuplicate);

		if (window.localStorage && localStorage.name) {
			this.set("name", localStorage.name);
		}

		var id = location.pathname.substr(1);
		if (id) {
			this.sync("get", "/data/profiles/_id/"+id);
			this.once("sync:get", function (profiles) {
				if (!profiles.length) {
					//error!
					return;
				}

				var profile = profiles[0];
				this.load(profile);
			});
		}
	},

	save: function () {
		var template = {};

		for (var i = 0; i < this.children.length; ++i) {
			template[days[i]] = this.children[i].save();
		}

		template['timezone'] = this.model.timezone;

		return template;
	},

	load: function (profile) {
		console.log(profile)
		var slots = JSON.parse(profile.slots);
		this.set("name", profile.name);

		for (var day in slots) {
			var index = days.indexOf(day);
			if (index === -1) { continue; }
			
			this.children[index].load(slots[day])
		}
	},

	onSave: function () {
		if (window.localStorage) {
			localStorage['name'] = this.model.name;
		}

		this.post("/data/profiles/", {
			slots: JSON.stringify(this.save()),
			name: this.model.name
		});

		this.once("sync:post", function (resp) {
			console.log("SYNC", arguments);
			this.link.innerHTML = "Your unique link: <strong><a href='/" + resp[0]._id + "'>"+resp[0]._id+"</a></strong>"
		})
	},

	onDuplicate: function (day) {
		var index = days.indexOf(day);
		var data = this.children[index].save();

		if (index + 1 >= days.length) { return; }

		this.children[index + 1].load(data);
	}
});

