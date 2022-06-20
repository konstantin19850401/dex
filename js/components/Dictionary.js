"use strict"
class Dictionary extends WindowClass {
	#dictName;#description;#dictData;
	#table;
	#type = "dictionary";
	#addForm;
	#initControls = false;#show = false;
	constructor (application, parent, data) {
		super(application, parent);
		this.#dictName = data.name;
		this.#description  = data.description;
		this.Title = this.#description;
		this.#GetDictData();
	}
	get Type() {return this.#type;}
	get Name() {return this.#dictName;}
	get Description() {return this.#description; }
	#Initialization() {
		// заголовки таблицы
		if (typeof this.#table === "undefined") {
			this.#table = new ComplexTable(this.Application, this.WindowBody).AddWatcher({name: 'watchSelectedRows', func: rows => this.#SetSelectedCnt(rows)});
			for (let i = 0; i < this.#dictData.schema.length; i++) {
				let th = new Th().Text(this.#dictData.schema[i].title);
				let type = typeof this.#dictData.schema[i].foreignKey !== "undefined" ? "string" : this.#dictData.schema[i].type
				this.#table.AddHead(th, type);
			}
		} else this.#table.ClearBody();
		// наполним талицу значениями
		this.#dictData.list.map(item=> {
			let row = new Tr().SetAttributes({'uid_num': item.id}).AddWatch(sho=> {
				sho.DomObject.addEventListener("dblclick", event=> this.#ShowAddForm(item.id))
			});
			for (let i = 0; i < this.#dictData.schema.length; i++) {
				let text = item[this.#dictData.schema[i].name];
				if (typeof this.#dictData.schema[i].foreignKey !== "undefined") {
					let arr = this.#dictData.schema[i].foreignKey.split(".");
					let dict = this.Parent.GetDictByName(arr[0]);
					if (typeof dict !== "undefined") {
						if (typeof this.#dictData.schema[i].multy !== "undefined" && this.#dictData.schema[i].multy == true) {
							let t = text.split(",");
							let s = [];
							for (let j = 0; j < t.length; j++) {
								let itm = dict.list.find(itm => itm[ arr[1] ] == t[j]);
								if (typeof itm !== "undefined") s.push(itm.title);
							}
							text = s.join(", ");
						} else {
							let itm = dict.list.find(itm => itm[arr[1]] == text);
							if (typeof itm !== "undefined") text = itm.title;
						}
					}
				}
				row.AddChilds([ new Td().Text(text) ]);
			}
			this.#table.AddRow(row);
		})
		//controls
		if (!this.#initControls) this.#InitControls();
		// добавим ссылку на окно в табы
		this.AddTab({
			hash: this.Hash,
			sho: new A().SetAttributes({class: "dropdown-item"})
				.Text(`${this.#description}`)
				.AddChilds([
					new I().SetAttributes({class: "dropdown-item-close"})
					// new I().SetAttributes({class: "dropdown-item-close fas fa-times"})
						// .AddWatch(sho=> sho.DomObject.addEventListener("click", event=>this.RemovePage()))
				])
				.AddWatch(sho=> sho.DomObject.addEventListener("click", event=> this.Parent.SetCurrentWindows(this.Hash)))
		});
		if (!this.#show) this.Show();

		this.SetCntTotalRows = this.#dictData.list.length;
	}
	#InitControls() {
		let ctrs = [
			{type: "add", iconClass: "fas fa-user-plus", title: "Добавить новую запись", action: ()=> {this.#ShowAddForm()}},
			{type: "delete", iconClass: "fas fa-user-minus", title: "Удалить выбранное", action: ()=> {this.#DeleteRecord()}},
			{type: "clear", iconClass: "fas fa-trash", title: "Очистить справочник", action: ()=> {this.#ClearDict()}}
		];
		for (let i = 0; i < ctrs.length; i++) {
			let c = new Div().SetAttributes({class: "window-module-controls-item"}).AddChilds([
				new I().SetAttributes({class: ctrs[i].iconClass, title: ctrs[i].title})
			]).AddWatch(sho=> sho.DomObject.addEventListener("click", event=> ctrs[i].action()));
			this.AddControlAction(c);
		}
		this.#initControls = true;
	}
	#GetDictData() {
		this.Transport.Get({com: "skyline.apps.adapters", subcom: "appApi", data: {action: "getDictsRecordsV1", dict: this.#dictName}, hash: this.Hash});
	}
	#ShowAddForm(element) {
		let dr = new DictionaryRecord(this, element);
		dr.OnClose = ()=> { this.#GetDictData() };
	}
	#SetSelectedCnt(rows) {
		// console.log("выбрано ", rows.length , " строк");
		this.SetCntSelectedRows = rows.length;
	}
	#DeleteRecord() {
		let dels = [];
		let arr = this.#table.SelectedRows;
		let acslength = 300;
		if (arr.length > 0) {
			if (arr.length < acslength) {
				arr.map(item=> dels.push(item.Attributes.uid_num));
				let c = confirm(`Вы правда желаете удалить выделенные поля? uids=> [${dels}]`);
				if (c) {
					this.Transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'delElementsFromDictV1', dict: this.#dictName, list: dels}, hash: this.Hash});
				}
			} else {
				alert(`Вы можете удалить не более ${acslength} элементов`);
			}
		}
	}
	#ClearDict() {
		let c = confirm("Вы правда желаете очистить справочник?");
		if (c) this.Transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'clearDictV1', dict: this.#dictName}, hash: this.Hash});
	}
	Show() {
		this.#show = true;
		this.Title = this.#description;
		this.Container.ToggleClass("show");
		this.ShowControls();
	}
	Hide() {
		this.#show = false;
		this.Container.ToggleClass("show");
		this.HideControlls();
	}
	#EditRecord(hash, fields) {

	}
	GetDictByName(name) {
		return this.Parent.GetDictByName(name);
	}
	RemoveFromTabs(hash) {
		let tabs = this.Parent.GetTabs();
		for (let i = 0; i < tabs.length; i++) {
			if (tabs[i].hash == hash) {
				tabs[i].sho.DeleteObject();
				tabs.splice(i, 1);
				break;
			}
		}
	}
	#CreateNewRecord(hash, fields) {
		let data = {};
		let value = "";
		for (let i = 0; i < fields.length; i++) {
			let elem = document.getElementById(`${fields[i]}_${hash}`);
			if (elem.getAttribute("multiple") != null) {
				let options = document.querySelectorAll(`#${fields[i]}_${hash} option:checked`);
				if (typeof options !== 'undefined') {
					if (elem.getAttribute("where") != null) value = Array.from(options).map(el => el.value.split(".")[1]);
					else value = Array.from(options).map(el => el.value);

				}
			} else value = elem.value;
			data[fields[i]] = value;
		}
		this.Transport.Get({com: "skyline.apps.adapters", subcom: "appApi", data: {action: "createNewRecordInDictV1", dict: this.#dictName, fields: data}, hash: this.Hash});
	}
	Commands ( packet ) {
		console.log(`Пакет для Справочника  ${this.#dictName} =>`, packet);
		switch(packet.com) {
			case "skyline.apps.adapters":
				switch(packet.subcom) {
					case "appApi":
						switch (packet.data.action) {
							case "getDictsRecordsV1":
								if (packet.data.status == 200) {
									let dict = packet.data.list.find(item=> item.dictName == this.#dictName);
									if (typeof dict !== "undefined") {
										this.#dictData = dict;
										this.#Initialization();
										this.Parent.UpdateDictByName(this.#dictName, dict);
									}
								}
							break;
							case "createNewRecordInDictV1":
								if (packet.data.status == 200) {
									this.#addForm.DeleteObject();
									this.#GetDictData();
								}
							break;
							case "delElementsFromDictV1":
								if (packet.data.status == 200) {
									this.#GetDictData();
								}
							break;
							case "clearDictV1":
								if (packet.data.status == 200) {
									this.#GetDictData();
								}
							break;
						}
					break;
				}
			break;
		}
	}
}

