'use strict'
class Regions extends Dictionaries {
	#newElement;
	constructor ( application, parent) {
		super( application, parent );
		this.Title = "Справочник регионов РФ";
		this.DictName = 'regions';
		this.Init({actions: {
			add: ()=> {this.#AddNewElement()},
			delete: ()=> {this.#DeleteElement()},
			getRecordById: (id)=> {this.GetRecordById(id)}
		}});
		this.#InitTitles();
		this.GetDictRecords();
	}
	#InitTitles( data ) {
		this.TableTitles = [{name: 'id', title: 'id'}, {name: 'uid', title: 'Код'}, {name: 'title', title: 'Наименование статуса'}, {name: 'short_title', title: 'Короткое имя'}, {name: 'def_bases', title: 'Базы'}, {name: 'status', title: 'Статус'}];
	}
	#CloseNewElement() {
		this.#newElement.DeleteObject();
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
					// console.log( 'dels=> ', dels);
					this.Transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'delElementsFromDict', dict: 'statuses', elements: dels}, hash: this.Hash});
				}
			} else {
				alert(`Вы можете удалить не более ${acslength} элементов`);
			}
		}
	}
	//добавление нового элемента в справочник
	#AddNewElement(element) {
		let formHash = this.Application.Toolbox.GenerateHash;
		let domTitle, cbody;
		let fields = {
			uid: 'uid',
			title: 'Наименование статуса',
		};
		// console.log(this.Application);
		this.#newElement = new Div( {parent: this.Parent.Container} ).SetAttributes( {class: 'dex-dict'} ).AddChilds([
			new I().SetAttributes( {class: 'dex-configuration-close fas fa-window-close'} ).AddWatch(sho => {
				sho.DomObject.addEventListener( 'click', event => this.#CloseNewElement() )
			}),
			domTitle = new Span().SetAttributes( {class: 'dex-configuration-title'} ).Text( `Добавление нового элемента` ),
			cbody = new Div().SetAttributes( {class: 'dex-contract-body row'} ),
			new Div().SetAttributes( {class: 'dex-configuration-footer'} ).AddChilds([
				new Button().SetAttributes( {class: 'dex-configuration-info-btn'} ).Text( typeof element !== 'undefined' ? 'Редактировать' : 'Создать').AddWatch((el)=> {
					el.DomObject.addEventListener( 'click', ()=> {
						typeof element !== 'undefined' ? this.#EditUnit(formHash, fields) : this.#CreateNewUnit(formHash, fields);
					} )
				})
			])
		]);
		let section = new Div( {parent: cbody} );

		let hiddens = [];
		for (let key in fields) {
			// console.log('key => ', key);
			// if ( key == 'uid' && typeof element !== 'undefined' || key != 'uid') {
				let inputAttrs = {class: `col-sm-12`, type: 'text', id: `${key}_${formHash}`};
				if (key == 'uid' && typeof element !== 'undefined') inputAttrs.disabled = true;
				let block = new Div( {parent: section} ).SetAttributes( {class: 'form-group row', name: key} ).AddChilds([
					new Label().SetAttributes( {class: 'col-sm-3 col-form-label'} ).Text(fields[key]),
					new Div().SetAttributes( {class: 'col-sm-9'} ).AddChilds([
						(()=> {
							let block = new Input().SetAttributes( inputAttrs );
							return block;
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
		let data = this.#CreatePacketData(formHash, fields);
		this.Transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'editStatus', fields: data}, hash: this.Hash});
	}
	#CreateNewUnit(formHash, fields) {
		let data = this.#CreatePacketData(formHash, fields);
		this.Transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'createNewStatus', fields: data}, hash: this.Hash});
	}
	// ПУБЛИЧНЫЕ МЕТОДЫ
	Commands ( packet ) {
		console.log( packet );
		switch ( packet.com ) {
			case 'skyline.apps.adapters':
				switch ( packet.subcom ) {
					case 'appApi':
						switch ( packet.data.action ) {
							case 'getDictRecords':
								if (packet.data.list.length > 0) this.TableData = packet.data.list;
							break;
							case 'getDictSingleId':
								this.#AddNewElement(packet.data.list[0]);
							break;
							case 'delElementsFromDict':
								this.CrearScDict();
								this.GetDictRecords();
							break;
							case 'createNewStatus':
								if (packet.data.status == 200) {
									this.#CloseNewElement();
									this.CrearScDict();
									this.GetDictRecords();
								} else {
									alert(packet.data.errs.join('\n'));
								}
							break;
							case 'editStatus':
								if (packet.data.status == 200) {
									this.#CloseNewElement();
									this.CrearScDict();
									this.GetDictRecords();
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

