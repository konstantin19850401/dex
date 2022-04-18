'use strict'
class ComplexTable extends Component {
	#type='cho';// complex html object
	#typeCho = 'table';
	#watcher;
	#table;#thead;#tbody;#theadTr;
	#memories = {};
	#selectedRows = [];#startShift;
	#watchers = {};
	#contextMenu;
	constructor( application, parent ) {
		// console.log('создание table');
		super( application, parent );
		this.#InitTable();
		// this.#hash = this.#application.Toolbox.GenerateHash;
	}
	// ГЕТТЕРЫ
	// get DomObject () { return this.Container.DomObject; };
	get ObjectType () { return this.#type; };
	get ComplexType () { return this.#typeCho; };
	get Tbody () { return this.#tbody; };
	get Table () { return this.#table; };
	get SelectedRows () { return this.#selectedRows; };

	// СЕТТЕРЫ

	// ПРИВАТНЫЕ МЕТОДЫ
	#InitTable () {
		this.Container = new Div( {parent: this.Parent} ).SetAttributes( {class: 'dex-table-container', 'oncontextmenu': 'return false'} ).AddChilds([
		// this.Container = new Div( {parent: this.Parent} ).SetAttributes( {class: 'dex-table-container',} ).AddChilds([
			this.#table = new Table().AddChilds([
				this.#thead = new Thead().AddChilds([
					this.#theadTr = new Tr()
				]),
				this.#tbody = new Tbody()
			])
		]);
	}
	#HandleWatches ( watch, params ) {
		for ( let key in this.#watchers ) {
			this.#watchers[key].map( watcher => {
				if ( watcher.name === 'watchSelectedRows' ) {
					watcher.func( this.#selectedRows );
				} else if ( watch == 'watchContextMenu' && watcher.name === 'watchContextMenu' ) {
				 	watcher.func( this.#selectedRows, params );
				}
			} )
		}
	}
	// ПУБЛИЧНЫЕ МЕТОДЫ
	// InitParent ( parent ) {
	// 	console.log( 'init parent ComplexTable ',  this.Parent );
	// 	if (typeof this.Parent === 'undefined' ) {
	// 		this.Parent = parent;
	// 		this.Parent.AddChild( this );
	// 		let dom = this.Parent.DomObject;
	// 		dom.append( this.DomObject );
	// 	}
	// };
	//
	ClearHead() {
		this.#theadTr.RemoveChilds();
	}
	AddHead( th ) {
		this.#theadTr.AddChilds( [ th ] );
	};
	AddRow ( tr ) {
		if ( this.#tbody.DomObject.children.length == 0 ) this.#startShift = tr;
		this.#tbody.AddChilds( [ tr.AddWatch((el)=> {
			el.DomObject.addEventListener( 'click', ( event )=> {
				let nodes = Array.prototype.slice.call( el.DomObject.parentElement.children );
				if ( event.shiftKey ) {
					let start = this.#startShift;
					let startIndex = nodes.indexOf( start.DomObject );
					let end = el;
					let endIndex = nodes.indexOf( end.DomObject );
					this.#tbody.Childs.map(( child )=> {
						let cindex = nodes.indexOf( child.DomObject );
						if ( startIndex <= endIndex ) {
							if ( cindex >= startIndex && cindex <= endIndex ) {
								child.RemoveClass( 'selected-row' );
								child.AddClass( 'selected-row' );
								if ( this.#selectedRows.indexOf( child ) == -1 ) this.#selectedRows.push( child );
							}
						} else {
							if ( cindex <= startIndex && cindex >= endIndex ) {
								child.RemoveClass( 'selected-row' );
								child.AddClass( 'selected-row' );
								if ( this.#selectedRows.indexOf( child ) == -1 ) this.#selectedRows.push( child );
							}
						}
					});
				} else {
					this.#startShift = el;
					this.#selectedRows.map(( item )=> item.RemoveClass( 'selected-row' ));
					this.#selectedRows = [];
					el.AddClass( 'selected-row' );
					this.#selectedRows.push( el );
				}
				this.#HandleWatches();
			} )
		}) ] );
		// если нажата правая клавиша мыши
		tr.AddWatch( shoObject => {
			shoObject.DomObject.addEventListener( 'mousedown', event => {
				if ( event.which == 3 ) this.#HandleWatches( 'watchContextMenu', {x: event.clientX, y: event.clientY} );
			})
		})
	};
	Clear () {
		this.#theadTr.RemoveChilds();
		this.#tbody.RemoveChilds();
	};
	SortByColIndex ( shoObject, index ) {
		let sortClasses = [ 'sort-up', 'sort-down' ];
		if ( typeof this.#memories.sort === 'undefined' ) {
			this.#memories.sort = { col: index, side: 0, shoEl: shoObject };
			shoObject.AddClass( sortClasses[this.#memories.sort.side] );
		} else if ( this.#memories.sort.col == index ) {
			shoObject.RemoveClass( sortClasses[this.#memories.sort.side] );
			this.#memories.sort.side = !this.#memories.sort.side * 1;
			shoObject.AddClass( sortClasses[this.#memories.sort.side] );
		} else if ( this.#memories.sort.col != index ) {
			this.#memories.sort.shoEl.RemoveClass( sortClasses[this.#memories.sort.side] );
			this.#memories.sort = { col: index, side: 0, shoEl: shoObject };
			shoObject.AddClass( sortClasses[0] );
		}
		let sortedRows = Array.from( this.#tbody.DomObject.rows ).slice(0);
		if ( this.#memories.sort.side == 0 ) {
			sortedRows.sort( ( rowA, rowB ) => rowA.cells[index].innerHTML > rowB.cells[index].innerHTML ? 1 : -1 );
		} else {
			sortedRows.sort( ( rowA, rowB ) => rowA.cells[index].innerHTML < rowB.cells[index].innerHTML ? 1 : -1 );
		}
		this.#tbody.DomObject.append( ...sortedRows );
		if ( this.#selectedRows.length > 1 ) {
			let newSelected = [];
			let sortedRows = Array.from( this.#tbody.DomObject.rows );
			for ( let i = 0; i < sortedRows.length; i++ ) {
				for ( let j = 0; j < this.#selectedRows.length; j++ ) {
					if ( this.#selectedRows[j].DomObject.isEqualNode( sortedRows[i] ) ) {
						newSelected.push( this.#selectedRows[j] );
						break;
					}
				}
			}
			this.#selectedRows = newSelected;
		}
	};
	AddWatcher ( conf ) {
		let watcher = { name: conf.name, func: conf.func };
		if ( typeof this.#watchers[ conf.name ] === 'undefined' ) this.#watchers[ conf.name ] = [];
		this.#watchers[ conf.name ].push( watcher );
		return this;
	};
	AddContextMenu ( contextMenu ) {
		this.#contextMenu = contextMenu;
		this.#contextMenu.TableLink = this;
	};
	ShowContextMenu ( coords ) {
		console.log( 'his.#contextMenu=> ', this.#contextMenu.DomObject );
		this.#contextMenu.DomObject.classList.toggle( 'context-menu-show' );
		this.#contextMenu.DomObject.style.marginTop = `${ coords.y }px`;
		this.#contextMenu.DomObject.style.marginLeft = `${ coords.x }px`;
		this.#contextMenu.Open();
	};
}
