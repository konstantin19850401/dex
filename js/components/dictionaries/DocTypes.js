'use strict'
class DocTypes extends Dictionaries {
	#docTypes = [];#cbody;#docTypesTable;#transport;#headers;#newElement;
	#scDocTypes = [];
	constructor ( application, parent) {
		super( application, parent );
		this.Title = "Справочник типов документов";
		this.Init({actions: {
			add: ()=> {this.#AddNewElement()},
			delete: ()=> {this.#DeleteElement()},
			getRecordById: (id)=> {this.#GetDataById(id)}
		}});
		this.#InitTitles();
		this.#GetDict();
	}
	#InitTitles( data ) {
		this.#headers = [{name: 'uid', title: 'id'}, {name: 'title', title: 'Наименование типа документа'}];
		this.TableTitles = this.#headers;
	}
	#AddRows() {
		for (let i=0; i< this.#docTypes.length; i++) {
			let attrs = {'uid_num': this.#docTypes[i].uid};
			if (this.#docTypes[i].status == 0) attrs.class = "bg-secondary bg-gradient";
			let row = new Tr().SetAttributes( attrs );
			for (let j=0; j<this.#headers.length; j++) {
				row.AddChilds([ new Td().Text( this.#docTypes[i][this.#headers[j].name] ) ]);
			}
			row.AddWatch(sho=> sho.DomObject.addEventListener('dblclick', event=> this.#GetDataById(this.#docTypes[i].uid)) );
			this.#docTypesTable.AddRow( row );
			this.#scDocTypes.push({uid: this.#docTypes[i].uid, sc: row});
		}
	}
	#CloseNewElement() {
		this.#newElement.DeleteObject();
	}
	#GetDataById(id) {
		if (id) this.Transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getDictDocTypesSingleId', id: id}, hash: this.Hash});
	}
	#GetDict() {
		this.Transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getDictDocTypes'}, hash: this.Hash});
	}
	//удаление елемента
	#DeleteElement() {
		let dels = [];
		let arr = this.Table.SelectedRows;
		let acslength = 300;
		if (arr.length > 0) {
			if (arr.length < acslength) {
				arr.map(item=> dels.push(item.Attributes.uid_num));
				let c = confirm(`Вы правда желаете удалить выделенные поля? uids=> [${dels}]`);
				if (c) {
					this.Transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'delElementsFromDict', dict: 'docTypes', elements: dels}, hash: this.Hash});
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
			uid: 'id типа документа',
			title: 'Наименование',
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

		let sel = ['status'];
		let hiddens = ['uid'];
		for (let key in fields) {
			let inputAttrs = {class: `col-sm-12`, type: 'text', id: `${key}_${formHash}`};
			if (key == 'uid') inputAttrs.disabled = true;
			let block = new Div( {parent: section} ).SetAttributes( {class: 'form-group row', name: key} ).AddChilds([
				new Label().SetAttributes( {class: 'col-sm-3 col-form-label'} ).Text(fields[key]),
				new Div().SetAttributes( {class: 'col-sm-9'} ).AddChilds([
					(()=> {

						if (sel.indexOf(key) != -1) {
							let options = [];
							let d = [];
							if (key == 'status') d = [{val: 0, text: 'Заблокировано'}, {val: 1, text: 'Активно'}];
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
			domTitle.Text(`Редактирование элемента. UID = [${element.uid}]`);
			for (let key in element) {
				// console.log('key=> ', key);
				if (typeof fields[key] !== 'undefined' && key != 'status') document.getElementById(`${key}_${formHash}`).value = element[key];
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
		let data = this.#CreatePacketData(formHash, fields);
		this.Transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'editDocType', fields: data}, hash: this.Hash});
	}
	#CreateNewUnit(formHash, fields) {
		let data = this.#CreatePacketData(formHash, fields);
		this.Transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'createNewDocType', fields: data}, hash: this.Hash});
	}
	// ПУБЛИЧНЫЕ МЕТОДЫ
	Commands ( packet ) {
		console.log( packet );
		switch ( packet.com ) {
			case 'skyline.apps.adapters':
				switch ( packet.subcom ) {
					case 'appApi':
						switch ( packet.data.action ) {
							case "getDictDocTypes":
								if (packet.data.list.length > 0) this.TableData = packet.data.list;
							break;
							case 'createNewDocType':
								if (packet.data.status == 200) {
									this.#CloseNewElement();
									this.CrearScDict();
									this.#GetDict();
								} else {
									alert(packet.data.err.join('\n'));
								}
							break;
							case "getDictDocTypesSingleId":
								this.#AddNewElement(packet.data.list[0]);
							break;
							case "editDocType":
								if (packet.data.status == 200) {
									this.#CloseNewElement();
									this.CrearScDict();
									this.#GetDict();
								} else {
									alert(packet.data.err.join('\n'));
								}
							break;
							case 'delElementsFromDict':
								// for (let i=0; i<packet.data.deleted.length; i++) {
								// 	let index = this.ScDict.findIndex((item)=> item.uid == packet.data.deleted[i]);
								// 	if (index != -1) {
								// 		let d = this.ScDict.splice(index, 1);
								// 		d[0].sc.DeleteObject();
								// 	}
								// }
								this.CrearScDict();
								this.#GetDict();
							break;
						}
					break;
				}
			break;
		}
	}
}

