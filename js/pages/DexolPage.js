'use strict'
class DexolPage extends Page {
	#dicts;#bases;
	#shoDicts;#shoBases;#shoReports;#shoFunctions;
	#title;#actionsBlock;#tabs = [];#tabsSho;
	#pageWindows = [];#currentWindow;
	#menuDropList;
	constructor(application) {
		super(application);
		this.#GetDicts();
	}
	set Title(title) {this.#title.Text(title);}
	AddAction(action) {this.#actionsBlock.AddChilds([action])}
	AddTab(tab) {
		this.#tabsSho.AddChilds([tab.sho]);
		this.#tabs.push(tab);
	}
	get MenuDropDownList() {return this.#menuDropList;}
	SetCurrentWindows(hash) {
		let w = this.#pageWindows.find(item=> item.Hash == hash);
		if (typeof w !== "undefined") {
			if (this.#currentWindow.Hash != w.Hash) {
				if (typeof this.#currentWindow !== "undefined") this.#currentWindow.Hide();
				this.#currentWindow = w;
				this.#currentWindow.Show();
			}
		}
	}
	GetTabs() { return this.#tabs; }
	// ПРИВАТНЫЕ МЕТОДЫ
	#InitPage () {
		let prop; let offCanvas;let actionsBlock;
		this.Application.Container.SetAttributes({'class': 'application'});
		this.Container.AddChilds([
			new Div().SetAttributes({class: "navbar navbar-dark bg-dark"}).AddChilds([
				new Div().SetAttributes({class: "container-fluid"}).AddChilds([
					new Button().SetAttributes({class: "navbar-toggler navbar-toggler__button"}).AddChilds([
						new Span().SetAttributes({class: "navbar-toggler-icon"})
					]).AddWatch(sho=> sho.DomObject.addEventListener("click", event=> {
						offCanvas.ToggleClass("show");
					})),
					new Div().SetAttributes({class: "nav window-module"}).AddChilds([
						this.#title = new Div().SetAttributes({class: "navbar-window-title nav-item"}),

					]),
					this.#menuDropList = new Div().AddChilds([
						this.#actionsBlock = new Div().SetAttributes({class: "window-module-controls"}),
						new Div().SetAttributes({class: "btn-group dropdown"}).AddChilds([
							new Button().SetAttributes({class: "dropbtn", type: "button"}).AddChilds([
								new I().SetAttributes({class: "fas fa-user"})
							]).Text("Настройки").AddWatch(sho=> {
								sho.DomObject.addEventListener("click", event=> prop.ToggleClass("show"))
							}),
							prop = new Div().SetAttributes({class: "dropdown-content"}).AddChilds([
								new A().SetAttributes({class: "dropdown-item"}).Text("Блокировать"),
								new A().SetAttributes({class: "dropdown-item"}).Text("Выход")
							])
						]),
						new Div().SetAttributes({class: "btn-group dropdown"}).AddChilds([
							new Button().SetAttributes({class: "dropbtn", type: "button"})
								.AddChilds([new I().SetAttributes({class: "fas fa-user"})])
								.Text("Вкладки")
								.AddWatch(sho=> sho.DomObject.addEventListener("click", event=> {if (this.#tabs.length > 0) this.#tabsSho.ToggleClass("show")})),
							this.#tabsSho = new Div().SetAttributes({class: "dropdown-content"})
						])
					])
				])
			]),
			offCanvas = new Div().SetAttributes({class: "offcanvas offcanvas-start", "data-bs-scroll": "true", "aria-labelledby": "offcanvasWithBothOptionsLabel"}).AddChilds([
					new Div().SetAttributes({class: "offcanvas-header"}).AddChilds([
						new H5().Text("Выберите действие")
					]),
					new Div().SetAttributes({class: "offcanvas-body"}).AddChilds([
						new Div().SetAttributes({class: "offcanvas-body-item"}).Text("Базы данных").AddChilds([
							this.#shoBases = new Ul().SetAttributes({class: "list-group list-group-flush"})
						]),
						new Div().SetAttributes({class: "offcanvas-body-item"}).Text("Справочники").AddChilds([
							this.#shoDicts = new Ul().SetAttributes({class: "list-group list-group-flush"})
						])
					])
				])
		]);

		// добавим справочники в меню
		this.#dicts.map(item=> {
			this.#shoDicts.AddChilds([
				new Li().SetAttributes({class: "list-group-item"})
					.Text(item.description)
					.AddWatch(sho=> sho.DomObject.addEventListener("click", event=> {
						if (typeof this.#currentWindow !== "undefined") this.#currentWindow.Hide();
						let w = this.#pageWindows.find(itm=> itm.Type == "dictionary" && itm.Name == item.name);
						if (typeof w !== "undefined") w.Show();
						else {
							w = new Dictionary(this.Application, this, item);
							this.#pageWindows.push(w);
						}
						this.#currentWindow = w;
					}))
			])
		});
		// добавим базы в меню
		this.#bases.map(item=> {
			this.#shoBases.AddChilds([
				new Li().SetAttributes({class: "list-group-item"})
					.Text(item.description)
					.AddWatch(sho=> sho.DomObject.addEventListener("click", event=> {
						if (typeof this.#currentWindow !== "undefined") this.#currentWindow.Hide();
						let w = this.#pageWindows.find(itm=> itm.Type == "dexbase" && itm.Name == item.id);
						if (typeof w !== "undefined") w.Show();
						else {
							w = new DexBase(this.Application, this, item);
							this.#pageWindows.push(w);
						}
						this.#currentWindow = w;
					}))
			]);
		})
	}
	#GetDicts() {
		this.Transport.Get({com: "skyline.apps.adapters", subcom: "appApi", data: {action: "getNewAllDictsV1"}, hash: this.Hash});
	}
	#GetBases() {
		this.Transport.Get({com: "skyline.apps.adapters", subcom: "appApi", data: {action: "getBasesV1"}, hash: this.Hash});
	}
	GetDictByName(name) {
		let dict = this.#dicts.find(item=> item.name == name);
		return dict;
	}
	UpdateDictByName(name, newDict) {
		for (let i = 0; i < this.#dicts.length; i++) {
			if (this.#dicts[i].name == name) {
				this.#dicts[i].list = newDict.list;
				break;
			}
		}
	}

	// ПУБЛИЧНЫЕ МЕТОДЫ
	Commands ( packet ) {
		console.log("Пакет для DexolPage ", packet);
		switch(packet.com) {
			case 'skyline.apps.adapters':
				switch(packet.subcom) {
					case "appApi":
						switch (packet.data.action) {
							case "getNewAllDictsV1":
								if (packet.data.status == 200) {
									this.#dicts = packet.data.list;
									this.#GetBases();
								}
							break;
							case "getBasesV1":
								if (packet.data.status == 200) {
									this.#bases = packet.data.list;
									this.#InitPage();
								}
							break;
						}
					break;
				}
			break;
		}
	}
}

