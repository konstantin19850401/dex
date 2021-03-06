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
	// из 20220619120000000 в 19.06.2022
	JdocDateToDate( typejdocdate ) {
		let year = typejdocdate.substring(0, 4);
		let month = typejdocdate.substring(4, 6);
		let day = typejdocdate.substring(6, 8);
		return `${day}.${month}.${year}`;
	}
	// из 19.06.2022 в 20220619
	ClientDateToServer(clientDate) {
		let date = moment(clientDate, "DD.MM.YYYY");
		return date.format("YYYYMMDD");
	}
	RemoveSymbols ( string ) {
		let m = string.replace(/[&\/\\#,+()$~%.'":*?<>{}-]/g, '');
		return m;
	}
	// не блокирующий цикл
	Loop(o) {
		let i = -1;
		let loop = ()=> {
			i++;
			if (i == o.length) {o.callback(); return;}
			if (i % 100 == 0) o.toLoop(() => {setTimeout(loop, 0)}, i);
			else o.toLoop(loop, i);
		}
		loop();
	}
	// проверка на число
	isNumber(num) {
        return typeof num === 'number' && !isNaN(num);
    }
}

