'use strict'
class Units extends Dictionaries {
	#units = [];#cbody;#unitsTable;
	constructor ( application, parent) {
		super( application, parent );
		this.#GetDict();
	}
	// ГЕТТЕРЫ

	// СЕТТЕРЫ

	// ПРИВАТНЫЕ МЕТОДЫ
	#Show( data ) {
		if (data.list.length > 0) this.#units = data.list;
		this.Container = new Div( {parent: this.Parent.Container} ).SetAttributes( {class: 'dex-dict'} ).AddChilds([
			new I().SetAttributes( {class: 'dex-configuration-close fas fa-window-close'} ).AddWatch(sho => {
				sho.DomObject.addEventListener( 'click', event => this.#Close() )
			}),
			new Span().SetAttributes( {class: 'dex-configuration-title'} ).Text( `Справочник отделений` ),
			this.#cbody = new Div().SetAttributes( {class: 'dex-contract-body row'} )
		]);
		this.#CreateList();
	}
	#CreateList() {
		// this.#unitsTable = new ComplexTable( this.Application ).AddWatcher({name: 'watchSelectedRows', func: ( rows )=> { this.#SetSelectedCnt( rows ) }});
		this.#unitsTable = new ComplexTable( this.Application, this.#cbody).AddWatcher({name: 'watchSelectedRows', func: ( rows )=> { this.#SetSelectedCnt( rows ) }});;
		let headers = [ {name: 'uid', title: 'id'}, {name: 'lastname', title: 'Фамилия'}, {name: 'firstname', title: 'Имя'}, {name: 'secondname', title: 'Отчество'}];
		this.#unitsTable.DomObject.style.height = `calc(${ this.#cbody.DomObject.clientHeight }px - 5px)`;

		for (let i = 0; i < headers.length; i++) {
			let newHeader = new Th().SetAttributes( ).Text( headers[i].title ).AddWatch( ( el )=> {
				el.DomObject.addEventListener('click', ( event ) => {this.#unitsTable.SortByColIndex( el, i )})
			});
			this.#unitsTable.AddHead( newHeader );
		}
		for (let i=0; i< this.#units.length; i++) {
			let row = new Tr();
			for (let j=0; j<headers.length; j++) {
				row.AddChilds([ new Td().Text( this.#units[i][headers[j].name] ) ]);
			}
			this.#unitsTable.AddRow( row );
		}
	}
	#SetSelectedCnt( rows ) {
		console.log("выбраны ", rows);
	}
	#Close () {
		this.Container.DeleteObject();
		this.Application.DeleteHash( this.Hash );
	};
	#GetDict() {
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

