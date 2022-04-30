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
		if (tr.Childs.length == this.#theadTr.Childs.length) {
			// if ( this.#tbody.DomObject.children.length == 0 ) this.#startShift = tr;
			this.#tbody.AddChilds( [ tr.AddWatch((el)=> {
				el.DomObject.addEventListener( 'click', ( event )=> {
					let nodes = Array.prototype.slice.call( el.DomObject.parentElement.children );
					if ( event.shiftKey ) {
						this.#selectedRows = [];
						let temp = [];
						this.#startShift.RemoveClass( 'selected-row' );
						let start = this.#startShift;
						let startIndex = nodes.indexOf( start.DomObject );
						let end = el;
						let endIndex = nodes.indexOf( end.DomObject );
						if (endIndex < startIndex) {
							let s = startIndex;
							startIndex = endIndex;
							endIndex = s;
						}
						this.#tbody.Childs.map(( child, index )=> {
							if (index >= startIndex && index <= endIndex) temp.push(index);
						});
						// console.log("temp=> ", temp);
						for (let i = 0; i < temp.length; i++) {

							let element = this.#tbody.Childs.find(item=> item.DomObject == nodes[temp[i]]);
							if (typeof element !== 'undefined') {
								this.#selectedRows.push(element);
								if (!nodes[temp[i]].classList.value.includes('selected-row')) {
									nodes[temp[i]].classList.toggle('selected-row');
									// console.log("Окрашиваем ", temp[i])
								}
							}
						}
						// console.log("this.#selectedRows=> ", this.#selectedRows);
						// this.#tbody.Childs.map(( child, index )=> {
						// 	let cindex = nodes.indexOf( child.DomObject );
						// 	if (temp.indexOf(cindex) != -1) {
						// 		child.AddClass( 'selected-row' );
						// 		this.#selectedRows.push( child );
						// 	} else {
						// 		child.RemoveClass( 'selected-row' );
						// 	}
						// });


						// let start = this.#startShift;
						// let startIndex = nodes.indexOf( start.DomObject );
						// let end = el;
						// let endIndex = nodes.indexOf( end.DomObject );
						// this.#tbody.Childs.map(( child )=> {
						// 	let cindex = nodes.indexOf( child.DomObject );
						// 	if ( startIndex <= endIndex ) {
						// 		if ( cindex >= startIndex && cindex <= endIndex ) {
						// 			child.RemoveClass( 'selected-row' );
						// 			child.AddClass( 'selected-row' );
						// 			if ( this.#selectedRows.indexOf( child ) == -1 ) {
						// 				console.log("1 добавляем в выделенные ", child.ShadowCopy.digest);
						// 				this.#selectedRows.push( child );
						// 			}
						// 		}
						// 	} else {
						// 		if ( cindex <= startIndex && cindex >= endIndex ) {
						// 			child.RemoveClass( 'selected-row' );
						// 			child.AddClass( 'selected-row' );
						// 			if ( this.#selectedRows.indexOf( child ) == -1 ) {
						// 				console.log("2 добавляем в выделенные ", child.ShadowCopy.digest);
						// 				this.#selectedRows.push( child );
						// 			}
						// 		}
						// 	}
						// });
					} else {
						this.#tbody.Childs.map(( child, index )=> {
							child.RemoveClass( 'selected-row' );
						});
						this.#startShift = el;
						// this.#selectedRows.map(( item )=> item.RemoveClass( 'selected-row' ));
						this.#selectedRows = [];
						el.AddClass( 'selected-row' );
						this.#selectedRows.push( el );
						// console.log("3 добавляем в выделенные ", el.ShadowCopy.digest);
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
		}
	};
	Clear () {
		this.#theadTr.RemoveChilds();
		this.#tbody.RemoveChilds();
	};
	ClearBody() {
		this.#tbody.RemoveChilds();
	};
	SortByColIndex ( shoObject, index ) {
		let sortClasses = [ 'sort-up', 'sort-down' ];
		// сборосить все селекты
		for (let i = 0; i < this.#selectedRows.length; i++) this.#selectedRows[i].RemoveClass('selected-row');
		this.#selectedRows = [];

		console.log('сортируем по index = ', index);
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
		// if ( this.#selectedRows.length > 1 ) {
		// 	let newSelected = [];
		// 	let sortedRows = Array.from( this.#tbody.DomObject.rows );
		// 	for ( let i = 0; i < sortedRows.length; i++ ) {
		// 		for ( let j = 0; j < this.#selectedRows.length; j++ ) {
		// 			if ( this.#selectedRows[j].DomObject.isEqualNode( sortedRows[i] ) ) {
		// 				newSelected.push( this.#selectedRows[j] );
		// 				break;
		// 			}
		// 		}
		// 	}
		// 	this.#selectedRows = newSelected;
		// }
		this.#tbody.Childs.map(child => child.RemoveClass( 'selected-row' ));
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
	DeleteRowByIndex(idx) {
		let arr = [];
		if (Array.isArray(idx)) {
			for (let i = 0; i < idx.length; i++) {
				let child = this.#tbody.Childs.find((item, index) => index == idx[i]);
				if (typeof child !== 'undefined') arr.push(child);
			}
		} else {
			let child = this.#tbody.Childs.find((item, index) => index == idx);
			if (typeof child !== 'undefined') arr.push(child);
		}
	 	if (arr.length > 0) arr.map(item => item.DeleteObject());
	};
	RebuildRowNumbers() {
		for (let i = 0; i < this.#tbody.Childs.length; i++) {
			this.#tbody.Childs[i].Childs[0].Text(i + 1);
		}
	};
}
