'use strict'
class Ajax {
	#url;#port;#protocol;#status = 0;#errs = [];
	#application;
	#uid;
	#headers = [
		{ header: 'Content-Type', value: 'application/json;charset=UTF-8' }
	]
	constructor(object, application) {
		if ( typeof object.url !== 'undefined' ) this.#url = object.url;
		else this.#errs.push( 'Не указан url. Ajax не может быть создан' );
		if ( typeof object.port !== 'undefined' ) this.#port = object.port;
		else this.#errs.push( 'Не указан порт. Ajax не может быть создан' );
		if ( typeof object.protocol !== 'undefined' ) this.#protocol = object.protocol;
		else this.#errs.push( 'Не указан протокол. Ajax не может быть создан' );

		if ( this.#errs.length == 0 ) this.#status = 1;

		this.#application = application;
	}
	// ГЕТТЕРЫ
	get Status () { return this.#status; };
	get Erros () { return this.#errs; };
	get Url () { return `${ this.#protocol }://${ this.#url }:${ this.#port }`; };

	// СЕТТЕРЫ


	// ПРИВАТНЫЕ МЕТОДЫ
	#InitSubscription () {
		// console.log("оформление подписки");
		let xhr = new XMLHttpRequest();
		let packet = { uid: this.#uid };
		xhr.open('GET', `${ this.#protocol }://${ this.#url }:${ this.#port }/subscription?packet=${ JSON.stringify( packet ) }&${ Date.now() }`);
		this.#headers.map( ( item ) => xhr.setRequestHeader( item.header, item.value ) );
		xhr.send();
		xhr.onload = () => {
			// console.log( 'response==> ', xhr.response );
			try {
				// console.log('ответ=> ', xhr.response);
				let response = typeof xhr.response === 'string' ? JSON.parse( xhr.response ) : xhr.response;
				if (typeof response.status !== 'undefined' && response.status == 401) {
					if (typeof response.err !== 'undefined') console.log(response.err);
					this.#application.DeleteAllHash();
					new Login( this.#application );
				} else {
					if ( typeof response.hash !== 'undefined' ) {
					if ( typeof this.#application.Hashes[ response.hash ] !== 'undefined' ) this.#application.Hashes[ response.hash ].Commands( response );
					} else {
						// if ( typeof response.data !== 'undefined' && typeof response.data.err !== 'undefined') {
						// 	let errs = response.data.err.join('<br>');
						// 	new this.#application.AlertMessages( errs );
						// }
					}
					if ( response.subcom == 'killsession' && response.data.status == 200 ) this.#uid = null;
					else this.#InitSubscription();
				}
			} catch ( e ) {
				console.log("Критическая ошибка при запросе на создание подписки. Сбросить соединение ", e);
				this.#application.DeleteAllHash();
				new Login( this.#application );
			}
		}
		xhr.onerror = () => {
			console.log( 'Ошибка в процессе попытки подписаться на сообщения сервера' );
			this.#application.DeleteAllHash();
			new Login( this.#application );
		}
	}
	#XMLHttpRequest ( method, packet ) {
		// console.log('Отправляем пакет ');
		if ( this.#uid != undefined ) packet.uid = this.#uid;
		let xhr = new XMLHttpRequest();
		let pkt = {packet: packet};
		xhr.open('GET', `${ this.#protocol }://${ this.#url }:${ this.#port }/cmd?packet=${ JSON.stringify( packet ) }`);
		this.#headers.map( ( item ) => xhr.setRequestHeader( item.header, item.value ) );
		xhr.send();
		xhr.onload = () => {
			if ( xhr.status == 200 ) {
				// console.log( xhr.response );
				let response = JSON.parse( xhr.response );
				if ( typeof response.status !== 'undefined' && response.status == 401 ) {
					//console.log('не авторизован ', packet);
					if (packet.subcom != 'initsession') {
						this.#application.DeleteAllHash();
						new Login( this.#application );
					} else {
						if ( typeof this.#application.Hashes[ response.hash ] !== 'undefined' ) {
							this.#application.Hashes[ response.hash ].Commands( response );
						}
					}
				} else {
					if ( typeof response.subcom !== 'undefined' && response.subcom == 'initsession' ) {
						if ( typeof response.data.uid !== 'undefined' ) {
							this.#uid = response.data.uid;
							this.#InitSubscription();
						}
					}
					if ( typeof response.hash !== 'undefined' ) {
						if ( typeof this.#application.Hashes[ response.hash ] !== 'undefined' ) {
							this.#application.Hashes[ response.hash ].Commands( response );
						}
					}
				}
				// console.log(response);
			} else {
				console.log( `Ошибка ajax запроса. Статус ошибки => ${ xhr.status }. Описание ошибки => ${ xhr.statusText }` );
			}
		}
		xhr.onerror = ( ) => {
			console.log( "Запрос не удался==>. Сбросить соединение ", xhr );
			this.#application.DeleteAllHash();
			new Login( this.#application );
		}
	}

	// ПУБЛИЧНЫЕ МЕТОДЫ
	Get ( packet ) { this.#XMLHttpRequest( 'GET', packet ) };
	Post ( packet ) { this.#XMLHttpRequest( 'POST', packet ) };
	Put ( packet ) { this.#XMLHttpRequest( 'PUT', packet ) };
}

