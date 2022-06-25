'use strict'
class Period extends Component {
	#start;#end;
	#startInput;#endInput;
	#type='cho';// complex html object
	#typeCho = 'period';
	#watchers = {};
	#onChange;
	constructor( application, parent ) {
		super( application, parent );
		this.#InitPeriod();
	}
	// ГЕТТЕРЫ
	get DomObject () { return this.Container.DomObject; };
	get ObjectType () { return this.#type; };
	get ComplexType () { return this.#typeCho; };
	get Data() { return {start: this.#start.format("DD.MM.YYYY"), end: this.#end.format("DD.MM.YYYY")}; }

	// get StartPeriod () { return this.#MomentDateToDex( this.#start ); };
	// get EndPeriod () { return this.#MomentDateToDex( this.#end ); };

	// get StartPeriodNotDots () { return this.Application.Toolbox.RemoveSymbols( this.StartDateInput ) };
	// get EndPeriodNotDots () { return this.Application.Toolbox.RemoveSymbols( this.EndDateInput ) };

	// get StartDateInput () { return this.Application.Toolbox.DateToInput( this.#start ) }
	// get EndDateInput () { return this.Application.Toolbox.DateToInput( this.#end ) }

	// // СЕТТЕРЫ
	// set StartPeriod ( date ) {
	// 	this.#start = this.#DexDateToMoment(date)
	// 	this.#startInput.Value = this.StartDateInput;
	// };
	// set EndPeriod ( date ) {
	// 	this.#end = this.#DexDateToMoment(date);
	// 	this.#endInput.Value = this.EndDateInput;
	// };

	// ПРИВАТНЫЕ МЕТОДЫ
	#InitPeriod () {
		console.log('init period');
		if ( typeof this.#start === 'undefined' ) this.#start = this.Application.Toolbox.CurrentDate;
		if ( typeof this.#end === 'undefined' ) this.#end = this.Application.Toolbox.CurrentDate;
		if ( this.#end.isBefore( this.#start ) ) this.#end = this.#start;


		let startDexDate = new DexDate(this.Application);
		let endDexDate = new DexDate(this.Application);

		this.Container = new Div({parent: this.Parent}).SetAttributes({class: 'dex-period-container window-module-controls-item'}).AddChilds([
			new Span().SetAttributes({class: "dex-date-picker-span"}).Text("Период с "),
			startDexDate,
			new Span().SetAttributes({class: "dex-date-picker-span"}).Text(" по "),
			endDexDate
		]);

		startDexDate
			.OnOpen(()=> endDexDate.Close())
			.OnSelect((date)=> {
				date = moment(date, 'DD.MM.YYYY');
				if (!date.isSame(this.#start)) {
					this.#start = date;
					if (this.#start.isAfter(this.#end)) {
						this.#end = this.#start;
						startDexDate.SetDate(this.#start.toDate());
						endDexDate.SetDate(this.#end.toDate());
					}
					if (typeof this.#onChange !== "undefined") this.#onChange();
				}
			});

		endDexDate
			.OnOpen(()=> startDexDate.Close())
			.OnSelect((date)=> {
				date = moment(date, 'DD.MM.YYYY');
				if (!date.isSame(this.#end)) {
					this.#end = date;
					if (this.#end.isBefore(this.#start)) {
						this.#start = this.#end;
						startDexDate.SetDate(this.#start.toDate());
						endDexDate.SetDate(this.#end.toDate());
					}
					if (typeof this.#onChange !== "undefined") this.#onChange();
				}
			});

		startDexDate.SetDate(this.#start.toDate());
		endDexDate.SetDate(this.#end.toDate());
	}
	// #HandleWatches () {
	// 	for ( let key in this.#watchers ) {
	// 		this.#watchers[key].map( watcher => {
	// 			if ( watcher.name === 'watchSelectedPeriod' ) {
	// 				watcher.func( this.StartPeriod, this.EndPeriod );
	// 			}
	// 		} )
	// 	}
	// }
	// #MomentDateToDex ( momentDate ) {
	// 	let dexDate = momentDate.format( 'YYYYMMDD' );
	// 	return dexDate;
	// }
	// #DexDateToMoment(dexDate) {
	// 	let md =  moment(dexDate, 'YYYYMMDD');
	// 	return md;
	// }
	// ПУБЛИЧНЫЕ МЕТОДЫ
	InitParent ( parent ) {
		console.log( 'init parent period ',  this.Parent );
		if (typeof this.Parent === 'undefined' ) {
			this.Parent = parent;
			this.Parent.AddChild( this );
			let dom = this.Parent.DomObject;
			dom.append( this.DomObject );
		}
	};
	OnChange(func) {
		if (typeof func !== "undefined") this.#onChange = func;
	}
	// AddWatcher ( conf ) {
	// 	let watcher = { name: conf.name, func: conf.func };
	// 	if ( typeof this.#watchers[ conf.name ] === 'undefined' ) this.#watchers[ conf.name ] = [];
	// 	this.#watchers[ conf.name ].push( watcher );
	// 	return this;
	// };
	Show() {}
}
