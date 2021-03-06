
define( [ require, './graph', './graph.shape' ], function( require, Graph, GraphShape ) {

	var plugin =  function() { };

	plugin.prototype = {

		init: function( graph, options ) {

			var funcs = {

				/* Linking shapes */

				linkA: function( shapeA, line ) {
					this.linking.current.a = shapeA;
					this.linking.current.line = line;
				},

				linkB: function( shapeB ) {
					this.linking.current.b = shapeB;
				},

				getLinkingA: function() {
					return this.linking.current.a;
				},

				getLinkingB: function() {
					return this.linking.current.b;
				},

				isLinking: function( set ) {
					return ! ! this.linking.current.a;
				},

				newLinkingLine: function() {
					var line = document.createElementNS( this.ns, 'line');
					line.setAttribute('class', 'graph-linkingline');
					this.shapeZone.insertBefore( line, this.shapeZone.firstChild );
					return line;
				},

				getLinkingLine: function( add ) {
					return this.linking.current.line;
				},

				endLinking: function() {

					if( ( this.linking.current.a == this.linking.current.b && this.linking.current.a ) || ( ! this.linking.current.b && this.linking.current.a )  ) {

						this.shapeZone.removeChild( this.linking.current.line );
						this.linking.current = {};

						return;
					}

					if( this.linking.current.line ) {

						this.linking.current.line.style.display = "none";
						this.linking.links.push( this.linking.current );
						this.linking.current = {};
					}

					
				},

				linkingReveal: function() {


					for( var i = 0, l = this.linking.links.length ; i < l ; i ++ ) {
						this.linking.links[ i ].line.style.display = "block";
					}
				},

				linkingHide: function() {

					for( var i = 0, l = this.linking.links.length ; i < l ; i ++ ) {

						this.linking.links[ i ].line.style.display = "none";
					}
				}

			};

			for( var i in funcs ) {
				graph[ i ] = funcs[ i ];
			}

			function linkingStart( shape, e, clicked ) {

				var linking = shape.graph.isLinking();

				if( linking ) {
					return;
				}

				var line = shape.graph.newLinkingLine( );
				var coords = shape.getLinkingCoords();

				line.setAttribute('x1', coords.x );
				line.setAttribute('y1', coords.y );
				line.setAttribute('x2', coords.x );
				line.setAttribute('y2', coords.y );

				shape.graph.linkA( shape, line );
			}

			function linkingMove( shape, e ) {


				var linking = shape.graph.isLinking();

				if( ! linking ) {
					return;
				}

				if( shape.graph.getLinkingB( ) ) { // Hover something else
					return;
				}

				var line = shape.graph.getLinkingLine();
				var coords = shape.graph.getXY( e );

				line.setAttribute('x2', coords.x - shape.graph.getPaddingLeft( ) );
				line.setAttribute('y2', coords.y - shape.graph.getPaddingTop( ) );
			}


			function linkingOn( shape, e ) {

				var linking = shape.graph.isLinking();
				if( ! linking ) {
					return;
				}

				var linkingA = shape.graph.getLinkingA( );

				if( linkingA == this ) {
					return;
				}

				shape.graph.linkB( shape ); // Update B element

		
				var coords = shape.getLinkingCoords();

				var line = shape.graph.getLinkingLine();
				line.setAttribute('x2', coords.x );
				line.setAttribute('y2', coords.y );
			}

			function linkingOut( shape, e ) {

				var linking = shape.graph.isLinking();
				if( ! linking ) {
					return;
				}
				shape.graph.linkB( undefined ); // Remove B element
			}

			function linkingFinalize( shape ) {

				shape.graph.endLinking();

			}
			

	
			graph.linking = {
				current: {},
				links: []
			};

			graph._dom.addEventListener('keydown', function( e ) {

				e.preventDefault();
				e.stopPropagation();

				if( e.keyCode == 16 && e.ctrlKey ) {
					graph.linkingReveal();
				}
			});


			graph._dom.addEventListener( 'keyup', function( e ) {

				e.preventDefault();
				e.stopPropagation();
				graph.linkingHide();
			});

			graph.shapeHandlers.mouseDown.push( function( e ) {
				
				if( e.shiftKey ) {
					linkingStart( this, e, true );
				}
			});


			graph.shapeHandlers.mouseUp.push( function( e ) {
				
				linkingFinalize( this );
			});


			graph.shapeHandlers.mouseMove.push( function( e ) {
				
				linkingMove( this, e, true );
			});


			graph.shapeHandlers.mouseOver.push( function( e ) {
				
				linkingOn( this, e, true );
			});


			graph.shapeHandlers.mouseOut.push( function( e ) {
				
				linkingOut( this, e, true );
			});
		}
	};

	return plugin;
});