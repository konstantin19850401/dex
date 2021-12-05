'use strict'
class SearchBlock extends Component{
	#type='cho';// complex html object
	#typeCho = 'search';
	#watchers = {};
	#searchString = '';
	constructor( application, parent ) {
		super( application, parent );
		this.#InitComponent();
	}
	// ГЕТТЕРЫ
	get DomObject () { return this.Container.DomObject; };
	get ObjectType () { return this.#type; };
	get ComplexType () { return this.#typeCho; };

	// СЕТТЕРЫ

	// ПРИВАТНЫЕ МЕТОДЫ
	#InitComponent () {
		this.Container = new Div().SetAttributes( {class: 'dex-search-container form-group'} ).AddChilds([
			new Input().SetAttributes( {class: 'form-control', type: 'text'} ).SetAttributes( {placeholder: 'Введите строку для поиска'} ).AddWatch( shoObject => {
				shoObject.DomObject.addEventListener( 'input', event => {

					if ( event.target.value != "" ) shoObject.SetAttributes( {'class': 'form-control dirty'} )
					else shoObject.SetAttributes( {'class': 'form-control'} );
					this.#searchString = event.target.value;
					this.#HandleWatches();
					console.log('this.#searchString=>', this.#searchString);
				} )
			} )
		]);
	}
	#HandleWatches () {
		for ( let key in this.#watchers ) {
			this.#watchers[key].map( watcher => {
				if ( watcher.name === 'watchSelectedSearch' ) {
					watcher.func( this.#searchString );
				}
			} )
		}
	}
	// ПУБЛИЧНЫЕ МЕТОДЫ
	AddWatcher ( conf ) {
		let watcher = { name: conf.name, func: conf.func };
		if ( typeof this.#watchers[ conf.name ] === 'undefined' ) this.#watchers[ conf.name ] = [];
		this.#watchers[ conf.name ].push( watcher );
		return this;
	};
}
