'use strict'
class Img extends SimpleHtmlObject {
	#value;
	constructor( object ) {
		super( object, 'IMG' );
	}


	AddWatch ( func ) { func ( this ); return this; };

}