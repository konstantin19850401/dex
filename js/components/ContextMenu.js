'use strict'
class ContextMenu extends Component {
	#type='cho';// complex html object
	#typeCho = 'contextMenu';
	#close = 1;
	#table;#items = [];
	#watchers = new Map();
	constructor ( application, parent ) {
		super( application, parent );
		this.#InitComponent();
	}
	// ГЕТТЕРЫ
	get ObjectType () { return this.#type; };
	get ComplexType () { return this.#typeCho; };
	// СЕТТЕРЫ
	set TableLink ( table ) { this.#table = table };

	// ПРиватные методы
	#InitComponent() {
		this.Container = new Div( {parent: this.Parent} ).SetAttributes( {class: 'context-menu'} );
		this.Application.AddComplexElement( this );
	}
	#HandleWatches ( watch, params ) {
		if ( this.#watchers.has( watch ) ) this.#watchers.get( watch ).func( params, this.#table.SelectedRows );
	}
	AddContextItems ( array ) {
		array.map(item => {
			let shadow = { copy: item };
			shadow.elm = new Div( {parent: this.Container} ).SetAttributes( {class: 'context-menu-item'} ).Text( item.title ).AddWatch(shoObject => {
				shoObject.DomObject.addEventListener('click', event=> { this.#HandleWatches( 'watchSelectContextMenuItem', item ) })
			})
			this.#items.push( shadow );
		});
		return this;
	}
	Open () {
		this.#close = 0;
		this.#items.map(item => { item.elm.DomObject.style.display = 'block'; });
		this.#items.map(item => {
			let selectedStatuses = [];
			this.#table.SelectedRows.map(row => {
				if ( selectedStatuses.indexOf(row.ShadowCopy.status) == -1 ) selectedStatuses.push( row.ShadowCopy.status );
			});

			let allowed = item.copy.statuses.split(',').map(item=> parseInt(item));
			for ( let i = 0; i < selectedStatuses.length; i++ ) {
				if ( allowed.indexOf( selectedStatuses[i] ) == -1 ) {
					// item.elm.DomObject.style.display = 'none'; // раскомментировать!!!!
					break;
				}
			}
		})
	}
	AddWatcher ( conf ) {
		let watcher = { name: conf.name, func: conf.func };
		this.#watchers.set( watcher.name, watcher );
	}
	Close () {
		if ( this.#close != 1 ) {
			this.#close = 1;
			this.Container.DomObject.classList.toggle( 'context-menu-show' );
		}
	}
}

