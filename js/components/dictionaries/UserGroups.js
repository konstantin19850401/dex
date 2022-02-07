'use strict'
class UserGroups extends Dictionaries {
	#groups = [];#cbody;#groupsTable;#transport;#newElement;#headers;
	#scGroups = [];
	constructor ( application, parent) {
		super( application, parent );
		this.#transport = this.Application.Transport;
		this.#GetDict();
	}
	// ГЕТТЕРЫ

	// СЕТТЕРЫ

	// ПРИВАТНЫЕ МЕТОДЫ
	#Show( data ) {
		this.Container = new Div( {parent: this.Parent.Container} ).SetAttributes( {class: 'dex-dict'} ).AddChilds([
			new I().SetAttributes( {class: 'dex-configuration-close fas fa-window-close'} ).AddWatch(sho => {
				sho.DomObject.addEventListener( 'click', event => this.#Close() )
			}),
			new I().SetAttributes( {class: 'dex-configuration-delete fas fa-user-minus'} ).AddWatch(sho => {
				sho.DomObject.addEventListener( 'click', event => this.#DeleteElement() )
			}),
			new I().SetAttributes( {class: 'dex-configuration-add fas fa-user-plus'} ).AddWatch(sho => {
				sho.DomObject.addEventListener( 'click', event => this.#AddNewElement() )
			}),
			new Span().SetAttributes( {class: 'dex-configuration-title'} ).Text( `Справочник групп пользователей` ),
			this.#cbody = new Div().SetAttributes( {class: 'dex-contract-body row'} )
		]);
		this.#CreateList();
	}
	#CreateList() {
		// this.#unitsTable = new ComplexTable( this.Application, this.#cbody ).AddWatcher({name: 'watchSelectedRows', func: ( rows )=> { this.#SetSelectedCnt( rows ) }});
		this.#groupsTable = new ComplexTable( this.Application, this.#cbody);
		this.#headers = [ {name: 'user_group_id', title: 'id'}, {name: 'name', title: 'Наименование'}];
		this.#groupsTable.DomObject.style.height = `calc(${ this.#cbody.DomObject.clientHeight }px - 5px)`;

		for (let i = 0; i < this.#headers.length; i++) {
			let newHeader = new Th().SetAttributes( ).Text( this.#headers[i].title ).AddWatch( ( el )=> {
				el.DomObject.addEventListener('click', ( event ) => {this.#groupsTable.SortByColIndex( el, i )})
			});
			this.#groupsTable.AddHead( newHeader );
		}
		this.#AddRows();
	}
	#AddRows() {
		for (let i=0; i< this.#groups.length; i++) {
			let row = new Tr().SetAttributes( {'uid_num': this.#groups[i].uid} );
			for (let j=0; j<this.#headers.length; j++) {
				row.AddChilds([ new Td().Text( this.#groups[i][this.#headers[j].name] ) ]);
			}
			row.AddWatch(sho=> sho.DomObject.addEventListener('dblclick', event=> this.#GetDataById(this.#groups[i].uid)) );
			this.#groupsTable.AddRow( row );
			this.#scGroups.push({uid: this.#groups[i].uid, sc: row});
		}
	}
	#Close () {
		this.Container.DeleteObject();
		this.Application.DeleteHash( this.Hash );
	};
	#CloseNewElement() {
		this.#newElement.DeleteObject();
	}
	#GetDataById(id) {
		// console.log("id=> ", id);
		if (id) this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getDictUnitsSingleId', id: id}, hash: this.Hash});
	}
	#GetDict() {
		this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getGroupsUsers'}, hash: this.Hash});
	}
	//удаление елемента
	#DeleteElement() {
		let dels = [];
		let arr = this.#groupsTable.SelectedRows;
		let acslength = 300;
		if (arr.length > 0) {
			if (arr.length < acslength) {
				arr.map(item=> dels.push(item.Attributes.uid_num));
				let c = confirm(`Вы правда желаете удалить выделенные поля? uids=> [${dels}]`);
				if (c) {
					// console.log( 'dels=> ', dels);
					this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'delElementsFromDict', dict: 'units', elements: dels}, hash: this.Hash});
				}
			} else {
				alert(`Вы можете удалить не более ${acslength} элементов`);
			}
		}
	}
	//добавление нового элемента в справочник
	#AddNewElement(element) {
		let formHash = this.Application.Toolbox.GenerateHash;
		let domTitle;
		let fields = {
			user_group_id: 'id группы',
			name: 'Наименование',
			apps: 'Приложения',
			status: 'Статус'
		};
		// console.log(this.Application);
		this.#newElement = new Div( {parent: this.Parent.Container} ).SetAttributes( {class: 'dex-dict'} ).AddChilds([
			new I().SetAttributes( {class: 'dex-configuration-close fas fa-window-close'} ).AddWatch(sho => {
				sho.DomObject.addEventListener( 'click', event => this.#CloseNewElement() )
			}),
			domTitle = new Span().SetAttributes( {class: 'dex-configuration-title'} ).Text( `Добавление нового элемента` ),
			this.#cbody = new Div().SetAttributes( {class: 'dex-contract-body row'} ),
			new Div().SetAttributes( {class: 'dex-configuration-footer'} ).AddChilds([
				new Button().SetAttributes( {class: 'dex-configuration-info-btn'} ).Text( typeof element !== 'undefined' ? 'Редактировать' : 'Создать').AddWatch((el)=> {
					el.DomObject.addEventListener( 'click', ()=> {
						typeof element !== 'undefined' ? this.#EditUnit(formHash, fields) : this.#CreateNewUnit(formHash, fields);
					} )
				})
			])
		]);
		let section = new Div( {parent: this.#cbody} ).SetAttributes( );
		let sel = ['status'];
		for (let key in fields) {
			// console.log('key => ', key);
			if ( key == 'uid' && typeof element !== 'undefined' || key != 'uid') {
				let inputAttrs = {class: `col-sm-12`, type: 'text', id: `${key}_${formHash}`};
				if (key == 'uid' && typeof element !== 'undefined') inputAttrs.disabled = true;
				new Div( {parent: section} ).SetAttributes( {class: 'form-group row', name: key} ).AddChilds([
					new Label().SetAttributes( {class: 'col-sm-3 col-form-label'} ).Text(fields[key]),
					new Div().SetAttributes( {class: 'col-sm-9'} ).AddChilds([
						(()=> {
							if (sel.indexOf(key) != -1) {
								// console.log('key => ', key, ' element.uid=> ', element.uid);
								let options = [];
								let d = [];
								if (key == 'status') d = [{val: 0, text: 'Заблокировано'}, {val: 1, text: 'Активно'}];
								for (let i = 0; i < d.length; i++) {
									let option = new Option().SetAttributes({'value':d[i].val}).Text(d[i].text);
									if (key == 'status' && typeof element !== 'undefined' && element.status == d[i].val) option.SetAttributes({'selected': 'selected'});
									options.push(option);
								}
								let select = new Select().SetAttributes( {class: 'col-sm-12', id: `${key}_${formHash}`} ).AddChilds(options);
								return select;
							} else {
								return new Input().SetAttributes( inputAttrs )
							}
						})()
					])
				])
			}
		}

		if (typeof element !== 'undefined') {
			domTitle.Text(`Редактирование элемента. UID = [${element.uid}]`);
			for (let key in element) {
				// console.log('key=> ', key);
				if (typeof fields[key] !== 'undefined' && key != 'status') document.getElementById(`${key}_${formHash}`).value = element[key];
			}
		}
	}
	#EditUnit(formHash, fields) {
		console.log('Редактировать');
		let data = {};
		for (let key in fields) {
			let element = document.getElementById(`${key}_${formHash}`);
			// console.log('element=> ', element);
			if (typeof element !== 'undefined') {
				data[key] = element.value;
			}
		}
		this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'editUnit', fields: data}, hash: this.Hash});
	}
	#CreateNewUnit(formHash, fields) {
		console.log('создание нового элемента ', formHash);
		let data = {};
		for (let key in fields) {
			if (key != 'uid') {
				let element = document.getElementById(`${key}_${formHash}`);
				if ( typeof element !== 'undefined' ) {
					data[key] = element.value;
				}
			}
		}
		this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'createNewUnit', fields: data}, hash: this.Hash});
	}
	// ПУБЛИЧНЫЕ МЕТОДЫ
	Commands ( packet ) {
		console.log( packet );
		switch ( packet.com ) {
			case 'skyline.apps.adapters':
				switch ( packet.subcom ) {
					case 'appApi':
						switch ( packet.data.action ) {
							case 'getGroupsUsers':
							if (packet.data.list.length > 0) this.#groups = packet.data.list;
							if ( typeof this.#groupsTable === 'undefined' ) this.#Show(packet.data);
							else this.#AddRows();
							console.log('список групп ');
							break;
						}
					break;
				}
			break;
		}
	}
}

