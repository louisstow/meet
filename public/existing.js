if (window.localStorage) {
	if (localStorage['events']) {
		var events = JSON.parse(localStorage['events']);

		for (var id in events) {
			console.log("EVENT", id)
			document.getElementById("events").appendChild(
				Spineless.View.toDOM({tag: "li", children: [
					{tag: "a", href: "/event/" + id, text: id}
				]})
			);
		}
	}

	if (localStorage['profiles']) {
		var profiles = JSON.parse(localStorage['profiles']);

		for (var id in profiles) {
			var p = profiles[id];
			var name = p ? p + " (" + id + ")" : id;
			console.log("PRFILES", id, name)
			document.getElementById("profiles").appendChild(
				Spineless.View.toDOM({tag: "li", children: [
					{tag: "a", href: "/" + id, text: name}
				]})
			);
		}
	}
}

document.getElementById("clear-button").onclick = function () {
	if (window.localStorage) {
		delete localStorage['events'];
		delete localStorage['profiles'];
	}

	document.getElementById("events").innerHTML = "";
	document.getElementById("profiles").innerHTML = "";
}