'use strict'
class NewUnit {
	#cbody;#unitsTable;
	constructor ( application, parent, unit) {
		super( application, parent );
		if (typeof unit !== 'undefined') this.#GetDict();
		else {
			this.#CreateForm();

		}
	}
	// ГЕТТЕРЫ

	// СЕТТЕРЫ

	// ПРИВАТНЫЕ МЕТОДЫ
	#CreateForm() {
		if (data.list.length > 0) this.#units = data.list;
		this.Container = new Div( {parent: this.Parent.Container} ).SetAttributes( {class: 'dex-dict dysplay-none'} ).AddChilds([
			new I().SetAttributes( {class: 'dex-configuration-close fas fa-window-close'} ).AddWatch(sho => {
				sho.DomObject.addEventListener( 'click', event => this.#Close() )
			}),
			new Span().SetAttributes( {class: 'dex-configuration-title'} ).Text( `Справочник отделений` ),
			this.#cbody = new Div().SetAttributes( {class: 'dex-contract-body row'} )
		]);

		this.#CreateList();
	}
	#Show( data ) {
		this.Container.DomObject.style.dysplay = 'block';
	}
	#Close () {
		this.Container.DeleteObject();
		this.Application.DeleteHash( this.Hash );
	};
	#GetUnit() {
		let transport = this.Application.Transport;
		transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getDictUnits'}, hash: this.Hash});
	}



	//добавление нового элемента в справочник
	#AddNewElement(data) {
		if (typeof data !== 'undefined') {

		}
	}

	// ПУБЛИЧНЫЕ МЕТОДЫ
	Commands ( packet ) {
		console.log( packet );
		switch ( packet.com ) {
			case 'skyline.apps.adapters':
				switch ( packet.subcom ) {
					case 'appApi':
						switch ( packet.data.action ) {
							case 'getDictUnits':
								this.#Show(packet.data);							
							break;
						}
					break;
				}
			break;
		}
	}
}

