'use strict'
class ArrivalStoreHouse extends WindowClass {
	#transport;#dicts;
	#right;#headers;#valHeaders = 0;#arrivalTable;#cascadeList;
	constructor ( application, parent ) {
		super( application, parent );
		this.#transport = this.Application.Transport;
		this.Title = "Склад. Поступление";
		this.#GetDicts();
	}
	#GetDicts() {
		let packet = { com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getNewDicts', dicts: ["operators",'typesProducts','stocks','dexBases', 'regions']}, hash: this.Hash};
		this.#transport.Get( packet );
	}
	#Init() {
		let cascade;
		this.#headers = [
			{uid: 0, titles: [{name: 'num', title: 'п/п'}, {name: 'icc', title: 'ICC'}, {name: 'msidn', title:'MSISDN'}, {name: "tp", title: 'Тарифный план'}]},
			{uid: 1, titles: [{name: 'num', title: 'п/п'}, {name: 'title', title: 'Наименование'}]}
		];
		this.#cascadeList = [
			{name: 'stock', sho: null, dict: 'stocks', labelTitle: 'Склад', rulles: [], value: null},
			{name: 'product', sho: null, dict: 'typesProducts', labelTitle: 'Тип товара', rulles: [], value: null},
			{name: 'operator', sho: null, dict: 'operators', labelTitle: 'Оператор', rulles: [{type: 'show', if: 'product', vals: [0]}], value: null},
			{name: 'base', sho: null, dict: 'dexBases', labelTitle: 'База', rulles: [
				{type: 'show', if: 'product', vals: [0]},
				{type: 'link', check: 'operator', fromDictField: 'operator'}
			], value: null},
			{name: 'region', sho: null, dict: 'regions', labelTitle: 'Регион', rulles: [], value: null}
		]
		new Div({parent: this.CBody}).SetAttributes({class: 'window-two-block-app-body row'}).AddChilds([
			cascade = new Div().SetAttributes({class: 'col align-self-start col-sm-4'}),
			this.#right = new Div().SetAttributes({class: 'col align-self-end col-sm-8'})
		]);
		this.#arrivalTable = new ComplexTable( this.Application, this.#right);
		this.#arrivalTable.DomObject.style.height = `calc(${ this.CBody.DomObject.clientHeight }px - 5px)`;

		for (let j = 0; j < this.#headers[0].titles.length; j++) {
			let newHeader = new Th().SetAttributes( ).Text( this.#headers[0].titles[j].title ).AddWatch( ( el )=> {
				el.DomObject.addEventListener('click', ( event ) => {this.#arrivalTable.SortByColIndex( el, i )})
			});
			this.#arrivalTable.AddHead( newHeader );
		}

		for (let i = 0; i < this.#cascadeList.length; i++) {
			new Div({parent: cascade}).SetAttributes({class: 'form-group'}).AddChilds([
				new Label().SetAttributes({class: 'col-sm-3 col-form-label'}).Text(this.#cascadeList[i].labelTitle),
				this.#cascadeList[i].sho = new Select().SetAttributes({class: 'col-sm-9'})
					.AddChilds((()=> {
						let arr = [];
						let dict = this.#dicts.find(item => item.name == this.#cascadeList[i].dict);
						for (let i = 0; i < dict.list.length; i++) {
							if (dict.list[i].status == 1) {
								let option = new Option().SetAttributes({'value': dict.list[i].uid}).Text(dict.list[i].title);
								// if (i == 0) option.SetAttributes({'selected': 'selected'});
								arr.push(option);
							}
						}
						this.#cascadeList[i].value = dict.list[0].uid;
						return arr;
					})())
					.AddWatch(sho=> sho.DomObject.addEventListener('change', event=> {
						this.#cascadeList[i].value = isNaN(event.target.value) == true ? event.target.value : parseInt(event.target.value);
						this.#HandleRulles(this.#cascadeList[i]);
						if (this.#cascadeList[i].name == 'product') {
							this.#arrivalTable.ClearHead();
							let headers = this.#headers.find(item=> item.uid == this.#cascadeList[i].value);
							this.#valHeaders = this.#cascadeList[i].value;
							for (let j = 0; j < headers.titles.length; j++) {
								let newHeader = new Th().SetAttributes( ).Text( headers.titles[j].title ).AddWatch( ( el )=> {
									el.DomObject.addEventListener('click', ( event ) => {this.#arrivalTable.SortByColIndex( el, i )})
								});
								this.#arrivalTable.AddHead( newHeader );
							}
						}
					}))
			])
		}

		// для вставки данных
		// из буфера обмена
		new Div({parent: cascade}).SetAttributes({class: 'form-group'}).AddChilds([
			new Label().SetAttributes({class: 'col-sm-3 col-form-label'}).Text('Вставить из буфера обмена'),
			new Textarea().SetAttributes({class: 'col-sm-9'}).AddWatch(sho=> {
				sho.DomObject.addEventListener('input', event=> {
					let rows = event.target.value.split(/\n/g);
					console.log("rows=> ", rows);
					if (rows != '') {
						for (let i = 0; i < rows.length; i++) {
							if (rows[i] != '') {
								let temp = rows[i].split('\t');
								let tdRows = [];
								let attrs = {'uid_num': i};
								let row = new Tr().SetAttributes( attrs );
								tdRows.push(new Td().Text(i + 1));
								for (let j = 0; j < temp.length; j++) {

									tdRows.push(new Td().Text(temp[j]));
									row.AddChilds(tdRows);
									this.#arrivalTable.AddRow( row );
								}
							}
						}
					}
					event.target.value = '';
				})
			})
		]);
		// из файла
		// new Div({parent: cascade}).SetAttributes({class: 'form-group'}).AddChilds([
		// 	new Label().SetAttributes({class: 'col-sm-3 col-form-label'}).Text('Вставить из файла'),
		// 	new Input().SetAttributes({type: 'file', class: 'col-sm-9'})
		// ]);

		this.#HandleRulles();
	}
	#SetHeaders(uid) {

	}
	#HandleRulles(cascadeListItem) {
		// console.log("this.#cascadeList==> ", this.#cascadeList);
		for (let i = 0; i < this.#cascadeList.length; i++) {
			for (let j = 0; j < this.#cascadeList[i].rulles.length; j++ ) {
				if (this.#cascadeList[i].rulles[j].type == "show" ) {
					if (typeof this.#cascadeList[i].rulles[j].if !== 'undefined') {
						let item = this.#cascadeList.find(item => item.name == this.#cascadeList[i].rulles[j].if);
						if (this.#cascadeList[i].rulles[j].vals.indexOf(item.value) == -1) {
							this.#cascadeList[i].sho.ObjectParent.Hide();
						} else this.#cascadeList[i].sho.ObjectParent.Show();
					}
				} else if (this.#cascadeList[i].rulles[j].type == "link") {
					if (typeof cascadeListItem == 'undefined' || cascadeListItem.name != this.#cascadeList[i].name) {
						let dict = this.#dicts.find(item => item.name == this.#cascadeList[i].dict);
						let operatorItem = this.#cascadeList.find(item => item.name == this.#cascadeList[i].rulles[j].check);
						let operator = operatorItem.value;
						let bases = dict.list.find(item => item.operator == operator);

						for (let k = 0; k < this.#cascadeList[i].sho.Childs.length; k++) this.#cascadeList[i].sho.Childs[k].Show();

						for (let k = 0; k < this.#cascadeList[i].sho.Childs.length; k++) {
							let base = this.#cascadeList[i].sho.Childs[k].Attributes.value;
							let find = bases;
							if (base == bases.uid) {
								this.#cascadeList[i].sho.DomObject.selectedIndex = k;
								this.#cascadeList[i].value = this.#cascadeList[i].sho.DomObject.value;
							} else {
								let curOptionOperator = dict.list.find(item=> item.uid == base);
								if (curOptionOperator.operator != operator) this.#cascadeList[i].sho.Childs[k].Hide();
							}
						}
					}
				}
			}
		}

		// console.log(this.#cascadeList);

	}
	Commands ( packet ) {
		// console.log(packet);
		switch ( packet.com ) {
			case 'skyline.apps.adapters':
				switch ( packet.subcom ) {
					case 'appApi':
						switch ( packet.data.action ) {
							case 'getNewDicts':
								console.log("=====> ", packet);
								if (Array.isArray(packet.data.list)) {
									this.#dicts = [];
									for (let i = 0; i < packet.data.list.length; i++) {
										this.#dicts.push(packet.data.list[i]);
									}
								}
								this.#Init();
							break;
						}
					break;
				}
			break;
		}
	}
}

