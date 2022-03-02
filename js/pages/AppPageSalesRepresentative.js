'use strict'
class AppPageSalesRepresentative extends Page {
	#menu;#windowsPanel;#windowsWrapper;#appWindows = [];
	#units;
	#commonDicts;
	constructor( application, units ) {
		super ( application );
		if ( units ) this.#units = units;
		this.#InitPage();
	}
	// ГЕТТЕРЫ
	get WindowsPanel () { return this.#windowsPanel; };
	get AppWindows () { return this.#appWindows; };
	get Wrapper () { return this.#windowsWrapper; };
	get CommonDicts () { return this.#commonDicts; };
	// СЕТТЕРЫ


	// ПРИВАТНЫЕ МЕТОДЫ
	#InitPage ( ) {
		// console.log("создаем AppPage");
		this.#InitMenu();
		this.#InitWindowsWrapper();
		this.#InitWindowsPanel();
		this.Application.Container.SetAttributes( {'class': 'application row'} );
		this.Container.SetAttributes( {class: 'app_list'} );
		this.#Resize();
		this.#ListenResizeWindow();
		this.#GetDocumentsList();
	}
	#InitWindowsWrapper () {
		this.#windowsWrapper = new Div( {parent: this.Container} ).SetAttributes( {class: 'windows-wrapper'} );
	}
	#InitMenu () {
		let menu = [
			// {text: 'Действия', childs: [
			// 	{ text: 'Подключение к базе', watch: () => this.#ShowDocumentsList() }
			// ]}
		]
		this.#menu = new this.Application.Components.Menu( this.Application, this );

		this.#menu.AddMenuNewItem( menu );
	}
	#InitWindowsPanel () {
		this.#windowsPanel = new this.Application.Components.WindowsPanel( this.Application, this );
	}
	#Resize () {
		this.#windowsWrapper.DomObject.style.marginTop = `27px`;
		this.#windowsWrapper.DomObject.style.height = `calc(100vh -
			${ this.#menu.Container.DomObject.clientHeight }px -
			${ this.#windowsPanel.Container.DomObject.clientHeight }px -
			5px)`;
	}
	#ListenResizeWindow () {
		window.addEventListener( 'resize', event => this.#Resize() )
	}

	// обработка ответов сервера
	#showUserDocuments(data) {

	}


	// запросы на api
	#GetDocumentsList () {
		let packet =  {com: 'skyline.apps.salesRepresentative', subcom: 'appApi', data: { action: 'getUserDocuments' }, hash: this.Hash};
		this.Application.Transport.Get( packet );
	}

	// ПУБЛИЧНЫЕ МЕТОДЫ
	UpdatePeriod () {
		this.#appWindows.map( w => w.UpdatePeriod() );
	}
	DeleteWindow ( hash ) {
		this.#appWindows.splice( this.#appWindows.findIndex( item => item.Hash == hash ), 1 );
	}
	Commands ( packet ) {
		switch ( packet.com ) {
			case 'skyline.apps.salesRepresentative':
				switch ( packet.subcom ) {
					case 'appApi':
						switch ( packet.data.action ) {
							case 'getUserDocuments':
								console.log('пришел список документов ===> ', packet);
								if (packet.data.status == 200) {
									let appWindow = new this.Application.Components.SalesRepresentativeWindow( this );
									this.#appWindows.push( appWindow );
									appWindow.Commands( packet );
									appWindow.MakeActive();
								    // appWindow.Maximize();
								} else {
									console.log('какие-то ошибки');
								}
								// let appWindow = this.#appWindows.find( w => w.Base == packet.data.base );
								// if ( typeof appWindow === 'undefined' ) {
								// 	appWindow = new this.Application.Components.DexAppWindow( this, packet.data.base );
								// 	this.#appWindows.push( appWindow );
								// 	appWindow.Commands( packet );
								// } else {
								// 	appWindow.MakeActive();
								// 	appWindow.Maximize();
								// }
							break;
						}
					break;
				}
			break;
		}
	}
}

