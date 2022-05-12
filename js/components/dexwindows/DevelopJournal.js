'use strict'
class DevelopJournal extends Dictionaries {
	#transport;#headers;#newElement;
	constructor ( application, parent ) {
		super( application, parent );
		this.#transport = application.Transport;
		this.Title = "Журнал разработчика";
		this.Init({actions: {
			add: ()=> {this.#AddNewElement()},
			// delete: ()=> {},
			getRecordById: (id)=> {}
		}});
		this.#InitTitles();
		this.#GetJournal();
	}
	#AddNewElement(element) {
		let formHash = this.Application.Toolbox.GenerateHash;
		let cbody,domTitle;
		let fields = {
			description: 'Данные записи',
		};
		this.#newElement = new Div( {parent: this.Parent.Container} ).SetAttributes( {class: 'dex-dict'} ).AddChilds([
			new I().SetAttributes( {class: 'dex-configuration-close fas fa-window-close'} ).AddWatch(sho => {
				sho.DomObject.addEventListener( 'click', event => this.#CloseNewElement() )
			}),
			domTitle = new Span().SetAttributes( {class: 'dex-configuration-title'} ).Text( `Добавление нового элемента` ),
			cbody = new Div().SetAttributes( {class: 'dex-contract-body row'} ),
			new Div().SetAttributes( {class: 'dex-configuration-footer'} ).AddChilds([
				new Button().SetAttributes( {class: 'dex-configuration-info-btn'} ).Text( typeof element !== 'undefined' ? 'Редактировать' : 'Создать').AddWatch((el)=> {
					el.DomObject.addEventListener( 'click', ()=> {
						typeof element !== 'undefined' ? this.#EditRecord(formHash, fields) : this.#CreateNewRecord(formHash, fields);
					} )
				})
			])
		]);
		let section = new Div( {parent: cbody} ).SetAttributes( );
		for (let key in fields) {
			let inputAttrs = {class: `col-sm-12`, type: 'text', id: `${key}_${formHash}`};
			if (key == 'id') inputAttrs.disabled = true;
			new Div( {parent: section} ).SetAttributes( {class: 'form-group row', name: key} ).AddChilds([
				new Label().SetAttributes( {class: 'col-sm-3 col-form-label'} ).Text(fields[key]),
				new Div().SetAttributes( {class: 'col-sm-9'} ).AddChilds([
					(()=> {
						let block;
						if (key == 'description') block = new Textarea().SetAttributes( inputAttrs );
						else block = new Input().SetAttributes( inputAttrs )
						return block;
					})()
				])
			]);
		}
		if (typeof element !== 'undefined') {
			domTitle.Text(`Редактирование элемента. UID = [${element.id}]`);
			for (let key in element) {
				if (typeof fields[key] !== 'undefined') document.getElementById(`${key}_${formHash}`).value = element[key];
			}
		}
	}
	#CreateNewRecord(formHash, fields) {
		let data = {};
		for (let key in fields) {
			let elt = document.getElementById(`${key}_${formHash}`);
			if (typeof elt !== 'undefined') data[key] = elt.value;
		}
		this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'createNewRecordInDevelopJournal', fields: data}, hash: this.Hash});
	}
	#EditRecord() {

	}
	#CloseNewElement() {
		this.#newElement.DeleteObject();
	}
	#GetJournal() {
		this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getDevelopJournal'}, hash: this.Hash});
	}
	#InitTitles() {
		this.#headers = [ {name: 'description', title: 'Описание записи'}, {name: 'author', title: 'Автор записи'}, {name: 'date', title: 'Дата записи'}];
		this.TableTitles = this.#headers;
	}
	Commands ( packet ) {
		console.log("пакет с сервера ", packet);
		switch ( packet.com ) {
			case 'skyline.apps.adapters':
				switch ( packet.subcom ) {
					case 'appApi':
						switch ( packet.data.action ) {
							case 'getDevelopJournal':
								if (packet.data.list.length > 0) this.TableData = packet.data.list;
							break;
							case 'createNewRecordInDevelopJournal':
								if (packet.data.status == 200) {
									this.#CloseNewElement();
									for (let i = 0; i < this.ScDict.length; i++) {
										this.ScDict[i].sc.DeleteObject();
									}
									this.ScDict = [];
									this.#GetJournal();
								} else alert(packet.data.err.join('\n'));
							break;
						}
					break;
				}
			break;
		}
	}
}

