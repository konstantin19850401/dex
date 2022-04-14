'use strict'
class StoreHouse extends WindowClass {
	#transport;#documents;#documentsTable;#headers;#hiddens = ["id"];
	#csDocuments = [];
	constructor ( application, parent ) {
		super( application, parent );
		this.#transport = this.Application.Transport;
		this.Title = "Склад. Журнал документов";
		this.#GetJournal();
	}
	#CreateList() {
		this.#documentsTable = new ComplexTable( this.Application, this.CBody);
		this.#headers = [ {name: 'id', title: 'id'}, {name: 'status', title: 'Отметка о проведении'}, {name: 'type', title: 'Тип документа'}, {name: 'creater', title: 'Создатель'}, {name: 'date', title: 'Дата создания'} ];
		this.#documentsTable.DomObject.style.height = `calc(${ this.CBody.DomObject.clientHeight }px - 5px)`;

		for (let i = 0; i < this.#headers.length; i++) {
			let newHeader = new Th().SetAttributes( ).Text( this.#headers[i].title ).AddWatch( ( el )=> {
				el.DomObject.addEventListener('click', ( event ) => {this.#documentsTable.SortByColIndex( el, i )})
			});
			if (this.#hiddens.indexOf(this.#headers[i].name) != -1) newHeader.SetAttributes({class: 'dnone'});
			this.#documentsTable.AddHead( newHeader );
		}
		this.#AddRows();
	}
	#AddRows() {
		for (let i=0; i< this.#documents.length; i++) {
			let attrs = {'uid_num': this.#documents[i].uid};
			if (this.#documents[i].status == 0) attrs.class = "bg-secondary bg-gradient";
			let row = new Tr().SetAttributes( attrs );
			for (let j=0; j<this.#headers.length; j++) {
				let td = new Td().Text(this.#documents[i][this.#headers[j].name]);
				if (this.#hiddens.indexOf(this.#headers[j].name) != -1) td.SetAttributes({class: 'dnone'});
				row.AddChilds([td]);
			}
			row.AddWatch(sho=> sho.DomObject.addEventListener('dblclick', event=> this.#GetDataById(this.#documents[i].uid)) );
			this.#documentsTable.AddRow( row );
			this.#csDocuments.push({uid: this.#documents[i].uid, sc: row});
		}
	}
	#GetDataById(id) {

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
								if (packet.data.list.length > 0) this.#documents = packet.data.list;
								if ( typeof this.#documentsTable === 'undefined' ) this.#CreateList();
								else this.#AddRows();
							break;
						}
					break;
				}
			break;
		}
	}
}

