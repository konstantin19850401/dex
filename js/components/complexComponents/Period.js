'use strict'
class Period extends Component {
	#start;#end;
	#startInput;#endInput;
	#type='cho';// complex html object
	#typeCho = 'period';
	#watchers = {};
	constructor( application, parent ) {
		super( application, parent );
		this.#InitPeriod();
	}
	// ГЕТТЕРЫ
	get DomObject () { return this.Container.DomObject; };
	get ObjectType () { return this.#type; };
	get ComplexType () { return this.#typeCho; };

	get StartPeriod () { return this.#MomentDateToDex( this.#start ); };
	get EndPeriod () { return this.#MomentDateToDex( this.#end ); };

	get StartPeriodNotDots () { return this.Application.Toolbox.RemoveSymbols( this.StartDateInput ) };
	get EndPeriodNotDots () { return this.Application.Toolbox.RemoveSymbols( this.EndDateInput ) };

	get StartDateInput () { return this.Application.Toolbox.DateToInput( this.#start ) }
	get EndDateInput () { return this.Application.Toolbox.DateToInput( this.#end ) }

	// СЕТТЕРЫ
	set StartPeriod ( date ) {
		this.#start = this.#DexDateToMoment(date)
		this.#startInput.Value( this.StartDateInput );
	};
	set EndPeriod ( date ) {
		this.#end = this.#DexDateToMoment(date);
		this.#endInput.Value( this.EndDateInput );
	};

	// ПРИВАТНЫЕ МЕТОДЫ
	#InitPeriod () {
		// console.log('init period');
		if ( typeof this.#start === 'undefined' ) this.#start = this.Application.Toolbox.CurrentDate;
		if ( typeof this.#end === 'undefined' ) this.#end = this.Application.Toolbox.CurrentDate;
		if ( this.#end.isBefore( this.#start ) ) this.#end = this.#start;
		this.Container = new Div().SetAttributes( {class: 'dex-period-container d-flex justify-content-center'} ).AddChilds([
			new Div().SetAttributes( {class: 'form-group'} ).AddChilds([
				this.#startInput = new Input().SetAttributes( {class: 'form-control', name: 'date-start', type: 'date'} ).Value( this.StartDateInput ).AddWatch((el) => {
						el.DomObject.addEventListener( 'input', (event) => {
							if ( event.target.value != "" ) el.SetAttributes( {'class': 'form-control dirty'} )
							else el.SetAttributes( {'class': 'form-control'} );
							let date = this.Application.Toolbox.InputToDate( event.target.value );
							this.#start = date;
							if ( this.#start.isAfter( this.#end ) ) {
								this.#end = this.#start;
								this.#endInput.Value( this.EndDateInput );
							}
							// if ( typeof this.#watcher !== 'undefined' ) this.#watcher( this );
							this.#HandleWatches();
						} );
						if ( el.Value != '' ) { el.DomObject.dispatchEvent(new Event('input')); }
					}
				),
				// new Label().SetAttributes( {for: 'date-start'} ).Text( 'Период с' )
				new Label().SetAttributes( {for: 'date-start'} ).Text( '' )
			]),
			new Div().SetAttributes( {class: 'date-splitter'} ).Text( '-' ),
			new Div().SetAttributes( {class: 'form-group'} ).AddChilds([
				this.#endInput = new Input().SetAttributes( {class: 'form-control', name: 'date-end', type: 'date'} ).Value( this.EndDateInput ).AddWatch((el) => {
						el.DomObject.addEventListener( 'input', (event) => {
							if ( event.target.value != "" ) el.SetAttributes( {'class': 'form-control dirty'} )
							else el.SetAttributes( {'class': 'form-control'} );
							let date = this.Application.Toolbox.InputToDate( event.target.value );
							this.#end = date;
							if ( this.#start.isAfter( this.#end ) ) {
								this.#start = this.#end;
								this.#startInput.Value( this.StartDateInput );
							}
							// if ( typeof this.#watcher !== 'undefined' ) this.#watcher( this );
							this.#HandleWatches();
						} );
						if ( el.Value != '' ) { el.DomObject.dispatchEvent(new Event('input')); }
					}
				),
				new Label().SetAttributes( {for: 'date-end'} ).Text( '' )
				// new Label().SetAttributes( {for: 'date-end'} ).Text( 'Период по' )
			])
		]);
		// console.log('this.Container=> ', this.Container);
	}
	#HandleWatches () {
		for ( let key in this.#watchers ) {
			this.#watchers[key].map( watcher => {
				if ( watcher.name === 'watchSelectedPeriod' ) {
					watcher.func( this.StartPeriod, this.EndPeriod );
				}
			} )
		}
	}
	#MomentDateToDex ( momentDate ) {
		let dexDate = momentDate.format( 'YYYYMMDD' );
		return dexDate;
	}
	#DexDateToMoment(dexDate) {
		let md =  moment(dexDate, 'YYYYMMDD');
		return md;
	}
	// ПУБЛИЧНЫЕ МЕТОДЫ
	// InitParent ( parent ) {
	// 	console.log( 'init parent period ',  this.Parent );
	// 	if (typeof this.Parent === 'undefined' ) {
	// 		this.Parent = parent;
	// 		this.Parent.AddChild( this );
	// 		let dom = this.Parent.DomObject;
	// 		dom.append( this.DomObject );
	// 	}
	// };
	AddWatcher ( conf ) {
		let watcher = { name: conf.name, func: conf.func };
		if ( typeof this.#watchers[ conf.name ] === 'undefined' ) this.#watchers[ conf.name ] = [];
		this.#watchers[ conf.name ].push( watcher );
		return this;
	};
}
