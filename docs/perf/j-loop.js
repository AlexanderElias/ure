
Jenie.component({
	name: 'j-loop',
	html: '\n\t\t<style>\n\t\t\thtml, body, j-loop {\n\t\t\t\twidth: 100%;\n\t\t\t\tdisplay: block;\n\t\t\t}\n\t\t\t.box {\n\t\t\t\tmargin: 5px;\n\t\t\t\tpadding: 5px;\n\t\t\t\t/*background: grey;*/\n\t\t\t\tdisplay: inline-block;\n\t\t\t}\n\t\t</style>\n\n\t\t<div j-each-item="items">\n\t\t\t<div class="box">\n\t\t\t\t<div j-text="item.number"></div>\n\t\t\t\t<input type="text" j-value="item.number">\n\t\t\t</div>\n\t\t\t<!--<button j-on-click="click">\n\t\t\t\t<div j-text="item.number"></div>\n\t\t\t</button>-->\n\t\t</div>\n\t',
	model: {
		items: [{ number: 0 }]
	},
	// events: {
	// 	click: function (e) {
	// 		console.log(e);
	// 		console.log('click');
	// 	}
	// },
	created: function created() {
		var self = this;

		window.self = self;

		// setTimeout(function () {
		// 	self.model.items.push({ number: self.model.items.length });
		// 	setTimeout(function () {
		// 		self.model.items.pop();
		// 	}, 1000);
		// }, 1000);

		setTimeout(function () {

			var increaseInterval = setInterval(function () {

				if (self.model.items.length === 2600) {
					// 2600
					clearInterval(increaseInterval);

					var decreaseInterval = setInterval(function () {

						if (self.model.items.length === 5) {
							clearInterval(decreaseInterval);
						}

						self.model.items.pop();
					}, 0);
				}

				self.model.items.push({ number: self.model.items.length });
			}, 0);
		}, 1000);
	}
});