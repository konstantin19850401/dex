'use strict'
class Stores extends Dictionaries {
	#units = [];#stores = [];#cbody;#newElement;#regions = [];#headers;
	constructor ( application, parent) {
		super( application, parent );
		this.Title = "Справочник торговых точек";
		this.Init({actions: {
			add: ()=> {this.#AddNewElement()},
			delete: ()=> {this.#DeleteElement()},
			getRecordById: (id)=> {this.#GetDataById(id)}
		}});
		this.#InitTitles();
		this.GetDicts(['regions', 'units']);
	}
	#InitTitles( data ) {
		this.#headers = [{name: 'uid', title: 'id'}, {name: 'dex_uid', title: 'dex id'}, {name: 'title', title: 'Торговая точка'}, {name: 'parent_title', title: 'Отделение'}];
		this.TableTitles = this.#headers;
	}
	#CloseNewElement() {
		this.#newElement.DeleteObject();
	}
	#GetDataById(id) {
		// console.log("id=> ", id);
		if (id) this.Transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getDictStoresSingleId', id: id}, hash: this.Hash});
	}
	#GetDict() {
		this.Transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getDictStores'}, hash: this.Hash});
	}
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
					// console.log( 'dels=> ', dels);
					this.Transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'delElementsFromDict', dict: 'stores', elements: dels}, hash: this.Hash});
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
			dex_uid: 'DEX идентификатор',
			lastname: 'Фамилия',
			firstname: 'Имя',
			secondname: 'Отчество',
			region: 'Регион',
			title: 'Описание точки',
			address: 'Адрес ТТ',
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
		// let units = this.Parent.CommonDicts['units'].elements;
		let units = this.#units;
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
	#CreatePacketData(formHash, fields) {
		let data = {};
		for (let key in fields) {
			let element = document.getElementById(`${key}_${formHash}`);
			if (typeof element !== 'undefined') data[key] = element.value;
		}
		return data;
	}
	#EditUnit(formHash, fields) {
		console.log('Редактировать');
		let data = this.#CreatePacketData(formHash, fields);
		this.Transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'editStore', fields: data}, hash: this.Hash});
	}
	#CreateNewUnit(formHash, fields) {
		console.log('создание нового элемента ', formHash);
		let data = this.#CreatePacketData(formHash, fields);
		this.Transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'createNewStore', fields: data}, hash: this.Hash});
	}
	// ПУБЛИЧНЫЕ МЕТОДЫ
	Commands ( packet ) {
		console.log( packet );
		switch ( packet.com ) {
			case 'skyline.apps.adapters':
				switch ( packet.subcom ) {
					case 'appApi':
						switch ( packet.data.action ) {
							case 'getDictStores':
								if (packet.data.list.length > 0) this.TableData = packet.data.list;
							break;
							case 'getDictStoresSingleId':
								this.#AddNewElement(packet.data.list[0]);
							break;
							case 'delElementsFromDict':
								this.CrearScDict();
								this.#GetDict();
							break;
							case 'createNewStore':
								if (packet.data.status == 200) {
									this.#CloseNewElement();
									this.CrearScDict();
									this.#GetDict();
								} else {
									alert(packet.data.err.join('\n'));
								}
							break;
							case 'editStore':
								if (packet.data.status == 200) {
									this.#CloseNewElement();
									this.CrearScDict();
									this.#GetDict();
								} else {
									alert(packet.data.err.join('\n'));
								}
							break;
							case 'getNewDicts':
								console.log("пришли справочники ", packet);
								if (packet.data.list.length > 0) {
									let regions = packet.data.list.find(item=> item.name == 'regions');
									if (typeof regions !== 'undefined') this.#regions = regions.list;
									let units = packet.data.list.find(item=> item.name == 'units');
									if (typeof units !== 'undefined') this.#units = units.list;
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

