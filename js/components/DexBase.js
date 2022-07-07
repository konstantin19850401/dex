"use strict"
class DexBase extends WindowClass {
	#name;#description;#data;#schema;#filter = {};
	#table;
	#type = "dexbase";
	#addForm;
	#initControls = false;#show = false;
	#operator;#preloader;
	#tasksSho;#tasksCnt = 0;#tasksCntInProcess = 0;#tasksCntSho;#tasksCntInProcessSho;#tasksListSho;
	constructor (application, parent, data) {
		super(application, parent);
		this.#name = data.id;
		this.#description  = data.description;
		this.Title = this.#description;
		this.#filter = {};
		this.#GetData();
	}
	get Type() {return this.#type;}
	get Name() {return this.#name;}
	get Description() {return this.#description; }
	set NewTask(task) {
		this.#tasksCnt++;
		this.#tasksCntInProcess++;
		this.#tasksCntSho.Text(this.#tasksCnt);
		this.#tasksCntInProcessSho.Text(this.#tasksCntInProcess);
		this.#tasksListSho.AddChilds([task]);
	}
	CompleteTask() {
		this.#tasksCntInProcess--;
		this.#tasksCntInProcessSho.Text(this.#tasksCntInProcess);
	}
	DeleteTask() {
		this.#tasksCnt--;
		this.#tasksCntSho.Text(this.#tasksCnt);
	}
	#Initialization() {
		// console.log("this.Parent.MenuDropDownList=> ", this.Parent.MenuDropDownList);
		// заголовки таблицы
		if (typeof this.#table === "undefined") {
			this.#table = new ComplexTable(this.Application, this.WindowBody)
			.AddWatcher({name: 'watchSelectedRows', func: rows => this.#SetSelectedCnt(rows)})
			.AddWatcher({name: 'watchContextMenu', func: (rows, coords) => this.#ShowContextMenu(rows, coords)})
			.AddWatcher({name: 'watchContextMenuItems', func: (rows, command) => this.#HandleSelectedContextMenuItems(rows, command)})
			for (let i = 0; i < this.#schema.length; i++) {
				let th = new Th().Text(this.#schema[i].title);
				// if (typeof this.#schema[i].foreignKey !== "undefined")
				let type = typeof this.#schema[i].foreignKey !== "undefined" ? "string" : this.#schema[i].type
				this.#table.AddHead(th, type);
			}
		} else this.#table.ClearBody();
		let colors = this.Parent.GetDictByName("colors");
		let dexColorStatuses = this.Parent.GetDictByName("dex_document_statuses");
		// console.log();
		// // наполним талицу значениями. Используем не блокирующий цикл, чтобы пользователь мог работать
		this.Application.Toolbox.Loop({
			length: this.#data.length,
			data: this.#data,
			toLoop: (loop, i)=> {
				// console.log("i=>", i);
				let item = this.#data[i];
				let row = new Tr().SetAttributes({'uid_num': item.id}).AddWatch(sho=> {
					// sho.DomObject.addEventListener("dblclick", event=> this.#ShowAddForm(item.id))
				});
				if (typeof item.status !== "undefined") {
					let dcs = dexColorStatuses.list.find(itm=> itm.uid == item.status);
					if (typeof dcs !== "undefined") {
						let cls = colors.list.find(itm=> itm.id == dcs.color);
						if (typeof cls !== "undefined" && typeof cls.code !== "undefined") {
							// row.DomObject.style.background = `#${cls}`;
							// console.log("cls=> ", cls);
							row.AddClass(cls.code);
						}
					}
				}
				for (let i = 0; i < this.#schema.length; i++) {
					let text = item[this.#schema[i].name];
					if (typeof this.#schema[i].foreignKey !== "undefined") {
						// console.log("this.#schema[i].foreignKey=> ", this.#schema[i].foreignKey);
						let arr = this.#schema[i].foreignKey.split(".");
						let dict = this.Parent.GetDictByName(arr[0]);
						// console.log("dict=> ", dict);
						if (typeof dict !== "undefined") {
							if (typeof this.#schema[i].multy !== "undefined" && this.#schema[i].multy == true) {
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
					else if (this.#schema[i].type == "date" && this.#schema[i].name == "jdocdate") {
						text = this.Application.Toolbox.JdocDateToDate(text);
					}
					row.AddChilds([ new Td().Text(text) ]);
				}
				this.#table.AddRow(row);
				loop();
			},
			callback: ()=> {
				// скроем прелоадер
				this.#HidePreloader();
			}
		});

		//controls
		if (!this.#initControls) {
			this.#InitControls();

			//добавить в контекстное меню элементы
			this.#AddElementsInContextMenu();
		}
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




		this.SetCntTotalRows = this.#data.length;



	}
	// get TasksSho() {return this.#tasksSho; }
	#AddElementsInContextMenu() {
		let contextMenu = this.#table.ContextMenu;
		let items = [
			{name: "print", title: "Печать", icon: "fa fa-print", items:
				[
					{name: "print.doc", title: "Форма печати договора", icon: "fa fa-print"},
				]
			},
			// {name: "change", title: "Изменить значение поля", icon: "fa fa-edit", items: []}
		];

		let dict = this.Parent.GetDictByName("bases");
		let record = dict.list.find(item=> item.sqlPoolName == this.#name);
		if (typeof record !== "undefined") {
			if (record.operator == "MTS") {
				// форма замены
				items[0].items.push({name: "print.replacement", title: "Форма печати замены", icon: "fa fa-print"});
				// иизменить значение поля
				// items[1].items.push({name: "change.city", title: "Город подключения", icon: "fa fa-city"});
				// items[1].items.push({name: "change.fio", title: "ФИО заполнившего договор", icon: "fa fa-male"});
				// items[1].items.push({name: "change.docdate", title: "Дату документа", icon: "fa fa-calendar-alt"});
				// items[1].items.push({name: "change.unitid", title: "Отделение", icon: "fa fa-address-book"});
				// items[1].items.push({name: "change.dpcode", title: "Код точки продаж", icon: "fa fa-location-arrow"});
				// items.push();
			}
		}
 		// console.log("справочник баз ", dict);

		contextMenu.AddItems(items);
	}
	#SearchData(element) {
		this.#filter.search = element.value;
	}
	#InitControls() {
		let ctrs = [
			{type: "period", name: "period", action: (element)=> {}},
			{type: "search", name: "search", action: (element)=> {this.#SearchData(element)}},
			{type: "btn", name: "add", iconClass: "fas fa-user-plus", title: "Добавить новую запись", action: ()=> {this.#ShowAddForm()}},
			{type: "btn", name: "filter", iconClass: "fas fa-filter", title: "Множественный фильтр", action: ()=> {this.#ShowAddForm()}},
			// {type: "btn", name: "delete", iconClass: "fas fa-user-minus", title: "Удалить выбранное", action: ()=> {this.#DeleteRecord()}},

		];
		for (let i = 0; i < ctrs.length; i++) {
			let c;
			if (ctrs[i].type == "btn") {
				c = new Div().SetAttributes({class: "window-module-controls-item"}).AddChilds([
					new I().SetAttributes({class: ctrs[i].iconClass, title: ctrs[i].title})
				]).AddWatch(sho=> sho.DomObject.addEventListener("click", event=> ctrs[i].action()));
			} else if (ctrs[i].type == "search") {
				c = new Div().SetAttributes({class: "window-module-controls-item input-group dex-search-block"}).AddChilds([
					new Div().SetAttributes({class: "form-outline"}).AddChilds([
						new Input().SetAttributes({type: "search", class: "form-control"})
							.AddWatch(sho=> sho.DomObject.addEventListener("input", event=> {
								ctrs[i].action(event.target);
								// а надо ли автоматически запрашивать данные если поле очистили по крестику?
								// if (this.#filter !== "undefined" && this.#filter.search == "" && typeof event.inputType === "undefined") this.#GetData();
							}))
							.AddWatch(sho=> sho.DomObject.addEventListener("keydown", event=> {
								if (event.keyCode === 13) this.#GetData()
							})),
						new Label().SetAttributes({class: "form-label"})
					]),
					new Button().SetAttributes({type: "button", class: "btn btn-light"}).AddChilds([
						new I().SetAttributes({class: "fas fa-search"})
					]).AddWatch(sho=> sho.DomObject.addEventListener("click", event=> this.#GetData()))
				]);
			} else if (ctrs[i].type == "period") {
				let period = new Period(this.Application);
				period.Container.AddClass("window-module-controls-item");
				period.OnChange(()=> {
					this.#filter.start = this.Application.Toolbox.ClientDateToServer(period.Data.start);
					this.#filter.end = this.Application.Toolbox.ClientDateToServer(period.Data.end);
					this.#GetData();
				});
				c = period.Container;
			}
			this.AddControlAction(c);
		}

		this.#table.AddContextMenu(new ContextMenu(this.Application, this));

		// из какой таблицы берем данные
		let o = [
			{value: "journal", text: "Журнал"},
			{value: "archive", text: "Архив"}
		];
		let customSelect = new CustomSelect(this.Application, this.FooterDataType, o);
		customSelect.SelectItem("journal");

		// повесить событие на выбор типа журнала
		customSelect.OnChange((selectedItem)=> {
			this.#filter.table = selectedItem.value;
			this.#GetData();
		});

		this.#initControls = true;

		// добавим прелоадер
		this.#preloader = new Div({parent: this.WindowBody}).SetAttributes({class: "dex-preloader-container preloader-hide"}).AddChilds([
		// this.#preloader = new Div({parent: this.WindowBody}).SetAttributes({class: "dex-preloader-container"}).AddChilds([
			new Div().SetAttributes({class: "dex-preloader"})
		]);

		// добавим отчеты
		let reports, reportsBlock;
		reportsBlock = new Div().SetAttributes({class: "btn-group dropdown"}).AddChilds([
			new Button().SetAttributes({class: "dropbtn", type: "button"}).AddChilds([
				new I().SetAttributes({class: "fas fa-user"})
			]).Text("Отчеты").AddWatch(sho=> {
				sho.DomObject.addEventListener("click", event=> reports.ToggleClass("show"))
			}),
			reports = new Div().SetAttributes({class: "dropdown-content"}).AddChilds([
				new A().SetAttributes({class: "dropdown-item"}).Text("Отчет по долгам")
					.AddWatch(sho=> sho.DomObject.addEventListener("click", event=> this.#CreateReport("dutyDocs"))),
				new A().SetAttributes({class: "dropdown-item"}).Text("Отчет сверка по ТП и документам")
					.AddWatch(sho=> sho.DomObject.addEventListener("click", event=> this.#CreateReport("sverka"))),
				new A().SetAttributes({class: "dropdown-item"}).Text("Отчет по остаткам")
					.AddWatch(sho=> sho.DomObject.addEventListener("click", event=> this.#CreateReport("leftovers"))),
				new A().SetAttributes({class: "dropdown-item"}).Text("Отчет по продажам за период")
					.AddWatch(sho=> sho.DomObject.addEventListener("click", event=> this.#CreateReport("subdealerSales")))

			])
		]);
		this.AddControlAction(reportsBlock);
		// добавим функции
		let func, funcBlock;
		funcBlock = new Div().SetAttributes({class: "btn-group dropdown"}).AddChilds([
			new Button().SetAttributes({class: "dropbtn", type: "button"}).AddChilds([
				new I().SetAttributes({class: "fas fa-user"})
			]).Text("Функции").AddWatch(sho=> {
				sho.DomObject.addEventListener("click", event=> func.ToggleClass("show"))
			}),
			func = new Div().SetAttributes({class: "dropdown-content"}).AddChilds([
				// new A().SetAttributes({class: "dropdown-item"}).Text("Архивирование документов"),
				// new A().SetAttributes({class: "dropdown-item"}).Text("Формирование группы документов"),
				// new A().SetAttributes({class: "dropdown-item"}).Text("Построение базы автодока")
			])
		]);

		// добавим ссылку на задачи
		this.FooterTasks.AddChilds([
			new Div().SetAttributes({class: "btn-group dropdown float-start", "data-icon": "fas fa-check-circle"}).AddChilds([
				new Button().SetAttributes({class: "dropbtn", type: "button"}).AddChilds([
					new I().SetAttributes({class: "fas fa-user"})
				]).Text("Список задач").AddWatch(sho=> {
					sho.DomObject.addEventListener("click", event=> this.#tasksListSho.ToggleClass("show"))
				}),
				this.#tasksListSho = new Div().SetAttributes({class: "dropdown-content dex-dropdown-up"})
			]),
			new Div().SetAttributes({class: "dex-tasks-label"}).Text("В процессе: ").AddChilds([
				this.#tasksCntInProcessSho = new Span().Text(this.#tasksCntInProcess),
			]),
			new Div().SetAttributes({class: "dex-tasks-label"}).Text("Всего: ").AddChilds([
				this.#tasksCntSho = new Span().Text(this.#tasksCnt),
			])
		]);

		this.AddControlAction(funcBlock);
	}
	#GetData() {
		this.#ShowPreloader();
		let packet = {com: "skyline.apps.adapters", subcom: "appApi", data: { action: 'listV1', subaction: 'period', base: this.#name, filter: this.#filter}, hash: this.Hash}
		console.log("packet=====> ", packet);
		this.Transport.Get(packet);
	}
	#ShowAddForm(element) {
		// let dr = new DictionaryRecord(this, element);
		// dr.OnClose = ()=> { this.#GetDictData() };
	}
	#ShowPreloader() {
		if (typeof this.#preloader !== "undefined") this.#preloader.RemoveClass("preloader-hide");
	}
	#HidePreloader() {
		if (typeof this.#preloader !== "undefined") this.#preloader.AddClass("preloader-hide");
	}
	#DeleteRecord() {
		// let dels = [];
		// let arr = this.#table.SelectedRows;
		// let acslength = 300;
		// if (arr.length > 0) {
		// 	if (arr.length < acslength) {
		// 		arr.map(item=> dels.push(item.Attributes.uid_num));
		// 		let c = confirm(`Вы правда желаете удалить выделенные поля? uids=> [${dels}]`);
		// 		if (c) {
		// 			// this.Transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'delElementsFromDictV1', dict: this.#dictName, list: dels}, hash: this.Hash});
		// 		}
		// 	} else {
		// 		alert(`Вы можете удалить не более ${acslength} элементов`);
		// 	}
		// }
	}
	#CalculatePreloader() {
		this.#preloader.DomObject.style.top = `${this.WindowBody.DomObject.getBoundingClientRect().top}px`;
		this.#preloader.DomObject.style.height = `${this.WindowBody.DomObject.offsetHeight}px`;
	}
	Show() {
		this.#show = true;
		this.Title = this.#description;
		this.Container.ToggleClass("show");
		this.ShowControls();
		this.#CalculatePreloader();
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
	#SetSelectedCnt(rows) {
		this.SetCntSelectedRows = rows.length;
	}
	#ShowContextMenu(rows, coords) {
		if (this.#table.SelectedRows.length > 0 ) {
			let wrapperWidth = this.Parent.Container.DomObject.offsetWidth;
			let wrapperHeight = this.Parent.Container.DomObject.offsetHeight;
			let contextWidth = this.#table.ContextMenu.Container.DomObject.offsetWidth;
			let contextHeight = this.#table.ContextMenu.Container.DomObject.offsetHeight;
			if (wrapperWidth < contextWidth * 2 + coords.x) {
				coords.x = coords.x - contextWidth;
				for (let i = 0; i < this.#table.ContextMenu.GetBlocks.length; i++) {
					if (typeof this.#table.ContextMenu.GetBlocks[i].items !== "undefined") {
						this.#table.ContextMenu.GetBlocks[i].sho.DomObject.style.marginLeft = `-${contextWidth * 1.92}px`;
					}
				}
			} else if (coords.x < contextWidth) {
				for (let i = 0; i < this.#table.ContextMenu.GetBlocks.length; i++) {
					if (typeof this.#table.ContextMenu.GetBlocks[i].items !== "undefined") {
						this.#table.ContextMenu.GetBlocks[i].sho.DomObject.style.marginLeft = `10px`;
					}
				}
			}
			if (wrapperHeight < contextHeight + coords.y) coords.y = coords.y - contextHeight;
			this.#table.ShowContextMenu(coords);
		}
	}
	#HandleSelectedContextMenuItems(rows, command) {
		console.log("Выбран элемент меню DexBase", command, " rows=> ", rows, " selectedRows=> ", this.#table.SelectedRows);
		let data = {action: 'hooks', base: this.#name};
		if (command == "print.doc") data.subaction = 'document.print.doc';
		else if (command == "print.replacement") data.subaction = 'document.replacement';
		else if (command == "change.fio") data.subaction = "document.change.fio";
		data.list = [];
		rows.map(item=> { if (typeof item.Attributes.uid_num !== "undefined") data.list.push(item.Attributes.uid_num) });
		console.log("data=====> ", data);
		this.Transport.Get({com: 'skyline.apps.adapters', subcom: 'appApi', data: data, hash: this.Hash});
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
		// this.Transport.Get({com: "skyline.apps.adapters", subcom: "appApi", data: {action: "createNewRecordInDictV1", dict: this.#dictName, fields: data}, hash: this.Hash});
	}
	#CreateReport(reportId) {
		let report;
		if (reportId == "dutyDocs") report = new ReportDutyDocs(this.Application, this);
		else if (reportId == "sverka") report = new Sverka(this.Application, this);
		else if (reportId == "leftovers") report = new Leftovers(this.Application, this);
		else if (reportId == "subdealerSales") report = new SubdealerSales(this.Application, this);
		// report.ShowQuestion();
		// let filter = {start: "20220601", end: "20220625"};
		// let packet = {com: "skyline.apps.adapters", subcom: "appApi", data: { action: 'reports', subaction: 'dutyDocs', base: this.#name, filter: filter}, hash: this.Hash}
		// console.log("packet=====> ", packet);
		// this.Transport.Get(packet);
	}
	#HandleHooks(data) {
		if ( data.subaction === 'document.print.doc' || data.subaction === 'document.replacement')
			window.open( `${ this.Application.Transport.Url }/adapters/printing/${ data.link }`);
		else if ( data.subaction === 'document.open.doc' ) {
				// console.log( 'пытаемся открыть документ ' );
				// new DexContract( this.Application, this, this.#base );
		}
	}
	Commands ( packet ) {
		console.log(`Пакет для базы  ${this.#name} =>`, packet);
		switch(packet.com) {
			case "skyline.apps.adapters":
				switch(packet.subcom) {
					case "appApi":
						switch (packet.data.action) {
							case "listV1":
								if (packet.data.status == 200) {
									this.#data = packet.data.list;
									this.#schema = packet.data.schema;
									this.#Initialization();
								}
							break;
							case "hooks":
								if (packet.data.status == 200) {
									this.#HandleHooks(packet.data);
								}
							break;
							case "reports":

							break;
						}
					break;
				}
			break;
		}
	}
}

