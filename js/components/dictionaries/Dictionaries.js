'use strict'
class Dictionaries extends WindowClass {
	#parent;#container;#application;#hash;
	#transport;
	#newRecordForm;
	#table;#tableTitles;#tableData;#scDict = [];
	#actions;
	#contextMenu;
	constructor ( application, parent) {
		super( application, parent );
		this.#transport = application.Transport;
	}
	// ГЕТТЕРЫ
	get Table() {return this.#table;}
	get Transport() {return this.#transport;}
	get NewRecordForm() {return this.#newRecordForm;}
	get TableTitles() {return this.#tableTitles;}
	get TableData() {return this.#tableData;}
	get ScDict() {return this.#scDict;}

	set Table(table) {this.#table = table;}
	set TableData(data) {
		this.ClearTableBody();
		this.#tableData = data;
		this.#scDict = [];
		this.AddRowsInTable(data);
	}
	set NewRecordForm(sho) {this.#newRecordForm = sho;}
	set TableTitles(titles) {
		if (typeof this.#table !== 'undefined') this.#table.ClearHead();
		for (let i = 0; i < titles.length; i++) {
			let newHeader = new Th().SetAttributes( ).Text( titles[i].title ).AddWatch( ( el )=> {
				el.DomObject.addEventListener('click', ( event ) => {this.#table.SortByColIndex( el, i )})
			});
			this.#table.AddHead( newHeader );
		}
		this.#table.DomObject.style.height = `calc(${ this.CBody.DomObject.clientHeight }px - 5px)`;
		this.#tableTitles = titles;
	}
	set ScDict(dict) {this.#scDict = dict;}
	Init(data) {
		let arrInstruments = [
			{name: 'add', icon: 'fas fa-user-plus'},
			{name: 'delete', icon: 'fas fa-user-minus'}
		];
		this.CBody.AddChilds([
			this.#table = new ComplexTable( this.Application)
		])

		let filter;
		this.Instruments.AddChilds([filter = new Div().SetAttributes( {class: 'dex-app-window-filter'} )]);
		this.#actions = data.actions;
		if (typeof data.actions !== 'undefined') {
			for (let key in data.actions) {
				let item = arrInstruments.find(item => item.name == key);
				if (typeof item !== 'undefined') {
					filter.AddChilds([
						new Div().SetAttributes({class: 'dex-filter-element'}).AddChilds([
							new I().SetAttributes( {class: item.icon} ).AddWatch(sho => {
								sho.DomObject.addEventListener( 'click', event => data.actions[key]() )
							})
						])
					])
				}
			}
		}
	}
	GetDicts(dicts) {
		let d = [];
		if (Array.isArray(dicts)) d = d.concat(dicts);
		else {
			if (typeof dicts !== 'undefined' && dicts != '') d.push(dicts);
		}
		if (d.length > 0) this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getNewDicts', dicts: d}, hash: this.Hash});
	}
	ClearTableBody() {if (typeof this.#table !== 'undefined') this.#table.ClearBody();}
	ClearTable () {if (typeof this.#table !== 'undefined') this.#table.Clear();}
	CloseNewRecordForm() { this.#newRecordForm.DeleteObject();}
	AddRowInTable(data) {
		let row = new Tr().SetAttributes( {'uid_num': data.uid} );
		for (let j=0; j<this.#tableTitles.length; j++) {
			row.AddChilds([ new Td().Text( data[this.#tableTitles[j].name] ) ]);
			row.AddShadowCopy(this.#tableTitles[j].title, data[this.#tableTitles[j].name]);
		}
		let action;
		for (let key in this.#actions) {
			if (key == 'getRecordById') {
				action = this.#actions[key];
				break;
			}
		}
		row.AddWatch(sho=> sho.DomObject.addEventListener('dblclick', event=> action(data.uid)));
		this.#scDict.push({uid: data.uid, sc: row});
		this.#table.AddRow(row);
		return row;
	}
	AddRowsInTable(arrData) {
		for (let i=0; i< arrData.length; i++) {
			let row = this.AddRowInTable(arrData[i]);
		}
	}
	AddContextMenu(data) {
		this.CBody.AddChilds([
			this.#contextMenu = new ContextMenu( this.Application ).AddContextItems(data)
		]);
		this.#table.AddContextMenu( this.#contextMenu, this.#table.Parent );
		this.#contextMenu.AddWatcher({name: 'watchSelectContextMenuItem', func: ( item, selectedRows ) => { this.#GetSelectContextMenuItem( item, selectedRows )}});
		this.#table.AddWatcher({name: 'watchContextMenu', func: ( rows, coords ) => { this.#ContextMenu( rows, coords ) }});
	}
	#ContextMenu ( rows, coords ) {
		this.#table.ShowContextMenu( {
			x: coords.x,
			y: coords.y
		} );
	}
	#GetSelectContextMenuItem ( item, selectedRows ) {
		console.log('выбран элемент контекстного меню ', item, ' selectedRows=> ', selectedRows);
		let arr = [];
		selectedRows.map(item => arr.push(item.ShadowCopy.id));
		if (arr.length > 0) {
			this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'printAgreementUnits', units: arr, printForm: item.uid}, hash: this.Hash});
		}
	}
}

