'use strict'
class AppPage extends Page {
	#menu;#windowsPanel;#windowsWrapper;#appWindows = [];
	#bases;
	#commonDicts;
	constructor( application, bases ) {
		super ( application );
		if ( bases ) this.#bases = bases;
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
		this.#GetGlobalDicts();
	}
	#InitWindowsWrapper () {
		this.#windowsWrapper = new Div( {parent: this.Container} ).SetAttributes( {class: 'windows-wrapper'} );
	}
	#InitMenu () {
		let menu = [
			{text: 'Действия', childs: [
				{ text: 'Подключение к базе', watch: () => this.#ShowBasesList() },
				{ text: 'Настройка полей таблицы', watch: () => this.#GetFieldsControl() },
				{ text: 'Настройка полей документа', watch: () => this.#InitConfigurationDexDocument() },
				{ text: 'Разработчик. Журнал', watch: () => this.#ShowDevelopJournal() },
				{ text: 'Разработчик. API', watch: () => this.#ShowDevelopApi() },
				{ text: 'Склад. Журнал документов', watch: () => this.#ShowStorehouseJournal() },
			]},
			{text: 'Отчеты', childs: [
				{ text: 'Отчет по долгам', watch: () => this.#InitReportDutyDocs() },
				{ text: 'Сверка по активации', watch: () => this.#InitReportDutyDocs() },
				{ text: 'Периодичный реестр договоров', watch: () => this.#InitReportDutyDocs() },
				{ text: 'Сверка по ТП и документам', watch: () => this.#InitReportDutyDocs() },
				{ text: 'Расчет вознаграждения', watch: () => this.#InitReportDutyDocs() }
			]},
			{text: 'Справочники', childs: [
				{ text: 'Справочник Пользователи', watch: () => this.#OpenDicts('users') },
				{ text: 'Справочник Группы пользователей', watch: () => this.#OpenDicts('userGroups') },
				{ text: 'Справочник Отделения', watch: () => this.#OpenDicts('units') },
				{ text: 'Справочник Торговые точки', watch: () => this.#OpenDicts('stores') },
				{ text: 'Справочник Виды документов', watch: () => this.#OpenDicts('docTypes') },
				{ text: 'Справочник Точки продаж МегаФон', watch: () => this.#OpenDicts('megaStores') },
				{ text: 'Справочник Статусы пользователей', watch: () => this.#OpenDicts('statuses') }
			]}
		]
		this.#menu = new this.Application.Components.Menu( this.Application, this );

		this.#menu.AddMenuNewItem( menu );
	}
	#InitWindowsPanel () {
		this.Application.TaskBar = new this.Application.Components.WindowsPanel( this.Application, this );
		// this.#windowsPanel = new this.Application.Components.WindowsPanel( this.Application, this );
		this.#windowsPanel = this.Application.TaskBar;
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
	#ShowBasesList () {
		let basesList = new this.Application.Components.BasesList( this.Application, this, this.#bases );
		// basesList.DrowBases( this.#bases );
	}
	#GetFieldsControl () {
		let fieldsControl = new this.Application.Components.FieldsControl( this.Application, this );
	}
	#InitConfigurationDexDocument () {
		new ConfigurationDexDocument( this.Application, this );
	}
	#ShowStorehouseJournal () {
		let item = this.Application.TaskBar.Items.find(item=> item.w.WindowType == "store");
		if (typeof item === "undefined") new StoreHouse(this.Application, this);
	}
	#ShowDevelopJournal() {
		new DevelopJournal( this.Application, this );
	}
	#ShowDevelopApi() {

	}
	#GetGlobalDicts () {
		this.#commonDicts = [];
		let packet =  {com: 'skyline.apps.adapters', subcom: 'appApi', data: { action: 'getGlobalAppDicts' }, hash: this.Hash};
		let transport = this.Application.Transport;
		transport.Get( packet );
	}

	#InitReportDutyDocs () {
		console.log( 'Отчет по долгам' );
	}

	#OpenDicts( dictname ) {
		if (dictname == 'units') new Units( this.Application, this );
		else if (dictname == 'userGroups') new UserGroups( this.Application, this );
		else if (dictname == 'users') new Users( this.Application, this );
		else if (dictname == 'stores') new Stores(this.Application, this);
		else if (dictname == 'docTypes') new DocTypes( this.Application, this )
		else if (dictname == 'megaStores') new MegafonStores( this.Application, this );
		else if (dictname == 'statuses') new Statuses( this.Application, this );
	}
	// #InitDictionariesUnits () {
	// 	new Units( this.Application, this );
	// }
	// #InitDictionariesUserGroups() {
	// 	new UserGroups( this.Application, this );
	// }
	// #InitDictionariesUsers() {
	// 	new Users( this.Application, this );
	// }


	// ПУБЛИЧНЫЕ МЕТОДЫ
	// AddAppWindow ( appWindow ) {
	// 	this.#appWindows.push( appWindow );
	// 	// this.WindowsPanel.AddMenuNewItem( appWindow );
	// }
	UpdatePeriod () {
		this.#appWindows.map( w => w.UpdatePeriod() );
	}
	DeleteWindow ( hash ) {
		this.#appWindows.splice( this.#appWindows.findIndex( item => item.Hash == hash ), 1 );
	}
	Commands ( packet ) {
		switch ( packet.com ) {
			case 'skyline.apps.adapters':
				switch ( packet.subcom ) {
					case 'appApi':
						switch ( packet.data.action ) {
							case 'list':
								// let appWindow = this.#appWindows.find( w => w.Base == packet.data.base );
								let appWindow = this.Application.TaskBar.Items.find(item=> item.w.Base == packet.data.base);
								if ( typeof appWindow === 'undefined' ) {
									appWindow = new DexAppWindow(this, packet.data.base);
									// this.#appWindows.push( appWindow );
									appWindow.Commands( packet );
									// this.Application.TaskBar.AddMenuNewItem(appWindow);
								} else {
									this.Application.TaskBar.MakeActive(appWindow.Hash);
									//appWindow.MakeActive();
									// appWindow.Maximize();
								}
							break;
							case 'getGlobalAppDicts':
								// console.log( 'Пришли справочники', packet );
								this.#commonDicts = packet.data.list;
								// for ( let dict in packet.data.list ) {
								// 	if ( typeof this.#appDicts[dict] !== 'undefined' ) this.#appDicts[dict] = packet.data.list[dict];
								// };
							break;
						}
					break;
				}
			break;
		}
	}
}

