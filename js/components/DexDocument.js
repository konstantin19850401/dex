'use strict'
class DexDocument extends DexBaseWindow {
	constructor (application, parent) {
		super(application, parent);
		this.#Initialization();
	};
	// ПРИВАТНЫЕ МЕТОДЫ
	#Initialization(data) {
		this.Container = new Div({parent: this.Parent}).SetAttributes({class: 'dex-table-container'}).AddChilds([
			new Div().Text("привет")
		]);
	};

	// ПУБЛИЧНЫЕ МЕТОДЫ
	Commands (packet) {
		console.log(packet);
		switch (packet.com) {
			case 'skyline.apps.adapters':
				switch (packet.subcom) {
					case 'appApi':
						switch (packet.data.action) {

						}
					break;
				}
			break;
		}
	};
}

