'use strict'
class AlertMessages {
	#text;#container;
	constructor ( text ) {
		this.#text = text;
		this.#InitComponent();
	}
	// ГЕТТЕРЫ

	// СЕТТЕРЫ

	// ПРИВАТНЫЕ МЕТОДЫ
	#InitComponent () {
		let text = typeof this.#text !== 'undefined' ? this.#text : '';
		this.#container = new Div( {parent: document.body} ).SetAttributes( {class: 'w-100 h-100 message_substrate'} ).AddChilds([
		// let message = new Div( {parent: document.body} ).SetAttributes( {class: 'message_substrate'} ).AddChilds([
			new Div().SetAttributes( {class: 'messages_block'} ).AddChilds([
				new Div().SetAttributes( {class: 'message_header'} ),
				new Div().SetAttributes( {class: 'message_body'} ).Text( text ),
				new Div().SetAttributes( {class: 'message_footer'} ).AddChilds([
					new Button().SetAttributes( {class: 'btns btn-primary alert_btn'} ).Text( 'OK' ).AddWatch( (el)=> {
						el.DomObject.addEventListener( 'click', ( event ) => { this.#DeleteComponent(); });
					} )
				])
			])
		]);
		setTimeout( ()=> this.#container.AddClass( 'show_message' ), 300 );
	}
	#DeleteComponent () {
		console.log("запрос на удаление сообщения");
		this.#container.DeleteObject();
	}

	// ПУБЛИЧНЫЕ МЕТОДЫ
}

