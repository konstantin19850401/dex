'use strict'
class ArrivalStoreHouse extends WindowClass {
	#transport;#dicts;
	#right;#headers;#valHeaders = 0;#arrivalTable;#cascadeList;
	#data = [];
	constructor ( application, parent ) {
		super( application, parent );
		this.#transport = this.Application.Transport;
		this.Title = "Склад. Поступление";
		this.#GetDicts();
	}
	#GetDicts() {
		let packet = { com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getNewDicts', dicts: ["operators",'typesProducts','stocks','dexBases', 'regions', 'balance','simTypes','contractors']}, hash: this.Hash};
		this.#transport.Get( packet );
	}
	#Init() {
		let cascade;
		this.#data = [];
		this.Instruments.AddChilds([
			new Div().SetAttributes( {class: 'dex-app-window-filter'} ).AddChilds([
				new Button().SetAttributes({class: 'dex-menu-btn'})
					.Text('Создать документ')
					.AddWatch(sho=> sho.DomObject.addEventListener('click', event=> this.#Create()))
			])
		]);
		this.#headers = [
			{uid: 0, titles: [{name: 'num', title: 'п/п'}, {name: 'icc', title: 'ICC'}, {name: 'msidn', title:'MSISDN'}, {name: "tp", title: 'Тарифный план'}]},
			{uid: 1, titles: [{name: 'num', title: 'п/п'}, {name: 'title', title: 'Наименование'}]},
			{uid: 2, titles: [{name: 'num', title: 'п/п'}, {name: 'icc', title: 'ICC'}]}
		];
		this.#cascadeList = [
			{name: 'stock', sho: null, dict: 'stocks', labelTitle: 'Склад', rulles: [], value: null},
			{name: 'contractors', sho: null, dict: 'contractors', labelTitle: 'Поставщик', rulles: [], value: null},
			{name: 'product', sho: null, dict: 'typesProducts', labelTitle: 'Тип товара', rulles: [], value: null},
			{name: 'simTypes', sho: null, dict: 'simTypes', labelTitle: 'Тип SIM', rulles: [{type: 'show', if: 'product', vals: [0]}], value: null},
			{name: 'operator', sho: null, dict: 'operators', labelTitle: 'Оператор', rulles: [{type: 'show', if: 'product', vals: [0]}], value: null},
			{name: 'base', sho: null, dict: 'dexBases', labelTitle: 'База', rulles: [
				{type: 'show', if: 'product', vals: [0]},
				{type: 'link', check: 'operator', fromDictField: 'operator'}
			], value: null},
			{name: 'region', sho: null, dict: 'regions', labelTitle: 'Регион', rulles: [], value: null},
			{name: 'balance', sho: null, dict: 'balance', labelTitle: 'Баланс', rulles: [{type: 'show', if: 'product', vals: [0]}], value: null},

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
				this.#cascadeList[i].sho = new Select()
				.SetAttributes({class: 'col-sm-9'})
				.AddChilds((()=> {
					let arr = [];
					let dict = this.#dicts.find(item => item.name == this.#cascadeList[i].dict);
					let firts = null;
					for (let i = 0; i < dict.list.length; i++) {
						if (dict.list[i].status == 1) {
							if (firts === null) firts = dict.list[i].uid;
							let option = new Option().SetAttributes({'value': dict.list[i].uid}).Text(dict.list[i].title);
							arr.push(option);
						}
					}
					console.log("ставим для ", this.#cascadeList[i].dict, " => ", firts);
					this.#cascadeList[i].value = firts;
					return arr;
				})())
				.AddWatch(sho=> sho.DomObject.addEventListener('change', event=> {
					this.#cascadeList[i].value = isNaN(event.target.value) == true ? event.target.value : parseInt(event.target.value);
					// if (typeof this.#cascadeList[i].rulles !== 'undefined' && this.#cascadeList[i].rulles.length > 0) {
						this.#HandleRulles(this.#cascadeList[i]);
						if (this.#cascadeList[i].name == 'product' || this.#cascadeList[i].name == 'simTypes') {
							this.#arrivalTable.Clear();
							let headers;
							if (this.#cascadeList[i].name == 'simTypes') {
								if (this.#cascadeList[i].value == '0' || this.#cascadeList[i].value == '1') {
									headers = this.#headers.find(item=> item.uid == 0);
								} else if (this.#cascadeList[i].value == '2') {
									headers = this.#headers.find(item=> item.uid == 2);
								}
							} else {
								let chech = this.#cascadeList.find(item=> item.name == 'simTypes');
								// console.log("chech=> ", chech.value, ' this.#cascadeList[i].value=> ', this.#cascadeList[i].value );
								if (chech.value != 2 && this.#cascadeList[i].value == 0) headers = this.#headers.find(item=> item.uid == 0);
								else if (chech.value == 2 && this.#cascadeList[i].value == 0) headers = this.#headers.find(item=> item.uid == 2);
								else headers = this.#headers.find(item=> item.uid == 1);
							}
							this.#valHeaders = this.#cascadeList[i].value;
							for (let j = 0; j < headers.titles.length; j++) {
								let newHeader = new Th().SetAttributes( ).Text( headers.titles[j].title ).AddWatch( ( el )=> {
									el.DomObject.addEventListener('click', ( event ) => {this.#arrivalTable.SortByColIndex( el, i )})
								});
								this.#arrivalTable.AddHead( newHeader );
							}
						}
					// }
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
					if (rows != '') {
						this.#data = [];
						for (let i = 0; i < rows.length; i++) {
							if (rows[i] != '') {
								let temp = rows[i].split('\t');
								let tdRows = [];
								let attrs = {'uid_num': i};
								let row = new Tr().SetAttributes( attrs );
								let dataRow = {};
								tdRows.push(new Td().Text(i + 1));
								for (let j = 0; j < temp.length; j++) {
									dataRow[this.#headers[this.#valHeaders].titles[j+1].name] = temp[j];
									tdRows.push(new Td().Text(temp[j]));
									row.AddChilds(tdRows);
								}
								this.#data.push(dataRow);
								this.#arrivalTable.AddRow( row );
							}
						}
					}
					event.target.value = '';
				})
			})
		]);
		this.#HandleRulles();
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
	#Create() {
		let data = {};
		for (let i = 0; i < this.#cascadeList.length; i++) {
			data[this.#cascadeList[i].name] = this.#cascadeList[i].value;
		}
		console.log("fdata=> ", data, " data=> ", this.#data);
		let packet = { com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'createDocumentInStoreHouse', params: data, list: this.#data}, hash: this.Hash};
		this.#transport.Get( packet );
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
							case 'createDocumentInStoreHouse':
								console.log("createDocumentInStoreHouse=> ", packet);
								if (packet.data.status == 200) this.Close();
								else if (typeof packet.data.errs !== 'undefined' && packet.data.errs.length > 0) {
									if (typeof packet.data.double !== 'undefined') {
										for (let i = 0; i < this.#arrivalTable.Tbody.Childs.length; i++) {
											if (packet.data.double.indexOf(i) != -1) this.#arrivalTable.Tbody.Childs[i].AddClass('bg-warning');
										}
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

