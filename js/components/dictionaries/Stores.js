'use strict'
class Stores extends Dictionaries {
	#units = [];#stores = [];#cbody;#unitsTable;#transport;#newElement;#regions = [];#headers;
	#scStores = [];
	constructor ( application, parent) {
		super( application, parent );
		this.#transport = this.Application.Transport;
		this.#GetDictRegions();
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
			new Span().SetAttributes( {class: 'dex-configuration-title'} ).Text( `Справочник торговых точек` ),
			this.#cbody = new Div().SetAttributes( {class: 'dex-contract-body row'} )
		]);
		this.#CreateList();
	}
	#CreateList() {
		// this.#unitsTable = new ComplexTable( this.Application, this.#cbody ).AddWatcher({name: 'watchSelectedRows', func: ( rows )=> { this.#SetSelectedCnt( rows ) }});
		this.#unitsTable = new ComplexTable( this.Application, this.#cbody);
		this.#headers = [ {name: 'uid', title: 'id'}, {name: 'title', title: 'Торговая точка'}, {name: 'parent_title', title: 'Отделение'} ];
		this.#unitsTable.DomObject.style.height = `calc(${ this.#cbody.DomObject.clientHeight }px - 5px)`;

		for (let i = 0; i < this.#headers.length; i++) {
			let newHeader = new Th().SetAttributes( ).Text( this.#headers[i].title ).AddWatch( ( el )=> {
				el.DomObject.addEventListener('click', ( event ) => {this.#unitsTable.SortByColIndex( el, i )})
			});
			this.#unitsTable.AddHead( newHeader );
		}
		this.#AddRows();
	}
	#AddRows() {
		for (let i=0; i< this.#stores.length; i++) {
			let row = new Tr().SetAttributes( {'uid_num': this.#stores[i].uid} );
			for (let j=0; j<this.#headers.length; j++) {
				row.AddChilds([ new Td().Text( this.#stores[i][this.#headers[j].name] ) ]);
			}
			row.AddWatch(sho=> sho.DomObject.addEventListener('dblclick', event=> this.#GetDataById(this.#stores[i].uid)) );
			this.#unitsTable.AddRow( row );
			this.#scStores.push({uid: this.#stores[i].uid, sc: row});
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
		if (id) this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getDictStoresSingleId', id: id}, hash: this.Hash});
	}
	#GetDict() {
		this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getDictStores'}, hash: this.Hash});
	}
	#GetDictRegions() {
		this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getAppDictById', dict: 'regions'}, hash: this.Hash});
	}
	//удаление елемента
	#DeleteElement() {
		let dels = [];
		let arr = this.#unitsTable.SelectedRows;
		let acslength = 300;
		if (arr.length > 0) {
			if (arr.length < acslength) {
				arr.map(item=> dels.push(item.Attributes.uid_num));
				let c = confirm(`Вы правда желаете удалить выделенные поля? uids=> [${dels}]`);
				if (c) {
					// console.log( 'dels=> ', dels);
					this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'delElementsFromDict', dict: 'stores', elements: dels}, hash: this.Hash});
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
			parent: 'Отделение',
			uid: 'id торговой точки',
			lastname: 'Фамилия',
			firstname: 'Имя',
			secondname: 'Отчество',
			region: 'Регион',
			title: 'Описание точки',
			doc_city: 'Нас. пункт',
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
		let section = new Div( {parent: this.#cbody} );
		let units = this.Parent.CommonDicts['units'].elements;
		//сначала покажем кто родитель
		// new Div( {parent: section} ).SetAttributes( {class: 'form-group row', name: "unit"} ).AddChilds([
		// 	new Label().SetAttributes( {class: 'col-sm-3 col-form-label'} ).Text("Отделение"),
		// 	new Div().SetAttributes( {class: 'col-sm-9'} ).AddChilds([
		// 		new Select().SetAttributes({class: 'col-sm-12'}).AddChilds(
		// 			(()=> {
		// 				let arr = [];
		// 				units.map(item=> {
		// 					let option = new Option().SetAttributes({value: item.uid}).Text(item.title);
		// 					if (typeof element !== 'undefined' && item.uid == element.parent_uid) option.SetAttributes({'selected': 'selected'})
		// 					arr.push(option);
		// 				})
		// 				return arr;
		// 			})()
		// 		)
		// 	])
		// ]);

		let sel = ['status', 'region', 'parent'];
		let hiddens = ['uid', 'lastname', 'firstname', 'secondname', 'region', 'title'];
		for (let key in fields) {
			// console.log('key => ', key);
			// if ( key == 'uid' && typeof element !== 'undefined' || key != 'uid') {
				let inputAttrs = {class: `col-sm-12`, type: 'text', id: `${key}_${formHash}`};
				if (key == 'uid') inputAttrs.disabled = true;
				let block = new Div( {parent: section} ).SetAttributes( {class: 'form-group row', name: key} ).AddChilds([
					new Label().SetAttributes( {class: 'col-sm-3 col-form-label'} ).Text(fields[key]),
					new Div().SetAttributes( {class: 'col-sm-9'} ).AddChilds([
						(()=> {

							if (sel.indexOf(key) != -1) {
								// console.log('key => ', key, ' element.uid=> ', element.uid);
								let options = [];
								let d = [];
								if (key == 'status') d = [{val: 0, text: 'Заблокировано'}, {val: 1, text: 'Активно'}];
								else if (key == 'parent') units.map(item=> d.push({val: item.uid, text: item.title}))
								else this.#regions.map(item=> item.status == 1 ? d.push({val: item.uid, text: item.title}) : '')
								for (let i = 0; i < d.length; i++) {
									let option = new Option().SetAttributes({'value':d[i].val}).Text(d[i].text);
									if (key == 'status' && typeof element !== 'undefined' && element.status == d[i].val) {
										option.SetAttributes({'selected': 'selected'});
									} else if (key == 'region' && typeof element !== 'undefined' && element.region == d[i].val) {
										// console.log("element.uid=> ", element.uid);
										option.SetAttributes({'selected': 'selected'});
									} else if (key == 'parent' && typeof element !== 'undefined' && element.parent_uid == d[i].val) {
										option.SetAttributes({'selected': 'selected'});
									} else if ( typeof element === 'undefined' && key == 'status' ) {
										option.SetAttributes({'selected': 'selected'});
									}
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

				if (typeof element === 'undefined' && hiddens.indexOf(key) != -1) {
					block.Hide();
				}
			// }
		}

		if (typeof element !== 'undefined') {
			domTitle.Text(`Редактирование элемента. UID = [${element.uid}]`);
			for (let key in element) {
				// console.log('key=> ', key);
				if (typeof fields[key] !== 'undefined' && key != 'status' && key != 'region') document.getElementById(`${key}_${formHash}`).value = element[key];
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
			// if (key != 'uid') {
				let element = document.getElementById(`${key}_${formHash}`);
				if ( typeof element !== 'undefined' ) {
					data[key] = element.value;
				}
			// }
		}

		let packet = {com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'createNewStore', fields: data}, hash: this.Hash};
		//if (confirm('Создается новое отделение. Будем создавать пользователя для входа в приложение?')) {
		//	packet.data.createNewUser = true;
		//} else packet.data.createNewUser = false;
		console.log('packet на сервер=> ', packet);
		this.#transport.Get(packet);
	}
	// ПУБЛИЧНЫЕ МЕТОДЫ
	Commands ( packet ) {
		console.log( packet );
		switch ( packet.com ) {
			case 'skyline.apps.adapters':
				switch ( packet.subcom ) {
					case 'appApi':
						switch ( packet.data.action ) {
							case 'getAppDictById':
								console.log('packet=> ', packet);
								if (packet.data.list.length > 0) {
									packet.data.list.map(item => this.#regions.push(item))
								}
								this.#GetDict();
							break;
							case 'getDictStores':
								if (packet.data.list.length > 0) this.#stores = packet.data.list;
								if ( typeof this.#unitsTable === 'undefined' ) this.#Show(packet.data);
								else this.#AddRows();
							break;
							case 'getDictStoresSingleId':
								// console.log("пакет===> ", packet.data);
								this.#AddNewElement(packet.data.list[0]);
							break;
							case 'delElementsFromDict':
								for (let i=0; i<packet.data.deleted.length; i++) {
									let index = this.#scStores.findIndex((item)=> item.uid == packet.data.deleted[i]);
									if (index != -1) {
										let d = this.#scStores.splice(index, 1);
										d[0].sc.DeleteObject();
									}
								}
							break;
							case 'createNewStore':
								if (packet.data.status == 200) {
									this.#CloseNewElement();
									for (let i = 0; i < this.#scStores.length; i++) {
										this.#scStores[i].sc.DeleteObject();
									}
									this.#scStores = [];
									this.#GetDict();
								} else {
									alert(packet.data.err.join('\n'));
								}
							break;
						}
					break;
				}
			break;
		}
	}
}

