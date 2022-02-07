'use strict'
class Units extends Dictionaries {
	#units = [];#cbody;#unitsTable;#transport;#newElement;#regions = [];
	#scUnits = [];
	constructor ( application, parent) {
		super( application, parent );
		this.#transport = this.Application.Transport;
		this.#GetDictRegions();
	}
	// ГЕТТЕРЫ

	// СЕТТЕРЫ

	// ПРИВАТНЫЕ МЕТОДЫ
	#Show( data ) {
		if (data.list.length > 0) this.#units = data.list;
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
			new Span().SetAttributes( {class: 'dex-configuration-title'} ).Text( `Справочник отделений` ),
			this.#cbody = new Div().SetAttributes( {class: 'dex-contract-body row'} )
		]);
		this.#CreateList();
	}
	#CreateList() {
		// this.#unitsTable = new ComplexTable( this.Application, this.#cbody ).AddWatcher({name: 'watchSelectedRows', func: ( rows )=> { this.#SetSelectedCnt( rows ) }});
		this.#unitsTable = new ComplexTable( this.Application, this.#cbody);
		let headers = [ {name: 'uid', title: 'id'}, {name: 'lastname', title: 'Фамилия'}, {name: 'firstname', title: 'Имя'}, {name: 'secondname', title: 'Отчество'}];
		this.#unitsTable.DomObject.style.height = `calc(${ this.#cbody.DomObject.clientHeight }px - 5px)`;

		for (let i = 0; i < headers.length; i++) {
			let newHeader = new Th().SetAttributes( ).Text( headers[i].title ).AddWatch( ( el )=> {
				el.DomObject.addEventListener('click', ( event ) => {this.#unitsTable.SortByColIndex( el, i )})
			});
			this.#unitsTable.AddHead( newHeader );
		}
		for (let i=0; i< this.#units.length; i++) {
			let row = new Tr().SetAttributes( {'uid_num': this.#units[i].uid} );
			for (let j=0; j<headers.length; j++) {
				row.AddChilds([ new Td().Text( this.#units[i][headers[j].name] ) ]);
			}
			row.AddWatch(sho=> sho.DomObject.addEventListener('dblclick', event=> this.#GetDataById(this.#units[i].uid)) );
			this.#unitsTable.AddRow( row );
			this.#scUnits.push({uid: this.#units[i].uid, sc: row});
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
		console.log("id=> ", id);
		if (id) this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getDictUnitsSingleId', id: id}, hash: this.Hash});
	}
	#GetDict() {
		this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getDictUnits'}, hash: this.Hash});
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
			uid: 'id субдилера',
			lastname: 'Фамилия',
			firstname: 'Имя',
			secondname: 'Отчество',
			region: 'Регион',
			title: 'Описание субдилера',
			doc_city: 'Город субдилера',
			status: 'Статус'
		};
		// console.log(this.Application);
		this.#newElement = new Div( {parent: this.Parent.Container} ).SetAttributes( {class: 'dex-dict'} ).AddChilds([
			new I().SetAttributes( {class: 'dex-configuration-close fas fa-window-close'} ).AddWatch(sho => {
				sho.DomObject.addEventListener( 'click', event => this.#CloseNewElement() )
			}),
			domTitle = new Span().SetAttributes( {class: 'dex-configuration-title'} ).Text( `Добавление нового элемента` ),
			this.#cbody = new Div().SetAttributes( {class: 'dex-contract-body row'} )
		]);
		let section = new Div( {parent: this.#cbody} ).SetAttributes( );
		let sel = ['status', 'region'];
		for (let key in fields) {
			// console.log('key => ', key);
			let inputAttrs = {class: `col-sm-12`, type: 'text', id: `${key}_${formHash}`};
			if (key == 'uid' && typeof element !== 'undefined') inputAttrs.disabled = true;
			new Div( {parent: section} ).SetAttributes( {class: 'form-group row', name: key} ).AddChilds([
				new Label().SetAttributes( {class: 'col-sm-3 col-form-label'} ).Text(fields[key]),
				new Div().SetAttributes( {class: 'col-sm-9'} ).AddChilds([
					(()=> {
						if (sel.indexOf(key) != -1) {
							console.log('key => ', key, ' element.uid=> ', element.uid);
							let options = [];
							let d = [];
							if (key == 'status') d = [{val: 0, text: 'Заблокировано'}, {val: 1, text: 'Активно'}];
							else {
								this.#regions.map(item=> d.push({val: item.uid, text: item.title}))
							}
							for (let i = 0; i < d.length; i++) {
								let option = new Option().SetAttributes({'value':d[i].val}).Text(d[i].text);
								if (key == 'status' && element.status == d[i].val) option.SetAttributes({'selected': 'selected'});
								else if (key == 'region' && element.region == d[i].val) {
									console.log("element.uid=> ", element.uid);
									option.SetAttributes({'selected': 'selected'});
								}
								options.push(option);
							}
							let select = new Select().SetAttributes( {class: 'col-sm-12'} ).AddChilds(options);
							return select;
						} else {
							return new Input().SetAttributes( inputAttrs )
						}
					})()
				])
			])
		}

		if (typeof element !== 'undefined') {
			domTitle.Text(`Редактирование элемента. UID = [${element.uid}]`);
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
								this.#Show(packet.data);							
							break;
							case 'getDictUnitsSingleId':
								console.log("пакет===> ", packet.data);
								this.#AddNewElement(packet.data.list[0]);
							break;
							case 'getAppDictById':
								console.log('packet=> ', packet);
								if (packet.data.list.length > 0) {
									packet.data.list.map(item => this.#regions.push(item))
								}
								this.#GetDict();
							break;
							case 'delElementsFromDict':
								// console.log('this.#scUnits=> ', this.#scUnits);
								// console.log("удалили элементы справочника =>", packet.data);
								for (let i=0; i<packet.data.deleted.length; i++) {
									let index = this.#scUnits.findIndex((item)=> item.uid == packet.data.deleted[i]);
									// console.log('index=> ', index);
									if (index != -1) {
										let d = this.#scUnits.splice(index, 1);
										d[0].sc.DeleteObject();
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

