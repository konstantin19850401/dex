'use strict'
class Units extends Dictionaries {
	#units = [];#cbody;#unitsTable;#newElement;#regions = [];#headers;
	#scUnits = [];#store;#scStores = [];#storeTable;#autoct = [];
	constructor ( application, parent) {
		super( application, parent );
		this.Title = "Справочник отделений";
		// this.#transport = this.Application.Transport;
		this.Init({actions: {
			add: ()=> {this.#AddNewElement()},
			delete: ()=> {this.#DeleteElement()},
			getRecordById: (id)=> {this.#GetDataById(id)}
		}});
		this.#InitTitles();
		this.GetDicts('regions');
		console.log("this.Application=> ", this.Application);
		this.AddContextMenu([
			{uid: 'doc.print.beeline', title: 'Печатная форма "Договор об оказании услуг Билайн"', statuses: '0,1,2,3,4,5'},
			{uid: 'doc.print.mts', title: 'Печатная форма "Договор об оказании услуг МТС"', statuses: '0,1,2,3,4,5'},
			{uid: 'doc.print.megafon', title: 'Печатная форма "Договор об оказании услуг МегаФон"', statuses: '0,1,2,3,4,5'}
		]);
	}
	// ГЕТТЕРЫ

	// СЕТТЕРЫ

	// ПРИВАТНЫЕ МЕТОДЫ
	#InitTitles( data ) {
		this.#headers = [ {name: 'uid', title: 'id'}, {name: 'title', title: 'Описание'}, {name: 'lastname', title: 'Фамилия'}, {name: 'firstname', title: 'Имя'}, {name: 'secondname', title: 'Отчество'}, {name: 'region', title: 'Регион'}, {name: 'status', title: 'Статус'}];
		this.TableTitles = this.#headers;
		// this.#AddRows();
	}
	#CloseNewElement() {
		this.#newElement.DeleteObject();
	}
	#CloseStoreWindow() {
		this.#store.DeleteObject();
	}
	#GetDataById(id) {
		// console.log("id=> ", id);
		if (id) this.Transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getDictUnitsSingleId', id: id}, hash: this.Hash});
	}
	#GetDict() {
		this.Transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getDictUnits'}, hash: this.Hash});
	}
	#GetDictRegions() {
		this.Transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getAppDictById', dict: 'regions'}, hash: this.Hash});
	}
	#GetUnitStore(storeId) {
		if (typeof storeId !== "undefined") {
			console.log("запросим торговую точку");
			this.Transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getDictStoresSingleId', id: storeId}, hash: this.Hash});
		}
	}
	#GetAddress(string, item) {
		// console.log("======> ", string);
		if (typeof string !== 'undefined' && string != '') {
			this.Transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getKladrByOneString', string: string, item: item}, hash: this.Hash});
		}
	}
	//удаление елемента
	#DeleteElement() {
		let dels = [];
		// let arr = this.#unitsTable.SelectedRows;
		let arr = this.Table.SelectedRows;
		let acslength = 300;
		if (arr.length > 0) {
			if (arr.length < acslength) {
				arr.map(item=> dels.push(item.Attributes.uid_num));
				let c = confirm(`Вы правда желаете удалить выделенные поля? uids=> [${dels}]`);
				if (c) {
					// console.log( 'dels=> ', dels);
					this.Transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'delElementsFromDict', dict: 'units', elements: dels}, hash: this.Hash});
				}
			} else {
				alert(`Вы можете удалить не более ${acslength} элементов`);
			}
		}
	}
	//добавление нового элемента в справочник
	#AddNewElement(element) {
		// console.log("application=> ", this.Application);
		let formHash = this.Application.Toolbox.GenerateHash;
		let domTitle;
		let fields = {
			uid: 'id субдилера',
			dex_uid: 'DEX id первой ТТ',
			title: 'Описание субдилера',
			lastname: 'Фамилия',
			firstname: 'Имя',
			secondname: 'Отчество',
			inn: 'ИНН',
			ogrn: 'ОГРН',
			agreement_number: 'Номер договора',
			docSeries: 'Серия паспорта',
			docNumber: 'Номер паспорта',
			docDate: 'Дата выдачи паспорта',
			docOrg: 'Организация, выдавшая паспорт',
			docOrgCode: 'Код организации, выдавшей паспорт',
			region: 'Регион',
			fiz_address: 'Физ. адрес',
			legal_address: 'Юр. адрес',
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
		let autocompleteInput;
		let section = new Div( {parent: this.#cbody} ).SetAttributes( );
		let sel = ['status', 'region'];
		for (let key in fields) {
			// console.log('key => ', key);
			// if ( key == 'uid' && typeof element !== 'undefined' || key != 'uid') {
				let inputAttrs = {class: `col-sm-12`, type: 'text', id: `${key}_${formHash}`};
				// if (key == 'uid' && typeof element !== 'undefined') inputAttrs.disabled = true;
				if (key == 'uid' ) inputAttrs.disabled = true;
				let block = new Div( {parent: section} ).SetAttributes( {class: 'form-group row', name: key} ).AddChilds([
					new Label().SetAttributes( {class: 'col-sm-3 col-form-label'} ).Text(fields[key]),
					new Div().SetAttributes( {class: 'col-sm-9'} ).AddChilds([
						(()=> {
							if (sel.indexOf(key) != -1) {
								// console.log('key => ', key, ' element.uid=> ', element.uid);
								let options = [];
								let d = [];
								if (key == 'status') d = [{val: 0, text: 'Заблокировано'}, {val: 1, text: 'Активно'}];
								else this.#regions.map(item=> item.status == 1 ? d.push({val: item.uid, text: item.title}) : '')
								for (let i = 0; i < d.length; i++) {
									let option = new Option().SetAttributes({'value':d[i].val}).Text(d[i].text);
									if (key == 'status' && typeof element !== 'undefined' && element.status == d[i].val) option.SetAttributes({'selected': 'selected'});
									else if (key == 'region' && typeof element !== 'undefined' && element.region == d[i].val) {
										// console.log("element.uid=> ", element.uid);
										option.SetAttributes({'selected': 'selected'});
									} else if ( typeof element === 'undefined' && key == 'status' ) {
										option.SetAttributes({'selected': 'selected'});
									}
									options.push(option);
								}
								let select = new Select().SetAttributes( {class: 'col-sm-12', id: `${key}_${formHash}`} ).AddChilds(options);
								return select;
							} else {
								let input;
								if (key == 'fiz_address' || key == 'legal_address') {
									inputAttrs.class = "col-sm-12 autocomplete";
									autocompleteInput = input = new Textarea().SetAttributes( inputAttrs );
									// console.log("autocompleteInput=> ", autocompleteInput);
									let ahash = this.Application.Toolbox.GenerateHash;
									autocompleteInput.AddWatch(sho=> sho.DomObject.addEventListener('input', event=> this.#GetAddress(event.target.value, ahash)));
									// this.#autoct = new Autocomplete(autocompleteInput, [], true);
									this.#autoct.push({name: ahash, sho: new Autocomplete(autocompleteInput, [], true) });
								} else {
									input = new Input().SetAttributes( inputAttrs );
								}
								return input;
							}
						})()
					])
				]);
				if (key == 'dex_uid' && typeof element !== 'undefined') block.Hide();
			// }
		}

		if (typeof element !== 'undefined') {
			domTitle.Text(`Редактирование элемента. UID = [${element.uid}]`);
			for (let key in element) {
				// console.log('key=> ', key);
				if (typeof fields[key] !== 'undefined' && key != 'status' && key != 'region') document.getElementById(`${key}_${formHash}`).value = element[key];
			}

			// покажем торговые точки отделения
			let tableBlock;
			let block = new Div( {parent: section} ).SetAttributes( {class: 'form-group row', name: "stores"} ).AddChilds([
				new Label().SetAttributes( {class: 'col-sm-3 col-form-label'} ).Text("Список ТТ"),
				tableBlock = new Div().SetAttributes( {class: 'col-sm-9'} ).AddChilds([
					// new Ul().SetAttributes({class: "list-group list-group-numbered"}).AddChilds(
					// 	(()=> {
					// 		let arr = [];
					// 		for (let i=0; i<element.stores.length; i++) {
					// 			let attrs = {class: "list-group-item list-group-item-action", store_uid: element.stores[i].uid};
					// 			if (element.stores[i].status == 0) {
					// 				attrs.class = "list-group-item list-group-item-action bg-secondary bg-gradient";
					// 				attrs["aria-disabled"] = "true";
					// 			}
					// 			let li = new Li().SetAttributes(attrs).Text(element.stores[i].title).AddWatch(sho=> {
					// 				sho.DomObject.addEventListener('dblclick', event => this.#GetUnitStore(element.stores[i].uid));
					// 			});
					// 			this.#storesList.push({uid: element.stores[i].uid, status: element.stores[i].status, title: element.stores[i].title,  sho: li});
					// 			arr.push(li);
					// 		}

					// 		return arr;
					// 	})()
					// )
				])
			]);
			this.#storeTable = new ComplexTable( this.Application, tableBlock);
			this.#headers = [ {name: 'uid', title: 'id'}, {name: 'dex_uid', title: 'dex id'}, {name: 'title', title: 'Торговая точка'}];
			for (let i = 0; i < this.#headers.length; i++) {
				let newHeader = new Th().SetAttributes( ).Text( this.#headers[i].title ).AddWatch( ( el )=> {
					el.DomObject.addEventListener('click', ( event ) => {this.#storeTable.SortByColIndex( el, i )})
				});
				this.#storeTable.AddHead( newHeader );
			}
			let stores = element.stores;
			for (let i=0; i< stores.length; i++) {
				let attrs = {'uid_num': stores[i].uid};
				if (stores[i].status == 0) attrs.class = "bg-secondary bg-gradient";
				let row = new Tr().SetAttributes( attrs );
				let obj = {uid: stores[i].uid, sc: row, status: stores[i].status, title: stores[i].title, rowTitleTd: null};
				for (let j=0; j<this.#headers.length; j++) {
					let td = new Td().Text( stores[i][this.#headers[j].name] );
					row.AddChilds([ td ]);
					if (this.#headers[j].name == 'title') obj.rowTitleTd = td;
				}
				row.AddWatch(sho=> sho.DomObject.addEventListener('dblclick', event=> this.#GetUnitStore(stores[i].uid)) );
				this.#storeTable.AddRow( row );
				this.#scStores.push({uid: stores[i].uid, sc: row, status: stores[i].status, title: stores[i].title});
			}
		}
	}
	#EditUnit(formHash, fields) {

		let data = {};
		for (let key in fields) {
			let element = document.getElementById(`${key}_${formHash}`);
			// console.log('element=> ', element);
			if (typeof element !== 'undefined') {
				data[key] = element.value;
			}
		}
		console.log('Редактировать ', data);
		this.Transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'editUnit', fields: data}, hash: this.Hash});
	}
	#EditStore(formHash, fields) {
		console.log('Редактировать');
		let data = {};
		for (let key in fields) {
			let element = document.getElementById(`${key}_${formHash}`);
			// console.log('element=> ', element);
			if (typeof element !== 'undefined') {
				data[key] = element.value;
			}
		}
		this.Transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'editStore', fields: data}, hash: this.Hash});
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
		let packet = {com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'createNewUnit', fields: data}, hash: this.Hash};
		if (confirm('Создается новое отделение. Будем создавать пользователя для входа в приложение?')) {
			packet.data.createNewUser = true;
		} else packet.data.createNewUser = false;
		console.log('packet на сервер=> ', packet);
		this.Transport.Get(packet);
	}
	#ShowUnitStore(element) {
		let formHash = this.Application.Toolbox.GenerateHash;
		let domTitle;
		let fields = {
			parent: 'Отделение',
			uid: 'id торговой точки',
			dex_uid: 'DEX идентификатор',
			lastname: 'Фамилия',
			firstname: 'Имя',
			secondname: 'Отчество',
			region: 'Регион',
			title: 'Описание точки',
			address: 'Адрес',
			status: 'Статус'
		};
		// console.log(this.Application);
		this.#store = new Div( {parent: this.Parent.Container} ).SetAttributes( {class: 'dex-dict'} ).AddChilds([
			new I().SetAttributes( {class: 'dex-configuration-close fas fa-window-close'} ).AddWatch(sho => {
				sho.DomObject.addEventListener( 'click', event => this.#CloseStoreWindow() )
			}),
			domTitle = new Span().SetAttributes( {class: 'dex-configuration-title'} ).Text( `Добавление нового элемента` ),
			this.#cbody = new Div().SetAttributes( {class: 'dex-contract-body row'} ),
			new Div().SetAttributes( {class: 'dex-configuration-footer'} ).AddChilds([
				new Button().SetAttributes( {class: 'dex-configuration-info-btn'} ).Text( typeof element !== 'undefined' ? 'Редактировать' : 'Создать').AddWatch((el)=> {
					el.DomObject.addEventListener( 'click', event => this.#EditStore(formHash, fields));
				})
			])
		]);
		let section = new Div( {parent: this.#cbody} );
		let units = this.TableData;
		let autocompleteInput;let rightBlock;
		let sel = ['status', 'region', 'parent'];
		let hiddens = ['uid', 'lastname', 'firstname', 'secondname', 'region', 'title'];
		for (let key in fields) {
			let inputAttrs = {class: `col-sm-12`, type: 'text', id: `${key}_${formHash}`};
			if (key == 'uid' || key == 'title') inputAttrs.disabled = true;
			let block = new Div( {parent: section} ).SetAttributes( {class: 'form-group row', name: key} ).AddChilds([
				new Label().SetAttributes( {class: 'col-sm-3 col-form-label'} ).Text(fields[key]),
				rightBlock = new Div().SetAttributes( {class: 'col-sm-9'} ).AddChilds([
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
									option.SetAttributes({'selected': 'selected'});
								} else if (key == 'parent' && typeof element !== 'undefined' && element.parent_uid == d[i].val) {
									option.SetAttributes({'selected': 'selected'});

								} else if ( typeof element === 'undefined' && key == 'status' ) {
									option.SetAttributes({'selected': 'selected'});
								}
								options.push(option);
							}
							let attrs = {class: 'col-sm-12', id: `${key}_${formHash}`};
							if (key == 'parent' || key == 'region') attrs.disabled = true;
							let select = new Select().SetAttributes(attrs).AddChilds(options);
							return select;
						} else {
							let input;
							if (key == 'address') {
								inputAttrs.class = "col-sm-12 autocomplete";
								autocompleteInput = input = new Textarea().SetAttributes( inputAttrs );
								let ahash = this.Application.Toolbox.GenerateHash;
								// console.log("autocompleteInput=> ", autocompleteInput);
								autocompleteInput.AddWatch(sho=> sho.DomObject.addEventListener('input', event=> this.#GetAddress(event.target.value, ahash)));
								this.#autoct.push({name: ahash, sho: new Autocomplete(autocompleteInput, [], true) });
							} else {
								input = new Input().SetAttributes( inputAttrs );
							}



							return input;
						}
					})()
				])
			])
			// console.log("autocompleteInput=> ", autocompleteInput);
			// autocompleteInput.InitParent(rightBlock);

			if (typeof element === 'undefined' && hiddens.indexOf(key) != -1) {
				block.Hide();
			}
		}

		if (typeof element !== 'undefined') {
			domTitle.Text(`Редактирование торговой точки. UID = [${element.uid}]`);
			for (let key in element) {
				// console.log('key=> ', key);
				if (typeof fields[key] !== 'undefined' && key != 'status' && key != 'region') document.getElementById(`${key}_${formHash}`).value = element[key];
			}
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
								if (packet.data.list.length > 0) this.TableData = packet.data.list;
							break;
							case 'getDictUnitsSingleId':
								this.#AddNewElement(packet.data.list[0]);
							break;
							// case 'getAppDictById':
							// 	console.log('packet=> ', packet);
							// 	if (packet.data.list.length > 0) {
							// 		packet.data.list.map(item => this.#regions.push(item))
							// 	}
							// 	this.#GetDict();
							// break;
							case 'delElementsFromDict':
								for (let i=0; i<packet.data.deleted.length; i++) {
									let index = this.#scUnits.findIndex((item)=> item.uid == packet.data.deleted[i]);
									if (index != -1) {
										let d = this.#scUnits.splice(index, 1);
										d[0].sc.DeleteObject();
									}
								}
							break;
							case 'createNewUnit':
								if (packet.data.status == 200) {
									this.#CloseNewElement();
									for (let i = 0; i < this.#scUnits.length; i++) {
										this.#scUnits[i].sc.DeleteObject();
									}
									this.#scUnits = [];
									this.#GetDict();
								} else {
									alert(packet.data.err.join('\n'));
								}
								console.log('пришел пакет ответ на создание нового элемента');
							break;
							case 'editUnit':
								if (packet.data.status == 200) {
									this.#CloseNewElement();
									for (let i = 0; i < this.#scUnits.length; i++) {
										this.#scUnits[i].sc.DeleteObject();
									}
									this.#scUnits = [];
									this.#GetDict();
								}
								console.log('пришел пакет ответ на редактирование элемента');
							break;
							case 'editStore':
								if (packet.data.status == 200) {
									this.#CloseStoreWindow();
									let item = this.#scStores.find(item=> item.uid == packet.data.list[0].uid);
									if (item.status != packet.data.list[0].status) {
									 	item.status = packet.data.list[0].status;
										if (packet.data.list[0].status == 1) item.sc.RemoveClass("bg-secondary bg-gradient");
										else if (packet.data.list[0].status == 0) item.sc.AddClass("bg-secondary bg-gradient");
									}
									if (item.title != packet.data.list[0].title) {
										item.title = packet.data.list[0].title;
										item.rowTitleTd.Text(packet.data.list[0].title);
									}
								} else {
									alert(packet.data.err.join('\n'));
								}
							break;
							case 'getDictStoresSingleId':
								this.#ShowUnitStore(packet.data.list[0]);
							break;
							case 'getKladrByOneString':
								let autocompleteItem = this.#autoct.find(item=> item.name == packet.data.item);
								autocompleteItem.sho.List(packet.data.list);
								autocompleteItem.sho.IfInput();
								// this.#autoct.List(packet.data.list);
								// this.#autoct.IfInput();
							break;
							case 'getNewDicts':
								console.log("пришли справочники ", packet);
								if (packet.data.list.length > 0) {
									let regions = packet.data.list.find(item=> item.name == 'regions');
									if (typeof regions !== 'undefined') this.#regions = regions.list;
								}
								this.#GetDict();
							break;
							case 'printAgreementUnits':
								if (typeof packet.data.link !== 'undefined' && packet.data.status == 200) {
									if (Array.isArray(packet.data.link)) {
										for (let i = 0; i < packet.data.link.length; i++) {
											window.open( `${ this.Application.Transport.Url }/adapters/printing/${ packet.data.link[i] }`);
										}
									} else {
										window.open( `${ this.Application.Transport.Url }/adapters/printing/${ packet.data.link }`);
									}
								}
							break;

						}
					break;
				}
			break;
		}
	}
}

