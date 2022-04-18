'use strict'
class ArrivalStoreHouse extends WindowClass {
	#transport;#dicts;
	#right;#headers;#arrivalTable;#cascadeList;
	constructor ( application, parent ) {
		super( application, parent );
		this.#transport = this.Application.Transport;
		this.Title = "Склад. Поступление";
		this.#GetDicts();
	}
	#GetDicts() {
		let packet = { com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getNewDicts', dicts: ["operators",'typesProducts','stocks','dexBases']}, hash: this.Hash};
		this.#transport.Get( packet );
	}
	#Init() {
		let cascade;
		this.#headers = [
			{uid: 0, titles: [{name: 'num', title: 'п/п'}, {name: 'icc', title: 'ICC'}, {name: 'msidn', title: 'MSISDN'}, {name: "tp", title: 'Тарифный план'}]}
		];
		this.#cascadeList = [
			{name: 'stock', sho: null, dict: 'stocks', labelTitle: 'Склад', rulles: [], value: null},
			{name: 'product', sho: null, dict: 'typesProducts', labelTitle: 'Тип товара', rulles: [], value: null},
			{name: 'operator', sho: null, dict: 'operators', labelTitle: 'Оператор', rulles: [{type: 'show', if: 'product', vals: [0]}], value: null},
			{name: 'base', sho: null, dict: 'dexBases', labelTitle: 'База', rulles: [{type: 'show', if: 'product', vals: [0]}, {type: 'link', check: 'operator', fromDictField: 'operator'}], value: null}
		]
		new Div({parent: this.CBody}).SetAttributes({class: 'window-two-block-app-body row'}).AddChilds([
			cascade = new Div().SetAttributes({class: 'col align-self-start col-sm-4'}),
			this.#right = new Div().SetAttributes({class: 'col align-self-end col-sm-8'})
		]);
		this.#arrivalTable = new ComplexTable( this.Application, this.#right);
		this.#arrivalTable.DomObject.style.height = `calc(${ this.CBody.DomObject.clientHeight }px - 5px)`;

		for (let i = 0; i < this.#cascadeList.length; i++) {
			new Div({parent: cascade}).SetAttributes({class: 'form-group'}).AddChilds([
				new Label().SetAttributes({class: 'col-sm-3 col-form-label'}).Text(this.#cascadeList[i].labelTitle),
				this.#cascadeList[i].sho = new Select().SetAttributes({class: 'col-sm-9'})
					.AddChilds((()=> {
						let arr = [];
						let dict = this.#dicts.find(item => item.name == this.#cascadeList[i].dict);
						for (let i = 0; i < dict.list.length; i++) {
							let option = new Option().SetAttributes({'value': dict.list[i].uid}).Text(dict.list[i].title);
							arr.push(option);
						}
						this.#cascadeList[i].value = dict.list[0].uid;
						return arr;
					})())
					.AddWatch(sho=> sho.DomObject.addEventListener('change', event=> {
						this.#cascadeList[i].value = isNaN(event.target.value) == true ? event.target.value : parseInt(event.target.value);
						this.#HandleRulles();
					}))
			])
			// if (this.#cascadeList[i].rulles.length > 0) {
			// 	this.#HandleRulles();
			// }
		}
	}
	#SetHeaders(uid) {

	}
	#HandleRulles() {
		console.log("this.#cascadeList==> ", this.#cascadeList);
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
					let itemCheck = this.#cascadeList.find(item => item.name == this.#cascadeList[i].rulles[j].check);
					let dict = this.#dicts.find(item => item.name == this.#cascadeList[i].dict);
					let check = itemCheck.value;
					for (let k = 0; k <  this.#cascadeList[i].sho.Childs.length; k++) {
						let attrs = this.#cascadeList[i].sho.Childs[k].Attributes;

						let item = dict.list.find(item => item.uid == attrs.value);
						console.log("item=> ", item, " dict=> ", dict);
						if (item.operator != itemCheck.value) this.#cascadeList[i].sho.Childs[k].Hide();
						else this.#cascadeList[i].sho.Childs[k].Show()

						console.log("currentOption=> ", attrs.value);
					}
					console.log("itemCheck=> ", itemCheck);

					// for (this.#cascadeList[i].rulles[j].sho.)

				}
			}
		}

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

