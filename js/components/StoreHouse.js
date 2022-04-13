'use strict'
class StoreHouse extends WindowClass {
	#transport;
	constructor ( application, parent ) {
		super( application, parent );
		this.#transport = this.Application.Transport;
		this.Title = "Склад. Журнал документов";
		this.#GetDicts();
		this.#GetJournal();
		// this.Show();
	}

	#GetJournal() {
		console.log("++++");
		this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getStoreJournal'}, hash: this.Hash});
	}
	// get Title() {return this.#wTitle;}

	Commands ( packet ) {
		// console.log(packet);
		switch ( packet.com ) {
			case 'skyline.apps.adapters':
				switch ( packet.subcom ) {
					case 'appApi':
						switch ( packet.data.action ) {
							case "getStoreJournal":
								console.log("ppppp=> ", packet);
							break;
						}
					break;
				}
			break;
		}
	}
}

