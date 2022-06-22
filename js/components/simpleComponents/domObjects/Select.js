'use strict'
class Select extends SimpleHtmlObject {
	#value;
	#mayHaveChild = ['OPTION'];
	constructor( object ) {
		super( object, 'SELECT' );
		this.#OnChangeData();
	};
	get Value () {
		if (typeof this.#value !== "undefined") return this.#value;
		else {
			if (this.Childs.length > 0) {
				return this.DomObject.value;
			} else return this.#value
		}
	};

	set Value ( value ) {
		let childs = this.Childs;
		for ( let i = 0; i < childs.length; i++ ) {
			if ( childs[i].Value == value ) {
				this.#value = childs[i].Value;
				this.DomObject.value = value;
				//childs[i].DomObject.setAttribute("selected", true);
				break;
			}
		}
	};

	get Text() {
		if (typeof this.#value === "undefined") return null;
		else {
			if (this.Childs.length > 0) {
				let childs = this.Childs;
				for ( let i = 0; i < childs.length; i++ ) {
					if ( childs[i].Value == this.#value ) {
						console.log("нашли");
						return childs[i].Text;
					}
				}
			} else return null
		}
	}

	get MayHaveChild () { return this.#mayHaveChild; };

	// события
	// если изменилось значение поля
	#OnChangeData () {
		this.DomObject.addEventListener( 'change', event => this.#value = event.target.value );
	}
	Reset(mode) {
		var options = this.Childs;
	    for (var i=0, iLen=options.length; i<iLen; i++) {
	        if (options[i].DomObject.defaultSelected) {
	            this.DomObject.selectedIndex = i;
	            return;
	        }
	    }
	    if (mode == -1) this.DomObject.selectedIndex = -1;
	    else this.DomObject.selectedIndex = 0;
	}
}