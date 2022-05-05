'use strict'
class Users extends Dictionaries {
	#users = [];#groups = [];#cbody;#transport;#newElement;#headers;#apps = [];
	#scUsers = [];
	#usersTable;
	constructor ( application, parent) {
		super( application, parent );
		this.Title = "Справочник пользователей";
		this.#transport = this.Application.Transport;
		// this.#Init();
		// this.#GetApps();

		this.Init({actions: {
			add: ()=> {this.#AddNewElement()},
			delete: ()=> {this.#DeleteElement()},
			getRecordById: (id)=> {this.#GetDataById(id)}
		}});
		this.#InitTitles();
		this.GetDicts('userGroups');
		this.#GetDict();
	}
	// ГЕТТЕРЫ

	// СЕТТЕРЫ
	// #Init() {
	// 	// this.#usersTable = new ComplexTable( this.Application, this.CBody);
	// 	this.Table = new ComplexTable( this.Application, this.CBody);
	// 	this.Instruments.AddChilds([
	// 		new Div().SetAttributes( {class: 'dex-app-window-filter'} ).AddChilds([
	// 			new Div().SetAttributes({class: 'dex-filter-element'}).AddChilds([
	// 				new I().SetAttributes( {class: 'fas fa-user-minus'} ).AddWatch(sho => {
	// 					sho.DomObject.addEventListener( 'click', event => this.#DeleteElement() )
	// 				})
	// 			]),
	// 			new Div().SetAttributes({class: 'dex-filter-element'}).AddChilds([
	// 				new I().SetAttributes( {class: 'fas fa-user-plus'} ).AddWatch(sho => {
	// 					sho.DomObject.addEventListener( 'click', event => this.#AddNewElement() )
	// 				})
	// 			])
	// 		])
	// 	]);
	// }
	// ПРИВАТНЫЕ МЕТОДЫ
	// #Show( data ) {
	// 	// this.Container = new Div( {parent: this.Parent.Container} ).SetAttributes( {class: 'dex-dict'} ).AddChilds([
	// 	// 	new I().SetAttributes( {class: 'dex-configuration-close fas fa-window-close'} ).AddWatch(sho => {
	// 	// 		sho.DomObject.addEventListener( 'click', event => this.#Close() )
	// 	// 	}),
	// 	// 	new I().SetAttributes( {class: 'dex-configuration-delete fas fa-user-minus'} ).AddWatch(sho => {
	// 	// 		sho.DomObject.addEventListener( 'click', event => this.#DeleteElement() )
	// 	// 	}),
	// 	// 	new I().SetAttributes( {class: 'dex-configuration-add fas fa-user-plus'} ).AddWatch(sho => {
	// 	// 		sho.DomObject.addEventListener( 'click', event => this.#AddNewElement() )
	// 	// 	}),
	// 	// 	new Span().SetAttributes( {class: 'dex-configuration-title'} ).Text( `Справочник пользователей` ),
	// 	// 	this.#cbody = new Div().SetAttributes( {class: 'dex-contract-body row'} )
	// 	// ]);
	// 	this.#CreateList();
	// }
	#InitTitles( data ) {
		this.#headers = [ {name: 'uid', title: 'id'}, {name:'username', title: 'Логин'}, {name: 'lastname', title: 'Фамилия'}, {name: 'firstname', title:'Имя'}, {name: 'user_group_id', title: 'Группа'}, {name: 'status', title: 'Статус'}];
		this.TableTitles = this.#headers;
		// this.#AddRows();
	}
	// #CreateList() {
	// 	// this.#unitsTable = new ComplexTable( this.Application, this.#cbody ).AddWatcher({name: 'watchSelectedRows', func: ( rows )=> { this.#SetSelectedCnt( rows ) }});
	// 	// this.#usersTable = new ComplexTable( this.Application, this.#cbody);
	// 	this.#headers = [ {name: 'uid', title: 'id'}, {name:'username', title: 'Логин'}, {name: 'lastname', title: 'Фамилия'}, {name: 'firstname', title:'Имя'}, {name: 'user_group_id', title: 'Группа'}];
	// 	// this.#usersTable.DomObject.style.height = `calc(${ this.#cbody.DomObject.clientHeight }px - 5px)`;
	// 	this.Table.DomObject.style.height = `calc(${ this.#cbody.DomObject.clientHeight }px - 5px)`;
	// 	for (let i = 0; i < this.#headers.length; i++) {
	// 		let newHeader = new Th().SetAttributes( ).Text( this.#headers[i].title ).AddWatch( ( el )=> {
	// 			// el.DomObject.addEventListener('click', ( event ) => {this.#usersTable.SortByColIndex( el, i )})
	// 			el.DomObject.addEventListener('click', ( event ) => {this.Table.SortByColIndex( el, i )})
	// 		});
	// 		// this.#usersTable.AddHead( newHeader );
	// 		this.Table.AddHead( newHeader );
	// 	}
	// 	this.#AddRows();
	// }
	// #AddRows() {
	// 	for (let i=0; i< this.#users.length; i++) {
	// 		let row = new Tr().SetAttributes( {'uid_num': this.#users[i].uid} );
	// 		for (let j=0; j<this.#headers.length; j++) {
	// 			if (this.#headers[j].name == 'user_group_id') {
	// 				let d = this.#users[i][this.#headers[j].name];
	// 				let group = this.#groups.find(item=> item.user_group_id == d);
	// 				row.AddChilds([ new Td().Text( group.name ) ]);
	// 			} else row.AddChilds([ new Td().Text( this.#users[i][this.#headers[j].name] ) ]);
	// 		}
	// 		row.AddWatch(sho=> sho.DomObject.addEventListener('dblclick', event=> this.#GetDataById(this.#users[i].uid)) );
	// 		// this.#usersTable.AddRow( row );
	// 		this.Table.AddRow( row );
	// 		this.#scUsers.push({uid: this.#users[i].uid, sc: row});
	// 	}
	// }
	// #Close () {
	// 	this.Container.DeleteObject();
	// 	this.Application.DeleteHash( this.Hash );
	// };
	#CloseNewElement() {
		this.#newElement.DeleteObject();
	}
	#GetDataById(id) {
		// console.log(" запрос группы id=> ", id);
		if ( typeof id !== 'undefined') this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getDictUserSingleId', id: id}, hash: this.Hash});
	}
	#GetDict() {
		this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getUsers'}, hash: this.Hash});
	}
	#GetUserGroups() {
		this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getGroupsUsers'}, hash: this.Hash});
	}
	#GetApps() {
		this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getAppDictById', dict: 'apps'}, hash: this.Hash});
	}
	//удаление елемента
	#DeleteElement() {
		let dels = [];
		// let arr = this.#usersTable.SelectedRows;
		let arr = this.Table.SelectedRows;
		let acslength = 300;
		if (arr.length > 0) {
			if (arr.length < acslength) {
				arr.map(item=> dels.push(item.Attributes.uid_num));
				let c = confirm(`Вы правда желаете удалить выделенные поля? uids=> [${dels}]`);
				if (c) {
					this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'delElementsFromDict', dict: 'user', elements: dels}, hash: this.Hash});
				}
			} else {
				alert(`Вы можете удалить не более ${acslength} элементов`);
			}
		}
	}
	//добавление нового элемента в справочник
	#AddNewElement(element) {
		console.log('element=> ', element);
		let formHash = this.Application.Toolbox.GenerateHash;
		let domTitle;
		let fields = {
			uid: 'id',
			username: 'Логин',
			lastname: 'Фамилия',
			firstname: 'Имя',
			secondname: 'Отчество',
			user_group_id: 'Группа',
			status: 'Статус'
		}
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
						typeof element !== 'undefined' ? this.#EditUnit(formHash, fields) : this.#CreateNewUser(formHash, fields);
					} )
				})
			])
		]);
		let section = new Div( {parent: this.#cbody} ).SetAttributes( );
		let sel = ['status', 'user_group_id'];
		for (let key in fields) {
			// console.log('key => ', key);
			if ( key == 'uid' && typeof element !== 'undefined' || key != 'uid') {
				let inputAttrs = {class: `col-sm-12`, type: 'text', id: `${key}_${formHash}`};
				if ( (key == 'uid' || key == 'username') && typeof element !== 'undefined') inputAttrs.disabled = true;
				new Div( {parent: section} ).SetAttributes( {class: 'form-group row', name: key} ).AddChilds([
					new Label().SetAttributes( {class: 'col-sm-3 col-form-label'} ).Text(fields[key]),
					new Div().SetAttributes( {class: 'col-sm-9'} ).AddChilds([
						(()=> {
							if (sel.indexOf(key) != -1) {
								// console.log('key => ', key, ' element.uid=> ', element.uid);
								let options = [];
								let d = [];
								if (key == 'status') d = [{val: 0, text: 'Заблокировано'}, {val: 1, text: 'Активно'}];
								else if (key == 'user_group_id') this.#groups.map(item=> d.push({val: item.user_group_id, text: item.name}))
								for (let i = 0; i < d.length; i++) {
									let option = new Option().SetAttributes({'value':d[i].val}).Text(d[i].text);
									if (key == 'status' && typeof element !== 'undefined' && element.status == d[i].val) option.SetAttributes({'selected': 'selected'});
									if (key == 'user_group_id' && typeof element !== 'undefined' && element.user_group_id == d.user_group_id) {
										option.SetAttributes({'selected': 'selected'});
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
			domTitle.Text(`Редактирование элемента. UID = [${element.uid}]`);
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
			let elt = document.getElementById(`${key}_${formHash}`);
			if (typeof elt !== 'undefined') data[key] = elt.value;
		}
		console.log('data=> ', data);
		this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'editUser', fields: data}, hash: this.Hash});
	}
	#CreateNewUser(formHash, fields) {
		let data = {};
		for (let key in fields) {
			if (key != 'uid') {
				let elt = document.getElementById(`${key}_${formHash}`);
				if (typeof elt !== 'undefined') data[key] = elt.value;
			}
		}
		this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'createNewUser', fields: data}, hash: this.Hash});
	}
	// ПУБЛИЧНЫЕ МЕТОДЫ
	Commands ( packet ) {
		console.log( packet );
		switch ( packet.com ) {
			case 'skyline.apps.adapters':
				switch ( packet.subcom ) {
					case 'appApi':
						switch ( packet.data.action ) {
							case 'getUsers':
								if (packet.data.list.length > 0) this.TableData = packet.data.list;
							break;
							case 'getDictUserSingleId':
								this.#AddNewElement(packet.data.list[0]);
							break;
							case 'getAppDictById':
								if (packet.data.list.length > 0) {
									packet.data.list.map(item => this.#apps.push(item))
								}
								this.#GetUserGroups();
							break;
							case 'getGroupsUsers':
								// console.log('пришли группы => ', packet.data);
								if (packet.data.list.length > 0) this.#groups = packet.data.list;
								this.#GetDict();
							break;
							case 'createNewUser':
								console.log('createNewUser=> ', packet);
								if (packet.data.status == 200) {
									this.#CloseNewElement();
									for (let i = 0; i < this.ScDict.length; i++) {
										this.ScDict[i].sc.DeleteObject();
									}
									// this.ScDict = [];
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
							case 'editUser':
								if (packet.data.status == 200) {
									this.#CloseNewElement();
									for (let i = 0; i < this.ScDict.length; i++) {
										this.ScDict[i].sc.DeleteObject();
									}
									// this.ScDict = [];
									this.#GetDict();
								}
							break;
							case 'getNewDicts':
								console.log("пришли справочники ", packet);
								if (packet.data.list.length > 0) {
									let userGroups = packet.data.list.find(item=> item.name == 'userGroups');
									if (typeof userGroups !== 'undefined') this.#groups = userGroups.list;
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
