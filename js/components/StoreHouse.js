'use strict'
class StoreHouse extends WindowClass {
	#windowType = "store";
	constructor ( application, parent ) {
		super( application, parent );
		this.Title = "Склад. Журнал документов";
		// this.GetJournal();
	}
	get WindowType() {return this.#windowType;}
	#GetJournal() {
		let transport = this.Application.Transport;
		transport.Get( {com: 'skyline.apps.storeHouse', subcom: 'appApi', data: {action: 'getJournal'}, hash: this.Hash} );
	}

	Commands ( packet ) {
		// console.log(packet);
		switch ( packet.com ) {
			case 'skyline.apps.storeHouse':
				switch ( packet.subcom ) {
					case 'appApi':
						switch ( packet.data.action ) {

						}
					break;
				}
			break;
		}
	}
}

