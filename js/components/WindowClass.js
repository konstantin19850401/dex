'use strict'
class WindowClass {
	#parent;#container;#application;#hash;#wTitle = "";
	#shoTitle;#instruments;#cbody;#info;
	#funcOnClose;
	constructor ( application, parent ) {
		this.#application = application;
		this.#parent = parent;
		this.#hash = this.#application.Toolbox.GenerateHash;
		this.#application.InsertHashInHashes( this.#hash, this );
		this.#Initialization();
	}
	#Initialization() {
		this.#container = new Div({parent: this.Parent.Wrapper})
			.SetAttributes({class: 'dex-app-window'})
			.AddChilds([
				new I().SetAttributes({class: 'dex-app-window-close fas fa-window-close'})
					.AddWatch(sho=> sho.DomObject.addEventListener("click", event=> this.Close())),
				this.#shoTitle = new Span().SetAttributes({class: 'dex-app-window-title'}).Text(`${this.#wTitle}`),
				this.#instruments = new Div().SetAttributes({class: "dex-app-window-instruments"}),
				this.#info = new Div().SetAttributes({class: "dex-app-window-info"}),
				this.#cbody = new Div().SetAttributes( {class: 'dex-app-window-body'} )
			]);
		this.#application.TaskBar.AddMenuNewItem( this );
	}

	get Parent() {return this.#parent;}
	get Application() {return this.#application;}
	get Hash() {return this.#hash;}
	get Container () {return this.#container;}
	get Title() {return this.#wTitle;}
	get Instruments() {return this.#instruments;}
	get Info() {return this.#info;}
	get CBody() {return this.#cbody;}

	set Container(shoObject) {this.#container = shoObject;}
	set Title(title) {
		this.#wTitle = title;
		this.#application.TaskBar.ChangeWindowTitle(this.#hash, title);
		this.#shoTitle.Text(title);
		let width = this.#shoTitle.DomObject.offsetWidth;
		this.#instruments.DomObject.style.left = `${width + 5}px`;
	}

	Close() {
		this.#application.TaskBar.DeleteWindow( this.#hash );
		// this.Parent.DeleteWindow( this.#hash );
		this.Container.DeleteObject();
		if (typeof this.#funcOnClose !== 'undefined') this.#funcOnClose();
	}
	Minimize() {
		this.#container.DomObject.style.width = '0px';
		// this.#container.DomObject.style.display = 'none';
		this.Hide();
	}
	Maximize() {
		// this.#container.DomObject.style.display = 'block';
		this.#container.DomObject.style.width = '100%';
		this.Show();
	}
	Hide() {
		this.#container.Hide();
	}
	Show() {
		this.#container.Show();
	}
	OnClose(func) {
		this.#funcOnClose = func;
	}

}

