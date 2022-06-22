'use strict'
class SimpleHtmlObject {
	#sho = true;#parent = null;#type = null;#domElement = null;#attributes = {};#childs = [];#hash;
	#mayHaveChild = ['DIV', 'SELECT', 'H5', 'H2', 'H3', 'SPAN', 'FORM', 'BUTTON', 'INPUT', 'LABEL', 'NAV', 'UL', 'LI', 'A', 'I', 'SMALL', 'TABLE', 'TR', 'TH', 'SELECT', 'TBODY', 'THEAD', 'TD', 'TEXTAREA', 'DEXDATE', 'DEXCOMBOBOX'];
	constructor ( object, type ) {
		// console.log( object, type  );
		if ( typeof type !== 'undefined' ) this.#type = type;
		if ( object && typeof object.parent !== 'undefined' ) this.#parent = object.parent;

		this.#GenerateHash();
		this.#CreateSimpleHtmlObject();
		if ( object && typeof object.attributes !== 'undefined' ) {
			for ( let attribute in object.attributes ) {
				this.SetAttribute( attribute, object.attributes[attribute] );
			}
		}
		if (typeof object === 'undefined') return this;
	}
	// ГЕТТЕРЫ
	// тип созданного объекта sho
	get ObjectType () { return this.#type; };

	// родитель объекта
	get ObjectParent () { return this.#parent; };

	// потомки объекта
	get Childs () { return this.#childs; };

	// атрибуты объекта
	get Attributes () { return this.#attributes; };

	// получение dom обекта
	get DomObject () { return this.#domElement; };

	// проверка SimpleHtmlObject ли объект
	get Sho () { return this.#sho; };

	get Hash() { return this.#hash; };

	get MayHaveChild () { return this.#mayHaveChild; };

	// СЕТТЕРЫ

	// ПРИВАТНЫЕ МЕТОДЫ
	// создание объекта dom
	#CreateSimpleHtmlObject () {
		this.#domElement = document.createElement( this.#type );
		if ( this.#parent && this.#parent.Sho ) {
			let mhc = this.#parent.MayHaveChild;
			if ( mhc.indexOf( this.#type ) != -1 ) {
				let dom = this.#parent.DomObject;
				dom.append( this.#domElement );
			}
			this.#parent.AddChild(this);
		} else {
			if ( this.#parent ) this.#parent.append( this.#domElement );

		}
	};
	#setDomType ( type ) {

		this.#type = type;
	};
	#GenerateHash () {
		let idstr = String.fromCharCode( Math.floor( ( Math.random() * 25 ) + 65 ) );
		do {
			let ascicode = Math.floor( ( Math.random() * 42 ) + 48 );
			if ( ascicode < 58 || ascicode > 64 ) idstr += String.fromCharCode( ascicode );
		} while ( idstr.length < 16 );
		this.#hash = idstr.toLowerCase();
	};

	// ПУБЛИЧНЫЕ МЕТОДЫ
	// установка атрибута
	SetAttribute ( attribute, value ) {
		this.#attributes[ attribute ] = value;
		this.#domElement.setAttribute( attribute, value );
		return this;
	};
	SetAttributes ( attributes ) {
		for ( let key in attributes ) {
			this.#attributes[ key ] = attributes[ key ];
			this.#domElement.setAttribute( key, attributes[ key ] );
		}
		return this;
	};
	InitParent ( parent ) {
		if ( this.#parent == null ) {
			this.#parent = parent;
			this.#parent.AddChild( this );
			let dom = this.#parent.DomObject;
			dom.append( this.#domElement );
		}
	};
	// добавление потомка
	AddChild ( newChild ) {
		// console.log("newChild=> ", newChild);
		let mayHaveChild = this.MayHaveChild;
		if ( mayHaveChild.indexOf( newChild.ObjectType ) != -1 ) {
			let ifIsset = this.#childs.find( item => item.Hash == newChild.Hash );
			if ( typeof ifIsset === 'undefined' ) this.#childs.push( newChild );
		} else {
			console.log( 'Не может быть добавлен' );
		}
		if ( newChild && newChild.ObjectParent == null ) newChild.InitParent( this );
		return this;
	};
	AddChilds ( newChilds ) {
		let mayHaveChild = this.MayHaveChild;
		for ( let i = 0; i < newChilds.length; i++ ) {
			if (newChilds[i] && mayHaveChild.indexOf( newChilds[i].ObjectType ) != -1 ) {
				if ( newChilds[i].ObjectType == 'OPTION' ) {
					// console.log("да");
				}
				// this.#childs.push( newChilds[i] );
				this.AddChild( newChilds[i] );
			} else if ( newChilds[i].ObjectType == 'cho' ) {
				// console.log('cho');
				this.AddChild( newChilds[i] );
			} else if ( newChilds[i].ObjectType == "DEXDATE") {
				console.log("добавим dexdate");
				this.AddChild( newChilds[i] );
			}

			// if ( newChilds[i] && newChilds[i].ObjectParent == null ) newChilds[i].InitParent( this );
		}
		return this;
	};
	// удаление элемента dom из дерева
	DeleteObject () {
		if ( this.#parent.Sho ) {
			let childs = this.#parent.Childs;
			for (let i = 0; i < childs.length; i++) {
				if ( childs[i].Hash == this.#hash ) {
					// console.log("удаляем dom");
					childs.splice(i, 1);
					break;
				}
			}
		}
		this.#domElement.remove();
	};
	// смена родителя
	ChangeParent ( parent ) {
		this.#parent = parent;
		this.#parent.DomObject.append( this.DomObject );
		return this;
	}
	// удаление всех потомков элемента
	RemoveChilds () {
		for (let i = 0; i < this.#childs.length; i++) this.#childs[i].DomObject.parentNode.removeChild(this.#childs[i].DomObject);

		// this.#domElement.textContent = '';
		this.#childs.length = 0;
	};
	RemoveChildByIndex(index) {
		let arr = this.#childs.splice(index, 1);
		arr[0].DeleteObject();
	};
	// добавить класс
	AddClass ( newclass ) {
		let arr = newclass.split(' ');
		// console.log("this.#domElement.classList=> ", this.#domElement.classList);
		for (let i = 0; i < arr.length; i++) {
			if (!this.#domElement.classList.value.includes(arr[i])) this.#domElement.classList.toggle( arr[i] );
		}
	};
	ToggleClass ( tclass ) {
		this.#domElement.classList.toggle( tclass );
	};
	RemoveClass ( className ) {
		// console.log( 'удалить класс', className , ' для элемента ', this.#domElement );
		let arr = className.split(' ');
		for (let i = 0; i < arr.length; i++) {
			if (this.#domElement.classList.value.includes(arr[i])) this.#domElement.classList.remove( arr[i] );
		}
	};
	AddWatch ( func ) { func ( this ); return this; };
	HideFirstChilds () {
		[].forEach.call(this.#domElement.childNodes, function(child) {
			child.classList.toggle( 'd-none' );
		});
	};
	ShowFirstChilds () {
		[].forEach.call(this.#domElement.childNodes, function(child) {
			child.classList.remove( 'd-none' );
		});
	};
	Hide() {
		this.AddClass('d-none');
	};
	Show() {
		this.RemoveClass('d-none');
	}
}

