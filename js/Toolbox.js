'use strict'
class Toolbox {
	constructor() {

	}
	// ГЕТТЕРЫ
	get GenerateHash () {
		let idstr = String.fromCharCode( Math.floor( ( Math.random() * 25 ) + 65 ) );
		do {
			let ascicode = Math.floor( ( Math.random() * 42 ) + 48 );
			if ( ascicode < 58 || ascicode > 64 ) idstr += String.fromCharCode( ascicode );
		} while ( idstr.length < 16 );
		return idstr.toLowerCase();
	}
	get CurrentDate () {
		let m = moment();
		return m;
	}
	get RandomPositiveInt () {
		let min = 0;
		let max = Number.MAX_VALUE;
		return Math.floor(Math.random() * (max - min)) + min;
	}

	// СЕТТЕРЫ

	// ПРИВАТНЫЕ МЕТОДЫ

	// ПУБЛИЧНЫЕ МЕТОДЫ
	DateToText ( momentDate ) {
		let m = momentDate.format('DD.MM.YYYY');
		return m;
	}
	DateToInput ( momentDate ) {
		let m = momentDate.format('YYYY-MM-DD');
		return m;
	}
	InputToDate ( inputDate ) {
		let m = moment( inputDate );
		return m;
	}
	RemoveSymbols ( string ) {
		let m = string.replace(/[&\/\\#,+()$~%.'":*?<>{}-]/g, '');
		return m;
	}
}

