"use strict"
class DictionaryRecord {
	#dictName;#hash;#transport;#application;#container;#parent;#data;
	#type = "dictionaryRecord";
	#schema;#onClose;
	#idRecord;
	#autocomplete = [];
	constructor (parent, idRecord) {
		this.#dictName = parent.Name;
		this.#parent = parent;
		this.#application = parent.Application;
		this.#hash = this.#application.Toolbox.GenerateHash;
		this.#application.InsertHashInHashes(this.#hash, this);
		this.#transport = this.#application.Transport;
		this.#idRecord = idRecord;
		this.#GetSchema();
	}
	get Type() {return this.#type;}
	get Name() {return this.#dictName;}
	get Hash() {return this.#hash;}

	#Initialization(element) {
		let formHash = this.#application.Toolbox.GenerateHash;
		let formBody;let formFields = [];
		let text = typeof this.#idRecord !== "undefined" ? `${this.#idRecord} ` : "";
		this.#container = new Div({parent: this.#parent.Container}).SetAttributes({class: "dex-dict-action-form"}).AddChilds([
			new I().SetAttributes({class: "dex-dict-action-form-close fas fa-window-close"}).AddWatch(sho => {
				sho.DomObject.addEventListener("click", event => this.RemoveForm())
			}),
			new Span().SetAttributes({class: "dex-dict-action-form-title"})
				.Text(`${this.#parent.Description}. [ ${typeof this.#idRecord !== "undefined" ? "Редактирование" : "Добавление"} записи ${text}]`),
			new Div().SetAttributes({class: "dex-dict-action-form-body row"}).AddChilds([
				formBody = new Div()
			]),
			new Div().SetAttributes({class: "dex-configuration-footer"}).AddChilds([
				new Button().SetAttributes({class: "dex-dict-action-form_button"}).Text(typeof this.#idRecord !== "undefined" ? "Редактировать" : "Создать").AddWatch((el)=> {
					el.DomObject.addEventListener("click", ()=> {
						typeof element !== "undefined" ? this.#EditRecord(formHash, formFields) : this.#CreateNewRecord(formHash, formFields);
					})
				})
			])
		]);
		// нарисуем поля
		//
		console.log("схема=> ", this.#schema);
		this.#schema.map(item=> {
			formFields.push(item.name);
			let block = new Div({parent: formBody}).SetAttributes({class: "form-group row"});
			new Label({parent: block}).SetAttributes({class: "col-sm-4 col-form-label"}).Text(item.title);
			if (typeof item.foreignKey !== "undefined") {
				let foreign = item.foreignKey.split(".");
				let dict = this.#parent.GetDictByName(foreign[0]);
				console.log("dict=> ", dict);
				if (typeof dict !== "undefined") {
					let attrs = {class: "col-sm-12", id: `${item.name}_${formHash}`};
					if (typeof item.multy !== "undefined" && item.multy == true) {
						attrs.multiple = true;
						attrs.class = `${attrs.class} dex-dict-action-form_multy-select`;
						if (typeof item.where !== "undefined") attrs.where = true;
					}
					if (typeof element !== "undefined") console.log(" foreign[1] =>  ", foreign[1], " foreign[0]=> ", foreign[0], " element[item.name]=> ", element[item.name]);
					let select;
					new Div({parent: block}).SetAttributes({class: "col-sm-8"}).AddChilds([
						select = new Select().SetAttributes(attrs).AddChilds(
							(()=> {
								let arr = [];
								// добавим просто пустое значение и поставим ему selected
								if (item.multy != true) {
									let option = new Option();
									option.Value = -1;
									option.Text("??????????");
									option.SetAttributes({selected: true});
									arr.push(option);
								}
								dict.list.map(itm=> {
									if (typeof element === "undefined" && typeof itm.status !== 'undefined' && itm.status == 1 ||
										typeof element === "undefined" && typeof itm.status === 'undefined' ||
										typeof element !== "undefined" && typeof itm.status === "undefined" ||
										typeof element !== "undefined" && typeof itm.status !== "undefined" && itm.status != 1 && itm[foreign[1]] == element[item.name] ||
										typeof element !== "undefined" && typeof itm.status !== "undefined" && itm.status == 1

										// || typeof element !== "undefined" && typeof item.status !== "undefined" && item[foreign[1]] == element[foreign[1]]
										) {
										let option = new Option();
										option.Value = itm[foreign[1]];
										option.Text(itm.title);
										arr.push(option);
									}
								});
								return arr;
							})()
						)
					])


					// если есть зависимость, надо бы ее реализовать
					if (typeof item.where !== "undefined") {
						let field = document.getElementById(`${item.where.field}_${formHash}`);
						if (typeof field !== "undefined") {
							field.addEventListener("change", event=> {
								select.Reset(-1);
								let childs = select.Childs;
								for (let i = 0; i < childs.length; i++) {
									let ovalue = childs[i].Value;
									let arr  = ovalue.split(".");
									if (arr[0] == event.target.value) childs[i].Show();
									else childs[i].Hide();
								}
							})
							let temp = field.selectedIndex;
							// field.selectedIndex = 0;
							field.dispatchEvent(new Event('change'));
							field.selectedIndex = temp;
						}
					}

					// наполнить если редактирование
					if (typeof element !== "undefined" && typeof item.multy !== "undefined" && item.multy == true) {
						// console.log("есть mu");
						let values = element[item.name].split(",");
						if (typeof values !== "undefined") {
							for (let i = 0; i < select.Childs.length; i++) {
								if (values.indexOf(select.Childs[i].Value) != -1) {
									// console.log("выделяем ", select.Childs[i].Value);
									select.Childs[i].DomObject.setAttribute("selected", true);
								}
							}
						}
					} else {
						// console.log("Обычный селект ", select.DomObject);
						if (typeof element !== "undefined") {
							// console.log("Надо поставить значение ", element[item.name]);
							select.Value = element[item.name];
							// console.log("select.Value=> ", select.Value);
						}
					}
				}
			} else {
				let input;
				if (typeof item.ifAddress !== "undefined" && item.ifAddress == true) {
					input = new Textarea().SetAttributes({class: "col-sm-12 autocomplete", id: `${item.name}_${formHash}`});
					input.AddWatch(sho=> sho.DomObject.addEventListener('input', event=> this.#GetAddress(event.target.value, `${item.name}_${formHash}`)));
					this.#autocomplete.push({name: `${item.name}_${formHash}`, sho: new Autocomplete(input, [], true)});
				} else {
					input = new Input().SetAttributes({class: "col-sm-12", id: `${item.name}_${formHash}`});
				}
				new Div({parent: block}).SetAttributes({class: "col-sm-8"}).AddChilds([input]);
				if (typeof element !== "undefined") input.Value = element[item.name];
			}
		});

	}
	#EditRecord(hash, fields) {
		let data = {};
		let value = "";
		for (let i = 0; i < fields.length; i++) {
			let elem = document.getElementById(`${fields[i]}_${hash}`);
			if (elem.getAttribute("multiple") != null) {
				let options = document.querySelectorAll(`#${fields[i]}_${hash} option:checked`);
				if (typeof options !== 'undefined') {
					//if (elem.getAttribute("where") != null) value = Array.from(options).map(el => el.value.split(".")[1]);
					value = Array.from(options).map(el => el.value);

				}
			} else value = elem.value;
			if (value == -1 && fields[i] == "dict") data[fields[i]] = "";
			else data[fields[i]] = value;

		}
		console.log("fdata=> ", data);
		this.#transport.Get({com: "skyline.apps.adapters", subcom: "appApi", data: {action: "editDictV1", dict: this.#dictName, id: data.id, fields: data}, hash: this.#hash});
	}
	#CreateNewRecord(hash, fields) {
		let data = {};
		let value = "";
		for (let i = 0; i < fields.length; i++) {
			let elem = document.getElementById(`${fields[i]}_${hash}`);
			if (elem.getAttribute("multiple") != null) {
				let options = document.querySelectorAll(`#${fields[i]}_${hash} option:checked`);
				if (typeof options !== 'undefined') {
					//if (elem.getAttribute("where") != null) value = Array.from(options).map(el => el.value);
					value = Array.from(options).map(el => el.value);

				}
			} else value = elem.value;
			data[fields[i]] = value;
		}
		console.log("fdata=> ", data);
		this.#transport.Get({com: "skyline.apps.adapters", subcom: "appApi", data: {action: "createNewRecordInDictV1", dict: this.#dictName, fields: data}, hash: this.#hash});
	}

	#GetSchema() {
		this.#transport.Get({com: "skyline.apps.adapters", subcom: "appApi", data: {action: "getDictSchemaV1", dict: this.#dictName}, hash: this.#hash});
	}
	#GetRecord() {
		console.log("редактирование! Запросить запись ", this.#idRecord);
		this.#transport.Get({com: "skyline.apps.adapters", subcom: "appApi", data: {action: "getDictSingleIdV1", dict: this.#dictName, id: this.#idRecord}, hash: this.#hash});
	}
	#GetAddress(string, item) {
		if (typeof string !== 'undefined' && string != '') {
			this.#transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getKladrByOneString', string: string, item: item}, hash: this.#hash});
		}
	}
	RemoveForm () {
		this.#parent.RemoveFromTabs(this.#hash);
		if (this.#container) this.#container.DeleteObject();
		this.#application.DeleteHash( this.#hash );
		if (typeof this.#onClose !== "undefined") this.#onClose();

	}
	set OnClose(func) { this.#onClose = func; }

	Commands ( packet ) {
		console.log(`Пакет для записи или редактирования справочника  ${this.#dictName} =>`, packet);
		switch(packet.com) {
			case "skyline.apps.adapters":
				switch(packet.subcom) {
					case "appApi":
						switch (packet.data.action) {
							case "getDictSchemaV1":
								if (packet.data.status == 200) {
									if (typeof packet.data.list !== "undefined") {
										this.#schema = packet.data.list;
										if (typeof this.#idRecord !== "undefined") this.#GetRecord();
										else this.#Initialization();
									} else this.RemoveForm();
								}
							break;
							case "createNewRecordInDictV1":
								if (packet.data.status == 200) {
									console.log("запись создана, закрыть форму");
									this.RemoveForm();
								}
							break;
							case "getDictSingleIdV1":
								if (packet.data.status == 200) this.#Initialization(packet.data.list);
								else this.RemoveForm();
							break;
							case "editDictV1":
								if (packet.data.status == 200) this.RemoveForm();
							break;
							case "getKladrByOneString":
								if (packet.data.status == 200) {
									let autocompleteItem = this.#autocomplete.find(item=> item.name == packet.data.item);
									autocompleteItem.sho.List(packet.data.list);
									autocompleteItem.sho.IfInput();
								}
							break;
						}
					break;
				}
			break;
		}
	}
}

