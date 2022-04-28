'use strict'
class StoreHouse extends WindowClass {
	#transport;#documents = [];#documentsTable;#headers;#hiddens = ["id"];
	#csDocuments = [];
	#totalDocsSho;#selectedDocsSho;#totalDocs=0;#selectedDocs=0;
	#ifIssetFilters = [];
	#dicts = [];
	#filter = { start: undefined, end: undefined, search: undefined, units: [], statuses: [] };
	constructor ( application, parent ) {
		super( application, parent );
		this.#transport = this.Application.Transport;
		this.Title = "Склад. Журнал документов";
		this.#Init();
		this.#GetDicts();
	}
	#Init() {
		let periodJournal, addNewDoc;
		this.#documentsTable = new ComplexTable( this.Application, this.CBody);

		this.#documentsTable.DomObject.style.height = `calc(${ this.CBody.DomObject.clientHeight }px - 5px)`;

		this.Instruments.AddChilds([
			new Div().SetAttributes( {class: 'dex-app-window-filter'} ).AddChilds([
				periodJournal = new Div().SetAttributes({class: 'dex-filter-element'}).AddChilds([
					new I().SetAttributes({class: 'fas fa-calendar-alt'}),
				]),
				addNewDoc = new Div().SetAttributes({class: 'dex-filter-element'}).AddChilds([
					new I().SetAttributes({class: 'fas fa-plus-square'}),
				])
			])
		]);

		periodJournal.AddWatch(shoObject=> {
			shoObject.DomObject.addEventListener('click', event=> {
				if (this.#ifIssetFilters.indexOf('periodJournal') == -1) {
					this.#ifIssetFilters.push('periodJournal');
					let mw = new MessagesWindow(this.Application, this.Container, 'Задайте период журнала', {width: 300});
					let period = new Period( this.Application );
					if (typeof this.#filter.start !== 'undefined') period.StartPeriod = this.#filter.start;
					if (typeof this.#filter.end !== 'undefined') period.EndPeriod = this.#filter.end;
					mw.AddBody(period);
					mw.OnClose(()=> {
						this.#filter.start = period.StartPeriod;
						this.#filter.end = period.EndPeriod;
						this.#GetJournal();
					});
					mw.IfCloseForm(()=> {this.#ifIssetFilters.splice(this.#ifIssetFilters.indexOf('periodJournal'), 1);})
				}
			})
		});

		addNewDoc.AddWatch(sho=> {
			sho.DomObject.addEventListener("click", event=> this.#ShowDocumentsType())
		})

		this.Info.AddChilds([
			this.#totalDocsSho = new Span().SetAttributes( {class: 'dex-app-window-total'} ).Text( `Всего: ${ this.#totalDocs }` ),
			this.#selectedDocsSho = new Span().SetAttributes( {class: 'dex-app-window-selected'} ).Text( `Выделено: ${ this.#selectedDocs }` )
		]);
	}
	#DrawTable() {
		if (typeof this.#documentsTable !== 'undefined') this.#documentsTable.ClearHead();
		this.#headers = [ {name: 'id', title: 'id'}, {name: 'status', title: ''}, {name: 'type', title: 'Документ'}, {name: 'creater', title: 'Автор'}, {name: "sum", title: "Сумма"}, {name: 'date', title: 'Дата создания'} ];

		for (let i = 0; i < this.#headers.length; i++) {
			let newHeader = new Th().SetAttributes( ).Text( this.#headers[i].title ).AddWatch( ( el )=> {
				el.DomObject.addEventListener('click', ( event ) => {this.#documentsTable.SortByColIndex( el, i )})
			});
			if (this.#hiddens.indexOf(this.#headers[i].name) != -1) newHeader.SetAttributes({class: 'dnone'});
			this.#documentsTable.AddHead( newHeader );
		}

		// let statusesLink = [{status: }];
		for (let i=0; i< this.#documents.length; i++) {
			let attrs = {'uid_num': this.#documents[i].id};
			// if (this.#documents[i].status == 0) attrs.class = "bg-secondary bg-gradient";
			let row = new Tr().SetAttributes( attrs );
			for (let j=0; j<this.#headers.length; j++) {
				let td = new Td();
				if (this.#hiddens.indexOf(this.#headers[j].name) != -1) td.SetAttributes({class: 'dnone'});
				if (this.#headers[j].name == "status") {
					let iclass = "fas fa-file dex-app-window-status-create";
					if (this.#documents[i].status == 100) iclass = 'fas fa-times dex-app-window-status-todelete';
					else if (this.#documents[i].status == 102) iclass = 'fas fa-check dex-app-window-status-complited';
					new I({parent: td}).SetAttributes({class: iclass});
					// td.AddClass("dex-app-window-status-create");
				} else td.Text(this.#documents[i][this.#headers[j].name])
				row.AddChilds([td]);
			}
			row.AddWatch(sho=> sho.DomObject.addEventListener('dblclick', event=> this.#GetDataById(this.#documents[i].id)) );
			this.#documentsTable.AddRow( row );
			this.#csDocuments.push({id: this.#documents[i].id, sc: row});
		}
	}
	#SetTotalCnt ( list ) {
		if ( typeof list !== 'undefined' && list.length > 0 ) this.#totalDocs = list.length
		else this.#totalDocs = 0;
		this.#totalDocsSho.Text( `Всего: ${ this.#totalDocs }` );
	}
	#SetSelectedCnt ( rows ) {
		this.#selectedDocs = rows.length;
		this.#selectedDocsSho.Text( `Выделено: ${ this.#selectedDocs }` );
	}

	#ShowDocumentsType() {
		let mw = new MessagesWindow(this.Application, this.Container, 'Создание нового документа', {width: 300, height: 200}, true);
		let ul = new Ul().SetAttributes({class: "list-group"}).AddChilds(
			(()=> {
				let dict = this.#dicts.find(item=> item.name == 'docTypes');
				let arr = [];
				for (let i = 0; i < dict.list.length; i++) {
					let li = new Li().SetAttributes({class: "list-group-item doc-types"})
						.Text(dict.list[i].title)
						.AddWatch(sho=> sho.DomObject.addEventListener('dblclick', event=> this.#CreateNewDoc(dict.list[i].uid, mw)))
					arr.push(li);
				}
				return arr;
			})()
		)
		mw.AddBody(ul);
	}
	#ClearTable () {
		if (typeof this.#documentsTable !== 'undefined') this.#documentsTable.Clear();
	}
	#GetDicts() {
		let packet = { com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getNewDicts', dicts: ["docTypes"]}, hash: this.Hash};
		this.#transport.Get( packet );
	}
	#CreateNewDoc(id, mw) {
		console.log("id=> ", id);
		if (id == 3) { // поступление
			let ash = new ArrivalStoreHouse(this.Application, this.Parent );
			ash.OnClose(() => { this.#GetJournal() });
		}
		mw.Close();
	}
	#GetDataById(id) {
	}
	#GetJournal() {
		console.log("запросить данные журнала");
		let data = { action: 'getStoreJournal' };
		for ( let key in this.#filter ) {
			if ( typeof this.#filter[key] !== 'undefined') data[key] = this.#filter[key];
		}
		let packet = { com: 'skyline.apps.adapters', subcom: 'appApi', data: data, hash: this.Hash};
		this.#transport.Get( packet );
	}

	Commands ( packet ) {
		// console.log(packet);
		switch ( packet.com ) {
			case 'skyline.apps.adapters':
				switch ( packet.subcom ) {
					case 'appApi':
						switch ( packet.data.action ) {
							case "getStoreJournal":
								if (Array.isArray(packet.data.list)) this.#documents = packet.data.list;
								this.#ClearTable();
								this.#DrawTable();
							break;
							case 'getNewDicts':
								console.log("getNewDicts=> ", packet);
								if (Array.isArray(packet.data.list)) {
									this.#dicts = [];
									for (let i = 0; i < packet.data.list.length; i++) {
										this.#dicts.push(packet.data.list[i]);
									}
								}
								this.#GetJournal();
							break;
						}
					break;
				}
			break;
		}
	}
}

