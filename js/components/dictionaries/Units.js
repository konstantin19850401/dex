'use strict'
class Units extends Dictionaries {
	#units = [];
	constructor ( application, parent) {
		super( application, parent );
		this.#GetDict();
	}
	// ГЕТТЕРЫ

	// СЕТТЕРЫ

	// ПРИВАТНЫЕ МЕТОДЫ
	#Show( data ) {
		let cbody;
		if (data.list.length > 0) this.#units = data.list;
		this.Container = new Div( {parent: this.Parent.Container} ).SetAttributes( {class: 'dex-configuration'} ).AddChilds([
			new I().SetAttributes( {class: 'dex-configuration-close fas fa-window-close'} ).AddWatch(sho => {
				sho.DomObject.addEventListener( 'click', event => this.#Close() )
			}),
			new Span().SetAttributes( {class: 'dex-configuration-title'} ).Text( `Справочник отделений` ),
			cbody = new Div().SetAttributes( {class: 'dex-contract-body row'} )
		]);
	}
	#Close () {
		this.Container.DeleteObject();
		this.Application.DeleteHash( this.Hash );
	};
	#GetDict() {
		let transport = this.Application.Transport;
		transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getDictUnits'}, hash: this.Hash});
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

