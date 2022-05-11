'use strict'
class UserGroups extends Dictionaries {
	#groups = [];#cbody;#groupsTable;#transport;#newElement;#headers;#apps = [];
	#scGroups = [];
	constructor ( application, parent) {
		super( application, parent );
		this.Title = "Справочник групп пользователей";
		this.#transport = this.Application.Transport;
		// this.#GetApps();

		this.Init({actions: {
			add: ()=> {this.#AddNewElement()},
			delete: ()=> {this.#DeleteElement()},
			getRecordById: (id)=> {this.#GetDataById(id)}
		}});
		this.#InitTitles();
		this.GetDicts('apps');
		// this.#GetDict();
	}
	// ГЕТТЕРЫ

	// СЕТТЕРЫ

	// ПРИВАТНЫЕ МЕТОДЫ
	// #Show( data ) {
	// 	this.Container = new Div( {parent: this.Parent.Container} ).SetAttributes( {class: 'dex-dict'} ).AddChilds([
	// 		new I().SetAttributes( {class: 'dex-configuration-close fas fa-window-close'} ).AddWatch(sho => {
	// 			sho.DomObject.addEventListener( 'click', event => this.#Close() )
	// 		}),
	// 		new I().SetAttributes( {class: 'dex-configuration-delete fas fa-user-minus'} ).AddWatch(sho => {
	// 			sho.DomObject.addEventListener( 'click', event => this.#DeleteElement() )
	// 		}),
	// 		new I().SetAttributes( {class: 'dex-configuration-add fas fa-user-plus'} ).AddWatch(sho => {
	// 			sho.DomObject.addEventListener( 'click', event => this.#AddNewElement() )
	// 		}),
	// 		new Span().SetAttributes( {class: 'dex-configuration-title'} ).Text( `Справочник групп пользователей` ),
	// 		this.#cbody = new Div().SetAttributes( {class: 'dex-contract-body row'} )
	// 	]);
	// 	this.#CreateList();
	// }
	// #CreateList() {
	// 	// this.#unitsTable = new ComplexTable( this.Application, this.#cbody ).AddWatcher({name: 'watchSelectedRows', func: ( rows )=> { this.#SetSelectedCnt( rows ) }});
	// 	this.#groupsTable = new ComplexTable( this.Application, this.#cbody);
	// 	this.#headers = [ {name: 'user_group_id', title: 'id'}, {name: 'name', title: 'Наименование'}];
	// 	this.#groupsTable.DomObject.style.height = `calc(${ this.#cbody.DomObject.clientHeight }px - 5px)`;

	// 	for (let i = 0; i < this.#headers.length; i++) {
	// 		let newHeader = new Th().SetAttributes( ).Text( this.#headers[i].title ).AddWatch( ( el )=> {
	// 			el.DomObject.addEventListener('click', ( event ) => {this.#groupsTable.SortByColIndex( el, i )})
	// 		});
	// 		this.#groupsTable.AddHead( newHeader );
	// 	}
	// 	this.#AddRows();
	// }
	// #AddRows() {
	// 	for (let i=0; i< this.#groups.length; i++) {
	// 		let row = new Tr().SetAttributes( {'uid_num': this.#groups[i].user_group_id} );
	// 		for (let j=0; j<this.#headers.length; j++) {
	// 			row.AddChilds([ new Td().Text( this.#groups[i][this.#headers[j].name] ) ]);
	// 		}
	// 		row.AddWatch(sho=> sho.DomObject.addEventListener('dblclick', event=> this.#GetDataById(this.#groups[i].user_group_id)) );
	// 		this.#groupsTable.AddRow( row );
	// 		this.#scGroups.push({uid: this.#groups[i].user_group_id, sc: row});
	// 	}
	// }
	// #Close () {
	// 	this.Container.DeleteObject();
	// 	this.Application.DeleteHash( this.Hash );
	// };
	#InitTitles( data ) {
		this.#headers = [ {name: 'uid', title: 'id'}, {name: 'name', title: 'Группа'}, {name: 'apps', title: 'Доступные приложения'}, {name: 'status', title: 'Статус'}];
		this.TableTitles = this.#headers;
		// this.#AddRows();
	}
	#CloseNewElement() {
		this.#newElement.DeleteObject();
	}
	#GetDataById(id) {
		console.log(" запрос группы id=> ", id);
		if ( typeof id !== 'undefined') this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getDictGroupsSingleId', id: id}, hash: this.Hash});
	}
	#GetDict() {
		this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getGroupsUsers'}, hash: this.Hash});
	}
	// #GetApps() {
	// 	this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getAppDictById', dict: 'apps'}, hash: this.Hash});
	// }
	//удаление елемента
	#DeleteElement() {
		let dels = [];
		let arr = this.Table.SelectedRows;;
		let acslength = 300;
		if (arr.length > 0) {
			if (arr.length < acslength) {
				arr.map(item=> dels.push(item.Attributes.uid_num));
				let c = confirm(`Вы правда желаете удалить выделенные поля? uids=> [${dels}]`);
				if (c) {
					this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'delElementsFromDict', dict: 'userGroups', elements: dels}, hash: this.Hash});
				}
			} else {
				alert(`Вы можете удалить не более ${acslength} элементов`);
			}
		}
	}
	//добавление нового элемента в справочник
	#AddNewElement(element) {
		console.log("element=> ", element);
		let formHash = this.Application.Toolbox.GenerateHash;
		let domTitle;
		let fields = {
			user_group_id: 'id',
			name: 'Группа',
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
		let sel = ['status', 'apps'];
		for (let key in fields) {
			// console.log('key => ', key);
			if ( key == 'user_group_id' && typeof element !== 'undefined' || key != 'user_group_id') {
				let inputAttrs = {class: `col-sm-12`, type: 'text', id: `${key}_${formHash}`};
				if (key == 'user_group_id' && typeof element !== 'undefined') inputAttrs.disabled = true;
				new Div( {parent: section} ).SetAttributes( {class: 'form-group row', name: key} ).AddChilds([
					new Label().SetAttributes( {class: 'col-sm-3 col-form-label'} ).Text(fields[key]),
					new Div().SetAttributes( {class: 'col-sm-9'} ).AddChilds([
						(()=> {
							if (sel.indexOf(key) != -1) {
								let options = [];
								let d = [];
								if (key == 'status') d = [{val: 0, text: 'Заблокировано'}, {val: 1, text: 'Активно'}];
								else if (key == 'apps') {
									console.log('apps=> ', this.#apps);
									this.#apps.map(item=> item.status == 1 ? d.push({val: item.uid, text: item.title}) : '');

								};
								console.log("d=> ", d);
								for (let i = 0; i < d.length; i++) {
									let option = new Option().SetAttributes({'value':d[i].val}).Text(d[i].text);
									if (key == 'status' && typeof element !== 'undefined' && element.status == d[i].val) option.SetAttributes({'selected': 'selected'});
									if (key == 'apps' && typeof element !== 'undefined' ) {
										console.log("зашли => ", element);
										let apps = JSON.parse(element.apps);
										for (let k = 0; k < apps.length; k++) {
											if (apps[k] == d[i].val) {
												option.DomObject.selected = true;
												break;
											}
										}
									}
									options.push(option);
								}
								let select;
								if (key == 'apps') {
									select = new Select().SetAttributes( {class: 'col-sm-12', id: `${key}_${formHash}`, multiple: true} ).AddChilds(options);
								} else select = new Select().SetAttributes( {class: 'col-sm-12', id: `${key}_${formHash}`} ).AddChilds(options);
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
			domTitle.Text(`Редактирование элемента. UID = [${element.user_group_id}]`);
			for (let key in element) {
				// console.log('key=> ', key);
				if (typeof fields[key] !== 'undefined' && key != 'status' && key != 'apps') document.getElementById(`${key}_${formHash}`).value = element[key];
			}
		}
	}
	#EditUnit(formHash, fields) {
		// console.log('Редактировать');
		let data = {};
		for (let key in fields) {
			let elt;
			if (key != 'apps') {
				elt = document.getElementById(`${key}_${formHash}`);
				if (typeof elt !== 'undefined') data[key] = elt.value;
			} else {
				elt = document.querySelectorAll(`#${key}_${formHash} option:checked`);
				if (typeof elt !== 'undefined') data[key] = Array.from(elt).map(el => el.value);
			}
		}
		console.log('data=> ', data);
		this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'editGroup', fields: data}, hash: this.Hash});
	}
	#CreateNewUnit(formHash, fields) {
		// console.log('создание нового элемента ', formHash, ' fields=> ', fields);
		let data = {};
		for (let key in fields) {
			if (key != 'user_group_id') {
				let elt;
				if (key != 'apps') {
					elt = document.getElementById(`${key}_${formHash}`);
					if (typeof elt !== 'undefined') data[key] = elt.value;
				} else {
					elt = document.querySelectorAll(`#${key}_${formHash} option:checked`);
					if (typeof elt !== 'undefined') data[key] = Array.from(elt).map(el => el.value);
				}
			}
		}
		this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'createNewUserGroup', fields: data}, hash: this.Hash});
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
								// if (packet.data.list.length > 0) this.#groups = packet.data.list;
								// if ( typeof this.#groupsTable === 'undefined' ) this.#Show(packet.data);
								// else this.#AddRows();
								if (packet.data.list.length > 0) this.TableData = packet.data.list;
							break;
							case 'getDictGroupsSingleId':
								this.#AddNewElement(packet.data.list[0]);
								// console.log('getDictGroupsSingleId=> ', packet);
							break;
							case 'getAppDictById':
								// if (packet.data.list.length > 0) {
								// 	packet.data.list.map(item => this.#apps.push(item))
								// }
								// this.#GetDict();
							break;
							case 'createNewUserGroup':
								if (packet.data.status == 200) {
									this.#CloseNewElement();
									for (let i = 0; i < this.#scGroups.length; i++) {
										this.#scGroups[i].sc.DeleteObject();
									}
									this.#scGroups = [];
									this.#GetDict();
								}
							break;
							case 'delElementsFromDict':
								for (let i=0; i<packet.data.deleted.length; i++) {
									let index = this.ScDict.findIndex((item)=> item.uid == packet.data.deleted[i]);
									if (index != -1) {
										let d = this.ScDict.splice(index, 1);
										d[0].sc.DeleteObject();
									}
								}
							break;
							case 'editGroup':
								if (packet.data.status == 200) {
									this.#CloseNewElement();
									for (let i = 0; i < this.#scGroups.length; i++) {
										this.#scGroups[i].sc.DeleteObject();
									}
									this.#scGroups = [];
									this.#GetDict();
								}
							break;
							case 'getNewDicts':
								console.log("пришли справочники ", packet);
								if (packet.data.list.length > 0) {
									let apps = packet.data.list.find(item=> item.name == 'apps');
									if (typeof apps !== 'undefined') this.#apps = apps.list;
								}
								this.#GetDict();
							break;
						}
					break;
				}
			break;
		}
	}
}
