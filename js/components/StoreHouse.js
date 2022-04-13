'use strict'
class StoreHouse extends WindowClass {
	constructor ( application, parent ) {
		super( application, parent );
		this.Title = "Склад. Журнал документов";
		this.Show();
	}

	// get Title() {return this.#wTitle;}

	Commands ( packet ) {
		// console.log(packet);
		switch ( packet.com ) {
			case 'skyline.apps.adapters':
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

