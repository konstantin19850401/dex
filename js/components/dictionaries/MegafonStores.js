'use strict'
class MegafonStores extends Dictionaries {
	#megafonStores = [];#cbody;#megafonStoresTable;#transport;#headers;#newElement;
	#scMegafonStores = [];
	#dicts = [];
	constructor ( application, parent) {
		super( application, parent );
		this.#transport = this.Application.Transport;
		this.#GetDicts();
	}
	// ГЕТТЕРЫ

	// СЕТТЕРЫ

	// ПРИВАТНЫЕ МЕТОДЫ
	#Show( data ) {
		if (typeof this.Container !== 'undefined' && this.Container != null) {
			this.Container.DeleteObject();
		}
		this.Container = new Div( {parent: this.Parent.Container} ).SetAttributes( {class: 'dex-dict'} ).AddChilds([
			new I().SetAttributes( {class: 'dex-configuration-close fas fa-window-close'} ).AddWatch(sho => {
				sho.DomObject.addEventListener( 'click', event => this.#Close() )
			}),
			new Span().SetAttributes( {class: 'dex-configuration-title'} ).Text( `Справочник точек продаж МегаФон` ),
			this.#cbody = new Div().SetAttributes( {class: 'dex-contract-body row'} )
		]);
		this.#CreateList();
	}
	#CreateList() {
		this.#megafonStoresTable = new ComplexTable( this.Application, this.#cbody);
		this.#headers = [
			{name: 'id', title: 'id'},
			{name: 'megafon_code', title: 'Имя точки'},
			{name: 'megafon_sale_point_id', title: 'Код точки'},
			{name: 'dex_store', title: 'Отделение'},
			{name: 'dex_megafon_profile', title: 'Профиль отправки'},
			{name: 'status', title: 'Статус'},
		];
		this.#megafonStoresTable.DomObject.style.height = `calc(${ this.#cbody.DomObject.clientHeight }px - 5px)`;

		for (let i = 0; i < this.#headers.length; i++) {
			let newHeader = new Th().SetAttributes( ).Text( this.#headers[i].title ).AddWatch( ( el )=> {
				el.DomObject.addEventListener('click', ( event ) => {this.#megafonStoresTable.SortByColIndex( el, i )})
			});
			this.#megafonStoresTable.AddHead( newHeader );
		}
		this.#AddRows();
	}
	#AddRows() {
		for (let i=0; i< this.#megafonStores.length; i++) {
			let attrs = {'uid_num': this.#megafonStores[i].id};
			if (this.#megafonStores[i].status == 0) attrs.class = "bg-secondary bg-gradient";
			let row = new Tr().SetAttributes( attrs );
			for (let j=0; j<this.#headers.length; j++) {
				row.AddChilds([ new Td().Text( this.#megafonStores[i][this.#headers[j].name] ) ]);
			}
			row.AddWatch(sho=> sho.DomObject.addEventListener('dblclick', event=> this.#GetDataById(this.#megafonStores[i].id)) );
			this.#megafonStoresTable.AddRow( row );
			this.#scMegafonStores.push({id: this.#megafonStores[i].id, sc: row});
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
		if (id) this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getDictMegafonStoresSingleId', id: id}, hash: this.Hash});
	}
	#GetMegafonStores() {
		this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getDictMegafonStores'}, hash: this.Hash});
	}
	#GetDicts() {
		this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getNewDicts', dicts: ['stores']}, hash: this.Hash});
	}
	//удаление елемента
	#DeleteElement() {
		let dels = [];
		let arr = this.#megafonStoresTable.SelectedRows;
		let acslength = 300;
		if (arr.length > 0) {
			if (arr.length < acslength) {
				arr.map(item=> dels.push(item.Attributes.uid_num));
				let c = confirm(`Вы правда желаете удалить выделенные поля? uids=> [${dels}]`);
				if (c) {
					// console.log( 'dels=> ', dels);
					this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'delElementsFromDict', dict: 'megafonStores', elements: dels}, hash: this.Hash});
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
			id: 'id',
			megafon_code: 'Имя точки',
			megafon_sale_point_id: 'Код точки',
			dex_store: 'Отделение',
			dex_megafon_profile: 'Профиль отправки',
			status: 'Статус'
		};
		this.#newElement = new Div( {parent: this.Parent.Container} ).SetAttributes( {class: 'dex-dict'} ).AddChilds([
			new I().SetAttributes( {class: 'dex-configuration-close fas fa-window-close'} ).AddWatch(sho => {
				sho.DomObject.addEventListener( 'click', event => this.#CloseNewElement() )
			}),
			domTitle = new Span().SetAttributes( {class: 'dex-configuration-title'} ).Text( `Добавление нового элемента` ),
			this.#cbody = new Div().SetAttributes( {class: 'dex-contract-body row'} ),
			new Div().SetAttributes( {class: 'dex-configuration-footer'} ).AddChilds([
				new Button().SetAttributes( {class: 'dex-configuration-info-btn'} ).Text( typeof element !== 'undefined' ? 'Редактировать' : 'Создать').AddWatch((el)=> {
					el.DomObject.addEventListener( 'click', ()=> this.#EditUnit(formHash, fields))
				})
			])
		]);
		let section = new Div( {parent: this.#cbody} );
		let stores = this.#dicts.find(item=> item.name == 'stores');

		let sel = ['status', 'dex_store'];
		let hiddens = ['id','dex_megafon_profile','megafon_code','megafon_sale_point_id'];
		for (let key in fields) {
			let inputAttrs = {class: `col-sm-12`, type: 'text', id: `${key}_${formHash}`};
			if (key == 'id' || hiddens.indexOf(key) != -1) inputAttrs.disabled = true;
			let block = new Div( {parent: section} ).SetAttributes( {class: 'form-group row', name: key} ).AddChilds([
				new Label().SetAttributes( {class: 'col-sm-3 col-form-label'} ).Text(fields[key]),
				new Div().SetAttributes( {class: 'col-sm-9'} ).AddChilds([
					(()=> {
						if (sel.indexOf(key) != -1) {
							let options = [];
							let d = [];
							if (key == 'status') d = [{val: 0, text: 'Заблокировано'}, {val: 1, text: 'Активно'}];
							else if (key == 'dex_store') stores.list.map(item=> d.push({val: item.dex_uid, text: item.title}))
							for (let i = 0; i < d.length; i++) {
								let option = new Option().SetAttributes({'value':d[i].val}).Text(d[i].text);
								if (key == 'status' && typeof element !== 'undefined' && element.status == d[i].val) {
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
		}

		if (typeof element !== 'undefined') {
			domTitle.Text(`Редактирование элемента. UID = [${element.id}]`);
			for (let key in element) {
				// console.log('key=> ', key);
				if (typeof fields[key] !== 'undefined' && key != 'status') document.getElementById(`${key}_${formHash}`).value = element[key];
			}
		}
	}
	#EditUnit(formHash, fields) {
		// console.log('Редактировать');
		let data = {};
		for (let key in fields) {
			let element = document.getElementById(`${key}_${formHash}`);
			// console.log('element=> ', element);
			if (typeof element !== 'undefined') {
				data[key] = element.value;
			}
		}
		// console.log("==> ", data);
		this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'editMegafonStore', fields: data}, hash: this.Hash});
	}
	// ПУБЛИЧНЫЕ МЕТОДЫ
	Commands ( packet ) {
		console.log( packet );
		switch ( packet.com ) {
			case 'skyline.apps.adapters':
				switch ( packet.subcom ) {
					case 'appApi':
						switch ( packet.data.action ) {
							case "getDictMegafonStores":
								if (packet.data.list.length > 0) this.#megafonStores = packet.data.list;
								if ( typeof this.#megafonStoresTable === 'undefined' ) this.#Show(packet.data);
								else this.#AddRows();
							break;
							case 'getNewDicts':
								if (typeof packet.data.list !== 'undefined')
								this.#dicts = packet.data.list;
								this.#GetMegafonStores();
							break;
							case 'getDictMegafonStoresSingleId':
								this.#AddNewElement(packet.data.list[0]);
							break;
							case 'editMegafonStore':
								this.#CloseNewElement();
								for (let i = 0; i < this.#scMegafonStores.length; i++) {
									this.#scMegafonStores[i].sc.DeleteObject();
								}
								this.#scMegafonStores = [];
								this.#GetMegafonStores();
							break;
						}
					break;
				}
			break;
		}
	}
}

