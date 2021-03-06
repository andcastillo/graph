define([], function() {

	"use strict";

	var plugin = function() { };

	plugin.prototype = {

		init: function( graph, options ) {
			this.shapeType = options.shapeType;
		},

		setShape: function( shapeType, linkable ) {
			this.shapeType = shapeType;
			this.shapeLinkable = linkable || false;
		},

		onMouseDown: function( graph, x, y, e, target ) {
				
			if( ! this.shapeType ) {
				return;
			}

			var self = this,
				selfPlugin = this;
				
			var xVal, yVal;

			this.count = this.count || 0;

			x -= graph.getPaddingLeft( ),
			y -= graph.getPaddingTop( ),

			xVal = graph.getXAxis().getVal( x );
			yVal = graph.getYAxis().getVal( y );

			//var color = Util.getNextColorRGB(this.count, 100);
			var color = [100, 100, 100];

			var shape = graph.makeShape( {

				type: this.shapeType,
				pos: {
					x: xVal, 
					y: yVal
				}, 
				pos2: {
					x: xVal,
					y: yVal
				},

				fillColor: color.concat([ 0.3 ]),
				strokeColor: color.concat([ 0.9 ]),
			
				onChange: function(newData) {
					graph.triggerEvent('onAnnotationChange', newData);
				},

				linkable: self.shapeLinkable

			}, {}, true ).then( function( shape ) {

				if( ! shape ) {
					return;
				}

				self.currentShape = shape;
				self.currentShapeEvent = e;
			
			} );

		},

		onMouseMove: function( graph, x, y, e ) {

			var self = this;

			if( self.currentShape ) {

				self.count ++;
				
				var shape = self.currentShape;
				self.currentShape = false;

				shape.draw( );				
				shape.handleCreateImpl();
				shape.select();

				shape.handleMouseDown( self.currentShapeEvent, true );
				shape.handleMouseMove( e, true );
			}
		},

		onMouseUp: function( ) {
			var self = this;
			if( self.currentShape ) {
				self.currentShape.kill();
				self.currentShape = false;
			}
		}

	}

	return plugin;

});