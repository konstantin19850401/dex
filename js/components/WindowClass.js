'use strict'
class WindowClass {
	#application;#transport;
	#hash;#container;#parent;
	#windowBody;#windowFooter;//#windowHeader;
	#windowTitle;
	#actions = [];
	#tableSelectedRows;
	#tableTotalRows;
	#footerDataType;
	constructor (application, parent) {
		this.#application = application;
		this.#hash = application.Toolbox.GenerateHash;
		this.#application.InsertHashInHashes(this.#hash, this);
		this.#transport = application.Transport;
		this.#parent = parent;
		this.#InitWindow();
	}
	get Hash () { return this.#hash; };
	get Application () { return this.#application; };
	get Container () { return this.#container; }
	get Transport() {return this.#transport;}
	get Parent() {return this.#parent;}
	get WindowBody() {return this.#windowBody;}
	set Title(title) { this.#parent.Title = `[ ${title} ]`; }
	get FooterDataType() {return this.#footerDataType; }

	#InitWindow() {
		if (typeof this.#parent !== "undefined") this.#container = new Div({parent: this.#parent.Container});
		else this.#container = new Div();
		this.#container.SetAttributes({class: "dexol-window dexol-window-container"}).AddChilds([
			this.#windowBody = new Div().SetAttributes({class: "dexol-window-body"}),
			this.#windowFooter = new Div().SetAttributes({class: "dexol-window-footer"}).AddChilds([
				// new Div().SetAttributes({class: "dexol-window-footer-table-info dexol-window-footer-table-info-filter"}).Text("Примененные фильтры: "),
				// new Div().SetAttributes({class: "dexol-window-footer-table-info dexol-window-footer-table-info-history"}).Text("История документа"),
				new Div().SetAttributes({class: "dexol-window-footer-table-info dexol-window-footer-table-info-journal"}).AddChilds([
						new Span().Text(""),
						// this.#footerDataType = new Div()
						this.#footerDataType = new Div()
					]),
				new Div().SetAttributes({class: "dexol-window-footer-table-info dex-table-tinfo"}).AddChilds([
						new Div().SetAttributes({class: "dex-table-tinfo-item"}).Text("Выделено: ").AddChilds([
						this.#tableSelectedRows = new Span().Text("0")
						]),
						new Div().SetAttributes({class: "dex-table-tinfo-item"}).Text("Всего: ").AddChilds([
							this.#tableTotalRows = new Span().Text("0")
						])
				])
			]),
		]);
	}
	AddControlAction(action) {
		this.#actions.push(action);
		this.#parent.AddAction(action);
	}
	set SetCntTotalRows(cnt) { this.#tableTotalRows.Text(cnt); }
	set SetCntSelectedRows(cnt) { this.#tableSelectedRows.Text(cnt); }
	AddTab(tab) {
		let allTabs = this.#parent.GetTabs();
		let t = allTabs.find(item=> item.hash == tab.hash);
		if (typeof t === "undefined") this.#parent.AddTab(tab);
	}
	HideControlls() {
		for (let i = 0; i < this.#actions.length; i++) this.#actions[i].Hide();
	}
	ShowControls() {
		for (let i = 0; i < this.#actions.length; i++) this.#actions[i].Show();
	}
	RemovePage () {
		this.Container.DeleteObject();
		this.#application.DeleteHash( this.#hash );
		
	}
}

