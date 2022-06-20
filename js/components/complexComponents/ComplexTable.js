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
	#types = [];
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
	get ContextMenu() {return this.#contextMenu; }

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
		// console.log("watch===> ", watch, " params=> ", params);
		for ( let key in this.#watchers ) {
			this.#watchers[key].map( watcher => {
				if ( watcher.name === 'watchSelectedRows' ) {
					watcher.func( this.#selectedRows );
				} else if ( watch == 'watchContextMenu' && watcher.name == 'watchContextMenu' ) {
				 	watcher.func( this.#selectedRows, params );
				} else if ( watch == "watchContextMenuItems" ) {
					watcher.func( this.#selectedRows, params.name );
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
		this.#types = [];
	}
	AddHead( th, type ) {
		let index = this.#theadTr.Childs.length;
		this.#types.push({index: index, type: type});
		th.AddWatch( sho => sho.DomObject.addEventListener('click', event=> this.SortByColIndex( sho, index )) );
		this.#theadTr.AddChilds( [ th ] );
	};
	AddRow ( tr ) {
		if (tr.Childs.length == this.#theadTr.Childs.length) {
			tr.AddWatch(sho=> {
				// если клик
				sho.DomObject.addEventListener("click", event => {
					let nodes = Array.prototype.slice.call(sho.DomObject.parentElement.children);
					if (event.shiftKey) {
						if (typeof this.#startShift === "undefined") {
							sho.ToggleClass("selected-row");
							this.#selectedRows.map(item=> item.ToggleClass('selected-row'));
							this.#selectedRows = [];
							this.#startShift = sho;
							this.#selectedRows.push(sho);
						} else {
							let sIndex = nodes.indexOf(this.#startShift.DomObject);
							let eIndex = nodes.indexOf(sho.DomObject);
							let start, end;
							if (sIndex < eIndex) {
								start = sIndex;
								end = eIndex;
							} else {
								start = eIndex;
								end = sIndex;
							}
							this.#selectedRows.map(item=> item.RemoveClass('selected-row'));
							this.#selectedRows = [];
							this.#tbody.Childs.map((child, index) => {
								if (index >= start && index <= end) {
									child.ToggleClass('selected-row');
									this.#selectedRows.push(child);
								}
							});
						}
					} else if (event.ctrlKey) {
						sho.ToggleClass('selected-row');
						let index = this.#selectedRows.findIndex(item=> item.DomObject.isEqualNode(sho.DomObject));
						if (index != -1) this.#selectedRows.splice(index, 1);
						else this.#selectedRows.push(sho);
						if (this.#selectedRows.length == 0) this.#startShift = undefined;
						else this.#startShift = sho;
					} else {
						sho.ToggleClass("selected-row");
						this.#selectedRows.map(item=> item.ToggleClass('selected-row'));
						this.#selectedRows = [];
						this.#startShift = sho;
						this.#selectedRows.push(sho);
					}
					this.#HandleWatches();
				})
				// если нажата правая клавиша мыши
				sho.DomObject.addEventListener("mousedown", event => {
					if (event.which == 3) this.#HandleWatches('watchContextMenu', {x: event.clientX, y: event.clientY});
				})
			})
			this.#tbody.AddChilds([tr]);
		}
	};
	Clear () {
		this.#theadTr.RemoveChilds();
		this.ClearBody();
	};
	ClearBody() {
		this.#tbody.RemoveChilds();
		this.#selectedRows = [];
		this.#HandleWatches();
	};
	SortByColIndex ( shoObject, index ) {
		let sortClasses = [ 'sort-up', 'sort-down' ];
		// сборосить все селекты
		for (let i = 0; i < this.#selectedRows.length; i++) this.#selectedRows[i].RemoveClass('selected-row');
		this.#selectedRows = [];

		// console.log('сортируем по index = ', index);
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
		let headType = this.#types.find(item=> item.index == index);
		console.log("headType.type=> ", headType.type);
		if (headType.type == "string") {
			if ( this.#memories.sort.side == 0 ) {
				this.#tbody.Childs.sort((rowA, rowB) => rowA.Childs[index].DomObject.innerHTML > rowB.Childs[index].DomObject.innerHTML ? 1 : -1);
				sortedRows.sort( ( rowA, rowB ) => rowA.cells[index].innerHTML > rowB.cells[index].innerHTML ? 1 : -1 );
			} else {
				this.#tbody.Childs.sort((rowA, rowB) => rowA.Childs[index].DomObject.innerHTML < rowB.Childs[index].DomObject.innerHTML ? 1 : -1);
				sortedRows.sort( ( rowA, rowB ) => rowA.cells[index].innerHTML < rowB.cells[index].innerHTML ? 1 : -1 );
			}
		} else if (headType.type == "number") {
			if ( this.#memories.sort.side == 0 ) {
				this.#tbody.Childs.sort((rowA, rowB) => parseInt(rowA.Childs[index].DomObject.innerHTML) > parseInt(rowB.Childs[index].DomObject.innerHTML) ? 1 : -1);
				sortedRows.sort( ( rowA, rowB ) => parseInt(rowA.cells[index].innerHTML) > parseInt(rowB.cells[index].innerHTML) ? 1 : -1 );
			} else {
				this.#tbody.Childs.sort((rowA, rowB) => parseInt(rowA.Childs[index].DomObject.innerHTML) < parseInt(rowB.Childs[index].DomObject.innerHTML) ? 1 : -1);
				sortedRows.sort( ( rowA, rowB ) => parseInt(rowA.cells[index].innerHTML) < parseInt(rowB.cells[index].innerHTML) ? 1 : -1 );
			}
		} else if (headType.type == "date") {
			// проверить на датах
			if ( this.#memories.sort.side == 0 ) {
				this.#tbody.Childs.sort((rowA, rowB) => {
					if (moment(rowA.Childs[index].DomObject.innerHTML, "DD.MM.YYYY").isAfter(moment(rowB.Childs[index].DomObject.innerHTML, "DD.MM.YYYY"))) return 1;
					else return -1;
				});
				sortedRows.sort( ( rowA, rowB ) => {
					if (moment(rowA.cells[index].innerHTML, "DD.MM.YYYY").isAfter(moment(rowB.cells[index].innerHTML, "DD.MM.YYYY"))) return 1;
					else return -1;
				});
			} else {
				this.#tbody.Childs.sort((rowA, rowB) => {
					if (moment(rowA.Childs[index].DomObject.innerHTML, "DD.MM.YYYY").isBefore(moment(rowB.Childs[index].DomObject.innerHTML, "DD.MM.YYYY"))) return 1;
					else return -1;
				})
				sortedRows.sort( ( rowA, rowB ) => {
					if (moment(rowA.cells[index].innerHTML, "DD.MM.YYYY").isBefore(moment(rowB.cells[index].innerHTML, "DD.MM.YYYY"))) return 1;
					else return -1;
				});
			}
		}
		this.#tbody.DomObject.append( ...sortedRows );
		this.#tbody.Childs.map(child => child.RemoveClass( 'selected-row' ));
		this.#startShift = undefined;
		this.#HandleWatches();
	};
	AddWatcher ( conf ) {
		let watcher = { name: conf.name, func: conf.func };
		if ( typeof this.#watchers[ conf.name ] === 'undefined' ) this.#watchers[ conf.name ] = [];
		this.#watchers[ conf.name ].push( watcher );
		return this;
	};
	AddContextMenu ( contextMenu ) {
		this.#contextMenu = contextMenu;
		// this.#contextMenu.TableLink = this;
		this.#contextMenu.AddWatch( {name: "watchContextMenuItems", func: (name, item)=> {this.#HandleWatches(name, item);} });
	};
	ShowContextMenu ( coords ) {
		// console.log( 'his.#contextMenu=> ', this.#contextMenu.DomObject , " coords=> ",coords);
		this.#contextMenu.DomObject.classList.toggle( 'context-menu-show' );
		this.#contextMenu.DomObject.style.marginTop = `${ coords.y }px`;
		this.#contextMenu.DomObject.style.marginLeft = `${ coords.x }px`;
		this.#contextMenu.Show();
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
