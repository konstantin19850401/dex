'use strict'
class DexAppWindow extends Component {
	#base;#operator;#windowBody;#docTable;#baseTitle;#contextMenu;#dicts = new Map();
	#data;
	#headers = [];
	#windowsPanel;
	#totalDocsSho;#selectedDocsSho;#totalDocs=0;#selectedDocs=0;
	#periodSho;#searchSho;
	#filter = { start: undefined, end: undefined, search: undefined };
	constructor ( parent, base ) {
		super( parent.Application, parent );
		this.#base = base;
		this.#windowsPanel = parent.WindowsPanel;
		this.#windowsPanel.AddMenuNewItem( this );
		this.#GetBaseDicts();
		// this.#InitComponent();
		// this.#Resize();
		// this.#ListenResizeWindow();
		// this.#GetBaseTitle();
	}
	// ГЕТТЕРЫ
	get Base () { return this.#base; };
	// СЕТТЕРЫ
	// set WindowsPanel ( panel ) { this.#windowsPanel = panel; };
	// ПРиватные методы
	#GetBaseDicts () {
		let transport = this.Application.Transport;
		transport.Get( {com: 'skyline.apps.adapters', subcom: 'appApi', data: { action: 'getBaseDicts', base: this.#base }, hash: this.Hash} );
	}
	#InitComponent() {
		let filterBox; let periodJournal; let filter; let search;
		this.Container = new Div( {parent: this.Parent.Wrapper} ).SetAttributes( {class: 'dex-app-window'} ).AddChilds([
			new I().SetAttributes( {class: 'dex-app-window-close fas fa-window-close'} ).AddWatch( shoObject => {
				shoObject.DomObject.addEventListener( 'click', event => {
					this.#windowsPanel.DeleteWindow( this.Hash );
					this.Parent.DeleteWindow( this.Hash );
					this.Container.DeleteObject();
					let appWindow = this.Parent.AppWindows;
					if ( appWindow.length > 0 ) {
						appWindow[0].Maximize();
						appWindow[0].MakeActive();
					}
				} )
			}),
			//this.#baseTitle = new Span().SetAttributes( {class: 'dex-app-window-title'} ).Text( `[ ${ this.#base } ]` ),

			// filterBox = new Div().SetAttributes( {class: 'dex-app-window-filter'} ).AddChilds([
			new Div().SetAttributes( {class: 'dex-app-window-filter'} ).AddChilds([
				periodJournal = new Div().SetAttributes({class: 'dex-filter-element'}).AddChilds([
					new I().SetAttributes({class: 'fas fa-calendar-alt'}),
				]),
				// filter = new Div().SetAttributes({class: 'dex-filter-element'}).AddChilds([
				// 	new I().SetAttributes({class: 'fas fa-filter'}),
				// ]),
				search = new Div().SetAttributes({class: 'dex-filter-element'}).AddChilds([
					new I().SetAttributes({class: 'fas fa-search'}),
				]),

				// this.#periodSho = new Period( this.Application ).AddWatcher({
				// 		name: 'watchSelectedPeriod', func: ( start, end )=> {
				// 		this.#filter.start = start;
				// 		this.#filter.end = end;
				// 		this.#GetData();
				// 	}
				// }),
				// this.#searchSho = new SearchBlock( this.Application ).AddWatcher({
				// 	name: 'watchSelectedSearch', func: ( search )=> {
				// 		this.#filter.search = search;
				// 		this.#GetData();
				// 	}
				// }),
				// this.#docTable = new ComplexTable( this.Application ).AddWatcher({name: 'watchSelectedRows', func: ( rows )=> { this.#SetSelectedCnt( rows ) }
				// }),
			]),
			new Div().SetAttributes( {class: 'dex-app-window-info'} ).AddChilds([
				this.#totalDocsSho = new Span().SetAttributes( {class: 'dex-app-window-total'} ).Text( `Всего: ${ this.#totalDocs }` ),
				this.#selectedDocsSho = new Span().SetAttributes( {class: 'dex-app-window-selected'} ).Text( `Выделено: ${ this.#selectedDocs }` )
			]),
			this.#windowBody = new Div().SetAttributes( {class: 'dex-app-window-body'} ).AddChilds([
				this.#docTable = new ComplexTable( this.Application ).AddWatcher(
					{name: 'watchSelectedRows', func: ( rows ) => { this.#SetSelectedCnt( rows ) }
				}),
				this.#contextMenu = new ContextMenu( this.Application ).AddContextItems( this.Parent.CommonDicts.contextMenu.elements )
			]),
		]);
		periodJournal.AddWatch(shoObject=> {
			shoObject.DomObject.addEventListener('click', event=> {
				let mw = new MessagesWindow(this.Application, this.Container, 'Задайте период журнала', {width: 300, height: 125});
				let period = new Period( this.Application );
				if (typeof this.#filter.start !== 'undefined') period.StartPeriod = this.#filter.start;
				if (typeof this.#filter.end !== 'undefined') period.EndPeriod = this.#filter.end;
				mw.AddBody(period);
				mw.OnClose(()=> {
					this.#filter.start = period.StartPeriod;
					this.#filter.end = period.EndPeriod;
					this.#GetData();
				});
			})
		});
		// filter.AddWatch(shoObject=> {
		// 	shoObject.DomObject.addEventListener('click', event=> {
		// 		let mw = new MessagesWindow(this.Application, this.Container, 'Фильтр по документу', {width: 300, height: 115});
		// 		// let search = new SearchBlock( this.Application );
		// 		// mw.AddBody(search);
		// 		let multiselect = new Select().SetAttributes({class:'select', multiple:true}).AddChilds([
		// 			new Option().SetAttributes({value: '1'}).Text('Привет'),
		// 			new Option().SetAttributes({value: '2'}).Text('Привет1'),
		// 			new Option().SetAttributes({value: '3'}).Text('Привет2'),
		// 			new Option().SetAttributes({value: '4'}).Text('Привет3'),
		// 			new Option().SetAttributes({value: '5'}).Text('Привет4'),
		// 			new Option().SetAttributes({value: '6'}).Text('Привет5'),
		// 		]);
		// 		mw.AddBody(multiselect);
		// 	})
		// });
		search.AddWatch(shoObject=> {
			shoObject.DomObject.addEventListener('click', event=> {
				let mw = new MessagesWindow(this.Application, this.Container, 'Поиск по документу', {width: 300, height: 115});
				let search = new SearchBlock( this.Application );
				if (typeof this.#filter.search !== 'undefined') search.SearchText = this.#filter.search;
				mw.AddBody(search);
				mw.OnClose(()=> {
					this.#filter.search = search.SearchText;
					this.#GetData();
				})
			})
		});

		this.#contextMenu.AddWatcher({name: 'watchSelectContextMenuItem', func: ( item, selectedRows ) => { this.#GetSelectContextMenuItem( item, selectedRows ); }})
		this.#docTable.AddContextMenu( this.#contextMenu );
		this.#docTable.AddWatcher({name: 'watchContextMenu', func: ( rows, coords ) => { this.#ContextMenu( rows, coords ) }});
	}
	#Resize () {
		this.#docTable.DomObject.style.height = `calc(${ this.#windowBody.DomObject.clientHeight }px - 5px)`;
	}
	#ListenResizeWindow () {
		window.addEventListener( 'resize', event => {
			this.#Resize();
		}, false )
	}
	#ContextMenu ( rows, coords ) {
		// console.log( 'выделенные строки ', this.#docTable.SelectedRows );
		this.#docTable.ShowContextMenu( {
			x: coords.x,
			y: coords.y
		} );
	}
	#ClearTable () {
		if (typeof this.#docTable !== 'undefined') this.#docTable.Clear();
	}
	#DrawTable () {
		// заголовки
		if ( typeof this.#docTable !== 'undefined') {
			let text = '';
			let commonDicts = this.Parent.CommonDicts;
			this.#headers = [];
			let hiddens = ['id', 'docid'];
			let reg = new RegExp(`${this.#operator}`, 'g');
			this.#data.headers.map(( item, index )=> {
				let ifIsset = commonDicts.docFields.elements.find( df => df.uid == item.id && df.vendor.match( reg ) != null );
				if ( !ifIsset ) hiddens.push( item.id );
				this.#headers.push( item.id );
				let newHeader = new Th().SetAttributes( ).Text( item.name ).AddWatch( ( el )=> {
					el.DomObject.addEventListener( 'click', ( event ) => {
						this.#docTable.SortByColIndex( el, index );
					} )
				} );
				if ( hiddens.indexOf( item.id ) != -1 ) newHeader.SetAttributes( {class: 'dnone'} );
				this.#docTable.AddHead( newHeader );
			});
			this.#data.list.map( ( item, index )=> {
				let row = new Tr().AddWatch( (el)=> {
					// el.DomObject.addEventListener( 'contextmenu', ( event )=> {
					// 	this.#ContextMenu( el, event.target, index );
					// } )
				} );
				for ( let i = 0; i < this.#headers.length; i++ ) {
					if ( typeof item.fields[ this.#headers[i] ] !== 'undefined' ) {
						row.AddChilds([
							(() => {
								let text = this.#CheckText( item.fields[ this.#headers[i] ], this.#headers[i] );
								let td = new Td().Text( text );
								if (  hiddens.indexOf( this.#headers[i] ) != -1 ) td.SetAttributes( {class: 'dnone'} );
								row.AddShadowCopy( this.#headers[i], text );
								return td;
							})()
						]);
						if ( this.#headers[i] == 'status' ) {
							// row.AddClass( this.#colors[item.fields[ this.#headers[i] ]] );
						}
					} else if ( typeof item.datafields[ this.#headers[i] ] !== 'undefined' ) {
						row.AddChilds([
							(() => {
								let text = this.#CheckText( item.datafields[ this.#headers[i] ], this.#headers[i] );
								let td = new Td().Text( text );
								if (  hiddens.indexOf( this.#headers[i] ) != -1 ) td.SetAttributes( {class: 'dnone'} );
								row.AddShadowCopy( this.#headers[i], text );
								return td;
							})()
						]);
					} else {
						row.AddChilds([
							(() => {
								let td = new Td().Text( '' );
								if (  hiddens.indexOf( this.#headers[i] ) != -1 ) td.SetAttributes( {class: 'dnone'} );
								row.AddShadowCopy( this.#headers[i], text );
								return td;
							})()
						]);
					}
				}
				this.#docTable.AddRow( row );
			});
			this.#SetTotalCnt( this.#data.list );
			this.#SetSelectedCnt([]);
		}
	}
	#CheckText ( text, fname ) {
		// if ( typeof this.#fieldToDict[fname] !== 'undefined' ) {
		// 	let newtext = this.#appDicts[ this.#fieldToDict[fname]  ].elements.find( element => element.uid == text );
		// 	if ( typeof newtext !== 'undefined' ) text = newtext.title;
		// }
		return text;
	}
	#GetBaseTitle () {
		let transport = this.Application.Transport;
		transport.Get( {com: 'skyline.apps.adapters', subcom: 'appApi', data: {action: 'getBaseName', base: this.#base}, hash: this.Hash} );
	}
	#GetSelectContextMenuItem ( item, selectedRows ) {
		console.log('выбран элемент контекстного меню ', item);
		let data = {action: 'hooks', base: this.#base};
		if ( item.uid == 'doc.print' ) {
			data.subaction = 'document.print.doc';
			data.list = [];
			selectedRows.map( item => data.list.push( item.ShadowCopy.id ) );
		} else if ( item.uid == 'doc.open' ) {
			if ( selectedRows.length == 0 || selectedRows.length > 1) return;
			data.subaction = 'document.open.doc';
			data.docid = selectedRows[0].ShadowCopy.id;
		} else if ( item.uid == 'doc.replacement' ) {
			data.subaction = 'document.replacement';
			data.list = [];
			selectedRows.map( item => data.list.push( item.ShadowCopy.id ) );
		}
		if ( item.uid == 'doc.newdoc' ) {
			new DexContract( this.Application, this, this.#base, this.#dicts );
 		} else {
 			data.list = data.list;
			let transport = this.Application.Transport;
			transport.Get( {com: 'skyline.apps.adapters', subcom: 'appApi', data: data, hash: this.Hash} );
 		}
	}
	#GetPrint() {
		let transport = this.Application.Transport;
		// transport.
	}
	#SetTotalCnt ( list ) {
		if ( typeof list !== 'undefined' && list.length > 0 ) this.#totalDocs = list.length
		else this.#totalDocs = 0;
		this.#totalDocsSho.Text( `Всего: ${ this.#totalDocs }` );
	}
	#SetSelectedCnt ( rows ) {
		this.#selectedDocs = rows.length;
		this.#selectedDocsSho.Text( `Выделено: ${ this.#selectedDocs }` );
	}
	#GetData (  ) {
		let transport = this.Application.Transport;
		let data = { action: 'list', subaction: 'period', base: this.#base };
		for ( let key in this.#filter ) {
			if ( typeof this.#filter[key] !== 'undefined') data[key] = this.#filter[key];
		}
		let packet = { com: 'skyline.apps.adapters', subcom: 'appApi', data: data, hash: this.Hash};
		console.log( ' запрос списка дог packet=>', packet );
		transport.Get( packet );
	}
	#HandleHooks ( data ) {
		// console.log("data=> ", data);
		if ( typeof data.err === 'undefined' ) {
			if ( data.subaction === 'document.print.doc' || data.subaction === 'document.replacement') window.open( `${ this.Application.Transport.Url }/adapters/printing/${ data.link }`);
			else if ( data.subaction === 'document.open.doc' ) {
				// console.log( 'пытаемся открыть документ ' );
				// new DexContract( this.Application, this, this.#base );
			}
		} else {
			console.log( "какие-то ошибки ", data.err );
		}
	}

	// публичные методы
	Minimize() {
		this.Container.DomObject.style.width = '0px';
		this.Container.DomObject.style.display = 'none';
	}
	Maximize() {
		this.Container.DomObject.style.display = 'block';
		this.Container.DomObject.style.width = '100%';
		this.#Resize();
	}
	MakeActive() {
		this.#windowsPanel.MakeActive( this.Hash );
	}
	UpdatePeriod () {
		this.#GetData();
	}
	Commands ( packet ) {
		// console.log(packet);
		switch ( packet.com ) {
			case 'skyline.apps.adapters':
				switch ( packet.subcom ) {
					case 'appApi':
						switch ( packet.data.action ) {
							case 'list':
								this.#operator = packet.data.operator;
								this.#data = packet.data;
								this.#ClearTable();
								this.#DrawTable();

							break;
							case 'getBaseName':
								if ( packet.data.title != '' && this.#base != packet.data.title ) {
									//this.#baseTitle.Text( `[ ${packet.data.title} ]`);
									this.Parent.WindowsPanel.ChangeWindowTitle( this.Hash, packet.data.title );
								}
							break;
							case 'hooks':
								this.#HandleHooks( packet.data );
							break;
							case 'getBaseDicts':
								console.log( 'getBaseDicts=> ', packet );
								for ( let key in packet.data.list ) {
									this.#dicts.set( key, packet.data.list[key] );
								}
								this.#InitComponent();
								this.#Resize();
								this.#ListenResizeWindow();
								this.#GetBaseTitle();

								this.#ClearTable();
								this.#DrawTable();
							break;
						}
					break;
				}
			break;
		}
	}
}

