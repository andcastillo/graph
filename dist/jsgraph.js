/*!
 * jsGraph JavaScript Graphing Library v1.14.4-1
 * http://github.com/NPellet/jsGraph
 *
 * Copyright 2014 Norman Pellet
 * Released under the MIT license
 *
 * Date: 2016-06-15T09:14Z
 */

( function( global, factory ) {

  if ( typeof module === "object" && typeof module.exports === "object" ) {

    module.exports = factory( global );

  } else {

    factory( global );

  }

  // Pass this if window is not defined yet
}( ( typeof window !== "undefined" ? window : this ), function( window ) {

  "use strict";

  var Graph = function( $ ) {

    var build = [];

    build[ './jquery' ] = $;

    /* 
     * Build: new source file 
     * File name : graph.position
     * File path : /Users/normanpellet/Documents/Web/graph/src/graph.position.js
     */

    build[ './graph.position' ] = ( function() {
      /** @global */
      /** @ignore */

      "use strict";

      /** 
       * Positionning class
       * @class Position
       */
      var Position = function( x, y, dx, dy ) {

        if ( !( x instanceof Number ) && x instanceof Object ) {
          this.x = x.x;
          this.y = x.y;
          this.dx = x.dx;
          this.dy = x.dy;
        } else {
          this.x = x;
          this.y = y;
          this.dx = dx;
          this.dy = dy;
        }
      };

      Position.prototype.compute = function( graph, xAxis, yAxis, serie ) {

        if ( !graph || !xAxis || !yAxis || !graph.hasXAxis || !graph.hasYAxis ) {
          this.graph.throw();
        }

        if ( !graph.hasXAxis( xAxis ) ) {
          graph.throw( "Graph does not contain the x axis that was used as a parameter" )
        }

        if ( !graph.hasYAxis( yAxis ) ) {
          graph.throw( "Graph does not contain the x axis that was used as a parameter" )
        }

        return this._compute( graph, xAxis, yAxis, serie );
      };

      Position.prototype._compute = function( graph, xAxis, yAxis, serie ) {

        var relativeTo = this._relativeTo;
        if ( relativeTo ) {
          var relativeToComputed = relativeTo._compute( graph, xAxis, yAxis, serie );
        }

        var parsed,
          pos = {
            x: false,
            y: false
          };

        if ( !xAxis ) {
          xAxis = graph.getXAxis();
        }

        if ( !yAxis ) {
          yAxis = graph.getYAxis();
        }

        for ( var i in pos ) {

          var axis = i == 'x' ? xAxis : yAxis;
          var val = this[ i ];
          var dval = this[ "d" + i ];

          if ( val === undefined && ( ( dval !== undefined && relativeTo === undefined ) || relativeTo === undefined ) ) {

            if ( i == 'x' ) {

              if ( dval === undefined ) {
                continue;
              }

              pos[ i ] = relativeTo ? relativeTo[ i ] : axis.getPos( 0 );

            } else if ( this.x && serie ) {

              if ( _parsePx( this.x ) !== false ) {
                console.warn( "You have defined x in px and not y. Makes no sense. Returning 0 for y" );
                pos[ i ] = 0;
              } else {

                var closest = serie.searchClosestValue( this.x );

                if ( !closest ) {
                  console.warn( "Could not find y position for x = " + ( this.x ) + " on serie \"" + serie.getName() + "\". Returning 0 for y." );
                  pos[ i ] = 0;
                } else {
                  pos[ i ] = serie.getY( closest.yMin );
                }
              }
            }

          } else if ( val !== undefined ) {

            pos[ i ] = this.getPx( val, axis );

          }

          if ( dval !== undefined ) {

            var def = ( val !== undefined || relativeToComputed == undefined || relativeToComputed[ i ] == undefined ) ? pos[ i ] : ( relativeToComputed[ i ] );

            if ( i == 'y' && relativeToComputed && relativeToComputed.x !== undefined && relativeToComputed.y == undefined ) {

              if ( !serie ) {
                throw "Error. No serie exists. Cannot find y value";
                return;
              }

              var closest = serie.searchClosestValue( relativeTo.x );
              if ( closest ) {
                def = serie.getY( closest.yMin );
              }

              //console.log( relativeTo.x, closest, serie.getY( closest.yMin ), def );
            }

            if ( ( parsed = _parsePx( dval ) ) !== false ) { // dx in px => val + 10px

              pos[ i ] = def + parsed; // return integer (will be interpreted as px)

            } else if ( parsed = this._parsePercent( dval ) ) {

              pos[ i ] = def + this._getPositionPx( parsed, true, axis, graph ); // returns xx%

            } else if ( axis ) {

              pos[ i ] = def + axis.getRelPx( dval ); // px + unittopx

            }
          }
        }

        return pos;
      };

      Position.prototype._getPositionPx = function( value, x, axis, graph ) {

        var parsed;

        if ( ( parsed = _parsePx( value ) ) !== false ) {
          return parsed; // return integer (will be interpreted as px)
        }

        if ( ( parsed = this._parsePercent( value ) ) !== false ) {

          return parsed / 100 * ( x ? graph.getDrawingWidth() : graph.getDrawingHeight() );

        } else if ( axis ) {

          return axis.getPos( value );
        }
      };

      Position.prototype._parsePercent = function( percent ) {
        if ( percent && percent.indexOf && percent.indexOf( '%' ) > -1 ) {
          return percent;
        }
        return false;
      };

      Position.getDeltaPx = function( value, axis ) {
        var v;
        if ( ( v = _parsePx( value ) ) !== false ) {
          return ( v ) + "px";
        } else {

          return ( axis.getRelPx( value ) ) + "px";
        }
      };

      Position.prototype.deltaPosition = function( mode, delta, axis ) {

        mode = mode == 'y' ? 'y' : 'x';
        var ref = this[ mode ],
          refd = this[ 'd' + mode ],
          refPx,
          deltaPx;

        if ( ref !== undefined ) {
          if ( ( refPx = _parsePx( ref ) ) !== false ) {

            if ( ( deltaPx = _parsePx( delta ) ) !== false ) {
              this[ mode ] = ( refPx + deltaPx ) + "px";
            } else {
              this[ mode ] = ( refPx + axis.getRelPx( delta ) ) + "px";
            }
          } else {

            ref = this.getValPosition( ref, axis );

            if ( ( deltaPx = _parsePx( delta ) ) !== false ) {
              this[ mode ] = ( ref + axis.getRelVal( deltaPx ) );
            } else {
              this[ mode ] = ( ref + delta );
            }
          }
        } else if ( refd !== undefined ) {

          if ( mode == 'y' && ref === undefined && !this._relativeTo ) { // This means that the shape is placed by the x value. Therefore, the dy is only a stand-off.
            // Therefore, we do nothing
            return;
          }

          if ( ( refPx = _parsePx( refd ) ) !== false ) {

            if ( ( deltaPx = _parsePx( delta ) ) !== false ) {
              this[ 'd' + mode ] = ( refPx + deltaPx ) + "px";
            } else {
              this[ 'd' + mode ] = ( refPx + axis.getRelPx( delta ) ) + "px";
            }
          } else {

            refd = this.getValPosition( refd, axis );

            if ( ( deltaPx = _parsePx( delta ) ) !== false ) {
              this[ 'd' + mode ] = ( refd + axis.getRelVal( deltaPx ) );
            } else {
              this[ 'd' + mode ] = ( refd + delta );
            }
          }

        }
      };

      Position.prototype.getValPosition = function( rel, axis ) {

        if ( rel == 'max' ) {
          return axis.getMaxValue();
        }

        if ( rel == 'min' ) {
          return axis.getMinValue();
        }

        return rel;
      };

      Position.prototype.getPx = function( value, axis, rel ) {

        var parsed;

        if ( ( parsed = _parsePx( value ) ) !== false ) {

          return parsed; // return integer (will be interpreted as px)

        } else if ( parsed = this._parsePercent( value ) ) {

          return parsed; // returns xx%

        } else if ( axis ) {

          if ( value == "min" ) {

            return axis.getMinPx();

          } else if ( value == "max" ) {

            return axis.getMaxPx();

          } else if ( rel ) {

            return axis.getRelPx( value );
          } else {

            return axis.getPos( value );
          }
        }
      };

      Position.prototype.getPxRel = function( value, axis ) {
        return this.getPx( value, axis, true );
      };

      Position.prototype.relativeTo = function( pos ) {
        this._relativeTo = Position.check( pos );
        return this;
      };

      Position.check = function( pos, callback ) {
        if ( pos instanceof Position ) {
          return pos;
        }

        var posObject = new Position( pos );

        if ( pos && pos.relativeTo ) {
          var position;
          if ( position = callback( pos.relativeTo ) ) {
            posObject.relativeTo( position );
          }
        }

        return posObject;

      };

      function _parsePx( px ) {
        if ( px && px.indexOf && px.indexOf( 'px' ) > -1 ) {
          return parseInt( px.replace( 'px', '' ) );
        }
        return false;
      };

      return Position;
    } )();

    /* 
     * Build: new source file 
     * File name : graph.util
     * File path : /Users/normanpellet/Documents/Web/graph/src/graph.util.js
     */

    build[ './graph.util' ] = ( function() {
      /** @global */
      /** @ignore */

      /**
       * Some general utilitary functions that are useful for jsGraph
       * @object
       */
      var util = {};

      /**
       *  Easy set attribute method to apply to a SVG Element the attributes listed. Optional namespacing
       * @param {SVGElement} to - The SVG element to apply the attributes to
       * @param {Object<String,Any>} attr - A key/value hashmap of attributes
       * @param {String} [ ns = undefined ] - The namespace to use (with <code>setAttributeNS</code>). Default if without namespacing
       */
      util.setAttributeTo = function( to, params, ns ) {
        var i;

        if ( ns ) {
          for ( i in params ) {
            to.setAttributeNS( ns, i, params[ i ] );
          }
        } else {
          for ( i in params ) {
            to.setAttribute( i, params[ i ] );
          }
        }
      };

      /**
       * Maps old-style events defined within the creation (i.e. <code>{ onMouseOver: function() }</code>) to modern event listening <code>.on("mouseover")</code>
       * The function will read any object and select the ones starting with "on"
       * @params {Object} options - An option object to read the events from
       * @param {Object} source - The source object to which the options belong
       * @example util.mapEventEmission( this.options, this );
       */
      util.mapEventEmission = function( options, source ) {

        if ( !source ) {
          source = this;
        }

        var eventName;

        for ( var i in options ) {

          // Starts with onXXX
          if ( i.indexOf( "on" ) == 0 && typeof options[ i ] == "function" ) {
            eventName = i.substring( 2 );
            eventName = eventName.substring( 0, 1 ).toLowerCase() + eventName.substring( 1 );

            if ( source.on ) {

              ( function( j ) {

                source.on( eventName, function() {
                  options[ j ].apply( source, arguments );
                } );

              } )( i )

            }
          }
        }
      };

      /**
       * @link http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
       * @return {String} a random id
       */
      util.guid = function() {
        // 
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function( c ) {
          var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : ( r & 0x3 | 0x8 );
          return v.toString( 16 );
        } );

      };

      util.throwError = function( message ) {
        console.error( message );
      };

      util.warn = function( message ) {
        console.warn( message );
      };

      /**
       * Checks if a variable is a numeric or not
       * @return {Boolean} <code>true</code> for a numeric value, false otherwise
       */
      util.isNumeric = function( obj ) {
        return !Array.isArray( obj ) && ( obj - parseFloat( obj ) + 1 ) >= 0;
      };

      /**
       * @see http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
       * Converts an HSL color value to RGB. Conversion formula
       * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
       * Assumes h, s, and l are contained in the set [0, 1] and
       * returns r, g, and b in the set [0, 255].
       *
       * @param   Number  h       The hue
       * @param   Number  s       The saturation
       * @param   Number  l       The lightness
       * @return  Array           The RGB representation
       */
      util.hue2rgb = function( p, q, t ) {
        if ( t < 0 ) t += 1;
        if ( t > 1 ) t -= 1;
        if ( t < 1 / 6 ) return p + ( q - p ) * 6 * t;
        if ( t < 1 / 2 ) return q;
        if ( t < 2 / 3 ) return p + ( q - p ) * ( 2 / 3 - t ) * 6;
        return p;
      };

      util.hslToRgb = function( h, s, l ) {
        var r, g, b;

        if ( s == 0 ) {
          r = g = b = l; // achromatic
        } else {

          var q = l < 0.5 ? l * ( 1 + s ) : l + s - l * s;
          var p = 2 * l - q;
          r = util.hue2rgb( p, q, h + 1 / 3 );
          g = util.hue2rgb( p, q, h );
          b = util.hue2rgb( p, q, h - 1 / 3 );
        }

        return [ Math.round( r * 255 ), Math.round( g * 255 ), Math.round( b * 255 ) ];
      };

      util.saveDomAttributes = function( to, attributes, identification ) {

        if ( !to ) return;

        to._savedAttributesIds = to._savedAttributesIds || [];

        if ( to._savedAttributesIds.indexOf( identification ) > -1 ) {
          util.restoreDomAttributes( to, identification );
        }

        to._savedAttributes = to._savedAttributes || {};
        to._attributes = to._attributes || {};
        to._attributes[ identification ] = attributes;

        to._savedAttributesIds.push( identification );

        for ( var i in attributes ) {

          if ( !to._savedAttributes[ i ] ) {
            to._savedAttributes[ i ] = to.getAttribute( i );
          }

          to.setAttribute( i, attributes[ i ] );
        }

      };

      util.restoreDomAttributes = function( to, identification ) {

        if ( !to || !to._savedAttributesIds ) {
          return;
        }

        to._savedAttributesIds.splice( to._savedAttributesIds.indexOf( identification ), 1 );
        delete to._attributes[ identification ];

        var attrs = {};

        for ( var i in to._savedAttributes ) {
          attrs[ i ] = to._savedAttributes[ i ];
        };

        for ( var i = 0, l = to._savedAttributesIds.length; i < l; i++ ) {

          for ( var j in to._attributes[ to._savedAttributesIds[ i ] ] ) {
            attrs[ j ] = to._attributes[ to._savedAttributesIds[ i ] ][ j ];
          }
        }

        for ( var j in attrs ) {
          to.setAttribute( j, attrs[ j ] );
        }

      };

      // http://stackoverflow.com/questions/11197247/javascript-equivalent-of-jquerys-extend-method
      util.extend = function() {
        var src, copyIsArray, copy, name, options, clone,
          target = arguments[ 0 ] || {},
          i = 1,
          length = arguments.length,
          deep = false;

        // Handle a deep copy situation
        if ( typeof target === "boolean" ) {
          deep = target;
          target = arguments[ 1 ] || {};

          // skip the boolean and the target
          i = 2;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if ( typeof target !== "object" && !( typeof target == "function" ) ) {
          target = {};
        }

        // extend jQuery itself if only one argument is passed
        if ( length === i ) {
          target = this;
          --i;
        }

        for ( ; i < length; i++ ) {

          // Only deal with non-null/undefined values
          if ( ( options = arguments[ i ] ) != null ) {

            // Extend the base object
            for ( name in options ) {
              src = target[ name ];
              copy = options[ name ];

              // Prevent never-ending loop
              if ( target === copy ) {
                continue;
              }

              // Recurse if we're merging plain objects or arrays
              if ( deep && copy && ( util.isPlainObject( copy ) || ( copyIsArray = Array.isArray( copy ) ) ) ) {
                if ( copyIsArray ) {
                  copyIsArray = false;
                  clone = src && Array.isArray( src ) ? src : [];

                } else {
                  clone = src && util.isPlainObject( src ) ? src : {};
                }

                // Never move original objects, clone them
                target[ name ] = util.extend( deep, clone, copy );

                // Don't bring in undefined values
              } else if ( copy !== undefined ) {
                target[ name ] = copy;
              }
            }
          }
        }

        // Return the modified object
        return target;
      };

      // http://code.jquery.com/jquery-2.1.4.js
      util.isPlainObject = function( obj ) {
        // Not plain objects:
        // - Any object or value whose internal [[Class]] property is not "[object Object]"
        // - DOM nodes
        // - window
        if ( typeof obj !== "object" || obj.nodeType || obj === obj.window ) {
          return false;
        }

        if ( obj.constructor && obj.constructor.prototype.hasOwnProperty( "isPrototypeOf" ) ) {
          return false;
        }

        // If the function hasn't returned already, we're confident that
        // |obj| is a plain object, created by {} or constructed with new Object
        return true;
      };

      // https://davidwalsh.name/function-debounce
      util.debounce = function( func, wait, immediate ) {
        var timeout;
        return function() {
          var context = this,
            args = arguments;
          var later = function() {
            timeout = null;
            if ( !immediate ) func.apply( context, args );
          };
          var callNow = immediate && !timeout;
          clearTimeout( timeout );
          timeout = setTimeout( later, wait );
          if ( callNow ) func.apply( context, args );
        };
      };

      util.SVGParser = function( svgString ) {

        var parser = new DOMParser();
        var doc = parser.parseFromString( svgString, "image/svg+xml" );
        // returns a SVGDocument, which also is a Document.

        return doc;

      };

      // http://stackoverflow.com/questions/5276953/what-is-the-most-efficient-way-to-reverse-an-array-in-javascript
      util.reverseArray = function( array ) {
        var left = null;
        var right = null;
        var length = array.length;
        for ( left = 0, right = length - 1; left < right; left += 1, right -= 1 ) {
          var temporary = array[ left ];
          array[ left ] = array[ right ];
          array[ right ] = temporary;
        }
        return array;
      };

      return util;

    } )();

    /* 
     * Build: new source file 
     * File name : dependencies/eventEmitter/EventEmitter
     * File path : /Users/normanpellet/Documents/Web/graph/src/dependencies/eventEmitter/EventEmitter.js
     */

    build[ './dependencies/eventEmitter/EventEmitter' ] = ( function() {
      /** @global */
      /** @ignore */
      /*!
       * EventEmitter v4.2.9 - git.io/ee
       * Oliver Caldwell
       * MIT license
       * @preserve
       */

      'use strict';

      /**
       * Class for managing events.
       * Can be extended to provide event functionality in other classes.
       *
       * @class EventEmitter Manages event registering and emitting.
       */
      function EventEmitter() {}

      // Shortcuts to improve speed and size
      var proto = EventEmitter.prototype;

      /**
       * Finds the index of the listener for the event in its storage array.
       *
       * @param {Function[]} listeners Array of listeners to search through.
       * @param {Function} listener Method to look for.
       * @return {Number} Index of the specified listener, -1 if not found
       * @api private
       */
      function indexOfListener( listeners, listener ) {
        var i = listeners.length;
        while ( i-- ) {
          if ( listeners[ i ].listener === listener ) {
            return i;
          }
        }

        return -1;
      }

      /**
       * Alias a method while keeping the context correct, to allow for overwriting of target method.
       *
       * @param {String} name The name of the target method.
       * @return {Function} The aliased method
       * @api private
       */
      function alias( name ) {
        return function aliasClosure() {
          return this[ name ].apply( this, arguments );
        };
      }

      /**
       * Returns the listener array for the specified event.
       * Will initialise the event object and listener arrays if required.
       * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
       * Each property in the object response is an array of listener functions.
       *
       * @param {String|RegExp} evt Name of the event to return the listeners from.
       * @return {Function[]|Object} All listener functions for the event.
       */
      proto.getListeners = function getListeners( evt ) {
        var events = this._getEvents();
        var response;
        var key;

        // Return a concatenated array of all matching events if
        // the selector is a regular expression.
        if ( evt instanceof RegExp ) {
          response = {};
          for ( key in events ) {
            if ( events.hasOwnProperty( key ) && evt.test( key ) ) {
              response[ key ] = events[ key ];
            }
          }
        } else {
          response = events[ evt ] || ( events[ evt ] = [] );
        }

        return response;
      };

      /**
       * Takes a list of listener objects and flattens it into a list of listener functions.
       *
       * @param {Object[]} listeners Raw listener objects.
       * @return {Function[]} Just the listener functions.
       */
      proto.flattenListeners = function flattenListeners( listeners ) {
        var flatListeners = [];
        var i;

        for ( i = 0; i < listeners.length; i += 1 ) {
          flatListeners.push( listeners[ i ].listener );
        }

        return flatListeners;
      };

      /**
       * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
       *
       * @param {String|RegExp} evt Name of the event to return the listeners from.
       * @return {Object} All listener functions for an event in an object.
       */
      proto.getListenersAsObject = function getListenersAsObject( evt ) {
        var listeners = this.getListeners( evt );
        var response;

        if ( listeners instanceof Array ) {
          response = {};
          response[ evt ] = listeners;
        }

        return response || listeners;
      };

      /**
       * Adds a listener function to the specified event.
       * The listener will not be added if it is a duplicate.
       * If the listener returns true then it will be removed after it is called.
       * If you pass a regular expression as the event name then the listener will be added to all events that match it.
       *
       * @param {String|RegExp} evt Name of the event to attach the listener to.
       * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
       * @return {Object} Current instance of EventEmitter for chaining.
       */
      proto.addListener = function addListener( evt, listener ) {
        var listeners = this.getListenersAsObject( evt );
        var listenerIsWrapped = typeof listener === 'object';
        var key;

        for ( key in listeners ) {
          if ( listeners.hasOwnProperty( key ) && indexOfListener( listeners[ key ], listener ) === -1 ) {
            listeners[ key ].push( listenerIsWrapped ? listener : {
              listener: listener,
              once: false
            } );
          }
        }

        return this;
      };

      /**
       * Alias of addListener
       */
      proto.on = alias( 'addListener' );

      /**
       * Semi-alias of addListener. It will add a listener that will be
       * automatically removed after its first execution.
       *
       * @param {String|RegExp} evt Name of the event to attach the listener to.
       * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
       * @return {Object} Current instance of EventEmitter for chaining.
       */
      proto.addOnceListener = function addOnceListener( evt, listener ) {
        return this.addListener( evt, {
          listener: listener,
          once: true
        } );
      };

      /**
       * Alias of addOnceListener.
       */
      proto.once = alias( 'addOnceListener' );

      /**
       * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
       * You need to tell it what event names should be matched by a regex.
       *
       * @param {String} evt Name of the event to create.
       * @return {Object} Current instance of EventEmitter for chaining.
       */
      proto.defineEvent = function defineEvent( evt ) {
        this.getListeners( evt );
        return this;
      };

      /**
       * Uses defineEvent to define multiple events.
       *
       * @param {String[]} evts An array of event names to define.
       * @return {Object} Current instance of EventEmitter for chaining.
       */
      proto.defineEvents = function defineEvents( evts ) {
        for ( var i = 0; i < evts.length; i += 1 ) {
          this.defineEvent( evts[ i ] );
        }
        return this;
      };

      /**
       * Removes a listener function from the specified event.
       * When passed a regular expression as the event name, it will remove the listener from all events that match it.
       *
       * @param {String|RegExp} evt Name of the event to remove the listener from.
       * @param {Function} listener Method to remove from the event.
       * @return {Object} Current instance of EventEmitter for chaining.
       */
      proto.removeListener = function removeListener( evt, listener ) {
        var listeners = this.getListenersAsObject( evt );
        var index;
        var key;

        for ( key in listeners ) {
          if ( listeners.hasOwnProperty( key ) ) {
            index = indexOfListener( listeners[ key ], listener );

            if ( index !== -1 ) {
              listeners[ key ].splice( index, 1 );
            }
          }
        }

        return this;
      };

      /**
       * Alias of removeListener
       */
      proto.off = alias( 'removeListener' );

      /**
       * Adds listeners in bulk using the manipulateListeners method.
       * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
       * You can also pass it a regular expression to add the array of listeners to all events that match it.
       * Yeah, this function does quite a bit. That's probably a bad thing.
       *
       * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
       * @param {Function[]} [listeners] An optional array of listener functions to add.
       * @return {Object} Current instance of EventEmitter for chaining.
       */
      proto.addListeners = function addListeners( evt, listeners ) {
        // Pass through to manipulateListeners
        return this.manipulateListeners( false, evt, listeners );
      };

      /**
       * Removes listeners in bulk using the manipulateListeners method.
       * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
       * You can also pass it an event name and an array of listeners to be removed.
       * You can also pass it a regular expression to remove the listeners from all events that match it.
       *
       * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
       * @param {Function[]} [listeners] An optional array of listener functions to remove.
       * @return {Object} Current instance of EventEmitter for chaining.
       */
      proto.removeListeners = function removeListeners( evt, listeners ) {
        // Pass through to manipulateListeners
        return this.manipulateListeners( true, evt, listeners );
      };

      /**
       * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
       * The first argument will determine if the listeners are removed (true) or added (false).
       * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
       * You can also pass it an event name and an array of listeners to be added/removed.
       * You can also pass it a regular expression to manipulate the listeners of all events that match it.
       *
       * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
       * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
       * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
       * @return {Object} Current instance of EventEmitter for chaining.
       */
      proto.manipulateListeners = function manipulateListeners( remove, evt, listeners ) {
        var i;
        var value;
        var single = remove ? this.removeListener : this.addListener;
        var multiple = remove ? this.removeListeners : this.addListeners;

        // If evt is an object then pass each of its properties to this method
        if ( typeof evt === 'object' && !( evt instanceof RegExp ) ) {
          for ( i in evt ) {
            if ( evt.hasOwnProperty( i ) && ( value = evt[ i ] ) ) {
              // Pass the single listener straight through to the singular method
              if ( typeof value === 'function' ) {
                single.call( this, i, value );
              } else {
                // Otherwise pass back to the multiple function
                multiple.call( this, i, value );
              }
            }
          }
        } else {
          // So evt must be a string
          // And listeners must be an array of listeners
          // Loop over it and pass each one to the multiple method
          i = listeners.length;
          while ( i-- ) {
            single.call( this, evt, listeners[ i ] );
          }
        }

        return this;
      };

      /**
       * Removes all listeners from a specified event.
       * If you do not specify an event then all listeners will be removed.
       * That means every event will be emptied.
       * You can also pass a regex to remove all events that match it.
       *
       * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
       * @return {Object} Current instance of EventEmitter for chaining.
       */
      proto.removeEvent = function removeEvent( evt ) {
        var type = typeof evt;
        var events = this._getEvents();
        var key;

        // Remove different things depending on the state of evt
        if ( type === 'string' ) {
          // Remove all listeners for the specified event
          delete events[ evt ];
        } else if ( evt instanceof RegExp ) {
          // Remove all events matching the regex.
          for ( key in events ) {
            if ( events.hasOwnProperty( key ) && evt.test( key ) ) {
              delete events[ key ];
            }
          }
        } else {
          // Remove all listeners in all events
          delete this._events;
        }

        return this;
      };

      /**
       * Alias of removeEvent.
       *
       * Added to mirror the node API.
       */
      proto.removeAllListeners = alias( 'removeEvent' );

      /**
       * Emits an event of your choice.
       * When emitted, every listener attached to that event will be executed.
       * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
       * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
       * So they will not arrive within the array on the other side, they will be separate.
       * You can also pass a regular expression to emit to all events that match it.
       *
       * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
       * @param {Array} [args] Optional array of arguments to be passed to each listener.
       * @return {Object} Current instance of EventEmitter for chaining.
       */
      proto.emitEvent = function emitEvent( evt, args ) {
        var listeners = this.getListenersAsObject( evt );
        var listener;
        var i;
        var key;
        var response;

        for ( key in listeners ) {
          if ( listeners.hasOwnProperty( key ) ) {
            i = listeners[ key ].length;

            while ( i-- ) {
              // If the listener returns true then it shall be removed from the event
              // The function is executed either with a basic call or an apply if there is an args array
              listener = listeners[ key ][ i ];

              if ( listener.once === true ) {
                this.removeListener( evt, listener.listener );
              }

              response = listener.listener.apply( this, args || [] );

              if ( response === this._getOnceReturnValue() ) {
                this.removeListener( evt, listener.listener );
              }
            }
          }
        }

        return this;
      };

      /**
       * Alias of emitEvent
       */
      proto.trigger = alias( 'emitEvent' );

      /**
       * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
       * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
       *
       * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
       * @param {...*} Optional additional arguments to be passed to each listener.
       * @return {Object} Current instance of EventEmitter for chaining.
       */
      proto.emit = function emit( evt ) {
        var args = Array.prototype.slice.call( arguments, 1 );
        return this.emitEvent( evt, args );
      };

      /**
       * Sets the current value to check against when executing listeners. If a
       * listeners return value matches the one set here then it will be removed
       * after execution. This value defaults to true.
       *
       * @param {*} value The new value to check for when executing listeners.
       * @return {Object} Current instance of EventEmitter for chaining.
       */
      proto.setOnceReturnValue = function setOnceReturnValue( value ) {
        this._onceReturnValue = value;
        return this;
      };

      /**
       * Fetches the current value to check against when executing listeners. If
       * the listeners return value matches this one then it should be removed
       * automatically. It will return true by default.
       *
       * @return {*|Boolean} The current value to check for or the default, true.
       * @api private
       */
      proto._getOnceReturnValue = function _getOnceReturnValue() {
        if ( this.hasOwnProperty( '_onceReturnValue' ) ) {
          return this._onceReturnValue;
        } else {
          return true;
        }
      };

      /**
       * Fetches the events object and creates one if required.
       *
       * @return {Object} The events storage object.
       * @api private
       */
      proto._getEvents = function _getEvents() {
        return this._events || ( this._events = {} );
      };

      return EventEmitter;
    } )();

    /* 
     * Build: new source file 
     * File name : graph.core
     * File path : /Users/normanpellet/Documents/Web/graph/src/graph.core.js
     */

    build[ './graph.core' ] = ( function( $, GraphPosition, util, EventEmitter ) {
      /** @global */
      /** @ignore */

      "use strict";

      /** 
       * Main class of jsGraph that creates a new graph.
       * @class Graph
       * @param {HTMLElement} wrapper - The DOM Wrapper element
       * @param {Graph#options} [ options ] - The options of the graph
       * @param {Object} [ axis ] - The list of axes
       * @param {Array} axis.left - The list of left axes
       * @param {Array} axis.bottom - The list of bottom axes
       * @param {Array} axis.top - The list of top axes
       * @param {Array} axis.right - The list of right axes
       * @augments EventEmitter
       * @example var graph = new Graph("someDomID");
       * @example var graph = new Graph("someOtherDomID", { title: 'Graph title', paddingRight: 100 } );
       * @tutorial basic
       */

      var profiling = [];

      function Graph( wrapper, options, axis ) {

        var self = this;

        /*
          The unique ID of the graph
          @name Graph#uniqueid
          @type String
        */
        this._creation = util.guid();

        if ( typeof wrapper == "string" ) {
          wrapper = document.getElementById( wrapper );
        }

        if ( !wrapper ) {
          throw "The wrapper DOM element was not found.";
        }

        if ( wrapper instanceof $ ) {
          wrapper = wrapper.get( 0 );
        }

        if ( !wrapper.appendChild ) {
          throw "The wrapper appears to be an invalid HTMLElement";
        }

        wrapper.style[ '-webkit-user-select' ] = 'none';
        wrapper.style[ '-moz-user-select' ] = 'none';
        wrapper.style[ '-o-user-select' ] = 'none';
        wrapper.style[ '-ms-user-select' ] = 'none';
        wrapper.style[ 'user-select' ] = 'none';

        /** 
         * @object
         * @memberof Graph
         * @name Graph#options
         * @default {@link GraphOptionsDefault}
         */
        this.options = $.extend( {}, GraphOptionsDefault, options );

        this.prevented = false;

        this.axis = {
          left: [],
          top: [],
          bottom: [],
          right: []
        };

        this.shapes = [];
        this.shapesLocked = false;
        this.plugins = {};

        for ( var i in this.options.pluginAction ) {
          this.options.pluginAction.plugin = i;
          this.options.mouseActions.push( this.options.pluginAction );
        }

        this.selectedShapes = [];

        this.ns = 'http://www.w3.org/2000/svg';
        this.nsxlink = "http://www.w3.org/1999/xlink";
        this.series = [];
        this._dom = wrapper;
        this._axesHaveChanged = true;

        if ( this.options.hasOwnProperty( 'padding' ) && util.isNumeric( this.options.padding ) ) {
          this.options.paddingTop = this.options.paddingBottom = this.options.paddingLeft = this.options.paddingRight = this.options.padding;
        }

        // DOM
        var w, h;
        if ( wrapper.style.width && wrapper.style.width.indexOf( "%" ) == -1 ) {
          w = parseInt( wrapper.style.width.replace( 'px', '' ) );
        } else {
          w = $( wrapper ).width();
        }

        if ( wrapper.style.height && wrapper.style.height.indexOf( "%" ) == -1 ) {
          h = parseInt( wrapper.style.height.replace( 'px', '' ) );
        } else {
          h = $( wrapper ).height();
        }

        this._doDom();

        this.setSize( w, h );
        this._resize();
        _registerEvents( this );

        this.pluginsReady = $.Deferred();
        this.seriesReady = $.Deferred();

        this.currentAction = false;

        // Load all axes
        if ( axis ) {
          for ( var i in axis ) {
            for ( var j = 0, l = axis[ i ].length; j < l; j++ ) {

              switch ( i ) {

                case 'top':
                  this.getTopAxis( j, axis[ i ][ j ] );
                  break;
                case 'bottom':
                  this.getBottomAxis( j, axis[ i ][ j ] );
                  break;
                case 'left':
                  this.getLeftAxis( j, axis[ i ][ j ] );
                  break;
                case 'right':
                  this.getRightAxis( j, axis[ i ][ j ] );
                  break;
              }
            }
          }
        }

        this._pluginsInit();

      }

      /** 
       * Default graph parameters
       * @name Graph~GraphOptionsDefault
       * @object
       * @static
       * @memberof Graph
       * @prop {String} title - Title of the graph
       * @prop {Number} paddingTop - The top padding
       * @prop {Number} paddingLeft - The left padding
       * @prop {Number} paddingRight - The right padding
       * @prop {Number} paddingBottom - The bottom padding
       * @prop {(Number|Boolean)} padding - A common padding value for top, bottom, left and right
       * @prop {Number} fontSize - The basic text size of the graphs
       * @prop {Number} fontFamily - The basic font family. Should be installed on the computer of the user
       * @prop {Object.<String,Object>} plugins - A list of plugins to import with their options
       * @prop {Object.<String,Object>} pluginAction - The default key combination to access those actions
       * @prop {Object.<String,Object>} mouseActions - Alias of pluginActions
       * @prop {Object} wheel - Define the mouse wheel action
       * @prop {Object} dblclick - Define the double click action
       * @prop {Boolean} shapesUniqueSelection - true to allow only one shape to be selected at the time
       * @prop {Boolean} shapesUnselectOnClick - true to unselect all shapes on click
       */
      var GraphOptionsDefault = {

        title: '',

        paddingTop: 30,
        paddingBottom: 5,
        paddingLeft: 20,
        paddingRight: 20,

        close: {
          left: true,
          right: true,
          top: true,
          bottom: true
        },

        fontSize: 12,
        fontFamily: 'Myriad Pro, Helvetica, Arial',

        plugins: {},
        pluginAction: {},
        mouseActions: [],
        wheel: {},
        dblclick: {},

        shapesUnselectOnClick: true,
        shapesUniqueSelection: true
      };

      Graph.prototype = new EventEmitter();

      Graph.prototype = $.extend( Graph.prototype, {

        /** 
         * Returns the graph SVG wrapper element
         * @memberof Graph.prototype
         * @public
         * @return {SVGElement} The DOM element wrapping the graph
         */
        getDom: function() {
          return this.dom;
        },

        /** 
         * Returns the graph wrapper element passed during the graph creation
         * @memberof Graph.prototype
         * @public
         * @return {HTMLElement} The DOM element wrapping the graph
         */
        getWrapper: function() {
          return this._dom;
        },

        /**
         * Sets an option of the graph
         * @memberof Graph.prototype
         * @param {String} name - Option name
         * @param value - New option value
         * @returns {Graph} - Graph instance
         */
        setOption: function( name, val ) {
          this.options[ name ] = val;
          return this;
        },

        /**
         *  Sets the title of the graph
         * @memberof Graph.prototype
         */
        setTitle: function( title ) {
          this.options.title = title;
          this.domTitle.textContent = title;
        },

        /**
         *  Shows the title of the graph
         * @memberof Graph.prototype
         */
        displayTitle: function() {
          this.domTitle.setAttribute( 'display', 'inline' );
        },

        /**
         *  Hides the title of the graph
         * @memberof Graph.prototype
         */
        hideTitle: function() {
          this.domTitle.setAttribute( 'display', 'none' );
        },

        /**
         * Calls a repaint of the container. Used internally when zooming on the graph, or when <code>.autoscaleAxes()</code> is called (see {@link Graph#autoscaleAxes}).<br />
         * To be called after axes min/max are expected to have changed (e.g. after an <code>axis.zoom( from, to )</code>) has been called
         * @memberof Graph.prototype
         * @param {Boolean} onlyIfAxesHaveChanged - Triggers a redraw only if min/max values of the axes have changed.
         * @return {Boolean} if the redraw has been successful
         */
        redraw: function( onlyIfAxesHaveChanged ) {

          if ( !this.width || !this.height ) {
            return;
          }

          if ( !this.sizeSet ) {

            this._resize();
            return true;

          } else {

            if ( !onlyIfAxesHaveChanged || haveAxesChanged( this ) ) {
              refreshDrawingZone( this );
              return true;
            }
          }

          return false;
        },

        /**
         * Draw the graph and the series. This method will only redraw what is necessary. You may trust its use when you have set new data to series, changed serie styles or called for a zoom on an axis.
         * @memberof Graph.prototype
         */
        draw: function() {

          this.drawSeries( this.redraw( true ) );
        },

        /**
         * Sets the total width of the graph
         * @param {Number} width - The new width of the graph
         * @param {Boolean} skipResize - <code>true</code> to defer graph repaint. Use {@link Graph#resize} to force repain later on. (Useful if many graph sizing operations are done successively)
         * @see Graph#setHeight
         * @see Graph#resize
         * @memberof Graph.prototype
         */
        setWidth: function( width, skipResize ) {
          this.width = width;
          if ( !skipResize ) {
            this._resize();
          }
        },

        /**
         * Sets the total height of the graph
         * @param {Number} height - The new height of the graph
         * @param {Boolean} skipResize - <code>true</code> to defer graph repaint. Use {@link Graph#resize} to force repain later on. (Useful if many graph sizing operations are done successively)
         * @see Graph#setWidth
         * @see Graph#resize
         * @memberof Graph.prototype
         */
        setHeight: function( height, skipResize ) {
          this.height = height;
          if ( !skipResize ) {
            this._resize();
          }
        },

        /**
         * Sets the new dimension of the graph and repaints it. If width and height are omitted, a simple refresh is done.
         * @param {Number} [ width ] - The new width of the graph
         * @param {Number} [ height ] - The new height of the graph
         * @see Graph#setWidth
         * @see Graph#setHeight
         * @memberof Graph.prototype
         * @return {Graph} The current graph
         */
        resize: function( w, h ) {
          if ( w && h ) {
            this.setSize( w, h );
          }

          this._resize();
          return this;
        },

        /**
         * Sets the new dimension of the graph without repainting it. Use {@link Graph#resize} to perform the actual resizing of the graph.
         * @param {Number} [ width ] - The new width of the graph
         * @param {Number} [ height ] - The new height of the graph
         * @see Graph#setWidth
         * @see Graph#setHeight
         * @see Graph#resize
         * @memberof Graph.prototype
         */
        setSize: function( w, h ) {
          this.setWidth( w, true );
          this.setHeight( h, true );
          this.getDrawingHeight();
          this.getDrawingWidth();
        },

        /**
         * Returns the width of the graph (set by setSize, setWidth or resize methods)
         * @return {Number} Width of the graph
         * @memberof Graph.prototype
         */
        getWidth: function() {
          return this.width;
        },

        /**
         * Returns the height of the graph (set by setSize, setHeight or resize methods)
         * @return {Number} Height of the graph
         * @memberof Graph.prototype
         */
        getHeight: function() {
          return this.height;
        },

        /**
         * Returns the top padding of the graph (space between the top of the svg container and the topmost axis)
         * @return {Number} paddingTop
         * @memberof Graph.prototype
         */
        getPaddingTop: function() {
          return this.options.paddingTop;
        },

        /**
         * Returns the left padding of the graph (space between the left of the svg container and the leftmost axis)
         * @return {Number} paddingTop
         * @memberof Graph.prototype
         */
        getPaddingLeft: function() {
          return this.options.paddingLeft;
        },

        /**
         * Returns the bottom padding of the graph (space between the bottom of the svg container and the bottommost axis)
         * @return {Number} paddingTop
         * @memberof Graph.prototype
         */
        getPaddingBottom: function() {
          return this.options.paddingBottom;
        },

        /**
         * Returns the right padding of the graph (space between the right of the svg container and the rightmost axis)
         * @return {Number} paddingRight
         * @memberof Graph.prototype
         */
        getPaddingRight: function() {
          return this.options.paddingRight;
        },

        /**
         * Returns the height of the drawable zone, including the space used by the axes
         * @param {Boolean} useCache - Use cached value. Useful if one is sure the graph hasn't changed dimension. Automatically called after a Graph.resize();
         * @returns {Number} Height of the graph
         * @memberof Graph.prototype
         */
        getDrawingHeight: function( useCache ) {
          if ( useCache && this.innerHeight ) {
            return this.innerHeight;
          }
          return ( this.innerHeight = ( this.height - this.options.paddingTop - this.options.paddingBottom ) );
        },

        /**
         * Returns the width of the drawable zone, including the space used by the axes
         * @param {Boolean} useCache - Use cached value. Useful if one is sure the graph hasn't changed dimension. Automatically called after a Graph.resize();
         * @returns {Number} Width of the graph
         * @memberof Graph.prototype
         */
        getDrawingWidth: function( useCache ) {
          if ( useCache && this.innerWidth ) {
            return this.innerWidth;
          }
          return ( this.innerWidth = ( this.width - this.options.paddingLeft - this.options.paddingRight ) );
        },

        /**
         * Caches the wrapper offset in the page.<br />
         * The position of the wrapper is used when processing most of mouse events and it is fetched via the jQuery function .offset().
         * If performance becomes a critical issue in your application, <code>cacheOffset()</code> should be used to store the offset position. It should be ensured that the graph doesn't move in the page. If one can know when the graph has moved, <code>cacheOffset()</code> should be called again to update the offset position.
         * @memberof Graph.prototype
         * @see Graph#uncacheOffset
         */
        cacheOffset: function() {
          this.offsetCached = $( this._dom ).offset();
        },

        /**
         * Un-caches the wrapper offset value
         * @memberof Graph.prototype
         * @see Graph#cacheOffset
         */
        uncacheOffset: function() {
          this.offsetCached = false;
        },

        /**
         * Returns the x axis at a certain index. If any top axis exists and no bottom axis exists, returns or creates a top axis. Otherwise, creates or returns a bottom axis
         * Caution ! The <code>options</code> parameter will only be effective if an axis is created
         * @memberof Graph.prototype
         * @param {Number} [ index=0 ] - The index of the axis
         * @param {Object} [ options={} ] - The options to pass to the axis constructor
         */
        getXAxis: function( index, options ) {
          if ( this.axis.top.length > 0 && this.axis.bottom.length == 0 ) {
            return this.getTopAxis( index, options );
          }

          return this.getBottomAxis( index, options );
        },

        /**
         * Returns the y axis at a certain index. If any right axis exists and no left axis exists, returns or creates a right axis. Otherwise, creates or returns a left axis
         * Caution ! The <code>options</code> parameter will only be effective if an axis is created
         * @memberof Graph.prototype
         * @param {Number} [ index=0 ] - The index of the axis
         * @param {Object} [ options={} ] - The options to pass to the axis constructor
         */
        getYAxis: function( index, options ) {

          if ( this.axis.right.length > 0 && this.axis.left.length == 0 ) {
            return this.getRightAxis( index, options );
          }

          return this.getLeftAxis( index, options );
        },

        /**
         * Returns the top axis at a certain index. Creates it if non-existant
         * @memberof Graph.prototype
         * @param {Number} [ index=0 ] - The index of the axis
         * @param {Object} [ options={} ] - The options to pass to the axis constructor
         */
        getTopAxis: function( index, options ) {
          return _getAxis( this, index, options, 'top' );
        },

        /**
         * Returns the bottom axis at a certain index. Creates it if non-existant
         * @memberof Graph.prototype
         * @param {Number} [ index=0 ] - The index of the axis
         * @param {Object} [ options={} ] - The options to pass to the axis constructor
         */
        getBottomAxis: function( index, options ) {
          return _getAxis( this, index, options, 'bottom' );
        },

        /**
         * Returns the left axis at a certain index. Creates it if non-existant
         * @memberof Graph.prototype
         * @param {Number} [ index=0 ] - The index of the axis
         * @param {Object} [ options={} ] - The options to pass to the axis constructor
         */
        getLeftAxis: function( index, options ) {
          return _getAxis( this, index, options, 'left' );
        },

        /**
         * Returns the right axis at a certain index. Creates it if non-existant
         * @memberof Graph.prototype
         * @param {Number} [ index=0 ] - The index of the axis
         * @param {Object} [ options={} ] - The options to pass to the axis constructor
         */
        getRightAxis: function( index, options ) {
          return _getAxis( this, index, options, 'right' );
        },

        /**
         * Sets a bottom axis
         * @param {GraphAxis} axis - The axis instance to set
         * @param {Number} [ index=0 ] - The index of the axis
         * @memberof Graph.prototype
         */
        setXAxis: function( axis, index ) {
          this.setBottomAxis( axis, index );
        },

        /**
         * Sets a left axis
         * @param {GraphAxis} axis - The axis instance to set
         * @param {Number} [ index=0 ] - The index of the axis
         * @memberof Graph.prototype
         */
        setYAxis: function( axis, index ) {
          this.setLeftAxis( axis, index );
        },

        /**
         * Sets a left axis
         * @param {GraphAxis} axis - The axis instance to set
         * @param {Number} [ index=0 ] - The index of the axis
         * @memberof Graph.prototype
         * @see Graph#setBottomAxis
         * @see Graph#setTopAxis
         * @see Graph#setRightAxis
         * @see Graph#getLeftAxis
         * @see Graph#getYAxis
         */
        setLeftAxis: function( axis, index ) {
          index = index || 0;
          this.axis.left[ index ] = axis;
        },

        /**
         * Sets a right axis
         * @param {GraphAxis} axis - The axis instance to set
         * @param {Number} [ index=0 ] - The index of the axis
         * @memberof Graph.prototype
         * @see Graph#setBottomAxis
         * @see Graph#setLeftAxis
         * @see Graph#setTopAxis
         * @see Graph#getRightAxis
         * @see Graph#getYAxis
         */
        setRightAxis: function( axis, index ) {
          index = index || 0;
          this.axis.right[ index ] = axis;
        },

        /**
         * Sets a top axis
         * @param {GraphAxis} axis - The axis instance to set
         * @param {Number} [ index=0 ] - The index of the axis
         * @memberof Graph.prototype
         * @see Graph#setBottomAxis
         * @see Graph#setLeftAxis
         * @see Graph#setRightAxis
         * @see Graph#getBottomAxis
         * @see Graph#getXAxis
         */
        setTopAxis: function( axis, index ) {
          index = index || 0;
          this.axis.top[ index ] = axis;
        },

        /**
         * Sets a bottom axis
         * @param {GraphAxis} axis - The axis instance to set
         * @param {Number} [ number=0 ] - The index of the axis
         * @memberof Graph.prototype
         * @see Graph#setTopAxis
         * @see Graph#setLeftAxis
         * @see Graph#setRightAxis
         * @see Graph#getTopAxis
         * @see Graph#getXAxis
         */
        setBottomAxis: function( axis, num ) {
          num = num || 0;
          this.axis.bottom[ num ] = axis;
        },

        /**
         * Determines if an x axis belongs to the graph
         * @param {Axis} axis - The axis instance to check
         * @memberof Graph.prototype
         */
        hasXAxis: function( axis ) {
          return this.hasTopAxis( axis ) || this.hasBottomAxis( axis );
        },

        /**
         * Determines if an x axis belongs to the graph
         * @param {Axis} axis - The axis instance to check
         * @memberof Graph.prototype
         */
        hasYAxis: function( axis ) {
          return this.hasLeftAxis( axis ) || this.hasRightAxis( axis );
        },

        /**
         * Determines if an x axis belongs to top axes list of the graph
         * @param {Axis} axis - The axis instance to check
         * @memberof Graph.prototype
         */
        hasTopAxis: function( axis ) {
          return this.hasAxis( axis, this.axis.top );
        },

        /**
         * Determines if an x axis belongs to bottom axes list of the graph
         * @param {Axis} axis - The axis instance to check
         * @memberof Graph.prototype
         */
        hasBottomAxis: function( axis ) {
          return this.hasAxis( axis, this.axis.bottom );
        },

        /**
         * Determines if a y axis belongs to left axes list of the graph
         * @param {Axis} axis - The axis instance to check
         * @memberof Graph.prototype
         */
        hasLeftAxis: function( axis ) {
          return this.hasAxis( axis, this.axis.left );
        },

        /**
         * Determines if a y axis belongs to right axes list of the graph
         * @param {Axis} axis - The axis instance to check
         * @memberof Graph.prototype
         */
        hasRightAxis: function( axis ) {
          return this.hasAxis( axis, this.axis.right );
        },

        /**
         * Determines if an axis belongs to a list of axes
         * @param {Axis} axis - The axis instance to check
         * @param {Array} axisList - The list of axes to check
         * @memberof Graph.prototype
         * @private
         */
        hasAxis: function( axis, axisList ) {
          return axisList.indexOf( axis ) > -1;
        },

        /**
         * Autoscales the x and y axes of the graph<br />
         * Repains the canvas
         * @todo Find a solution for rescaling the y axis: if the x axis is
         * @memberof Graph.prototype
         */
        autoscaleAxes: function() {

          this._applyToAxes( "setMinMaxToFitSeries", null, true, true );

          //this._applyToAxes( "scaleToFitAxis", [ this.getYAxis() ], false, true )
          // X is not always ascending... 
        },

        _applyToAxis: {
          'string': function( type, func, params ) {
            //    params.splice(1, 0, type);

            for ( var i = 0; i < this.axis[ type ].length; i++ ) {
              this.axis[ type ][ i ][ func ].apply( this.axis[ type ][ i ], params );
            }
          },

          'function': function( type, func, params ) {
            for ( var i = 0; i < this.axis[ type ].length; i++ ) {
              func.call( this, this.axis[ type ][ i ], type, params );
            }
          }
        },

        /**
         * Calculates the minimal or maximal value of the axis. Currently, alias of getBoudaryAxisFromSeries
         * @memberof Graph.prototype
         */
        getBoundaryAxis: function( axis, minmax ) {

          var valSeries = this.getBoundaryAxisFromSeries( axis, minmax );
          //  var valShapes = this.getBoundaryAxisFromShapes( axis, xy, minmax );
          return valSeries;
          //return Math[ minmax ]( valSeries, valShapes );

        },

        /**
         * Calculates the minimal or maximal value of the axis, based on the series that belong to it. The value is computed so that all series just fit in the value.
         * @memberof Graph.prototype
         * @param {GraphAxis} axis - The axis for which the value should be computed
         * @param {minmax} minmax - The minimum or maximum to look for. "min" for the minimum, anything else for the maximum
         * @returns {Number} The minimimum or maximum of the axis based on its series
         */
        getBoundaryAxisFromSeries: function( axis, minmax ) {

          var min = minmax == 'min',
            val,
            func = axis.isX() ? [ 'getMinX', 'getMaxX' ] : [ 'getMinY', 'getMaxY' ],
            func2use = func[ min ? 0 : 1 ],
            infinity2use = min ? +Infinity : -Infinity,
            currentSerie,
            serie,
            series,
            serieValue,
            i,
            l;

          val = min ? Number.MAX_VALUE : Number.MIN_VALUE;
          series = this.getSeriesFromAxis( axis, true );

          for ( i = 0, l = series.length; i < l; i++ ) {

            serie = series[ i ];

            if ( !serie.isShown() ) {
              continue;
            }

            serieValue = serie[ func2use ]();

            val = Math[ minmax ]( isNaN( val ) ? infinity2use : val, isNaN( serieValue ) ? infinity2use : serieValue );

          }

          return val;
        },

        /**
         *  Returns all the series associated to an axis
         *  @memberof Graph.prototype
         *  @param {GraphAxis} axis - The axis to which the series belong
         *  @returns {Serie[]} An array containing the list of series that belong to the axis
         */
        getSeriesFromAxis: function( axis ) {
          var series = [],
            i = this.series.length - 1;
          for ( ; i >= 0; i-- ) {
            if ( this.series[ i ].getXAxis() == axis || this.series[ i ].getYAxis() == axis ) {
              series.push( this.series[ i ] );
            }
          }

          return series;
        },

        /**
         * Determines the maximum and minimum of each axes, based on {@link Graph#getBoundaryAxis}. It is usually called internally, but if the data of series has changed, called this function to make sure that minimum / maximum of the axes are properly updated.
         * @memberof Graph.prototype
         * @see Graph#getBoundaryAxis
         */
        updateDataMinMaxAxes: function() {

          var axisvars = [ 'bottom', 'top', 'left', 'right' ],
            axis,
            j,
            l,
            i,
            xy;

          for ( j = 0, l = axisvars.length; j < l; j++ ) {

            for ( i = this.axis[ axisvars[ j ] ].length - 1; i >= 0; i-- ) {

              axis = this.axis[ axisvars[ j ] ][ i ];
              xy = j < 2 ? 'x' : 'y';

              if ( axis.disabled ) {
                continue;
              }

              //console.log( axisvars[ j ], this.getBoundaryAxisFromSeries( this.axis[ axisvars[ j ] ][ i ], xy, 'min'), this.getBoundaryAxisFromSeries( this.axis[ axisvars[ j ] ][ i ], xy, 'max') );

              axis.setMinValueData( this.getBoundaryAxis( this.axis[ axisvars[ j ] ][ i ], 'min' ) );
              axis.setMaxValueData( this.getBoundaryAxis( this.axis[ axisvars[ j ] ][ i ], 'max' ) );

            }
          }

        },

        /** 
         * Function that is called from {@link Graph#_applyToAxes}
         * @function
         * @name AxisCallbackFunction
         * @param {GraphAxis} axis - The axis of the function
         * @param {String} type - The type of the axis (left,right,top,bottom)
         * @param params - The params passed in the _applyToAxis function.
         * @see Graph#_applyToAxes
         */

        /**
         * Applies a function to axes. The function will be executed once for every axis.
         * If func is a string, the internal function belonging to <strong>the axis</strong> will be called, with the params array flattened out (in this case, params must be an array).
         * If func is a function, the function will be called with the axis, its type and params as parameters. See {@link AxisCallbackFunction} for more details.
         * @param {(AxisCallbackFunction|String)} func - The function or function name to execute
         * @param params - Extra parameters to pass to the function
         * @param {Boolean} topbottom=false - True to apply to function to top and bottom axes
         * @param {Boolean} leftright=false - True to apply to function to left and right axes
         * @memberof Graph.prototype
         */
        _applyToAxes: function( func, params, tb, lr ) {

          var ax = [],
            i = 0,
            l;

          if ( tb || tb == undefined ) {
            ax.push( 'top' );
            ax.push( 'bottom' );
          }
          if ( lr || lr == undefined ) {
            ax.push( 'left' );
            ax.push( 'right' );
          }

          for ( l = ax.length; i < l; i++ ) {
            this._applyToAxis[ typeof func ].call( this, ax[ i ], func, params );
          }
        },

        /**
         * Axes can be dependant of one another (for instance for unit conversions)
         * Finds and returns all the axes that are linked to a specific axis. Mostly used internally.
         * @memberof Graph.prototype
         * @param {GraphAxis} axis - The axis that links one or multiple other dependant axes
         * @returns {Axis[]} The list of axes linked to the axis passed as parameter
         */
        findAxesLinkedTo: function( axis ) {

          var axes = [];
          this._applyToAxes( function( a ) {

            if ( a.linkedToAxis && a.linkedToAxis.axis == axis ) {
              axes.push( a );
            }
          }, {}, axis instanceof this.getConstructor( "graph.axis.x" ), axis instanceof this.getConstructor( "graph.axis.y" ) );

          return axes;
        },

        _axisHasChanged: function( axis ) {
          this._axesHaveChanged = true;
        },

        /**
         * Creates a new serie<br />
         * If the a serie with the same name exists, returns this serie with update options <br />
         * The type of the serie is used to fetch the corresponding registered constructor registered with the name "graph.serie.<type>", e.g "line" will fetch the "graph.serie.line" prototype (built-in)<br />
         * Built-in series types are "line", "contour", "zone" and "scatter".
         * @param {String} name - The name of the serie (unique)
         * @param {Object} options - The serie options
         * @param {Type} type - The type of the serie.
         * @returns {Serie} The newly created serie
         * @memberof Graph.prototype
         */
        newSerie: function( name, options, type ) {

          var self = this;

          if ( !type ) {
            type = "line";
          }

          var serie;
          if ( serie = this.getSerie( name ) ) {
            return serie;
          }

          serie = makeSerie( this, name, options, type );
          serie.type = type;
          self.series.push( serie );

          if ( self.legend ) {
            self.legend.update();
          }

          self.emit( "newSerie", serie );
          return serie;
        },

        /** 
         * Looks for an existing serie by name or by index and returns it.
         * The index of the serie follows the creation sequence (0 for the first one, 1 for the second one, ...)
         * @param {(String|Number)} name - The name or the index of the serie
         * @returns {Serie}
         * @memberof Graph.prototype
         */
        getSerie: function( name ) {

          if ( typeof name == 'number' ) {
            return this.series[ name ] || false;
          }
          var i = 0,
            l = this.series.length;

          for ( ; i < l; i++ ) {

            if ( this.series[ i ].getName() == name ) {

              return this.series[ i ];

            }
          }

          return false
        },

        /**
         * Returns all the series
         * @returns {Serie[]} An array of all the series
         * @memberof Graph.prototype
         */
        getSeries: function() {
          return this.series;
        },

        /**
         * Draws a specific serie
         * @param {Serie} serie - The serie to redraw
         * @param {Boolean} force - Forces redraw even if no data has changed
         * @memberof Graph.prototype
         */
        drawSerie: function( serie, force ) {

          if ( !serie.draw ) {
            throw "Serie has no method draw";
          }

          serie.draw( force );
        },

        /**
         * Redraws all visible series
         * @memberof Graph.prototype
         * @param {Boolean} force - Forces redraw even if no data has changed
         */
        drawSeries: function( force ) {

          if ( !this.width || !this.height ) {
            return;
          }

          var i = this.series.length - 1;
          for ( ; i >= 0; i-- ) {
            if ( this.series[ i ].isShown() ) {
              this.drawSerie( this.series[ i ], force );
            }
          }
        },

        /**
         * @memberof Graph.prototype
         * @alias Graph#removeSeries
         */
        resetSeries: function() {
          this.removeSeries()
        },

        /**
         * @memberof Graph.prototype
         * @alias Graph#removeSeries
         */

        killSeries: function() {
          this.resetSeries();
        },

        /**
         * Removes all series from the graph
         * @memberof Graph.prototype
         */
        removeSeries: function() {
          while ( this.series[ 0 ] ) {
            this.series[ 0 ].kill( true );
          }
          this.series = [];
        },

        /**
         * Selects a serie. Only one serie per graph can be selected.
         * @param {Serie} serie - The serie to select
         * @param {String} selectName="selected" - The name of the selection
         * @memberof Graph.prototype
         */
        selectSerie: function( serie, selectName ) {

          if ( this.selectedSerie == serie ) {
            return;
          }

          if ( this.selectedSerie ) {
            this.unselectSerie( serie );
          }

          this.selectedSerie = serie;
          this.triggerEvent( 'onSelectSerie', serie );
          serie.select( "selected" );
        },

        /**
         * Returns the selected serie
         * @returns {(Serie|undefined)} The selected serie
         * @memberof Graph.prototype
         */
        getSelectedSerie: function() {
          return this.selectedSerie;
        },

        /**
         * Unselects a serie
         * @param {Serie} serie - The serie to unselect
         * @memberof Graph.prototype
         */
        unselectSerie: function( serie ) {
          serie.unselect();
          this.selectedSerie = false;
          this.triggerEvent( 'onUnselectSerie', serie );
        },

        /**
         * Returns all the shapes associated to a serie. Shapes can (but don't have to) be associated to a serie. The position of the shape can then be relative to the same axes as the serie.
         * @param {Serie} serie - The serie containing the shapes
         * @returns {Shape[]} An array containing a list of shapes associated to the serie
         * @memberof Graph.prototype
         */
        getShapesOfSerie: function( serie ) {

          var shapes = [];
          var i = this.shapes.length - 1;

          for ( ; i >= 0; i-- ) {

            if ( this.shapes[ i ].getSerie() == serie ) {
              shapes.push( this.shapes[ i ] );
            }
          }

          return shapes;
        },

        makeToolbar: function( toolbarData ) {

          var constructor = this.getConstructor( "graph.toolbar" );
          if ( constructor ) {
            return this.toolbar = new constructor( this, toolbarData );
          } else {
            return util.throwError( "No constructor exists for toolbar" );
          }
        },

        /**
         *  Returns all shapes from the graph
         *  @memberof Graph.prototype
         */
        getShapes: function() {
          return this.shapes || [];
        },

        /**
         * Creates a new shape. jsGraph will look for the registered constructor "graph.shape.<shapeType>".
         * @param {String} shapeType - The type of the shape
         * @param {Object} [shapeData] - The options passed to the shape creator
         * @param {Boolean} [mute=false] - <code>true</code> to create the shape quietly
         * @param {Object} [shapeProperties] - The native object containing the shape properties in the jsGraph format (caution when using it)
         * @returns {Shape} The created shape
         * @memberof Graph.prototype
         * @see Graph#getConstructor
         */
        newShape: function( shapeType, shapeData, mute, shapeProperties ) {

          var self = this,
            response;

          if ( !mute ) {

            this.emit( 'beforeNewShape', shapeData );

            if ( this.prevent( false ) ) {
              return false;
            }
          }

          // Backward compatibility
          if ( typeof shapeType == "object" ) {
            mute = shapeData;
            shapeData = shapeType;
            shapeType = shapeData.type;
          }

          shapeData = shapeData || {};
          shapeData._id = util.guid();

          var constructor;
          if ( typeof shapeType == "function" ) {
            constructor = shapeType;
          } else {
            constructor = this.getConstructor( "graph.shape." + shapeType );
          }

          if ( !constructor ) {
            return util.throwError( "No constructor for this shape" );
          }

          var shape = new constructor( this, shapeData );

          if ( !shape ) {
            return util.throwError( "Failed to construct shape." );
          }

          shape.type = shapeType;
          shape.graph = this;
          shape._data = shapeData;

          shape.init( this, shapeProperties );

          if ( shapeData.position ) {

            for ( var i = 0, l = shapeData.position.length; i < l; i++ ) {
              shape.setPosition( new GraphPosition( shapeData.position[ i ] ), i );
            }
          }

          if ( shapeData.properties !== undefined ) {
            shape.setProperties( shapeData.properties );
          }

          /* Setting shape properties */
          if ( shapeData.fillColor !== undefined ) {
            shape.setFillColor( shapeData.fillColor );
          }

          if ( shapeData.fillOpacity !== undefined ) {
            shape.setFillOpacity( shapeData.fillOpacity );
          }

          if ( shapeData.strokeColor !== undefined ) {
            shape.setStrokeColor( shapeData.strokeColor );
          }

          if ( shapeData.strokeWidth !== undefined ) {
            shape.setStrokeWidth( shapeData.strokeWidth );
          }

          if ( shapeData.layer !== undefined ) {
            shape.setLayer( shapeData.layer );
          }

          if ( shapeData.locked == true ) {
            shape.lock();
          }

          if ( shapeData.movable == true ) {
            shape.movable();
          }

          if ( shapeData.selectable == true ) {
            shape.selectable();
          }

          if ( shapeData.resizable == true ) {
            shape.resizable();
          }

          if ( shapeData.attributes !== undefined ) {
            shape.setProp( "attributes", shapeData.attributes );
          }

          if ( shapeData.handles !== undefined ) {
            shape.setProp( 'handles', shapeData.handles );
          }

          if ( shapeData.selectOnMouseDown !== undefined ) {
            shape.setProp( "selectOnMouseDown", true );
          }

          if ( shapeData.selectOnClick !== undefined ) {
            shape.setProp( "selectOnClick", true );
          }

          if ( shapeData.highlightOnMouseOver !== undefined ) {
            shape.setProp( "highlightOnMouseOver", true );
          }

          if ( shapeData.labelEditable ) {
            shape.setProp( "labelEditable", shapeData.labelEditable );
          }

          if ( shapeData.labels && !shapeData.label ) {
            shapeData.label = shapeData.labels;
          }

          if ( shapeData.label !== undefined ) {

            if ( !Array.isArray( shapeData.label ) ) {
              shapeData.label = [ shapeData.label ];
            }

            for ( var i = 0, l = shapeData.label.length; i < l; i++ ) {

              shape.showLabel( i );
              shape.setLabelText( shapeData.label[ i ].text, i );
              shape.setLabelPosition( shapeData.label[ i ].position, i );
              shape.setLabelColor( shapeData.label[ i ].color || 'black', i );
              shape.setLabelSize( shapeData.label[ i ].size, i );
              shape.setLabelAngle( shapeData.label[ i ].angle || 0, i );
              shape.setLabelBaseline( shapeData.label[ i ].baseline || 'no-change', i );
              shape.setLabelAnchor( shapeData.label[ i ].anchor || 'start', i );
            }
          }

          shape.createHandles();

          this.shapes.push( shape );

          if ( !mute ) {
            this.emit( 'newShape', shape, shapeData );
          }

          return shape;
        },

        /**
         * Creates a new position. Arguments are passed to the position constructor
         * @param {...*} var_args
         * @memberof Graph.prototype
         * @see Position
         */
        newPosition: function( var_args ) {

          Array.prototype.unshift.call( arguments, null );
          return new( Function.prototype.bind.apply( GraphPosition, arguments ) );
        },

        /**
         *  Redraws all shapes. To be called if their definitions have changed
         *  @memberof Graph.prototype
         */
        redrawShapes: function() {

          //this.graphingZone.removeChild(this.shapeZone);
          for ( var i = 0, l = this.shapes.length; i < l; i++ ) {
            this.shapes[ i ].redraw();
          }
          //this.graphingZone.insertBefore(this.shapeZone, this.axisGroup);
        },

        /**
         *  Removes all shapes from the graph
         *  @memberof Graph.prototype
         */
        removeShapes: function() {
          for ( var i = 0, l = this.shapes.length; i < l; i++ ) {
            if ( this.shapes[ i ] && this.shapes[ i ].kill ) {
              this.shapes[ i ].kill( true );
            }
          }
          this.shapes = [];
        },

        /**
         * Selects a shape
         * @param {Shape} shape - The shape to select
         * @param {Boolean} mute - Select the shape quietly
         * @memberof Graph.prototype
         */
        selectShape: function( shape, mute ) {

          // Already selected. Returns false

          if ( !shape ) {
            return;
          }

          if ( this.selectedShapes.indexOf( shape ) > -1 ) {
            return false;
          }

          if ( !shape.isSelectable() ) {
            return false;
          }

          if ( !mute ) {
            this.emit( "beforeShapeSelect", shape );
          }

          if ( this.prevent( false ) ) {
            return;
          }

          if ( this.selectedShapes.length > 0 && this.options.shapesUniqueSelection ) { // Only one selected shape at the time

            this.unselectShapes( mute );
          }

          shape._select( mute );
          this.selectedShapes.push( shape );

          if ( !mute ) {
            this.emit( "shapeSelect", shape );
          }
        },

        /**
         * Unselects a shape
         * @param {Shape} shape - The shape to unselect
         * @param {Boolean} mute - Unselect the shape quietly
         * @memberof Graph.prototype
         */
        unselectShape: function( shape, mute ) {

          if ( this.selectedShapes.indexOf( shape ) == -1 ) {
            return;
          }

          if ( !mute ) {
            this.emit( "beforeShapeUnselect", shape );
          }

          if ( this.cancelUnselectShape ) {
            this.cancelUnselectShape = false;
            return;
          }

          shape._unselect();

          this.selectedShapes.splice( this.selectedShapes.indexOf( shape ), 1 );

          if ( !mute ) {
            this.emit( "shapeUnselect", shape );
          }

        },

        /**
         * Unselects all shapes
         * @memberof Graph.prototype
         * @param {Boolean} [ mute = false ] - Mutes all unselection events
         * @return {Graph} The current graph instance
         */
        unselectShapes: function( mute ) {

          while ( this.selectedShapes[ 0 ] ) {
            this.unselectShape( this.selectedShapes[ 0 ], mute );
          }

          return this;
        },

        _removeShape: function( shape ) {
          this.shapes.splice( this.shapes.indexOf( shape ), 1 );
        },

        appendShapeToDom: function( shape ) {
          this.getLayer( shape.getLayer(), 'shape' ).appendChild( shape.group );
        },

        removeShapeFromDom: function( shape ) {
          this.getLayer( shape.getLayer(), 'shape' ).removeChild( shape.group );
        },

        appendSerieToDom: function( serie ) {
          this.getLayer( serie.getLayer(), 'serie' ).appendChild( serie.groupMain );
        },

        removeSerieFromDom: function( serie ) {
          this.getLayer( serie.getLayer(), 'serie' ).removeChild( serie.groupMain );
        },

        getLayer: function( layer, mode ) {

          if ( !this.layers[ layer ] ) {

            this.layers[ layer ] = [];

            this.layers[ layer ][ 0 ] = document.createElementNS( this.ns, 'g' );
            this.layers[ layer ][ 0 ].setAttribute( 'data-layer', layer );
            this.layers[ layer ][ 1 ] = document.createElementNS( this.ns, 'g' );
            this.layers[ layer ][ 2 ] = document.createElementNS( this.ns, 'g' );

            this.layers[ layer ][ 0 ].appendChild( this.layers[ layer ][ 1 ] );
            this.layers[ layer ][ 0 ].appendChild( this.layers[ layer ][ 2 ] );

            var i = 1,
              prevLayer;

            while ( !( prevLayer = this.layers[ layer - i ] ) && layer - i >= 0 ) {
              i++;
            }

            if ( !prevLayer ) {

              this.plotGroup.insertBefore( this.layers[ layer ][ 0 ], this.plotGroup.firstChild );

            } else if ( prevLayer.nextSibling ) {

              this.plotGroup.insertBefore( this.layers[ layer ][ 0 ], prevLayer.nextSibling );

            } else {

              this.plotGroup.appendChild( this.layers[ layer ][ 0 ] );

            }
          }

          return this.layers[ layer ][ mode == 'shape' ? 2 : 1 ];

        },

        focus: function() {
          this._dom.focus();
        },

        elementMoving: function( movingElement ) {
          this.bypassHandleMouse = movingElement;
        },

        stopElementMoving: function( element ) {

          if ( element && element == this.bypassHandleMouse ) {
            this.bypassHandleMouse = false;
          } else if ( !element ) {
            this.bypassHandleMouse = false;
          }
        },

        _makeClosingLines: function() {

          this.closingLines = {};
          var els = [ 'top', 'bottom', 'left', 'right' ],
            i = 0,
            l = 4;
          for ( ; i < l; i++ ) {
            var line = document.createElementNS( this.ns, 'line' );
            line.setAttribute( 'stroke', 'black' );
            line.setAttribute( 'shape-rendering', 'crispEdges' );
            line.setAttribute( 'stroke-linecap', 'square' );
            line.setAttribute( 'display', 'none' );
            this.closingLines[ els[ i ] ] = line;
            this.graphingZone.appendChild( line );
          }
        },

        isMouseActionAllowed: function( e, action ) {

          if ( action.type !== e.type && ( action.type !== undefined || e.type !== "mousedown" ) && !( ( e.type === 'wheel' || e.type === 'mousewheel' ) && action.type == 'mousewheel' ) ) {
            return;
          }

          if ( action.shift === undefined ) {
            action.shift = false;
          }

          if ( action.ctrl === undefined ) {
            action.ctrl = false;
          }

          if ( action.meta === undefined ) {
            action.meta = false;
          }

          if ( action.alt === undefined ) {
            action.alt = false;
          }

          return ( e.shiftKey == action.shift && e.ctrlKey == action.ctrl && e.metaKey == action.meta && e.altKey == action.alt );
        },

        forcePlugin: function( plugin ) {
          this.forcedPlugin = plugin;
        },

        unforcePlugin: function() {
          this.forcedPlugin = false;
        },

        _pluginsExecute: function( funcName, args ) {

          //			Array.prototype.splice.apply(args, [0, 0, this]);

          for ( var i in this.plugins ) {

            if ( this.plugins[ i ] && this.plugins[ i ][ funcName ] ) {

              this.plugins[ i ][ funcName ].apply( this.plugins[ i ], args );

            }
          }
        },

        _pluginExecute: function( which, func, args ) {

          //Array.prototype.splice.apply( args, [ 0, 0, this ] );
          if ( !which ) {
            return;
          }

          if ( this.plugins[ which ] && this.plugins[ which ][ func ] ) {

            this.plugins[ which ][ func ].apply( this.plugins[ which ], args );
          }
        },

        _serieExecute: function( which, func, args ) {

          if ( typeof serie !== 'object' ) {
            serie = this.getSerie( serie );
          }

          if ( typeof serie[ func ] == 'function' ) {
            serie.apply( serie, args );
          }
        },

        _pluginsInit: function() {

          var constructor, pluginName, pluginOptions;

          for ( var i in this.options.plugins ) {

            pluginName = i;
            pluginOptions = this.options.plugins[ i ];

            constructor = this.getConstructor( "graph.plugin." + pluginName );

            if ( constructor ) {

              this.plugins[ pluginName ] = new constructor();
              this.plugins[ pluginName ].options = $.extend( true, {}, constructor.prototype.defaults || {}, pluginOptions );

              util.mapEventEmission( this.plugins[ pluginName ].options, this.plugins[ pluginName ] );
              this.plugins[ pluginName ].init( this, pluginOptions );

            } else {
              util.throwError( "Plugin \"" + pluginName + "\" has not been registered" );
            }
          }
        },

        /**
         * Returns an initialized plugin
         * @memberof Graph.prototype
         * @param {String} pluginName
         * @returns {Plugin} The plugin which name is <pluginName>
         */
        getPlugin: function( pluginName ) {
          var plugin = this.plugins[ pluginName ];

          if ( !plugin ) {
            return util.throwError( "Plugin \"" + pluginName + "\" has not been loaded or properly registered" );
          }

          return plugin;
        },

        triggerEvent: function() {
          var func = arguments[ 0 ],
            args = Array.prototype.splice.apply( arguments, [ 0, 1 ] );

          if ( typeof this.options[ func ] == "function" ) {
            return this.options[ func ].apply( this, arguments );
          }

          return;
        },

        /**
         * Creates a legend. Only one legend is allowed per graph
         * @param {Object} options - The legend options
         * @memberof Graph.prototype
         */
        makeLegend: function( options ) {

          if ( this.legend ) {
            return this.legend;
          }

          var constructor = this.getConstructor( "graph.legend" );
          if ( constructor ) {
            this.legend = new constructor( this, options );
          } else {
            return util.throwError( "Graph legend is not available as it has not been registered" );
          }

          this.legend.update();

          return this.legend;
        },

        /**
         * Redraw the legend
         * @memberof Graph.prototype
         */
        updateLegend: function() {

          if ( !this.legend ) {
            return;
          }

          this.legend.update();
        },

        getLegend: function() {
          if ( !this.legend ) {
            return;
          }

          return this.legend;

        },
        /**
         * Kills the graph
         * @memberof Graph.prototype
         **/
        kill: function() {
          this._dom.removeChild( this.dom );
        },

        _removeSerie: function( serie ) {
          this.series.splice( this.series.indexOf( serie ), 1 );
        },

        contextListen: function( target, menuElements, callback ) {

          var self = this;

          if ( this.options.onContextMenuListen ) {
            return this.options.onContextMenuListen( target, menuElements, callback );
          }
        },

        lockShapes: function() {
          this.shapesLocked = true;

          // Removes the current actions of the shapes
          for ( var i = 0, l = this.shapes.length; i < l; i++ ) {
            this.shapes[ i ].moving = false;
            this.shapes[ i ].resizing = false;
          }
        },

        unlockShapes: function() {
          //		console.log('unlock');
          this.shapesLocked = false;
        },

        prevent: function( arg ) {
          var curr = this.prevented;
          if ( arg != -1 ) {
            this.prevented = ( arg == undefined ) || arg;
          }
          return curr;
        },

        _getXY: function( e ) {

          var x = e.pageX,
            y = e.pageY;

          var pos = this.offsetCached || $( this._dom ).offset();

          x -= pos.left /* - window.scrollX*/ ;
          y -= pos.top /* - window.scrollY*/ ;

          return {
            x: x,
            y: y
          };
        },

        _resize: function() {

          if ( !this.width || !this.height ) {
            return;
          }

          this.getDrawingWidth();
          this.getDrawingHeight();

          this.sizeSet = true;
          this.dom.setAttribute( 'width', this.width );
          this.dom.setAttribute( 'height', this.height );
          this.domTitle.setAttribute( 'x', this.width / 2 );

          this.redraw();
          this.drawSeries( true );
          //refreshDrawingZone( this );

          if ( this.legend ) {
            this.legend.update();
          }
        },

        _doDom: function() {

          // Create SVG element, set the NS
          this.dom = document.createElementNS( this.ns, 'svg' );
          this.dom.setAttributeNS( "http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink" );
          //this.dom.setAttributeNS(this.ns, 'xmlns:xlink', this.nsxml);  
          util.setAttributeTo( this.dom, {
            'xmlns': this.ns,
            'font-family': this.options.fontFamily,
            'font-size': this.options.fontSize
          } );

          this._dom.appendChild( this.dom );

          this._dom.setAttribute( 'tabindex', 1 );

          this._dom.style.outline = "none";

          this.defs = document.createElementNS( this.ns, 'defs' );
          this.dom.appendChild( this.defs );

          this.groupEvent = document.createElementNS( this.ns, 'g' );

          this.rectEvent = document.createElementNS( this.ns, 'rect' );
          util.setAttributeTo( this.rectEvent, {
            'pointer-events': 'fill',
            'fill': 'transparent'
          } );
          this.groupEvent.appendChild( this.rectEvent );

          this.dom.appendChild( this.groupEvent );

          // Handling graph title
          this.domTitle = document.createElementNS( this.ns, 'text' );
          this.setTitle( this.options.title );
          util.setAttributeTo( this.domTitle, {
            'text-anchor': 'middle',
            'y': 20
          } );
          this.groupEvent.appendChild( this.domTitle );
          //

          this.graphingZone = document.createElementNS( this.ns, 'g' );
          this.updateGraphingZone();

          this.groupEvent.appendChild( this.graphingZone );

          /*  this.shapeZoneRect = document.createElementNS(this.ns, 'rect');
      //this.shapeZoneRect.setAttribute('pointer-events', 'fill');
      this.shapeZoneRect.setAttribute('fill', 'transparent');
      this.shapeZone.appendChild(this.shapeZoneRect);
    */
          this.axisGroup = document.createElementNS( this.ns, 'g' );
          this.graphingZone.appendChild( this.axisGroup );

          this.groupGrids = document.createElementNS( this.ns, 'g' );
          this.groupGrids.setAttribute( 'clip-path', 'url(#_clipplot' + this._creation + ')' );

          this.groupPrimaryGrids = document.createElementNS( this.ns, 'g' );
          this.groupSecondaryGrids = document.createElementNS( this.ns, 'g' );

          this.axisGroup.appendChild( this.groupGrids );

          this.groupGrids.appendChild( this.groupSecondaryGrids );
          this.groupGrids.appendChild( this.groupPrimaryGrids );

          this.plotGroup = document.createElementNS( this.ns, 'g' );
          this.graphingZone.appendChild( this.plotGroup );

          // 5 September 2014. I encountered a case here shapeZone must be above plotGroup
          /*this.shapeZone = document.createElementNS( this.ns, 'g' );
      this.graphingZone.appendChild( this.shapeZone );
*/

          this.layers = [];

          this._makeClosingLines();

          this.clip = document.createElementNS( this.ns, 'clipPath' );
          this.clip.setAttribute( 'id', '_clipplot' + this._creation );
          this.defs.appendChild( this.clip );

          this.clipRect = document.createElementNS( this.ns, 'rect' );
          this.clip.appendChild( this.clipRect );
          this.clip.setAttribute( 'clipPathUnits', 'userSpaceOnUse' );

          this.markerArrow = document.createElementNS( this.ns, 'marker' );
          this.markerArrow.setAttribute( 'viewBox', '0 0 10 10' );
          this.markerArrow.setAttribute( 'id', 'arrow' + this._creation );
          this.markerArrow.setAttribute( 'refX', '6' );
          this.markerArrow.setAttribute( 'refY', '5' );
          this.markerArrow.setAttribute( 'markerUnits', 'strokeWidth' );
          this.markerArrow.setAttribute( 'markerWidth', '8' );
          this.markerArrow.setAttribute( 'markerHeight', '6' );
          this.markerArrow.setAttribute( 'orient', 'auto' );
          //this.markerArrow.setAttribute('fill', 'context-stroke');
          //this.markerArrow.setAttribute('stroke', 'context-stroke');

          var pathArrow = document.createElementNS( this.ns, 'path' );
          pathArrow.setAttribute( 'd', 'M 0 0 L 10 5 L 0 10 z' );
          //pathArrow.setAttribute( 'fill', 'context-stroke' );
          this.markerArrow.appendChild( pathArrow );

          this.defs.appendChild( this.markerArrow );

          this.vertLineArrow = document.createElementNS( this.ns, 'marker' );
          this.vertLineArrow.setAttribute( 'viewBox', '0 0 10 10' );
          this.vertLineArrow.setAttribute( 'id', 'verticalline' + this._creation );
          this.vertLineArrow.setAttribute( 'refX', '0' );
          this.vertLineArrow.setAttribute( 'refY', '5' );
          this.vertLineArrow.setAttribute( 'markerUnits', 'strokeWidth' );
          this.vertLineArrow.setAttribute( 'markerWidth', '20' );
          this.vertLineArrow.setAttribute( 'markerHeight', '10' );
          this.vertLineArrow.setAttribute( 'orient', 'auto' );
          //this.vertLineArrow.setAttribute('fill', 'context-stroke');
          //this.vertLineArrow.setAttribute('stroke', 'context-stroke');
          this.vertLineArrow.setAttribute( 'stroke-width', '1px' );

          var pathVertLine = document.createElementNS( this.ns, 'path' );
          pathVertLine.setAttribute( 'd', 'M 0 -10 L 0 10' );
          pathVertLine.setAttribute( 'stroke', 'black' );

          this.vertLineArrow.appendChild( pathVertLine );

          this.defs.appendChild( this.vertLineArrow );

          this.plotGroup.setAttribute( 'clip-path', 'url(#_clipplot' + this._creation + ')' );

          this.bypassHandleMouse = false;
        },

        updateGraphingZone: function() {
          util.setAttributeTo( this.graphingZone, {
            'transform': 'translate(' + this.options.paddingLeft + ', ' + this.options.paddingTop + ')'
          } );
        },

        trackingLine: function( options ) {

          var self = this;

          if ( options ) {
            this.options.trackingLine = options;
          }

          if ( options.mode == "individual" ) {

            options.series.map( function( sOptions ) {

              sOptions.serie.enableTracking( function( serie, index, x, y ) {

                if ( index ) {

                  self.trackingLine.show();
                  var closestIndex = index.xIndexClosest;
                  self.trackingLine.getPosition( 0 ).x = serie.getData()[ 0 ][ index.closestIndex * 2 ];
                  self.trackingLine.getPosition( 1 ).x = serie.getData()[ 0 ][ index.closestIndex * 2 ];
                  self.trackingLine.redraw();

                  serie._trackingLegend = _trackingLegendSerie( self, {
                    serie: serie
                  }, x, y, serie._trackingLegend, sOptions.textMethod ? sOptions.textMethod : function( output ) {

                    for ( var i in output ) {
                      return output[ i ].serie.serie.getName();
                      break;
                    }

                  }, self.trackingLine.getPosition( 0 ).x );

                  serie._trackingLegend.style.display = "block";
                }
              }, function( serie ) {
                self.trackingLine.hide();

                if ( serie.trackingShape ) {
                  serie.trackingShape.hide();
                }

                serie._trackingLegend.style.display = "none";
                serie._trackingLegend = _trackingLegendSerie( self, {
                  serie: serie
                }, false, false, serie._trackingLegend, false, false );

              } );
            } );
          } else {
            options.series.map( function( serie ) {
              serie.serie.disableTracking();
            } );
          }

          this.trackingLine = this.newShape( 'line', util.extend( true, {
            position: [ {
              y: 'min'
            }, {
              y: 'max'
            } ],
            stroke: 'black',
            layer: -1
          }, options.trackingLineShapeOptions ) );
          this.trackingLine.draw();

          return this.trackingLine;

        }

      } );

      function makeSerie( graph, name, options, type ) {

        var constructor = graph.getConstructor( "graph.serie." + type );
        if ( constructor ) {
          var serie = new constructor();
          serie.init( graph, name, options );
          graph.appendSerieToDom( serie );
        } else {
          return util.throwError( "No constructor exists for serie type \"" + type + "\"" );
        }

        return serie;
      };

      function getAxisLevelFromSpan( span, level ) {

        for ( var i = 0, l = level.length; i < l; i++ ) {

          var possible = true;
          for ( var k = 0, m = level[ i ].length; k < m; k++ ) {

            if ( !( ( span[ 0 ] < level[ i ][ k ][ 0 ] && span[ 1 ] < level[ i ][ k ][ 0 ] ) || ( ( span[ 0 ] > level[ i ][ k ][ 1 ] && span[ 1 ] > level[ i ][ k ][ 1 ] ) ) ) ) {
              possible = false;
            }
          }

          if ( possible ) {

            level[ i ].push( span );
            return i;
          }
        }

        level.push( [ span ] );
        return ( level.length - 1 );
      }

      function refreshDrawingZone( graph ) {

        var i, j, l, xy, min, max, axis;
        var shift = {
          top: [],
          bottom: [],
          left: [],
          right: []
        };

        var levels = {
          top: [],
          bottom: [],
          left: [],
          right: []
        };

        graph._painted = true;

        // Apply to top and bottom
        graph._applyToAxes( function( axis, position ) {

          if ( axis.disabled || axis.floating ) {
            return;
          }

          var level = getAxisLevelFromSpan( axis.getSpan(), levels[ position ] );
          axis.setLevel( level );

          shift[ position ][ level ] = Math.max( axis.getAxisPosition(), ( shift[ position ][ level ] || 0 ) );

        }, false, true, false );

        var shiftTop = shift.top.reduce( function( prev, curr ) {
          return prev + curr;
        }, 0 );

        var shiftBottom = shift.bottom.reduce( function( prev, curr ) {
          return prev + curr;
        }, 0 );

        [ shift.top, shift.bottom ].map( function( arr ) {
          arr.reduce( function( prev, current, index ) {
            arr[ index ] = prev + current;
            return prev + current;
          }, 0 );
        } );

        // Apply to top and bottom
        graph._applyToAxes( function( axis, position ) {

          if ( axis.disabled || axis.floating ) {
            return;
          }

          axis.setShift( shift[ position ][ axis.getLevel() ] );

        }, false, true, false );

        // Applied to left and right
        graph._applyToAxes( function( axis, position ) {

          if ( axis.disabled ) {
            return;
          }

          axis.setMinPx( shiftTop );
          axis.setMaxPx( graph.getDrawingHeight( true ) - shiftBottom );

          if ( axis.floating ) {
            return;
          }

          // First we need to draw it in order to determine the width to allocate
          // graph is done to accomodate 0 and 100000 without overlapping any element in the DOM (label, ...)

          var drawn = axis.draw();
          // Get axis position gives the extra shift that is common

          var level = getAxisLevelFromSpan( axis.getSpan(), levels[ position ] );
          axis.setLevel( level );

          shift[ position ][ level ] = Math.max( drawn + axis.getAxisPosition(), shift[ position ][ level ] || 0 );

        }, false, false, true );

        var shiftLeft = shift.left.reduce( function( prev, curr ) {
          return prev + curr;
        }, 0 );

        var shiftRight = shift.right.reduce( function( prev, curr ) {
          return prev + curr;
        }, 0 );

        [ shift.left, shift.right ].map( function( arr ) {
          arr.reduce( function( prev, current, index ) {
            arr[ index ] = prev + current;
            return prev + current;
          }, 0 );
        } );

        // Apply to left and right
        graph._applyToAxes( function( axis, position ) {

          if ( axis.disabled || axis.floating ) {
            return;
          }
          axis.setShift( shift[ position ][ axis.getLevel() ] );

        }, false, false, true );

        // Apply to top and bottom
        graph._applyToAxes( function( axis, position ) {

          if ( axis.disabled ) {
            return;
          }

          axis.setMinPx( shiftLeft );
          axis.setMaxPx( graph.getDrawingWidth( true ) - shiftRight );

          if ( axis.floating ) {
            return;
          }

          axis.draw();

        }, false, true, false );

        graph._applyToAxes( function( axis ) {

          if ( !axis.floating ) {
            return;
          }

          var floatingAxis = axis.getFloatingAxis();
          var floatingValue = axis.getFloatingValue();
          var floatingPx = floatingAxis.getPx( floatingValue );

          axis.setShift( floatingPx );
          axis.draw();

        }, false, true, true );

        _closeLine( graph, 'right', graph.getDrawingWidth( true ), graph.getDrawingWidth( true ), shiftTop, graph.getDrawingHeight( true ) - shiftBottom );
        _closeLine( graph, 'left', 0, 0, shiftTop, graph.getDrawingHeight( true ) - shiftBottom );
        _closeLine( graph, 'top', shiftLeft, graph.getDrawingWidth( true ) - shiftRight, 0, 0 );
        _closeLine( graph, 'bottom', shiftLeft, graph.getDrawingWidth( true ) - shiftRight, graph.getDrawingHeight( true ) - shiftBottom, graph.getDrawingHeight( true ) - shiftBottom );

        graph.clipRect.setAttribute( 'y', shiftTop );
        graph.clipRect.setAttribute( 'x', shiftLeft );
        graph.clipRect.setAttribute( 'width', graph.getDrawingWidth() - shiftLeft - shiftRight );
        graph.clipRect.setAttribute( 'height', graph.getDrawingHeight() - shiftTop - shiftBottom );

        graph.rectEvent.setAttribute( 'y', shiftTop + graph.getPaddingTop() );
        graph.rectEvent.setAttribute( 'x', shiftLeft + graph.getPaddingLeft() );
        graph.rectEvent.setAttribute( 'width', graph.getDrawingWidth() - shiftLeft - shiftRight );
        graph.rectEvent.setAttribute( 'height', graph.getDrawingHeight() - shiftTop - shiftBottom );

        /*
		graph.shapeZoneRect.setAttribute('x', shift[1]);
		graph.shapeZoneRect.setAttribute('y', shift[2]);
		graph.shapeZoneRect.setAttribute('width', graph.getDrawingWidth() - shift[2] - shift[3]);
		graph.shapeZoneRect.setAttribute('height', graph.getDrawingHeight() - shift[1] - shift[0]);
*/
        graph.shift = shift;
        graph.redrawShapes(); // Not sure this should be automatic here. The user should be clever.
      }

      function _registerEvents( graph ) {
        var self = graph;

        graph._dom.addEventListener( 'keydown', function( e ) {

          // Not sure this has to be prevented

          if ( e.keyCode == 8 && self.selectedShapes ) {

            e.preventDefault();
            e.stopPropagation();

            self.selectedShapes.map( function( shape ) {
              shape.kill();
            } );
          }

        } );

        graph.groupEvent.addEventListener( 'mousemove', function( e ) {
          //e.preventDefault();
          var coords = self._getXY( e );
          _handleMouseMove( self, coords.x, coords.y, e );
        } );

        graph.dom.addEventListener( 'mouseleave', function( e ) {

          _handleMouseLeave( self );
        } );

        graph.groupEvent.addEventListener( 'mousedown', function( e ) {

          self.focus();

          //   e.preventDefault();
          if ( e.which == 3 || e.ctrlKey ) {
            return;
          }

          var coords = self._getXY( e );
          _handleMouseDown( self, coords.x, coords.y, e );

        } );

        graph.dom.addEventListener( 'mouseup', function( e ) {

          graph.emit( "mouseUp", e );
          //   e.preventDefault();
          var coords = self._getXY( e );

          _handleMouseUp( self, coords.x, coords.y, e );

        } );

        graph.dom.addEventListener( 'dblclick', function( e ) {

          graph.emit( "dblClick", e );

          //      e.preventDefault();

          //      if ( self.clickTimeout ) {
          //       window.clearTimeout( self.clickTimeout );
          //    }

          var coords = self._getXY( e );
          //    self.cancelClick = true;

          _handleDblClick( self, coords.x, coords.y, e );
        } );

        // Norman 26 june 2015: Do we really need the click timeout ?

        graph.dom.addEventListener( 'click', function( e ) {

          // Cancel right click or Command+Click
          if ( e.which == 3 || e.ctrlKey ) {
            return;
          }

          //   e.preventDefault();
          var coords = self._getXY( e );
          //    if ( self.clickTimeout ) {
          //     window.clearTimeout( self.clickTimeout );
          //  }

          // Only execute the action after 100ms
          // self.clickTimeout = window.setTimeout( function() {

          //  if ( self.cancelClick ) {
          //   self.cancelClick = false;
          //   return;
          // }

          if ( !self.prevent( false ) ) {
            _handleClick( self, coords.x, coords.y, e );
          }

          //}, 200 );
        } );

        graph.groupEvent.addEventListener( 'mousewheel', function( e ) {

          var deltaY = e.wheelDeltaY || e.wheelDelta || -e.deltaY;
          _handleMouseWheel( self, deltaY, e );

          return false;
        } );

        graph.groupEvent.addEventListener( 'wheel', function( e ) {

          var deltaY = e.wheelDeltaY || e.wheelDelta || -e.deltaY;
          _handleMouseWheel( self, deltaY, e );

          return false;
        } );
      }

      function _handleMouseDown( graph, x, y, e ) {

        var self = graph;

        if ( graph.forcedPlugin ) {

          graph.activePlugin = graph.forcedPlugin;
          graph._pluginExecute( graph.activePlugin, 'onMouseDown', [ graph, x, y, e ] );
          return;
        }

        checkMouseActions( graph, e, [ graph, x, y, e ], 'onMouseDown' );
      }

      function _handleMouseMove( graph, x, y, e ) {

        if ( graph.bypassHandleMouse ) {
          graph.bypassHandleMouse.handleMouseMove( e );
          return;
        }

        if ( graph.activePlugin && graph._pluginExecute( graph.activePlugin, 'onMouseMove', [ graph, x, y, e ] ) ) {
          return;
        };

        //			return;

        graph._applyToAxes( 'handleMouseMove', [ x - graph.options.paddingLeft, e ], true, false );
        graph._applyToAxes( 'handleMouseMove', [ y - graph.options.paddingTop, e ], false, true );

        if ( !graph.activePlugin ) {
          var results = {};
          var index;

          if ( graph.options.trackingLine && graph.options.trackingLine.snapToSerie ) {

            if ( graph.options.trackingLine.mode == "common" ) {

              var snapToSerie = graph.options.trackingLine.snapToSerie;
              index = snapToSerie.handleMouseMove( false, true );

              if ( !index ) {

                graph.trackingLine.hide();

              } else {

                graph.trackingLine.show();
                var closestIndex = index.xIndexClosest;
                graph.trackingLine.getPosition( 0 ).x = snapToSerie.getData()[ 0 ][ closestIndex * 2 ];
                graph.trackingLine.getPosition( 1 ).x = snapToSerie.getData()[ 0 ][ closestIndex * 2 ];
                graph.trackingLine.redraw();

                var x = snapToSerie.getXAxis().getPx( graph.trackingLine.getPosition( 0 ).x ) + graph.options.paddingLeft;

              }

              var series = graph.options.trackingLine.series;

              if ( !graph.options.trackingLine.series ) {

                series = graph.getSeries().map( function( serie ) {
                  return {
                    serie: serie,
                    withinPx: 20,
                    withinVal: -1
                  };
                } );
              }

              graph._trackingLegend = _trackingLegendSerie( graph, series, x, y, graph._trackingLegend, graph.options.trackingLine.textMethod, graph.trackingLine.getPosition( 1 ).x );
            }
          }
        }

        if ( graph.options.onMouseMoveData ) {

          for ( var i = 0; i < graph.series.length; i++ ) {

            results[ graph.series[ i ].getName() ] = graph.series[ i ].handleMouseMove( false, true );

          }

          graph.options.onMouseMoveData.call( graph, e, results );
        }

        checkMouseActions( graph, e, [ graph, x, y, e ], 'onMouseMove' );

        return;

      }

      function checkMouseActions( graph, e, parameters, methodName ) {

        var keyComb = graph.options.mouseActions,
          i, l;

        for ( i = 0, l = keyComb.length; i < l; i++ ) {

          if ( keyComb[ i ].plugin ) { // Is it a plugin ?

            if ( graph.forcedPlugin == keyComb[ i ].plugin || graph.isMouseActionAllowed( e, keyComb[ i ] ) ) {

              if ( keyComb[ i ].options ) {
                parameters.push( keyComb[ i ].options );
              }

              graph.activePlugin = keyComb[ i ].plugin; // Lease the mouse action to the current action
              graph._pluginExecute( keyComb[ i ].plugin, methodName, parameters );
              return true;
            }

          } else if ( keyComb[ i ].callback && graph.isMouseActionAllowed( e, keyComb[ i ] ) ) {

            if ( keyComb[ i ].options ) {
              parameters.push( keyComb[ i ].options );
            }

            keyComb[ i ].callback.apply( graph, parameters );
            return true;

          } else if ( keyComb[ i ].series ) {

            var series;
            if ( keyComb[ i ].series === 'all' ) {
              series = graph.series;
            }

            if ( !Array.isArray( keyComb[ i ].series ) ) {
              series = [ series ];
            }

            if ( keyComb[ i ].options ) {
              parameters.push( keyComb[ i ].options );
            }

            for ( var j = 0; j < series.length; i++ ) {
              graph._serieExecute( series[ i ], methodName, parameters );
            }
            return true;
          }
        }

        return false;

      };

      var _trackingLegendSerie = function( graph, serie, x, y, legend, textMethod, xValue ) {

        var justCreated = false;

        if ( !Array.isArray( serie ) ) {
          serie = [ serie ];
        }

        var output = [];

        if ( !legend ) {
          justCreated = true;
          legend = _makeTrackingLegend( graph );
        }

        serie.map( function( serie ) {

          var index = serie.serie.handleMouseMove( xValue, false );

          if ( !index || !textMethod ) {

            if ( serie.serie.trackingShape ) {
              serie.serie.trackingShape.hide();
            }

            return legend;
          }

          // Should we display the dot ?
          if (
            ( serie.withinPx > 0 && Math.abs( x - graph.options.paddingLeft - serie.serie.getXAxis().getPx( serie.serie.getData()[ 0 ][ index.xIndexClosest * 2 ] ) ) - serie.withinPx > 1e-14 ) ||
            ( serie.withinVal > 0 && Math.abs( serie.serie.getXAxis().getVal( x - graph.options.paddingLeft ) - serie.serie.getData()[ 0 ][ index.xIndexClosest * 2 ] ) - serie.withinVal > serie.serie.getXAxis().getVal( x - graph.options.paddingLeft ) / 100000 )
          ) {

            if ( serie.serie.trackingShape ) {
              serie.serie.trackingShape.hide();
            }

          } else {

            output[ serie.serie.getName() ] = {

              xIndex: index.xIndexClosest,
              yValue: serie.serie.getData()[ 0 ][ index.xIndexClosest * 2 + 1 ],
              xValue: serie.serie.getData()[ 0 ][ index.xIndexClosest * 2 ],
              serie: serie,
              index: index

            };

            if ( !serie.serie.trackingShape ) {

              serie.serie.trackingShape = graph.newShape( "ellipse", {

                  fillColor: serie.serie.getLineColor(),
                  strokeColor: "White",
                  strokeWidth: serie.serie.getLineWidth()

                } )
                .setSerie( serie.serie )
                .setProp( 'rx', serie.serie.getLineWidth() * 3 )
                .setProp( 'ry', serie.serie.getLineWidth() * 3 )
                .forceParentDom( serie.serie.groupMain )
                .draw();
            }

            serie.serie.trackingShape.show();
            serie.serie.trackingShape.getPosition( 0 ).x = serie.serie.getData()[ 0 ][ index.xIndexClosest * 2 ];
            serie.serie.trackingShape.redraw();
          }

        } ); // End map

        if ( Object.keys( output ).length == 0 || !textMethod ) {
          legend.style.display = "none";
        } else {

          if ( legend.style.display == "none" || justCreated ) {

            forceTrackingLegendMode( graph, legend, x, y, true );
          } else {
            _trackingLegendMove( graph, legend, x, y );
          }

          legend.style.display = "block";
          legend.innerHTML = textMethod( output, xValue, x, y );

        }

        return legend;

      };

      var forceTrackingLegendMode = function( graph, legend, toX, toY, skip ) {

        var ratio = 0,
          start = Date.now(),
          h = legend.offsetHeight,
          startX = parseInt( legend.style.marginLeft.replace( "px", "" ) || 0 ),
          startY = parseInt( legend.style.marginTop.replace( "px", "" ) || 0 );

        toX = ( toX > graph.getWidth() / 2 ) ? ( ( toX - toX % 10 - 20 ) - legend.offsetWidth ) : ( toX - toX % 10 + 30 );
        toY = ( toY - toY % 10 + h / 2 );

        if ( skip ) {
          legend.style.marginLeft = ( toX ) + "px";
          legend.style.marginTop = ( toY ) + "px";
          return;
        }

        function next() {

          var progress = ( Date.now() - start ) / 200;
          if ( progress > 1 ) {
            progress = 1;
          }

          legend.style.marginLeft = ( ( toX - startX ) * progress + startX ) + "px";
          legend.style.marginTop = ( ( toY - startY ) * progress + startY ) + "px";

          if ( progress < 1 ) {
            window.requestAnimationFrame( next );
          }
        }

        window.requestAnimationFrame( next );
      };

      var _trackingLegendMove = util.debounce( forceTrackingLegendMode, 50 );

      function _makeTrackingLegend( graph ) {

        var group = document.createElement( 'div' );
        group.setAttribute( 'class', 'trackingLegend' );
        group.style.position = 'absolute';
        group.style.borderRadius = '4px';
        group.style.boxShadow = "1px 1px 3px 0px rgba(100,100,100,0.6)";
        group.style.border = "2px solid #333333";
        group.style.backgroundColor = "rgba(255, 255, 255, 0.5 )";
        group.style.pointerEvents = "none";
        group.style.paddingTop = "5px";
        group.style.paddingBottom = "5px";
        group.style.paddingLeft = "10px";
        group.style.paddingRight = "10px";

        graph.getWrapper().insertBefore( group, graph.getDom() );

        return group;
      }

      function _handleDblClick( graph, x, y, e ) {
        //	var _x = x - graph.options.paddingLeft;
        //	var _y = y - graph.options.paddingTop;
        var pref = graph.options.dblclick;
        checkMouseActions( graph, e, [ x, y, e ], 'onDblClick' );
        /*
            if ( !pref ||  !pref.type ) {
              return;
            }

            switch ( pref.type ) {

              case 'plugin':

                var plugin;

                if ( ( plugin = graph.plugins[ pref.plugin ] ) ) {

                  plugin.onDblClick( graph, x, y, pref.options, e );
                }

                break;
            }*/
      }

      function _handleMouseUp( graph, x, y, e ) {

        if ( graph.bypassHandleMouse ) {
          graph.bypassHandleMouse.handleMouseUp( e );
          graph.activePlugin = false;
          return;
        }

        graph._pluginExecute( graph.activePlugin, 'onMouseUp', [ graph, x, y, e ] );
        graph.activePlugin = false;

      }

      function _handleClick( graph, x, y, e ) {

        graph.emit( 'click', [ graph, x, y, e ] );

        // Not on a shape

        if ( !e.target.jsGraphIsShape && !graph.prevent( false ) && graph.options.shapesUnselectOnClick ) {

          graph.unselectShapes();
        }

      }

      function _getAxis( graph, num, options, pos ) {

        var options = options || {};
        var inst;

        var _availableAxes = {

          def: {
            x: graph.getConstructor( "graph.axis.x" ),
            y: graph.getConstructor( "graph.axis.y" )
          },

          broken: {
            x: graph.getConstructor( "graph.axis.x.broken" ),
            y: graph.getConstructor( "graph.axis.y.broken" )
          },

          time: {
            x: graph.getConstructor( "graph.axis.x.time" )
          }
        };

        switch ( options.type ) {

          case 'time':
            var axisInstance = _availableAxes.time;
            break;

          case 'broken':
            var axisInstance = _availableAxes.broken;
            break;

          default:
            var axisInstance = _availableAxes.def;
            break;
        }

        switch ( pos ) {

          case 'top':
          case 'bottom':
            inst = axisInstance.x;
            break;

          case 'left':
          case 'right':
            inst = axisInstance.y;
            break;
        }

        num = num || 0;

        if ( typeof num == "object" ) {
          options = num;
          num = 0;
        }

        return graph.axis[ pos ][ num ] = graph.axis[ pos ][ num ] || new inst( graph, pos, options );
      }

      function _closeLine( graph, mode, x1, x2, y1, y2 ) {

        if ( graph.options.close === false ) {
          return;
        }

        var l = 0;

        graph.axis[ mode ].map( function( g ) {

          if ( g.isDisplayed() && !g.floating ) {
            l++;
          }
        } );

        if ( ( graph.options.close === true || graph.options.close[ mode ] ) && l == 0 ) {

          graph.closingLines[ mode ].setAttribute( 'display', 'block' );
          graph.closingLines[ mode ].setAttribute( 'x1', x1 );
          graph.closingLines[ mode ].setAttribute( 'x2', x2 );
          graph.closingLines[ mode ].setAttribute( 'y1', y1 );
          graph.closingLines[ mode ].setAttribute( 'y2', y2 );

        } else {

          graph.closingLines[ mode ].setAttribute( 'display', 'none' );

        }
      }

      function _handleMouseWheel( graph, delta, e ) {

        if ( checkMouseActions( graph, e, [ delta, e ], 'onMouseWheel' ) ) {
          e.preventDefault();
          e.stopPropagation();
        }
        /*
            switch ( graph.options.wheel.type ) {

              case 'plugin':

                var plugin;

                if ( plugin = graph.plugins[ graph.options.wheel.plugin ] ) {

                  plugin.onMouseWheel( delta, e, graph.options.wheel.options );
                }

                break;

              case 'toSeries':

                for ( var i = 0, l = graph.series.length; i < l; i++ ) {
                  graph.series[ i ].onMouseWheel( delta, e );
                }

                break;

            }
            */

        // Redraw not obvious at all !!
        /*
        graph.redraw();
        graph.drawSeries( true );

        */
      }

      function _handleMouseLeave( graph ) {

        if ( graph.options.handleMouseLeave ) {
          graph.options.handleMouseLeave.call( graph );

        }

      }

      function haveAxesChanged( graph ) {
        var temp = graph._axesHaveChanged;
        graph._axesHaveChanged = false;
        return temp;
      }

      /**
       * Registers a constructor to jsGraph. Constructors are used on a later basis by jsGraph to create series, shapes or plugins
       * @name Graph.registerConstructor
       * @param {String} name - The name of the constructor
       * @see Graph#newSerie
       */
      Graph.registerConstructor = function( name, constructor ) {

        if ( Graph._constructors[ name ] ) {
          return util.throwError( "Constructor " + constructor + " already exists." );
        }

        Graph._constructors[ name ] = constructor;
      };

      /**
       * Returns a registered constructor
       * @memberof Graph
       * @param {String} constructorName - The constructor name to look for
       * @returns {Function} The registered constructor
       * @throws Error
       * @see Graph.registerConstructor
       * @name Graph#getConstructor
       */
      Graph.getConstructor = function( constructorName ) {
        var constructor = Graph._constructors[ constructorName ];
        if ( !constructor ) {
          return util.throwError( "Constructor \"" + constructorName + "\" doesn't exist" );
        }
        return constructor;
      };

      /**
       * Returns a graph created from a schema
       * @memberof Graph
       * @param {Object} schema - The schema (see https://github.com/cheminfo/json-chart/blob/master/chart-schema.json)
       * @param {HTMLElement} wrapper - The wrapping element
       * @returns {Graph} Newly created graph
       * @name Graph#fromSchema
       */
      Graph.fromSchema = function( schema, wrapper ) {

        var graph;
        var options = {};
        var axes = {
          left: [],
          top: [],
          right: [],
          bottom: []
        };
        var axesIndices = [];

        if ( schema.title ) {
          options.title = schema.title;
        }

        if ( schema.axis ) {

          schema.axis.map( function( schemaAxis ) {

            if ( !schemaAxis.type ) {
              util.throwError( "Axis type is required (top, bottom, left or right)" );
            }

            var axisOptions = {};
            if ( schemaAxis.label ) {
              axisOptions.labelValue = schemaAxis.label;
            }

            if ( schemaAxis.unit !== undefined ) {
              axisOption.unit = schemaAxis.unit;
            }

            if ( schemaAxis.min !== undefined ) {
              axisOption.forcedMin = schemaAxis.min;
            }

            if ( schemaAxis.max !== undefined ) {
              axisOption.forcedMax = schemaAxis.max;
            }

            if ( schemaAxis.flip !== undefined ) {
              axisOption.flipped = schemaAxis.flip;
            }

            axes[ schemaAxis.type ].push( axisOptions );
            schemaAxis._jsGraphIndex = axes[ schemaAxis.type ].length - 1;

          } );
        }

        graph = new Graph( wrapper, options, axes );

        if ( schema.data ) {

          schema.data.map( function( schemaSerie ) {

            var serieType = schemaSerie.type,
              serie,
              serieOptions,
              serieAxis;

            switch ( schemaSerie.type ) {

              case 'bar':
                util.throwError( "Bar charts not supported" );
                serieType = false;
                break;

              case 'scatter':
                serieType = 'scatter';
                break;

              default:
                serieType = 'line';
                break;
            }

            console.log( serieType );
            if ( !serieType ) {
              util.throwError( "No valid serie type was found" );
              return;
            }

            serie = graph.newSerie( schemaSerie.label || util.guid(), serieOptions, serieType );

            if ( schemaSerie.lineStyle ) {

              schemaSerie.lineStyle.map( function( style ) {

                var styleSerie = {};
                style.styleName = style.styleName || "unselected";

                switch ( serieType ) {

                  case 'line':
                    if ( style.lineWidth !== undefined ) {
                      styleSerie.lineWidth = style.lineWidth;
                    }

                    if ( style.color !== undefined ) {
                      styleSerie.lineColor = style.color;
                    }

                    if ( style.lineStyle ) {
                      styleSerie.lineStyle = style.lineStyle;
                    }

                    serie.setStyle( styleSerie, style.styleName );
                    break;
                }

              } );
            }

            if ( schemaSerie.style ) {

              schemaSerie.style.map( function( style ) {

                var styleSerie = {};
                style.styleName = style.styleName || "unselected";

                if ( !Array.isArray( style.styles ) ) {
                  style.styles = [ style.styles ];
                }

                var styles = style.styles.map( function( style ) {

                  switch ( serieType ) {

                    case "line":

                      return {
                        type: style.shape,
                        zoom: style.zoom,
                        strokeWidth: style.lineWidth,
                        strokeColor: style.lineColor,
                        fillColor: style.color,
                        points: style.points
                      };

                      break;

                    case "scatter":

                      break;
                  }
                } );

                switch ( serieType ) {

                  case "line":

                    serie.setMarkers( styles, style.styleName );
                    break;

                  case "scatter":

                    serie.setStyle( styles, {}, style.styleName );
                    break;
                }

              } );
            }

            var errors = [];
            if ( schemaSerie.errordXdY ) {

              schemaSerie.errordXdY.map( function( dxdy ) {

                errors.push( [
                  [ dxdy[ 0 ] ],
                  [ dxdy[ 1 ] ]
                ] );
              } );

              serie.setDataError( errors ) // Adds the error data
                .setErrorStyle( [ {
                  type: 'bar',
                  x: {},
                  y: {}
                } ] ) // Display bar errors

            }

            if ( schema.axis ) {
              serieAxis = schema.axis[ schemaSerie.xAxis ];

              if ( !serieAxis || ( serieAxis.type !== 'top' && serieAxis.type !== 'bottom' ) ) {
                util.warn( "No x axis found. Setting automatically" );
                serie.setXAxis( graph.getXAxis( 0 ) );
              } else {
                if ( serieAxis.type == 'top' ) {
                  serie.setXAxis( graph.getTopAxis( serieAxis._jsGraphIndex ) );
                } else if ( serieAxis.type == 'bottom' ) {
                  serie.setXAxis( graph.getBottomAxis( serieAxis._jsGraphIndex ) );
                }
              }

              serieAxis = schema.axis[ schemaSerie.yAxis ];

              if ( !serieAxis || ( serieAxis.type !== 'left' && serieAxis.type !== 'right' ) ) {
                util.warn( "No y axis found. Setting automatically" );
                serie.setYAxis( graph.getYAxis( 0 ) );
              } else {
                if ( serieAxis.type == 'left' ) {
                  serie.setYAxis( graph.getLeftAxis( serieAxis._jsGraphIndex ) );
                } else if ( serieAxis.type == 'right' ) {
                  serie.setYAxis( graph.getRightAxis( serieAxis._jsGraphIndex ) );
                }
              }

            } else {
              util.warn( "No axes found. Setting automatically" );
              serie.autoAxis();
            }

            serie.setData( [ {
              x: schemaSerie.x,
              y: schemaSerie.y
            } ] );

          } );

        }

        return graph;
      }

      /**
       * @alias Graph~getConstructor
       */
      Graph.prototype.getConstructor = Graph.getConstructor;

      Graph._constructors = {};

      return Graph;
    } )( build[ "./jquery" ], build[ "./graph.position" ], build[ "./graph.util" ], build[ "./dependencies/eventEmitter/EventEmitter" ] );

    /* 
     * Build: new source file 
     * File name : graph.axis
     * File path : /Users/normanpellet/Documents/Web/graph/src/graph.axis.js
     */

    build[ './graph.axis' ] = ( function( $, EventEmitter, util ) {
      /** @global */
      /** @ignore */

      "use strict";

      /** 
       * Axis constructor. Usually not instanced directly, but for custom made axes, that's possible
       * @class Axis
       * @static
       * @example function myAxis() {};
       * myAxis.prototype = new Graph.getConstructor("axis");
       * graph.setBottomAxis( new myAxis( { } ) );
       */
      function GraphAxis() {}

      GraphAxis.prototype = new EventEmitter();

      /** 
       * Default graph parameters
       * @name AxisOptionsDefault
       * @object
       * @static
       * @memberof GraphAxis
       * @prop {Boolean} display - Whether to display or not the axis
       * @prop {Boolean} flipped - The top padding
       * @prop {Numner} axisDataSpacing.min - The spacing of the at the bottom of the axis. The value is multiplied by the (max - min) values given by the series (0.1 means 10% of the serie width / height).
       * @prop {Number} axisDataSpacing.max - The spacing of the at the top of the axis. The value is multiplied by the (max - min) values given by the series (0.1 means 10% of the serie width / height).
       * @prop {String} unitModification - Used to change the units of the axis in a defined way. Currently, "time" and "time:min.sec" are supported. They will display the value in days, hours, minutes and seconds and the data should be expressed in seconds.
       * @prop {Boolean} primaryGrid - Whether or not to display the primary grid (on the main ticks)
       * @prop {Boolean} secondaryGrid - Whether or not to display the secondary grid (on the secondary ticks)
       * @prop {Number} tickPosition - Sets the position of the ticks with regards to the axis ( 1 = inside, 2 = centered, 3 = outside ).
       * @prop {Number} nbTicksPrimary - The number of primary ticks to use (approximately)
       * @prop {Number} nbTicksSecondary - The number of secondary ticks to use (approximately)
       * @prop {Number} ticklabelratio - Scaling factor on the labels under each primary ticks
       * @prop {Number} exponentialFactor - Scales the labels under each primary ticks by 10^(exponentialFactor)
       * @prop {Number} exponentialLabelFactor - Scales the axis label by 10^(exponentialFactor)
       * @prop {Number} ticklabelratio - Scaling factor on the labels under each primary ticks
       * @prop {Boolean} logScale - Display the axis in log scale (base 10)
       * @prop {(Number|Boolean)} forcedMin - Use a number to force the minimum value of the axis (becomes independant of its series)
       * @prop {(Number|Boolean)} forcedMax - Use a number to force the maximum value of the axis (becomes independant of its series)
       */
      GraphAxis.prototype.defaults = {
        lineAt0: false,
        display: true,
        flipped: false,
        axisDataSpacing: {
          min: 0.1,
          max: 0.1
        },
        unitModification: false,
        primaryGrid: true,
        secondaryGrid: true,

        primaryGridColor: "#f0f0f0",
        secondaryGridColor: "#f0f0f0",

        primaryGridWidth: 1,
        secondaryGridWidth: 1,

        shiftToZero: false,
        tickPosition: 1,
        nbTicksPrimary: 3,
        nbTicksSecondary: 10,
        ticklabelratio: 1,
        exponentialFactor: 0,
        exponentialLabelFactor: 0,
        logScale: false,
        forcedMin: false,
        forcedMax: false,

        span: [ 0, 1 ],

        scientificScale: false,
        scientificScaleExponent: false,
        engineeringScale: false,
        unit: false
      };

      GraphAxis.prototype.init = function( graph, options, overwriteoptions ) {

        this.unitModificationTimeTicks = [
          [ 1, [ 1, 2, 5, 10, 20, 30 ] ],
          [ 60, [ 1, 2, 5, 10, 20, 30 ] ],
          [ 3600, [ 1, 2, 6, 12 ] ],
          [ 3600 * 24, [ 1, 2, 3, 4, 5, 10, 20, 40 ] ]
        ];

        var self = this;
        this.graph = graph;
        this.options = $.extend( true, {}, GraphAxis.prototype.defaults, overwriteoptions, options );

        this.group = document.createElementNS( this.graph.ns, 'g' );
        this.hasChanged = true;

        this.rectEvent = document.createElementNS( this.graph.ns, 'rect' );
        this.rectEvent.setAttribute( 'pointer-events', 'fill' );
        this.rectEvent.setAttribute( 'fill', 'transparent' );
        this.group.appendChild( this.rectEvent );

        this.graph.axisGroup.appendChild( this.group ); // Adds to the main axiszone

        this.line = document.createElementNS( this.graph.ns, 'line' );
        this.line.setAttribute( 'stroke', 'black' );
        this.line.setAttribute( 'shape-rendering', 'crispEdges' );
        this.line.setAttribute( 'stroke-linecap', 'square' );
        this.groupTicks = document.createElementNS( this.graph.ns, 'g' );
        this.groupTickLabels = document.createElementNS( this.graph.ns, 'g' );

        this.group.appendChild( this.groupTicks );
        this.group.appendChild( this.groupTickLabels );
        this.group.appendChild( this.line );

        this.labelValue;

        this.label = document.createElementNS( this.graph.ns, 'text' );

        this.labelTspan = document.createElementNS( this.graph.ns, 'tspan' ); // Contains the main label
        this.preunitTspan = document.createElementNS( this.graph.ns, 'tspan' ); // Contains the scaling unit
        this.unitTspan = document.createElementNS( this.graph.ns, 'tspan' ); // Contains the unit
        this.expTspan = document.createElementNS( this.graph.ns, 'tspan' ); // Contains the exponent (x10)
        this.expTspanExp = document.createElementNS( this.graph.ns, 'tspan' ); // Contains the exponent value

        this.label.appendChild( this.labelTspan );
        this.label.appendChild( this.preunitTspan );
        this.label.appendChild( this.unitTspan );
        this.label.appendChild( this.expTspan );
        this.label.appendChild( this.expTspanExp );

        this.preunitTspan.setAttribute( 'dx', 6 );
        this.expTspan.setAttribute( 'dx', 6 );
        this.expTspanExp.setAttribute( 'dy', -5 );
        this.expTspanExp.setAttribute( 'font-size', "0.8em" );

        this.label.setAttribute( 'text-anchor', 'middle' );

        this.gridLinePath = {
          primary: "",
          secondary: ""
        };

        this.gridPrimary = document.createElementNS( this.graph.ns, "path" );
        this.gridSecondary = document.createElementNS( this.graph.ns, "path" );

        this.graph.groupPrimaryGrids.appendChild( this.gridPrimary );
        this.graph.groupSecondaryGrids.appendChild( this.gridSecondary );

        this.setGridLinesStyle();

        this.group.appendChild( this.label );

        this.groupSeries = document.createElementNS( this.graph.ns, 'g' );
        this.group.appendChild( this.groupSeries );

        this.widthHeightTick = 0;

        this.ticks = {};
        this.ticksLabels = [];
        this.tickScaling = {
          1: 3,
          2: 2,
          3: 1,
          4: 0.5
        };

        this.currentTick = {};
        this.lastCurrentTick = {};

        this.series = [];
        this.totalDelta = 0;
        this.currentAction = false;

        this.group.addEventListener( 'mousemove', function( e ) {
          e.preventDefault();
          var coords = self.graph._getXY( e );
          self.handleMouseMoveLocal( coords.x, coords.y, e );

          for ( var i = 0, l = self.series.length; i < l; i++ ) {
            self.series[ i ].handleMouseMove( false, true );
          }
        } );

        this.labels = [];
        this.group.addEventListener( 'click', function( e ) {
          e.preventDefault();
          var coords = self.graph._getXY( e );
          self.addLabel( self.getVal( coords.x - self.graph.getPaddingLeft() ) );
        } );

        this.axisRand = Math.random();
        this.clip = document.createElementNS( this.graph.ns, 'clipPath' );
        this.clip.setAttribute( 'id', '_clip' + this.axisRand );
        this.graph.defs.appendChild( this.clip );

        this.clipRect = document.createElementNS( this.graph.ns, 'rect' );
        this.clip.appendChild( this.clipRect );
        this.clip.setAttribute( 'clipPathUnits', 'userSpaceOnUse' );
      };

      GraphAxis.prototype.handleMouseMoveLocal = function() {};

      /**
       * Hides the axis
       * @memberof GraphAxis
       * @return {Axis} The current axis
       */
      GraphAxis.prototype.hide = function() {
        this.options.display = false;
        return this;
      };

      /**
       * Shows the axis
       * @memberof GraphAxis
       * @return {Axis} The current axis
       */
      GraphAxis.prototype.show = function() {
        this.options.display = true;
        return this;
      };

      /**
       * Shows or hides the axis
       * @memberof GraphAxis
       * @param {Boolean} display - true to display the axis, false to hide it
       * @return {Axis} The current axis
       */
      GraphAxis.prototype.setDisplay = function( bool ) {
        this.options.display = !!bool;
        return this;
      };

      /**
       * @memberof GraphAxis
       * @return {Boolean} A boolean indicating the displayed state of the axis
       */
      GraphAxis.prototype.isDisplayed = function() {
        return this.options.display;
      };

      /**
       * Forces the appearence of a straight perpendicular line at value 0
       * @param {Boolean} lineAt0 - true to display the line, false not to.
       * @memberof GraphAxis
       * @return {Axis} The current axis
       */
      GraphAxis.prototype.setLineAt0 = function( bool ) {
        this.options.lineAt0 = !!bool;
      };

      // Used to adapt the 0 of the axis to the zero of another axis that has the same direction

      /**
       * Forces the alignment of the 0 of the axis to the zero of another axis
       * @param {(Axis|Boolean)} axis - The axis with which the 0 should be aligned. Use "false" to deactivate the adapt to 0 mode.
       * @param {Number} thisValue - The value of the current axis that should be aligned
       * @param {Number} foreignValue - The value of the reference axis that should be aligned
       * @param {String} preference - "min" or "max". Defined the boundary that should behave the more normally
       * @memberof GraphAxis
       * @return {Axis} The current axis
       * @since 1.13.2
       */
      GraphAxis.prototype.adaptTo = function( axis, thisValue, foreignValue, preference ) {

        if ( !axis ) {
          this.options.adaptTo = false;
          return this;
        }

        this.options.adaptTo = {
          axis: axis,
          thisValue: thisValue,
          foreignValue: foreignValue,
          preference: preference
        };

        this.adapt();

        return this;
      };

      /**
       * Adapts maximum and minimum of the axis if options.adaptTo is defined
       * @memberof GraphAxis
       * @returns {Axis} The current axis
       * @since 1.13.2
       */
      GraphAxis.prototype.adapt = function() {

        if ( !this.options.adaptTo ) {
          return;
        }

        if ( !axis )
          var val;

        var axis = this.options.adaptTo.axis,
          current = this.options.adaptTo.thisValue,
          foreign = this.options.adaptTo.foreignValue;

        if ( axis.currentAxisMin === undefined || axis.currentAxisMax === undefined ) {
          axis.setMinMaxToFitSeries();
        }

        if ( ( this.options.forcedMin !== false && this.options.forcedMax == false ) || ( this.options.adaptTo.preference !== "max" ) ) {

          if ( this.options.forcedMin !== false ) {
            this.currentAxisMin = this.options.forcedMin;
          } else {
            this.currentAxisMin = this._zoomed ? this.getCurrentMin() : this.getMinValue() - ( current - this.getMinValue() ) * ( this.options.axisDataSpacing.min * ( axis.getCurrentMax() - axis.getCurrentMin() ) / ( foreign - axis.getCurrentMin() ) );
          }

          if ( this.currentAxisMin == current ) {
            this.currentAxisMin -= this.options.axisDataSpacing.min * this.getInterval();
          }

          var use = this.options.forcedMin !== false ? this.options.forcedMin : this.currentAxisMin;
          this.currentAxisMax = ( current - use ) * ( axis.getCurrentMax() - axis.getCurrentMin() ) / ( foreign - axis.getCurrentMin() ) + use;

        } else {

          if ( this.options.forcedMax !== false ) {
            this.currentAxisMax = this.options.forcedMax;
          } else {
            this.currentAxisMax = this._zoomed ? this.getCurrentMax() : this.getMaxValue() + ( this.getMaxValue() - current ) * ( this.options.axisDataSpacing.max * ( axis.getCurrentMax() - axis.getCurrentMin() ) / ( axis.getCurrentMax() - foreign ) );
          }

          if ( this.currentAxisMax == current ) {
            this.currentAxisMax += this.options.axisDataSpacing.max * this.getInterval();
          }

          var use = this.options.forcedMax !== false ? this.options.forcedMax : this.currentAxisMax;

          this.currentAxisMin = ( current - use ) * ( axis.getCurrentMin() - axis.getCurrentMax() ) / ( foreign - axis.getCurrentMax() ) + use;
        }

        this.graph._axisHasChanged( this );
      };

      // Floating axis. Adapts axis position orthogonally to another axis at a defined value. Not taken into account for margins

      /**
       * Makes the axis floating (not aligned to the right or the left anymore). You need to specify another axis (perpendicular) and a value at which this axis should be located
       * @param {Axis} axis - The axis on which the current axis should be aligned to
       * @param {Number} value - The value on which the current axis should be aligned
       * @memberof GraphAxis
       * @return {Axis} The current axis
       * @example graph.getYAxis().setFloat( graph.getBottomAxis(), 0 ); // Alignes the y axis with the origin of the bottom axis
       */
      GraphAxis.prototype.setFloating = function( axis, value ) {

        this.floating = true;
        this.floatingAxis = axis;
        this.floatingValue = value;

        return this;
      };

      /**
       * @memberof GraphAxis
       * @return {Axis} The axis referencing the floating value of the current axis
       */
      GraphAxis.prototype.getFloatingAxis = function() {
        return this.floatingAxis;
      };

      /**
       * @memberof GraphAxis
       * @return {Axis} The value to which the current axis is aligned to
       */
      GraphAxis.prototype.getFloatingValue = function() {
        return this.floatingValue;
      };

      /**
       * Sets the axis data spacing
       * @memberof GraphAxis
       * @see AxisOptionsDefault
       * @param {Number} min - The spacing at the axis min value
       * @param {Number} [ max = min ] - The spacing at the axis max value. If omitted, will be equal to the "min" parameter
       * @return {Axis} The current axis
       */
      GraphAxis.prototype.setAxisDataSpacing = function( val1, val2 ) {
        this.options.axisDataSpacing.min = val1;
        this.options.axisDataSpacing.max = val2 || val1;
        return this;
      };

      /**
       * Sets the axis data spacing at the minimum of the axis
       * @memberof GraphAxis
       * @see AxisOptionsDefault
       * @param {Number} min - The spacing at the axis min value
       * @return {Axis} The current axis
       */
      GraphAxis.prototype.setAxisDataSpacingMin = function( val ) {
        this.options.axisDataSpacing.min = val;
      };

      /**
       * Sets the axis data spacing at the maximum of the axis
       * @memberof GraphAxis
       * @see AxisOptionsDefault
       * @param {Number} max - The spacing at the axis max value
       * @return {Axis} The current axis
       */
      GraphAxis.prototype.setAxisDataSpacingMax = function( val ) {
        this.options.axisDataSpacing.max = val;
      };

      GraphAxis.prototype.setMinPx = function( px ) {
        this.minPx = px;
        this.setMinMaxFlipped();
      };

      GraphAxis.prototype.setMaxPx = function( px ) {
        this.maxPx = px;
        this.setMinMaxFlipped();
      };

      /**
       * @memberof GraphAxis
       * @return {Number} The position in px of the bottom of the axis
       */
      GraphAxis.prototype.getMinPx = function() {
        return this.minPxFlipped;
      };

      /**
       * @memberof GraphAxis
       * @return {Number} The position in px of the top of the axis
       */
      GraphAxis.prototype.getMaxPx = function( px ) {
        return this.maxPxFlipped;
      };

      GraphAxis.prototype.getMathMaxPx = function() {
        return this.maxPx;
      };

      GraphAxis.prototype.getMathMinPx = function() {
        return this.minPx;
      };

      // Returns the true minimum of the axis. Either forced in options or the one from the data

      /**
       * Retrieves the minimum possible value of the axis. Can be set by "forcedMin", "adapt0ToAxis" or by the values of the series the axis contains. Does not take into account any zooming.
       * @memberof GraphAxis
       * @return {Number} The minimum possible value of the axis
       */
      GraphAxis.prototype.getMinValue = function() {
        return this.options.forcedMin !== false ? this.options.forcedMin : this.dataMin;
      };

      /**
       * Retrieves the maximum possible value of the axis. Can be set by "forcedMax", "adapt0ToAxis" or by the values of the series the axis contains. Does not take into account any zooming.
       * @memberof GraphAxis
       * @return {Number} The maximum possible value of the axis
       */
      GraphAxis.prototype.getMaxValue = function() {
        return this.options.forcedMax !== false ? this.options.forcedMax : this.dataMax;
      };

      GraphAxis.prototype.setMinValueData = function( min ) {
        this.dataMin = min;
      };

      GraphAxis.prototype.setMaxValueData = function( max ) {
        this.dataMax = max;
      };

      /**
       * Forces the minimum value of the axis (no more dependant on the serie values)
       * @memberof GraphAxis
       * @param {Number} min - The minimum value of the axis
       * @param {Boolean} noRescale - ```true``` to prevent the axis to rescale to set this minimum. Rescales anyway if current min is lower than the value
       * @return {Axis} The current axis
       */
      GraphAxis.prototype.forceMin = function( min, noRescale ) {
        this.options.forcedMin = min;

        this.setCurrentMin( noRescale ? this.getCurrentMin() : undefined );
        this.graph._axisHasChanged( this );
        return this;
      };

      /**
       * Forces the maximum value of the axis (no more dependant on the serie values).
       * @memberof GraphAxis
       * @param {Number} max - The maximum value of the axis
       * @param {Boolean} noRescale - ```true``` to prevent the axis to rescale to set this maximum. Rescales anyway if current max is higher than the value
       * @return {Axis} The current axis
       */
      GraphAxis.prototype.forceMax = function( max, noRescale ) {
        this.options.forcedMax = max;

        this.setCurrentMax( noRescale ? this.getCurrentMax() : undefined );
        this.graph._axisHasChanged( this );
        return this;
      };

      /**
       * Retrieves the forced minimum of the axis
       * @memberof GraphAxis
       * @return {Number} The maximum possible value of the axis
       */
      GraphAxis.prototype.getForcedMin = function() {
        return this.options.forcedMin;
      };

      /**
       * Retrieves the forced minimum of the axis
       * @memberof GraphAxis
       * @return {Number} The maximum possible value of the axis
       */
      GraphAxis.prototype.getForcedMax = function() {
        return this.options.forcedMax;
      };

      /**
       * Forces the min and max values of the axis to the min / max values of another axis
       * @param {Axis} axis - The axis from which the min / max values are retrieved.
       * @memberof GraphAxis
       * @return {Axis} The current axis
       */
      GraphAxis.prototype.forceToAxis = function( axis ) {
        if ( axis.getMaxValue && axis.getMinValue ) {
          this.options.forcedMin = axis.getMinValue();
          this.options.forcedMax = axis.getMaxValue();
        }

        return this;
      };

      GraphAxis.prototype.getNbTicksPrimary = function() {
        return this.options.nbTicksPrimary;
      };

      GraphAxis.prototype.getNbTicksSecondary = function() {
        return this.options.nbTicksSecondary;
      };

      GraphAxis.prototype.handleMouseMove = function( px, e ) {
        this.mouseVal = this.getVal( px );
      };

      GraphAxis.prototype.handleMouseWheel = function( delta, e, baseline ) {

        delta = Math.min( 0.2, Math.max( -0.2, delta ) );

        if ( baseline == "min" ) {
          baseline = this.getMinValue();
        } else if ( baseline == "max" ) {
          baseline = this.getMaxValue();
        } else if ( !baseline ) {
          baseline = 0;
        }

        this._doZoomVal(
          ( ( this.getCurrentMax() - baseline ) * ( 1 + delta ) ) + baseline, ( ( this.getCurrentMin() - baseline ) * ( 1 + delta ) ) + baseline
        );

        this.graph.draw();
        //	this.graph.drawSeries(true);

      };

      /**
       * Performs a zoom on the axis, without redraw afterwards
       * @param {Number} val1 - The new axis minimum
       * @param {Number} val2 - The new axis maximum
       * @memberof GraphAxis
       * @return {Axis} The current axis
       * @example
       * graph.getBottomAxis().zoom( 50, 70 ); // Axis boundaries will be 50 and 70 after next redraw
       * graph.redraw();
       * @example
       * graph.getBottomAxis().forceMin( 0 ).forceMax( 100 ).zoom( 50, 70 );  // Axis boundaries will be 50 and 70 after next redraw
       * graph.draw();
       * graph.autoscaleAxes(); // New bottom axis boundaries will be 0 and 100, not 50 and 70 !
       * graph.draw();
       */
      GraphAxis.prototype.zoom = function( val1, val2 ) {
        return this._doZoomVal( val1, val2, true );
      };

      GraphAxis.prototype._doZoomVal = function( val1, val2, mute ) {

        return this._doZoom( this.getPx( val1 ), this.getPx( val2 ), val1, val2, mute );
      };

      GraphAxis.prototype._doZoom = function( px1, px2, val1, val2, mute ) {

        //if(this.options.display || 1 == 1) {
        var val1 = val1 !== undefined ? val1 : this.getVal( px1 );
        var val2 = val2 !== undefined ? val2 : this.getVal( px2 );

        this.setCurrentMin( Math.min( val1, val2 ) );
        this.setCurrentMax( Math.max( val1, val2 ) );

        this.cacheCurrentMin();
        this.cacheCurrentMax();
        this.cacheInterval();

        this._zoomed = true;

        this.adapt();

        this._hasChanged = true;

        // New method
        if ( !mute ) {
          this.emit( "zoom", [ this.currentAxisMin, this.currentAxisMax, this ] );
        }

        return this;
      };

      GraphAxis.prototype.getSerieShift = function() {
        return this._serieShift;
      };

      GraphAxis.prototype.getSerieScale = function() {
        return this._serieScale;
      };

      GraphAxis.prototype.getMouseVal = function() {
        return this.mouseVal;
      };

      GraphAxis.prototype.getUnitPerTick = function( px, nbTick, valrange ) {

        var umin;
        var pxPerTick = px / nbTicks; // 1000 / 100 = 10 px per tick
        if ( !nbTick ) {
          nbTick = px / 10;
        } else {
          nbTick = Math.min( nbTick, px / 10 );
        }

        // So now the question is, how many units per ticks ?
        // Say, we have 0.0004 unit per tick
        var unitPerTick = valrange / nbTick;

        switch ( this.options.unitModification ) {

          case 'time':
          case 'time:min.sec':

            var max = this.getModifiedValue( this.getMaxValue() ),
              units = [
                [ 60, 'min' ],
                [ 3600, 'h' ],
                [ 3600 * 24, 'd' ]
              ];

            if ( max < 3600 ) { // to minutes
              umin = 0;
            } else if ( max < 3600 * 24 ) {
              umin = 1;
            } else {
              umin = 2;
            }

            var breaked = false;
            for ( var i = 0, l = this.unitModificationTimeTicks.length; i < l; i++ ) {
              for ( var k = 0, m = this.unitModificationTimeTicks[ i ][ 1 ].length; k < m; k++ ) {
                if ( unitPerTick < this.unitModificationTimeTicks[ i ][ 0 ] * this.unitModificationTimeTicks[ i ][ 1 ][ k ] ) {
                  breaked = true;
                  break;
                }
              }
              if ( breaked ) {
                break;
              }
            }

            //i and k contain the good variable;
            if ( i !== this.unitModificationTimeTicks.length ) {
              unitPerTickCorrect = this.unitModificationTimeTicks[ i ][ 0 ] * this.unitModificationTimeTicks[ i ][ 1 ][ k ];
            } else {
              unitPerTickCorrect = 1;
            }

            break;

          default:

            // We take the log
            var decimals = Math.floor( Math.log( unitPerTick ) / Math.log( 10 ) );
            /*
  					Example:
  						13'453 => Math.log10() = 4.12 => 4
  						0.0000341 => Math.log10() = -4.46 => -5
  				*/

            var numberToNatural = unitPerTick * Math.pow( 10, -decimals );

            /*
  					Example:
  						13'453 (4) => 1.345
  						0.0000341 (-5) => 3.41
  				*/

            this.decimals = -decimals;

            var possibleTicks = [ 1, 2, 5, 10 ];
            var closest = false;
            for ( var i = possibleTicks.length - 1; i >= 0; i-- )
              if ( !closest || ( Math.abs( possibleTicks[ i ] - numberToNatural ) < Math.abs( closest - numberToNatural ) ) ) {
                closest = possibleTicks[ i ];
              }

              // Ok now closest is the number of unit per tick in the natural number
              /*
  					Example:
  						13'453 (4) (1.345) => 1
  						0.0000341 (-5) (3.41) => 5
  				*/

              // Let's scale it back
            var unitPerTickCorrect = closest * Math.pow( 10, decimals );
            /*
  					Example:
  						13'453 (4) (1.345) (1) => 10'000
  						0.0000341 (-5) (3.41) (5) => 0.00005
  				*/
            break;
        }

        var nbTicks = valrange / unitPerTickCorrect;
        var pxPerTick = px / nbTick;

        return [ unitPerTickCorrect, nbTicks, pxPerTick ];
      };

      /**
       * Resets the min and max of the serie to fit the series it contains
       * @memberof GraphAxis
       * @return {Axis} The current axis
       */
      GraphAxis.prototype.setMinMaxToFitSeries = function( noNotify ) {

        var interval = this.getInterval();

        if ( this.options.logScale ) {

          this.currentAxisMin = Math.max( 1e-50, this.getMinValue() * 0.9 );
          this.currentAxisMax = Math.max( 1e-50, this.getMaxValue() * 1.1 );

        } else {

          this.currentAxisMin = this.getMinValue();
          this.currentAxisMax = this.getMaxValue();

          if ( this.getForcedMin() === false ) {
            this.currentAxisMin -= ( this.options.axisDataSpacing.min * interval );
          }

          if ( this.getForcedMax() === false ) {
            this.currentAxisMax += ( this.options.axisDataSpacing.max * interval );
          }
        }

        if ( isNaN( this.currentAxisMin ) || isNaN( this.currentAxisMax ) ) {
          this.currentAxisMax = undefined;
          this.currentAxisMin = undefined;
        }

        this.cacheCurrentMin();
        this.cacheCurrentMax();
        this.cacheInterval();

        this._zoomed = false;

        this.adapt();

        if ( !noNotify ) {
          this.graph._axisHasChanged( this );
        }

        return this;
      };

      /**
       * @memberof GraphAxis
       * @return {Number} the maximum interval ( max - min ) of the axis ( not nessarily the current one )
       */
      GraphAxis.prototype.getInterval = function() {
        return this.getMaxValue() - this.getMinValue()
      };

      /**
       * @memberof GraphAxis
       * @return {Number} the maximum interval ( max - min ) of the axis ( not nessarily the current one )
       */
      GraphAxis.prototype.getCurrentInterval = function() {
        return this.cachedInterval;
      };

      /**
       * @memberof GraphAxis
       * @return {Number} The current minimum value of the axis
       */
      GraphAxis.prototype.getCurrentMin = function() {
        return this.cachedCurrentMin;
      };

      /**
       * @memberof GraphAxis
       * @return {Number} The current maximum value of the axis
       */
      GraphAxis.prototype.getCurrentMax = function() {
        return this.cachedCurrentMax;
      };

      /**
       * Caches the current axis minimum
       * @memberof GraphAxis
       */
      GraphAxis.prototype.cacheCurrentMin = function() {
        this.cachedCurrentMin = this.currentAxisMin == this.currentAxisMax ? ( this.options.logScale ? this.currentAxisMin / 10 : this.currentAxisMin - 1 ) : this.currentAxisMin;
      };

      /**
       * Caches the current axis maximum
       * @memberof GraphAxis
       */
      GraphAxis.prototype.cacheCurrentMax = function() {
        this.cachedCurrentMax = this.currentAxisMax == this.currentAxisMin ? ( this.options.logScale ? this.currentAxisMax * 10 : this.currentAxisMax + 1 ) : this.currentAxisMax;
      };

      /**
       * Caches the current interval
       * @memberof GraphAxis
       */
      GraphAxis.prototype.cacheInterval = function() {
        this.cachedInterval = this.cachedCurrentMax - this.cachedCurrentMin;
      };

      /**
       * Sets the current minimum value of the axis. If lower that the forced value, the forced value is used
       * @memberof GraphAxis
       * @param {Number} val - The new minimum value
       * @return {Axis} The current axis
       */
      GraphAxis.prototype.setCurrentMin = function( val ) {

        if ( val === undefined || ( this.getForcedMin() !== false && val < this.getForcedMin() ) ) {
          val = this.getMinValue();
        }

        this.currentAxisMin = val;
        if ( this.options.logScale ) {
          this.currentAxisMin = Math.max( 1e-50, val );
        }

        this.graph._axisHasChanged( this );
        return this;
      };

      /**
       * Sets the current maximum value of the axis. If higher that the forced value, the forced value is used
       * @memberof GraphAxis
       * @param {Number} val - The new maximum value
       * @return {Axis} The current axis
       */
      GraphAxis.prototype.setCurrentMax = function( val ) {

        if ( val === undefined || ( this.getForcedMax() !== false && val > this.getForcedMax() ) ) {
          val = this.getMaxValue();
        }

        this.currentAxisMax = val;

        if ( this.options.logScale ) {
          this.currentAxisMax = Math.max( 1e-50, val );
        }

        this.graph._axisHasChanged( this );
      };

      /**
       * Sets the flipping state of the axis. If enabled, the axis is descending rather than ascending.
       * @memberof GraphAxis
       * @param {Boolean} flip - The new flipping state of the axis
       * @return {Axis} The current axis
       */
      GraphAxis.prototype.flip = function( flip ) {
        this.options.flipped = flip;
        this.setMinMaxFlipped();
        return this;
      };
      /*
        GraphAxis.prototype.setMinMaxFlipped = function() {

          var interval = this.maxPx - this.minPx;
          var maxPx = this.maxPx - interval * this.options.span[ 0 ];
          var minPx = this.maxPx - interval * this.options.span[ 1 ];

          this.minPxFlipped = this.isFlipped() ? maxPx : minPx;
          this.maxPxFlipped = this.isFlipped() ? minPx : maxPx;

          // this.minPx = minPx;
          //this.maxPx = maxPx;
        }
      */
      /**
       * @memberof GraphAxis
       * @return {Boolean} The current flipping state of the axis
       */
      GraphAxis.prototype.isFlipped = function() {
        return this.options.flipped;
      };

      GraphAxis.prototype._draw = function( linkedToAxisOnly ) { // Redrawing of the axis

        var self = this;
        var visible;

        this.drawInit();

        this.cacheCurrentMax();
        this.cacheCurrentMin();
        this.cacheInterval();

        if ( this.currentAxisMin == undefined || this.currentAxisMax == undefined ) {
          this.setMinMaxToFitSeries( true ); // We reset the min max as a function of the series

        }

        //   this.setSlaveAxesBoundaries();

        // The data min max is stored in this.dataMin, this.dataMax

        //var widthPx = this.maxPx - this.minPx;
        var widthPx = Math.abs( this.getMaxPx() - this.getMinPx() );
        var valrange = this.getCurrentInterval();

        /* Number of px per unit */
        /* Example: width: 1000px
			/* 			10 - 100 => 11.11
			/*			0 - 2 => 500
			/*			0 - 0.00005 => 20'000'000
			*/

        if ( !this.options.display ) {
          this.line.setAttribute( 'display', 'none' );
          return 0;
        }

        this.line.setAttribute( 'display', 'block' );

        if ( this.options.scientificScale == true ) {

          if ( this.options.scientificScaleExponent ) {

            this.scientificExponent = this.options.scientificScaleExponent;
          } else {
            this.scientificExponent = Math.floor( Math.log( Math.max( Math.abs( this.getCurrentMax() ), Math.abs( this.getCurrentMin() ) ) ) / Math.log( 10 ) );
          }
        } else {
          this.scientificExponent = 0;
        }

        /************************************/
        /*** DRAWING LABEL ******************/
        /************************************/

        this.gridLinePath.primary = "";
        this.gridLinePath.secondary = "";

        var label;
        if ( label = this.getLabel() ) {
          // Sets the label
          this.labelTspan.textContent = label;

          if ( this.options.unit ) {

            this.unitTspan.setAttribute( 'display', 'visible' );
            this.expTspan.setAttribute( 'display', 'none' );
            this.expTspanExp.setAttribute( 'display', 'none' );
            this.unitTspan.innerHTML = this.options.unit.replace( /\^([-+0-9]*)/g, "<tspan dy='-5' font-size='0.7em'>$1</tspan>" );

          } else {
            this.unitTspan.setAttribute( 'display', 'none' );
          }

          var letter;

          if ( this.options.unitDecade && this.options.unit && this.scientificExponent !== 0 && ( this.scientificExponent = this.getEngineeringExponent( this.scientificExponent ) ) && ( letter = this.getExponentGreekLetter( this.scientificExponent ) ) ) {

            this.preunitTspan.innerHTML = letter;
            this.preunitTspan.setAttribute( 'display', 'visible' );
            this.unitTspan.setAttribute( 'dx', 0 );

          } else if ( this.scientificExponent !== 0 && !isNaN( this.scientificExponent ) ) {

            if ( this.options.engineeringScale ) {
              this.scientificExponent = this.getEngineeringExponent( this.scientificExponent );
            }

            this.preunitTspan.textContent = "";
            this.preunitTspan.setAttribute( 'display', 'none' );

            if ( this.options.unit ) {
              this.unitTspan.setAttribute( 'dx', 5 );
            }

            this.expTspan.setAttribute( 'display', 'visible' );
            this.expTspanExp.setAttribute( 'display', 'visible' );

            this.expTspan.textContent = "x10";
            this.expTspanExp.textContent = this.scientificExponent;

          } else {

            this.unitTspan.setAttribute( 'display', 'none' );
            this.preunitTspan.setAttribute( 'display', 'none' );
            this.expTspan.setAttribute( 'display', 'none' );
            this.expTspanExp.setAttribute( 'display', 'none' );
          }

        }

        if ( !this.options.hideTicks ) {

          this.resetTicksLength();

          if ( this.linkedToAxis ) { // px defined, linked to another axis

            this.linkedToAxis.deltaPx = 10;
            var widthHeight = this.drawLinkedToAxisTicksWrapper( widthPx, valrange );

          } else if ( !this.options.logScale ) {
            // So the setting is: How many ticks in total ? Then we have to separate it

            var widthHeight = this.drawLinearTicksWrapper( widthPx, valrange );

          } else {

            var widthHeight = this.drawLogTicks();

          }
        } else {
          var widthHeight = 0;
        }

        this.removeUselessTicks();
        this.removeUselessTickLabels();

        this.gridPrimary.setAttribute( 'd', this.gridLinePath.primary );
        this.gridSecondary.setAttribute( 'd', this.gridLinePath.secondary );

        // Looks for axes linked to this current axis
        var axes = this.graph.findAxesLinkedTo( this );
        axes.map( function( axis ) {

          axis.setMinPx( self.getMinPx() );
          axis.setMaxPx( self.getMaxPx() );

          axis.draw( true );
        } );

        /************************************/
        /*** DRAW CHILDREN IMPL SPECIFIC ****/
        /************************************/

        this.drawSpecifics();
        if ( this.options.lineAt0 && this.getCurrentMin() < 0 && this.getCurrentMax() > 0 ) {
          this._draw0Line( this.getPx( 0 ) );
        }

        return widthHeight + ( label ? 20 : 0 );
      };

      GraphAxis.prototype.getExponentGreekLetter = function( val ) {
        switch ( val ) {

          case 3:
            return "k";
            break;

          case 6:
            return "M";
            break;

          case 9:
            return 'G';
            break;

          case 12:
            return "T";
            break;

          case 15:
            return "E";
            break;

          case -3:
            return "m";
            break;

          case -6:
            return "&mu;";
            break;

          case -9:
            return 'n';
            break;

          case -12:
            return 'p';
            break;

          case -15:
            return 'f';
            break;
        }

      };

      GraphAxis.prototype.drawInit = function() {

        switch ( this.options.tickPosition ) {
          case 3:
            this.tickPx1 = -2;
            this.tickPx2 = 0;
            break;

          case 2:
            this.tickPx1 = -1;
            this.tickPx2 = 1;
            break;

          case 1:
            this.tickPx1 = 0;
            this.tickPx2 = 2;
            break;
        }

        // Remove all ticks
        //   while ( this.groupTicks.firstChild ) {
        //    this.groupTicks.removeChild( this.groupTicks.firstChild );
        // }

        //    this.removeTicks();

        // Remove all ticks
        /*while ( this.groupTickLabels.firstChild ) {
          this.groupTickLabels.removeChild( this.groupTickLabels.firstChild );
        }*/

        // Remove all grids
        /*    while ( this.groupGrids.firstChild ) {
        this.groupGrids.removeChild( this.groupGrids.firstChild );
      }
*/
      };

      GraphAxis.prototype.drawLinearTicksWrapper = function( widthPx, valrange ) {

        var tickPrimaryUnit = this.getUnitPerTick( widthPx, this.getNbTicksPrimary(), valrange )[ 0 ];

        if ( this.options.maxPrimaryTickUnit && this.options.maxPrimaryTickUnit < tickPrimaryUnit ) {
          tickPrimaryUnit = this.options.maxPrimaryTickUnit;
        } else if ( this.options.minPrimaryTickUnit && this.options.minPrimaryTickUnit > tickPrimaryUnit ) {
          tickPrimaryUnit = this.options.minPrimaryTickUnit;
        }
        // We need to get here the width of the ticks to display the axis properly, with the correct shift
        return this.drawTicks( tickPrimaryUnit, this.secondaryTicks() );
      };

      GraphAxis.prototype.forcePrimaryTickUnitMax = function( value ) {
        this.options.maxPrimaryTickUnit = value;
      };

      GraphAxis.prototype.forcePrimaryTickUnitMin = function( value ) {
        this.options.minPrimaryTickUnit = value;
      };

      GraphAxis.prototype.setTickLabelRatio = function( tickRatio ) {
        this.options.ticklabelratio = tickRatio;
      };

      GraphAxis.prototype.draw = function( linkedToAxisOnly ) {

        if ( ( linkedToAxisOnly && this.linkedToAxis ) || ( !linkedToAxisOnly && !this.linkedToAxis ) ) {

          this._widthLabels = 0;
          var drawn = this._draw();
          this._widthLabels += drawn;
          return drawn; // ??? this.series.length > 0 ? 100 : drawn;       
        }

        return 0;
      };

      GraphAxis.prototype.drawTicks = function( primary, secondary ) {

        var unitPerTick = primary,
          min = this.getCurrentMin(),
          max = this.getCurrentMax(),
          widthHeight = 0,
          secondaryIncr,
          incrTick,
          subIncrTick,
          loop = 0;

        if ( secondary ) {
          secondaryIncr = unitPerTick / secondary;
        }

        incrTick = this.options.shiftToZero ? this.dataMin - Math.ceil( ( this.dataMin - min ) / unitPerTick ) * unitPerTick : Math.floor( min / unitPerTick ) * unitPerTick;
        this.incrTick = primary;

        while ( incrTick <= max ) {

          loop++;
          if ( loop > 200 ) {
            break;
          }

          if ( secondary ) {

            subIncrTick = incrTick + secondaryIncr;
            //widthHeight = Math.max(widthHeight, this.drawTick(subIncrTick, 1));
            var loop2 = 0;

            while ( subIncrTick < incrTick + unitPerTick ) {
              loop2++;
              if ( loop2 > 100 ) {
                break;
              }

              if ( subIncrTick < min || subIncrTick > max ) {
                subIncrTick += secondaryIncr;
                continue;
              }

              this.drawTickWrapper( subIncrTick, false, Math.abs( subIncrTick - incrTick - unitPerTick / 2 ) < 1e-4 ? 2 : 3 );

              subIncrTick += secondaryIncr;
            }
          }

          if ( incrTick < min || incrTick > max ) {
            incrTick += primary;
            continue;
          }

          this.drawTickWrapper( incrTick, true, 1 );
          incrTick += primary;
        }

        this.widthHeightTick = this.getMaxSizeTick();
        return this.widthHeightTick;
      };

      GraphAxis.prototype.nextTick = function( level, callback ) {

        this.ticks[ level ] = this.ticks[ level ] || [];
        this.lastCurrentTick[ level ] = this.lastCurrentTick[ level ] || 0;
        this.currentTick[ level ] = this.currentTick[ level ] || 0;

        if ( this.currentTick[ level ] >= this.ticks[ level ].length ) {
          var tick = document.createElementNS( this.graph.ns, 'line' );
          this.groupTicks.appendChild( tick );
          this.ticks[ level ].push( tick );

          callback( tick );
        }

        var tick = this.ticks[ level ][ this.currentTick[ level ] ];

        if ( this.currentTick[ level ] >= this.lastCurrentTick[ level ] ) {
          tick.setAttribute( 'display', 'visible' );
        }

        this.currentTick[ level ]++;

        return tick;
      };

      GraphAxis.prototype.nextTickLabel = function( callback ) {

        this.ticksLabels = this.ticksLabels || [];
        this.lastCurrentTickLabel = this.lastCurrentTickLabel || 0;
        this.currentTickLabel = this.currentTickLabel || 0;

        if ( this.currentTickLabel >= this.ticksLabels.length ) {

          var tickLabel = document.createElementNS( this.graph.ns, 'text' );
          this.groupTickLabels.appendChild( tickLabel );
          this.ticksLabels.push( tickLabel );
          callback( tickLabel );
        }

        var tickLabel = this.ticksLabels[ this.currentTickLabel ];

        if ( this.currentTickLabel >= this.lastCurrentTickLabel ) {
          tickLabel.setAttribute( 'display', 'visible' );
        }

        this.currentTickLabel++;

        return tickLabel;
      };

      GraphAxis.prototype.removeUselessTicks = function() {

        for ( var j in this.currentTick ) {

          for ( var i = this.currentTick[ j ]; i < this.ticks[ j ].length; i++ ) {
            this.ticks[ j ][ i ].setAttribute( 'display', 'none' );
          }

          this.lastCurrentTick[ j ] = this.currentTick[ j ];
          this.currentTick[ j ] = 0;
        }
      };

      GraphAxis.prototype.removeUselessTickLabels = function() {

        for ( var i = this.currentTickLabel; i < this.ticksLabels.length; i++ ) {
          this.ticksLabels[ i ].setAttribute( 'display', 'none' );
        }

        this.lastCurrentTickLabel = this.currentTickLabel;
        this.currentTickLabel = 0;

      };
      /*
        GraphAxis.prototype.doGridLine = function() {
          var gridLine = document.createElementNS( this.graph.ns, 'line' );
          this.groupGrids.appendChild( gridLine );
          return gridLine;
        };*/

      GraphAxis.prototype.nextGridLine = function( primary, x1, x2, y1, y2 ) {

        if ( !( ( primary && this.options.primaryGrid ) || ( !primary && this.options.secondaryGrid ) ) ) {
          return;
        }

        this.gridLinePath[ primary ? "primary" : "secondary" ] += "M " + x1 + " " + y1 + " L " + x2 + " " + y2;
      };

      GraphAxis.prototype.setGridLineStyle = function( gridLine, primary ) {

        gridLine.setAttribute( 'shape-rendering', 'crispEdges' );
        gridLine.setAttribute( 'stroke', primary ? this.getPrimaryGridColor() : this.getSecondaryGridColor() );
        gridLine.setAttribute( 'stroke-width', primary ? this.getPrimaryGridWidth() : this.getSecondaryGridWidth() );
        gridLine.setAttribute( 'stroke-opacity', primary ? this.getPrimaryGridOpacity() : this.getSecondaryGridOpacity() );

        var dasharray;
        if ( ( dasharray = primary ? this.getPrimaryGridDasharray() : this.getSecondaryGridDasharray() ) ) {
          gridLine.setAttribute( 'stroke-dasharray', dasharray );
        }

      };

      GraphAxis.prototype.setGridLinesStyle = function() {
        this.setGridLineStyle( this.gridPrimary, true );
        this.setGridLineStyle( this.gridSecondary, false );
        return this;
      };

      GraphAxis.prototype.resetTicksLength = function() {};

      GraphAxis.prototype.secondaryTicks = function() {
        return this.options.nbTicksSecondary;
      };

      GraphAxis.prototype.drawLogTicks = function() {
        var min = this.getCurrentMin(),
          max = this.getCurrentMax();
        var incr = Math.min( min, max );
        var max = Math.max( min, max );

        if ( incr < 1e-50 ) {
          incr = 1e-50;
        }

        if ( Math.log( incr ) - Math.log( max ) > 20 ) {
          max = Math.pow( 10, ( Math.log( incr ) * 20 ) );
        }

        var optsMain = {
          fontSize: '1.0em',
          exponential: true,
          overwrite: false
        };
        if ( incr < 0 )
          incr = 0;
        var pow = incr == 0 ? 0 : Math.floor( Math.log( incr ) / Math.log( 10 ) );
        var incr = 1,
          k = 0,
          val;
        while ( ( val = incr * Math.pow( 10, pow ) ) < max ) {
          if ( incr == 1 ) { // Superior power
            if ( val > min )
              this.drawTickWrapper( val, true, 1, optsMain );
          }
          if ( incr == 10 ) {
            incr = 1;
            pow++;
          } else {

            if ( incr != 1 && val > min ) {

              this.drawTickWrapper( val, false, 2, {
                overwrite: "",
                fontSize: '0.6em'
              } );

            }

            incr++;
          }
        }

        this.widthHeightTick = this.getMaxSizeTick();
        return this.widthHeightTick;
      };

      GraphAxis.prototype.drawTickWrapper = function( value, label, level, options ) {

        //var pos = this.getPos( value );

        this.drawTick( value, label, level, options );
      };

      /**
       * Used to scale the master axis into the slave axis
       * @function SlaveAxisScalingFunction
       * @param {Number} val - The master value to convert into a slave value
       * @returns undefined
       */

      /**
       * Makes this axis a slave. This can be used to show the same data with different units, specifically when a conversion function exists from axis -> slaveAxis but not in reverse. This axis should actually have no series.
       * @param {Axis} axis - The master axis
       * @param {SlaveAxisScalingFunction} scalingFunction - The scaling function used to map masterValue -> slaveValue
       * @param {Number} decimals - The number of decimals to round the value to
       * @memberof GraphAxis
       * @return {Number} The width or height used by the axis (used internally)
       */
      GraphAxis.prototype.linkToAxis = function( axis, scalingFunction, decimals ) {

        this.linkedToAxis = {
          axis: axis,
          scalingFunction: scalingFunction,
          decimals: decimals || 1
        };

      };

      GraphAxis.prototype.drawLinkedToAxisTicksWrapper = function( widthPx, valrange ) {

        var opts = this.linkedToAxis,
          px = 0,
          val,
          t,
          i = 0,
          l,
          delta2;

        // Redrawing the main axis ? Why ?
        //opts.axis.draw();

        if ( !opts.deltaPx ) {
          opts.deltaPx = 10;
        }

        do {

          val = opts.scalingFunction( opts.axis.getVal( px + this.getMinPx() ) );

          if ( opts.decimals ) {
            this.decimals = opts.decimals;
          }

          t = this.drawTick( val, true, 1, {}, px + this.getMinPx() );

          if ( !t ) {
            console.log( val, px, this.getMinPx() );
            console.error( "Problem here" );
            break;
          }

          l = String( t[ 1 ].textContent ).length * 8;
          delta2 = Math.round( l / 5 ) * 5;

          if ( delta2 > opts.deltaPx ) {
            opts.deltaPx = delta2;
            this.drawInit();
            this.drawLinkedToAxisTicksWrapper( widthPx, valrange );
            return;
          }

          i++;

          px += opts.deltaPx;

        } while ( px < widthPx );
      };

      /**
       * Transform a value into pixels, according to the axis scaling. The value is referenced to the drawing wrapper, not the the axis minimal value
       * @param {Number} value - The value to translate into pixels
       * @memberof GraphAxis
       * @return {Number} The value transformed into pixels
       */
      GraphAxis.prototype.getPos = function( value ) {
        return this.getPx( value );
      };

      /**
       * @alias Axis~getPos
       */
      GraphAxis.prototype.getPx = function( value ) {
        //			if(this.getMaxPx() == undefined)
        //				console.log(this);
        //console.log(this.getMaxPx(), this.getMinPx(), this.getCurrentInterval());
        // Ex 50 / (100) * (1000 - 700) + 700

        //console.log( value, this.getCurrentMin(), this.getMaxPx(), this.getMinPx(), this.getCurrentInterval() );
        if ( !this.options.logScale ) {

          return ( value - this.getCurrentMin() ) / ( this.getCurrentInterval() ) * ( this.getMaxPx() - this.getMinPx() ) + this.getMinPx();
        } else {
          // 0 if value = min
          // 1 if value = max

          if ( value < 0 )
            return;

          var value = ( ( Math.log( value ) - Math.log( this.getCurrentMin() ) ) / ( Math.log( this.getCurrentMax() ) - Math.log( this.getCurrentMin() ) ) ) * ( this.getMaxPx() - this.getMinPx() ) + this.getMinPx();

          return value;
        }
      };

      /**
       * Transform a pixel position (referenced to the graph zone, not to the axis minimum) into a value, according to the axis scaling.
       * @param {Number} pixels - The number of pixels to translate into a value
       * @memberof GraphAxis
       * @return {Number} The axis value corresponding to the pixel position
       */
      GraphAxis.prototype.getVal = function( px ) {

        if ( !this.options.logScale ) {

          return ( px - this.getMinPx() ) / ( this.getMaxPx() - this.getMinPx() ) * this.getCurrentInterval() + this.getCurrentMin();

        } else {

          return Math.exp( ( px - this.getMinPx() ) / ( this.getMaxPx() - this.getMinPx() ) * ( Math.log( this.getCurrentMax() ) - Math.log( this.getCurrentMin() ) ) + Math.log( this.getCurrentMin() ) )
        }

        // Ex 50 / (100) * (1000 - 700) + 700

      };

      /**
       * Transform a delta value into pixels
       * @param {Number} value - The value to translate into pixels
       * @memberof GraphAxis
       * @return {Number} The value transformed into pixels
       * @example graph.getBottomAxis().forceMin( 20 ).forceMax( 50 ).getRelPx( 2 ); // Returns how many pixels will be covered by 2 units. Let's assume 600px of width, it's ( 2 / 30 ) * 600 = 40px
       */
      GraphAxis.prototype.getRelPx = function( delta ) {

        return ( delta / this.getCurrentInterval() ) * ( this.getMaxPx() - this.getMinPx() );
      };

      /**
       * Transform a delta pixels value into value
       * @param {Number} pixels - The pixel to convert into a value
       * @memberof GraphAxis
       * @return {Number} The delta value corresponding to delta pixels
       * @see Axis~getRelPx
       * @example graph.getBottomAxis().forceMin( 20 ).forceMax( 50 ).getRelVal( 40 ); // Returns 2 (for 600px width)
       */
      GraphAxis.prototype.getRelVal = function( px ) {

        return px / ( this.getMaxPx() - this.getMinPx() ) * this.getCurrentInterval();
      };

      GraphAxis.prototype.valueToText = function( value ) {

        if ( this.scientificExponent ) {

          value /= Math.pow( 10, this.scientificExponent );
          return value.toFixed( 1 );

        } else {

          value = value * Math.pow( 10, this.getExponentialFactor() ) * Math.pow( 10, this.getExponentialLabelFactor() );
          if ( this.options.shiftToZero ) {
            value -= this.dataMin;
          }
          if ( this.options.ticklabelratio ) {
            value *= this.options.ticklabelratio;
          }
          if ( this.options.unitModification ) {
            value = this.modifyUnit( value, this.options.unitModification );
            return value;
          }

          var dec = this.decimals - this.getExponentialFactor() - this.getExponentialLabelFactor();

          if ( isNaN( value ) ) {
            return "";
          }

          if ( dec > 0 ) {
            return value.toFixed( dec );
          }

          return value.toFixed( 0 );
        }
      };

      GraphAxis.prototype.getModifiedValue = function( value ) {
        if ( this.options.ticklabelratio ) {
          value *= this.options.ticklabelratio;
        }

        if ( this.options.shiftToZero ) {
          value -= this.getMinValue() * ( this.options.ticklabelratio || 1 );
        }

        return value;
      };

      GraphAxis.prototype.modifyUnit = function( value, mode ) {

        var text = "";
        var incr = this.incrTick;

        switch ( mode ) {

          case 'time': // val must be in seconds => transform in hours / days / months
            var max = this.getModifiedValue( this.getMaxValue() ),
              first,
              units = [
                [ 60, 'min' ],
                [ 3600, 'h' ],
                [ 3600 * 24, 'd' ]
              ];
            var umin;
            if ( max < 3600 ) { // to minutes
              umin = 0;
            } else if ( max < 3600 * 24 ) {
              umin = 1;
            } else if ( max < 3600 * 24 * 30 ) {
              umin = 2;
            }

            if ( !units[ umin ] ) {
              return false;
            }

            value = value / units[ umin ][ 0 ];
            var valueRounded = Math.floor( value );
            text = valueRounded + units[ umin ][ 1 ];

            // Addind lower unit for precision
            umin--;
            while ( incr < 1 * units[ umin + 1 ][ 0 ] && umin > -1 ) {

              first = false;
              value = ( value - valueRounded ) * units[ umin + 1 ][ 0 ] / units[ umin ][ 0 ];
              valueRounded = Math.round( value );
              text += " " + valueRounded + units[ umin ][ 1 ];
              umin--;
            }

            break;

          case 'time:min.sec':
            value = value / 60;
            var valueRounded = Math.floor( value );
            var s = ( Math.round( ( value - valueRounded ) * 60 ) + "" );
            s = s.length == 1 ? '0' + s : s;
            text = valueRounded + "." + s;
            break;
        }

        return text;
      };

      GraphAxis.prototype.getExponentialFactor = function() {
        return this.options.exponentialFactor;
      };

      GraphAxis.prototype.setExponentialFactor = function( value ) {
        this.options.exponentialFactor = value;
      };

      GraphAxis.prototype.setExponentialLabelFactor = function( value ) {
        this.options.exponentialLabelFactor = value;
      };

      GraphAxis.prototype.getExponentialLabelFactor = function() {
        return this.options.exponentialLabelFactor;
      };

      /**
       * Sets the label of the axis
       * @param {Number} label - The label to display under the axis
       * @memberof GraphAxis
       * @return {Axis} The current axis
       */
      GraphAxis.prototype.setLabel = function( label ) {
        this.options.labelValue = label;
        return this;
      };

      /**
       * @memberof GraphAxis
       * @return {String} The label value
       */
      GraphAxis.prototype.getLabel = function() {
        return this.options.labelValue;
      };

      GraphAxis.prototype.setSpan = function( _from, _to ) {

        this.options.span = [ _from, _to ];
        return this;
      };

      GraphAxis.prototype.getSpan = function() {
        return this.options.span;
      };

      GraphAxis.prototype.setLevel = function( level ) {
        this._level = level;
        return this;
      };

      GraphAxis.prototype.getLevel = function() {
        return this._level;
      };

      GraphAxis.prototype.setShift = function( shift ) {
        this.shift = shift;
        //this.totalDimension = totalDimension; // Width (axis y) or height (axis x) of the axis.
        this._setShift();
      };

      GraphAxis.prototype.getShift = function() {
        return this.shift;
      };

      /**
       * Changes the tick position
       * @param {Number} pos - The new position ( "outside", "centered" or "inside" )
       * @memberof GraphAxis
       * @return {Axis} The current axis
       */
      GraphAxis.prototype.setTickPosition = function( pos ) {
        switch ( pos ) {
          case 3:
          case 'outside':
            pos = 3;
            break;

          case 2:
          case 'centered':
            pos = 2;
            break;

          default:
          case 1:
          case 'inside':
            pos = 1;
            break;
        }

        this.options.tickPosition = pos;
        return this;
      };

      /**
       * Displays or hides the axis grids
       * @param {Boolean} on - true to enable the grids, false to disable them
       * @memberof GraphAxis
       * @return {Axis} The current axis
       */
      GraphAxis.prototype.setGrids = function( on ) {
        this.options.primaryGrid = on;
        this.options.secondaryGrid = on;
        return this;
      };

      /**
       * Displays or hides the axis primary grid
       * @param {Boolean} on - true to enable the grids, false to disable it
       * @memberof GraphAxis
       * @return {Axis} The current axis
       */
      GraphAxis.prototype.setPrimaryGrid = function( on ) {
        this.options.primaryGrid = on;
        return this;
      };

      /**
       * Displays or hides the axis secondary grid
       * @param {Boolean} on - true to enable the grids, false to disable it
       * @memberof GraphAxis
       * @return {Axis} The current axis
       */
      GraphAxis.prototype.setSecondaryGrid = function( on ) {
        this.options.secondaryGrid = on;
        return this;
      };

      /**
       * Enables primary grid
       * @memberof GraphAxis
       * @return {Axis} The current axis
       */
      GraphAxis.prototype.primaryGridOn = function() {
        return this.setPrimaryGrid( true );
      };

      /**
       * Disables primary grid
       * @memberof GraphAxis
       * @return {Axis} The current axis
       */
      GraphAxis.prototype.primaryGridOff = function() {
        return this.setPrimaryGrid( false );
      };

      /**
       * Enables secondary grid
       * @memberof GraphAxis
       * @return {Axis} The current axis
       */
      GraphAxis.prototype.secondaryGridOn = function() {
        return this.setSecondaryGrid( true );
      };

      /**
       * Disables secondary grid
       * @memberof GraphAxis
       * @return {Axis} The current axis
       */
      GraphAxis.prototype.secondaryGridOff = function() {
        return this.setSecondaryGrid( false );
      };

      /**
       * Enables all the grids
       * @memberof GraphAxis
       * @return {Axis} The current axis
       */
      GraphAxis.prototype.gridsOn = function() {
        return this.setGrids( true );
      };

      /**
       * Disables all the grids
       * @memberof GraphAxis
       * @return {Axis} The current axis
       */
      GraphAxis.prototype.gridsOff = function() {
        return this.setGrids( false );
      };

      GraphAxis.prototype.turnGridsOff = GraphAxis.prototype.gridsOff;
      GraphAxis.prototype.turnGridsOn = GraphAxis.prototype.gridsOn;

      /**
       * Sets the axis color
       * @memberof GraphAxis
       * @param {String} color - The color to set the axis
       * @return {Axis} The current axis
       * @since 1.13.2
       */
      GraphAxis.prototype.setAxisColor = function( color ) {
        this.options.axisColor = color;
        return this;
      };

      /**
       * Gets the axis color
       * @memberof GraphAxis
       * @return {String} The color of the axis
       * @since 1.13.2
       */
      GraphAxis.prototype.getAxisColor = function( color ) {
        return this.options.axisColor || 'black';
      };

      /**
       * Sets the color of the main ticks
       * @memberof GraphAxis
       * @param {String} color - The new color of the primary ticks
       * @return {Axis} The current axis
       * @since 1.13.2
       */
      GraphAxis.prototype.setPrimaryTicksColor = function( color ) {
        this.options.primaryTicksColor = color;
        return this;
      };

      /**
       * Gets the color of the main ticks
       * @memberof GraphAxis
       * @return {String} The color of the primary ticks
       * @since 1.13.2
       */
      GraphAxis.prototype.getPrimaryTicksColor = function( color ) {
        return this.options.primaryTicksColor || 'black';
      };

      /**
       * Sets the color of the secondary ticks
       * @memberof GraphAxis
       * @param {String} color - The new color of the secondary ticks
       * @return {Axis} The current axis
       * @since 1.13.2
       */
      GraphAxis.prototype.setSecondaryTicksColor = function( color ) {
        this.options.secondaryTicksColor = color;
        return this;
      };

      /**
       * Gets the color of the secondary ticks
       * @memberof GraphAxis
       * @return {String} The color of the secondary ticks
       * @since 1.13.2
       */
      GraphAxis.prototype.getSecondaryTicksColor = function( color ) {
        return this.options.secondaryTicksColor || 'black';
      };

      /**
       * Sets the color of the tick labels
       * @memberof GraphAxis
       * @param {String} color - The new color of the tick labels
       * @return {Axis} The current axis
       * @since 1.13.2
       */
      GraphAxis.prototype.setTicksLabelColor = function( color ) {
        this.options.ticksLabelColor = color;
        return this;
      };

      /**
       * Gets the color of the tick labels
       * @memberof GraphAxis
       * @return {String} The color of the tick labels
       * @since 1.13.2
       */
      GraphAxis.prototype.getTicksLabelColor = function( color ) {
        return this.options.ticksLabelColor || 'black';
      };

      /**
       * Sets the color of the primary grid
       * @memberof GraphAxis
       * @param {String} color - The primary grid color
       * @return {Axis} The current axis
       * @since 1.13.3
       */
      GraphAxis.prototype.setPrimaryGridColor = function( color ) {
        this.options.primaryGridColor = color;
        return this;
      };

      /**
       * Gets the color of the primary grid
       * @memberof GraphAxis
       * @return {String} color - The primary grid color
       * @since 1.13.3
       */
      GraphAxis.prototype.getPrimaryGridColor = function() {
        return this.options.primaryGridColor;
      };

      /**
       * Sets the color of the primary grid
       * @memberof GraphAxis
       * @param {String} color - The primary grid color
       * @return {Axis} The current axis
       * @since 1.13.3
       */
      GraphAxis.prototype.setSecondaryGridColor = function( color ) {
        this.options.secondaryGridColor = color;
        return this;
      };

      /**
       * Gets the color of the secondary grid
       * @memberof GraphAxis
       * @return {String} color - The secondary grid color
       * @since 1.13.3
       */
      GraphAxis.prototype.getSecondaryGridColor = function() {
        return this.options.secondaryGridColor;
      };

      /**
       * Sets the width of the primary grid lines
       * @memberof GraphAxis
       * @param {Number} width - The width of the primary grid lines
       * @return {Axis} The current axis
       * @since 1.13.3
       */
      GraphAxis.prototype.setPrimaryGridWidth = function( width ) {
        this.options.primaryGridWidth = width;
        return this;
      };

      /**
       * Gets the width of the primary grid lines
       * @memberof GraphAxis
       * @return {Number} width - The width of the primary grid lines
       * @since 1.13.3
       */
      GraphAxis.prototype.getPrimaryGridWidth = function() {
        return this.options.primaryGridWidth;
      };

      /**
       * Sets the width of the secondary grid lines
       * @memberof GraphAxis
       * @param {Number} width - The width of the secondary grid lines
       * @return {Axis} The current axis
       * @since 1.13.3
       */
      GraphAxis.prototype.setSecondaryGridWidth = function( width ) {
        this.options.secondaryGridWidth = width;
        return this;
      };

      /**
       * Gets the width of the secondary grid lines
       * @memberof GraphAxis
       * @return {Number} width - The width of the secondary grid lines
       * @since 1.13.3
       */
      GraphAxis.prototype.getSecondaryGridWidth = function() {
        return this.options.secondaryGridWidth;
      };

      /**
       * Sets the opacity of the primary grid lines
       * @memberof GraphAxis
       * @param {Number} opacity - The opacity of the primary grid lines
       * @return {Axis} The current axis
       * @since 1.13.3
       */
      GraphAxis.prototype.setPrimaryGridOpacity = function( opacity ) {
        this.options.primaryGridOpacity = opacity;
        return this;
      };

      /**
       * Gets the opacity of the primary grid lines
       * @memberof GraphAxis
       * @return {Number} opacity - The opacity of the primary grid lines
       * @since 1.13.3
       */
      GraphAxis.prototype.getPrimaryGridOpacity = function() {
        return this.options.primaryGridOpacity;
      };

      /**
       * Sets the opacity of the secondary grid lines
       * @memberof GraphAxis
       * @param {Number} opacity - The opacity of the secondary grid lines
       * @return {Axis} The current axis
       * @since 1.13.3
       */
      GraphAxis.prototype.setSecondaryGridOpacity = function( opacity ) {
        this.options.secondaryGridOpacity = opacity;
        return this;
      };

      /**
       * Gets the opacity of the secondary grid lines
       * @memberof GraphAxis
       * @return {Number} opacity - The opacity of the secondary grid lines
       * @since 1.13.3
       */
      GraphAxis.prototype.getSecondaryGridOpacity = function() {
        return this.options.secondaryGridOpacity;
      };

      /**
       * Sets the dasharray of the primary grid lines
       * @memberof GraphAxis
       * @param {String} dasharray - The dasharray of the primary grid lines
       * @return {Axis} The current axis
       * @since 1.13.3
       */
      GraphAxis.prototype.setPrimaryGridDasharray = function( dasharray ) {
        this.options.primaryGridDasharray = dasharray;
        return this;
      };

      /**
       * Gets the dasharray of the primary grid lines
       * @memberof GraphAxis
       * @return {String} dasharray - The dasharray of the primary grid lines
       * @since 1.13.3
       */
      GraphAxis.prototype.getPrimaryGridDasharray = function() {
        return this.options.primaryGridDasharray;
      };

      /**
       * Sets the dasharray of the secondary grid lines
       * @memberof GraphAxis
       * @param {String} dasharray - The dasharray of the secondary grid lines
       * @return {Axis} The current axis
       * @since 1.13.3
       */
      GraphAxis.prototype.setSecondaryGridDasharray = function( dasharray ) {
        this.options.secondaryGridDasharray = dasharray;
        return this;
      };

      /**
       * Gets the dasharray of the secondary grid lines
       * @memberof GraphAxis
       * @return {String} dasharray - The dasharray of the secondary grid lines
       * @since 1.13.3
       */
      GraphAxis.prototype.getSecondaryGridDasharray = function() {
        return this.options.secondaryGridDasharray;
      };

      /**
       * Sets the color of the label
       * @memberof GraphAxis
       * @param {String} color - The new color of the label
       * @return {Axis} The current axis
       * @since 1.13.2
       */
      GraphAxis.prototype.setLabelColor = function( color ) {
        this.options.labelColor = color;
      };

      /**
       * Gets the color of the label
       * @memberof GraphAxis
       * @return {String} The color of the label
       * @since 1.13.2
       */
      GraphAxis.prototype.getLabelColor = function() {
        return this.options.labelColor;
      };

      GraphAxis.prototype.setTickContent = function( dom, val, options ) {
        if ( !options ) options = {};

        if ( options.overwrite || !options.exponential ) {

          dom.textContent = options.overwrite || this.valueToText( val );

        } else {
          var log = Math.round( Math.log( val ) / Math.log( 10 ) );
          var unit = Math.floor( val * Math.pow( 10, -log ) );

          dom.textContent = ( unit != 1 ) ? unit + "x10" : "10";
          var tspan = document.createElementNS( this.graph.ns, 'tspan' );
          tspan.textContent = log;
          tspan.setAttribute( 'font-size', '0.7em' );
          tspan.setAttribute( 'dy', -5 );
          dom.appendChild( tspan );
        }

        if ( options.fontSize ) {
          dom.setAttribute( 'font-size', options.fontSize );
        }
      };

      /**
       * @memberof GraphAxis
       * @returns {Boolean} true if it is an x axis, false otherwise
       */
      GraphAxis.prototype.isX = function() {
        return false;
      };

      /**
       * @memberof GraphAxis
       * @returns {Boolean} true if it is an y axis, false otherwise
       */
      GraphAxis.prototype.isY = function() {
        return false;
      };

      /**
       * Sets the unit of the axis
       * @param {String} unit - The unit of the axis
       * @return {Axis} The current axis
       * @memberof GraphAxis
       * @since 1.13.3
       */
      GraphAxis.prototype.setUnit = function( unit ) {
        this.options.unit = unit;
        return this;
      };

      /**
       * Allows the unit to scale with thousands
       * @param {Boolean} on - Enables this mode
       * @return {Axis} The current axis
       * @memberof GraphAxis
       * @since 1.13.3
       */
      GraphAxis.prototype.setUnitDecade = function( on ) {
        this.options.unitDecade = on;
      };

      /**
       * Enable the scientific mode for the axis values. This way, big numbers can be avoided, e.g. "1000000000" would be displayed 1 with 10<sup>9</sup> or "G" shown on near the axis unit.
       * @param {Boolean} on - Enables the scientific mode
       * @return {Axis} The current axis
       * @memberof GraphAxis
       * @since 1.13.3
       */
      GraphAxis.prototype.setScientific = function( on ) {
        this.options.scientificScale = on;
        return this;
      };

      /**
       * In the scientific mode, forces the axis to take a specific power of ten. Useful if you want to show kilometers instead of meters for example. In this case you would use "3" as a value.
       * @param {Number} scientificScaleExponent - Forces the scientific scale to take a defined power of ten
       * @return {Axis} The current axis
       * @memberof GraphAxis
       * @since 1.13.3
       * @see Axis#setScientific
       */
      GraphAxis.prototype.setScientificScaleExponent = function( scientificScaleExponent ) {
        this.options.scientificScaleExponent = scientificScaleExponent;
        return this;
      };

      /**
       * The engineer scaling is similar to the scientific scaling ({@link Axis#setScientificScale}) but allowing only mupltiples of 3 to be used to scale the axis (for instance, go from grams to kilograms while skipping decagrams and hexagrams)
       * @param {Boolean} engineeringScaling - <code>true</code> to turn on the engineering scaling
       * @return {Axis} The current axis
       * @memberof GraphAxis
       * @since 1.13.3
       * @see Axis#setScientific
       */
      GraphAxis.prototype.setEngineering = function( engineeringScaling ) {
        this.options.scientificScale = engineeringScaling;
        this.options.engineeringScale = engineeringScaling;
        return this;
      };

      /**
       * Calculates the closest engineering exponent from a scientific exponent
       * @param {Number} scientificExponent - The exponent of 10 based on which the axis will be scaled
       * @return {Number} The appropriate engineering exponent
       * @memberof GraphAxis
       * @since 1.13.3
       * @private
       */
      GraphAxis.prototype.getEngineeringExponent = function( scientificExponent ) {

        if ( scientificExponent > 0 ) {
          scientificExponent -= ( scientificExponent % 3 );
        } else {
          scientificExponent -= ( 3 - ( -scientificExponent ) % 3 ) % 3;
        }

        return scientificExponent
      };

      /**
       * Enables log scaling
       * @param {Boolean} logScale - ```true``` to enable the log scaling, ```false``` to disable it
       * @return {Axis} The current axis
       * @memberof GraphAxis
       * @since 1.13.3
       */
      GraphAxis.prototype.setLogScale = function( log ) {
        this.options.logScale = log;
        return this;
      };

      GraphAxis.prototype.isZoomed = function() {
        return !( this.currentAxisMin == this.getMinValue() || this.currentAxisMax == this.getMaxValue() );
      };

      return GraphAxis;

    } )( build[ "./jquery" ], build[ "./dependencies/eventEmitter/EventEmitter" ], build[ "./graph.util" ] );

    /* 
     * Build: new source file 
     * File name : graph.axis.x
     * File path : /Users/normanpellet/Documents/Web/graph/src/graph.axis.x.js
     */

    build[ './graph.axis.x' ] = ( function( $, GraphAxis ) {
      /** @global */
      /** @ignore */

      "use strict";

      /** 
       * Generic constructor of a y axis
       * @class XAxis
       * @augments GraphAxis
       */
      function XAxis( graph, topbottom, options ) {
        this.init( graph, options );
        this.top = topbottom == 'top';
      }

      $.extend( XAxis.prototype, GraphAxis.prototype, {

        getAxisPosition: function() {

          if ( !this.options.display ) {
            return 0;
          }

          var size = ( this.options.tickPosition == 1 ? 8 : 20 ) + this.graph.options.fontSize * 1;

          if ( this.getLabel() ) {
            size += this.graph.options.fontSize;
          }

          return size;
        },

        getAxisWidthHeight: function() {
          return;
        },

        isX: function() {
          return true;
        },
        isY: function() {
          return false;
        },

        _setShift: function() {
          if ( this.getShift() === undefined || !this.graph.getDrawingHeight() ) {
            return;
          }

          this.group.setAttribute( 'transform', 'translate(0 ' + ( this.floating ? this.getShift() : ( this.top ? this.shift : ( this.graph.getDrawingHeight() - this.shift ) ) ) + ')' )
        },

        getMaxSizeTick: function() {
          return ( this.top ? -1 : 1 ) * ( ( this.options.tickPosition == 1 ) ? 10 : 10 )
        },

        drawTick: function( value, label, level, options, forcedPos ) {

          var self = this,
            val;

          val = forcedPos || this.getPos( value );

          if ( val == undefined || isNaN( val ) ) {
            return;
          }

          var tick = this.nextTick( level, function( tick ) {

            tick.setAttribute( 'y1', ( self.top ? 1 : -1 ) * self.tickPx1 * self.tickScaling[ level ] );
            tick.setAttribute( 'y2', ( self.top ? 1 : -1 ) * self.tickPx2 * self.tickScaling[ level ] );

            if ( level == 1 ) {
              tick.setAttribute( 'stroke', self.getPrimaryTicksColor() );
            } else {
              tick.setAttribute( 'stroke', self.getSecondaryTicksColor() );
            }

          } );

          //      tick.setAttribute( 'shape-rendering', 'crispEdges' );
          tick.setAttribute( 'x1', val );
          tick.setAttribute( 'x2', val );

          this.nextGridLine( level == 1, val, val, 0, this.graph.getDrawingHeight() );

          //  this.groupTicks.appendChild( tick );
          if ( level == 1 ) {
            var tickLabel = this.nextTickLabel( function( tickLabel ) {

              tickLabel.setAttribute( 'y', ( self.top ? -1 : 1 ) * ( ( self.options.tickPosition == 1 ? 8 : 20 ) + ( self.top ? 10 : 0 ) ) );
              tickLabel.setAttribute( 'text-anchor', 'middle' );
              if ( self.getTicksLabelColor() !== 'black' ) {
                tickLabel.setAttribute( 'fill', self.getTicksLabelColor() );
              }
              tickLabel.style.dominantBaseline = 'hanging';
            } );

            tickLabel.setAttribute( 'x', val );
            this.setTickContent( tickLabel, value, options );

          }
          //    this.ticks.push( tick );

          return [ tick, tickLabel ];
        },

        drawSpecifics: function() {

          // Adjusts group shift
          //this.group.setAttribute('transform', 'translate(0 ' + this.getShift() + ')');

          // Place label correctly
          this.label.setAttribute( 'text-anchor', 'middle' );
          this.label.setAttribute( 'x', Math.abs( this.getMaxPx() + this.getMinPx() ) / 2 );
          this.label.setAttribute( 'y', ( this.top ? -1 : 1 ) * ( ( this.options.tickPosition == 1 ? 10 : 15 ) + this.graph.options.fontSize ) );
          this.labelTspan.textContent = this.getLabel();

          this.line.setAttribute( 'x1', this.getMinPx() );
          this.line.setAttribute( 'x2', this.getMaxPx() );
          this.line.setAttribute( 'y1', 0 );
          this.line.setAttribute( 'y2', 0 );

          this.line.setAttribute( 'stroke', this.getAxisColor() );

          if ( !this.top ) {

            this.labelTspan.style.dominantBaseline = 'hanging';
            this.expTspan.style.dominantBaseline = 'hanging';
            this.expTspanExp.style.dominantBaseline = 'hanging';

            this.unitTspan.style.dominantBaseline = 'hanging';
            this.preunitTspan.style.dominantBaseline = 'hanging';

          }
        },

        _draw0Line: function( px ) {

          if ( !this._0line ) {
            this._0line = document.createElementNS( this.graph.ns, 'line' );
          }
          this._0line.setAttribute( 'x1', px );
          this._0line.setAttribute( 'x2', px );

          this._0line.setAttribute( 'y1', 0 );
          this._0line.setAttribute( 'y2', this.getMaxPx() );

          this._0line.setAttribute( 'stroke', 'black' );
          this.groupGrids.appendChild( this._0line );
        },

        handleMouseMoveLocal: function( x, y, e ) {
          x -= this.graph.getPaddingLeft();
          this.mouseVal = this.getVal( x );
        },

        setMinMaxFlipped: function() {

          var interval = this.maxPx - this.minPx;
          var maxPx = interval * this.options.span[ 1 ] + this.minPx;
          var minPx = interval * this.options.span[ 0 ] + this.minPx;

          this.minPxFlipped = this.isFlipped() ? maxPx : minPx;
          this.maxPxFlipped = this.isFlipped() ? minPx : maxPx;

        }

      } );

      return XAxis;
    } )( build[ "./jquery" ], build[ "./graph.axis" ] );

    /* 
     * Build: new source file 
     * File name : graph.axis.y
     * File path : /Users/normanpellet/Documents/Web/graph/src/graph.axis.y.js
     */

    build[ './graph.axis.y' ] = ( function( $, GraphAxis ) {
      /** @global */
      /** @ignore */

      "use strict";

      /** 
       * Generic constructor of a y axis
       * @class GraphYAxis
       * @augments GraphAxis
       */
      function GraphYAxis( graph, leftright, options ) {

        this.init( graph, options );

        this.leftright = leftright;
        this.left = leftright == 'left';

      }

      $.extend( GraphYAxis.prototype, GraphAxis.prototype, {

        getAxisPosition: function() {

          if ( !this.options.display ) {
            return 0;
          }
          return ( this.options.tickPosition == 1 ? 15 : 0 );
        },

        getAxisWidthHeight: function() {
          return 15;
        },

        isX: function() {
          return false;
        },
        isY: function() {
          return true;
        },

        resetTicksLength: function() {
          this.longestTick = [ false, 0 ];
        },

        getMaxSizeTick: function() {

          return ( this.longestTick && this.longestTick[ 0 ] ? this.longestTick[ 0 ].getComputedTextLength() : 0 ) + 10; //(this.left ? 10 : 0);
        },

        drawTick: function( value, label, level, options, forcedPos ) {
          var pos;

          var self = this,
            group = this.groupTicks,
            tickLabel;

          pos = forcedPos || this.getPos( value );

          if ( pos == undefined || isNaN( pos ) ) {
            return;
          }

          var tick = this.nextTick( level, function( tick ) {

            tick.setAttribute( 'x1', ( self.left ? 1 : -1 ) * self.tickPx1 * self.tickScaling[ level ] );
            tick.setAttribute( 'x2', ( self.left ? 1 : -1 ) * self.tickPx2 * self.tickScaling[ level ] );

            if ( level == 1 ) {
              tick.setAttribute( 'stroke', self.getPrimaryTicksColor() );
            } else {
              tick.setAttribute( 'stroke', self.getSecondaryTicksColor() );
            }

          } );

          tick.setAttribute( 'y1', pos );
          tick.setAttribute( 'y2', pos );

          this.nextGridLine( level == 1, 0, this.graph.getDrawingWidth(), pos, pos );

          //  this.groupTicks.appendChild( tick );
          if ( level == 1 ) {
            var tickLabel = this.nextTickLabel( function( tickLabel ) {

              tickLabel.setAttribute( 'x', self.left ? -10 : 10 );
              if ( self.getTicksLabelColor() !== 'black' ) {
                tickLabel.setAttribute( 'fill', self.getTicksLabelColor() );
              }

              if ( self.left ) {
                tickLabel.setAttribute( 'text-anchor', 'end' );
              } else {
                tickLabel.setAttribute( 'text-anchor', 'start' );
              }
              tickLabel.style.dominantBaseline = 'central';

            } );

            tickLabel.setAttribute( 'y', pos );
            this.setTickContent( tickLabel, value, options );

            if ( String( tickLabel.textContent ).length >= this.longestTick[ 1 ] ) {
              this.longestTick[ 0 ] = tickLabel;
              this.longestTick[ 1 ] = String( tickLabel.textContent ).length;

            }
          }

        },

        drawSpecifics: function() {
          // Place label correctly
          //this.label.setAttribute('x', (this.getMaxPx() - this.getMinPx()) / 2);

          this.label.setAttribute( 'transform', 'translate(' + ( ( this.left ? 1 : -1 ) * ( -this.widthHeightTick - 10 - 5 ) ) + ', ' + ( Math.abs( this.getMaxPx() + this.getMinPx() ) / 2 ) + ') rotate(-90)' );

          if ( this.getLabelColor() !== 'black' ) {
            this.label.setAttribute( 'fill', this.getLabelColor() );
          }

          this.labelTspan.textContent = this.getLabel();

          if ( !this.left ) {
            this.labelTspan.style.dominantBaseline = 'hanging';
            this.expTspan.style.dominantBaseline = 'hanging';
            this.expTspanExp.style.dominantBaseline = 'hanging';

            this.unitTspan.style.dominantBaseline = 'hanging';
            this.preunitTspan.style.dominantBaseline = 'hanging';

          }

          this.line.setAttribute( 'y1', this.getMinPx() );
          this.line.setAttribute( 'y2', this.getMaxPx() );
          this.line.setAttribute( 'x1', 0 );
          this.line.setAttribute( 'x2', 0 );

          this.line.setAttribute( 'stroke', this.getAxisColor() );

        },

        _setShift: function() {

          if ( !this.getShift() || !this.graph.getWidth() ) {
            return;
          }

          var xshift = this.floating ? this.getShift() : ( this.isLeft() ? this.getShift() : this.graph.getWidth() - this.graph.getPaddingRight() - this.graph.getPaddingLeft() - this.getShift() );
          this.group.setAttribute( 'transform', 'translate( ' + xshift + ' 0 )' );
        },

        isLeft: function() {
          return this.left;
        },

        isRight: function() {
          return !this.left;
        },

        isFlipped: function() {
          return !this.options.flipped;
        },

        _draw0Line: function( px ) {

          if ( !this._0line ) {
            this._0line = document.createElementNS( this.graph.ns, 'line' );
          }

          this._0line.setAttribute( 'y1', px );
          this._0line.setAttribute( 'y2', px );

          this._0line.setAttribute( 'x1', 0 );
          this._0line.setAttribute( 'x2', this.graph.getDrawingWidth() );

          this._0line.setAttribute( 'stroke', 'black' );
          this.groupGrids.appendChild( this._0line );
        },

        handleMouseMoveLocal: function( x, y, e ) {
          y -= this.graph.getPaddingTop();
          this.mouseVal = this.getVal( y );
        },

        /**
         * Scales the axis with respect to the series contained in an x axis
         * @memberof GraphYAxis.prototype
         * @param {GraphAxis} [ axis = graph.getXAxis() ] - The X axis to use as a reference
         * @param {GraphSerie} [ excludeSerie ] - A serie to exclude
         * @param {Number} [ start = xaxis.getCurrentMin() ] - The start of the boundary
         * @param {Number} [ end = xaxis.getCurrentMax() ] - The end of the boundary
         * @param {Boolean} [ min = true ] - Adapt the min
         * @param {Boolean} [ max = true ] - Adapt the max
         * @returns {GraphAxis} The current axis
         */
        scaleToFitAxis: function( axis, excludeSerie, start, end, min, max ) {
          //console.log( axis instanceof GraphAxis );
          if ( !axis || !axis.isX() ) {
            axis = this.graph.getXAxis();
          }

          if ( isNaN( start ) ) {
            start = axis.getCurrentMin();
          }

          if ( isNaN( end ) ) {
            end = axis.getCurrentMax();
          }

          if ( min === undefined ) {
            min = true;
          }

          if ( max === undefined ) {
            max = true;
          }

          if ( typeof excludeSerie == "number" ) {
            end = start;
            start = excludeSerie;
            excludeSerie = false;
          }

          var maxV = -Infinity,
            minV = Infinity,
            j = 0;

          for ( var i = 0, l = this.graph.series.length; i < l; i++ ) {

            if ( !this.graph.series[ i ].isShown() ) {
              continue;
            }

            if ( this.graph.series[ i ] == excludeSerie ) {
              continue;
            }

            if ( !( this.graph.series[ i ].getXAxis() == axis ) || ( this.graph.series[ i ].getYAxis() !== this ) ) {
              continue;
            }

            j++;

            maxV = max ? Math.max( maxV, this.graph.series[ i ].getMax( start, end ) ) : 0;
            minV = min ? Math.min( minV, this.graph.series[ i ].getMin( start, end ) ) : 0;
          }

          if ( j == 0 ) {

            this.setMinMaxToFitSeries(); // No point was found

          } else {

            // If we wanted originally to resize min and max. Otherwise we use the current value
            minV = min ? minV : this.getCurrentMin();
            maxV = max ? maxV : this.getCurrentMax();

            var interval = maxV - minV;

            minV -= ( this.options.axisDataSpacing.min * interval );
            maxV += ( this.options.axisDataSpacing.max * interval );

            this._doZoomVal( minV, maxV );
          }

          return this;
        },

        setMinMaxFlipped: function() {

          var interval = this.maxPx - this.minPx;
          var maxPx = this.maxPx - interval * this.options.span[ 0 ];
          var minPx = this.maxPx - interval * this.options.span[ 1 ];

          this.minPxFlipped = this.isFlipped() ? maxPx : minPx;
          this.maxPxFlipped = this.isFlipped() ? minPx : maxPx;

        }

      } );

      return GraphYAxis;

    } )( build[ "./jquery" ], build[ "./graph.axis" ] );

    /* 
     * Build: new source file 
     * File name : graph.axis.broken
     * File path : /Users/normanpellet/Documents/Web/graph/src/graph.axis.broken.js
     */

    build[ './graph.axis.broken' ] = ( function( $ ) {
      /** @global */
      /** @ignore */

      "use strict";

      function GraphAxis() {}

      GraphAxis.prototype = {

        getNbTicksPrimary: function() {
          return this.options.nbTicksPrimary;
        },

        getNbTicksSecondary: function() {
          return this.options.nbTicksSecondary;
        },

        getBreakingSpacing: function() {
          return this.options.breakingSpacing || 5;
        },

        // [ [ 0, 10 ], [ 50, 100 ] ]
        setBrokenRanges: function( ranges ) {
          this.ranges = [];
          this._broken = true;
          var
            self = this,
            i = 0,
            l = ranges.length,
            total = 0;

          ranges.map( function( range ) {
            total += range[ 1 ] - range[ 0 ];
          } );

          ranges.map( function( range ) {

            self.ranges.push( {

              ratio: ( range[ 1 ] - range[ 0 ] ) / total,
              diff: range[ 1 ] - range[ 0 ],
              min: range[ 0 ],
              max: range[ 1 ],
              minPx: undefined,
              maxPx: undefined

            } );
          } );

          self.totalValRanges = total;
        },

        drawLinearTicksWrapper: function() {

          var nbIntervals = this.ranges.length - 1,
            availableDrawingPxs = ( this.maxPx - this.minPx ) - nbIntervals * this.getBreakingSpacing(),
            nbTicksPrimary = this.getNbTicksPrimary();

          var ticksPrimary = this.getUnitPerTick( availableDrawingPxs, nbTicksPrimary, this.totalValRanges );
          var nbSecondaryTicks = this.secondaryTicks();

          // We need to get here the width of the ticks to display the axis properly, with the correct shift
          return this.drawTicks( ticksPrimary, nbSecondaryTicks );
        },

        setTickLabelRatio: function( tickRatio ) {
          this.options.ticklabelratio = tickRatio;
        },

        drawTicks: function( primary, secondary ) {

          var self = this;
          var unitPerTick = primary[ 0 ];
          var minPx = this.getMinPx();
          var maxPx = this.getMaxPx();
          var last = minPx;
          var nbIntervals = this.ranges.length - 1;
          var availableDrawingPxs = ( this.getMaxPx() - this.getMinPx() ) - nbIntervals * this.getBreakingSpacing() * ( self.isFlipped() ? -1 : 1 );

          this.resetTicks();

          this.ranges.map( function( range, index ) {

            range.minPx = index == 0 ? minPx : last + self.getBreakingSpacing() * ( self.isFlipped() ? -1 : 1 );
            range.maxPx = range.minPx + availableDrawingPxs * range.ratio;

            last = range.maxPx;

            if ( index > 0 ) {
              if ( !range.brokenMin ) {
                range.brokenMin = self.createBrokenLine( range );
                self.group.appendChild( range.brokenMin );
              }
              self.placeBrokenLine( range, range.brokenMin, range.minPx );
            }

            if ( index < self.ranges.length - 1 ) {
              if ( !range.brokenMax ) {
                range.brokenMax = self.createBrokenLine( range );
                self.group.appendChild( range.brokenMax );
              }
              self.placeBrokenLine( range, range.brokenMax, range.maxPx );
            }

            var min = range.min,
              max = range.max,
              secondaryIncr,
              incrTick,
              subIncrTick,
              loop = 0,
              loop2 = 0;

            if ( secondary ) {
              secondaryIncr = unitPerTick / secondary;
            }

            incrTick = Math.floor( min / unitPerTick ) * unitPerTick;

            while ( incrTick < max ) {

              if ( secondary ) {
                subIncrTick = incrTick + secondaryIncr;
                while ( subIncrTick < incrTick + unitPerTick ) {

                  if ( subIncrTick < min || subIncrTick > max ) {
                    subIncrTick += secondaryIncr;
                    continue;
                  }

                  self.drawTick( subIncrTick, false, Math.abs( subIncrTick - incrTick - unitPerTick / 2 ) < 1e-4 ? 3 : 2 );
                  subIncrTick += secondaryIncr;
                }
              }

              if ( incrTick < min || incrTick > max ) {
                incrTick += primary[ 0 ];
                continue;
              }

              self.drawTick( incrTick, true, 4 );
              incrTick += primary[ 0 ];
            }
          } );

          this.widthHeightTick = this.getMaxSizeTick();
          return this.widthHeightTick;
        },

        secondaryTicks: function() {
          return this.options.nbTicksSecondary;
        },

        drawLogTicks: function() {
          return 0;
        },

        getPx: function( value ) {
          return this.getPos( value );
        },

        getPos: function( value ) {

          for ( var i = 0, l = this.ranges.length; i < l; i++ ) {
            if ( value <= this.ranges[ i ].max && value >= this.ranges[ i ].min ) {
              return ( value - this.ranges[ i ].min ) / ( this.ranges[ i ].diff ) * ( this.ranges[ i ].maxPx - this.ranges[ i ].minPx ) + this.ranges[ i ].minPx
            }
          }
        },

        getRelPx: function( value ) {
          return ( value / this.getCurrentInterval() ) * ( this.getMaxPx() - this.getMinPx() );
        },

        getRelVal: function( px ) {
          return px / ( ( this.maxPx - this.minPx ) - nbIntervals * this.getBreakingSpacing() ) * this.totalValRanges;
        },

        getVal: function( px ) {

          for ( var i = 0, l = this.ranges.length; i < l; i++ ) {
            if ( px <= this.ranges[ i ].maxPx && px >= this.ranges[ i ].minPx ) {
              return ( px - this.ranges[ i ].minPx ) / ( this.ranges[ i ].maxPx - this.ranges[ i ].minPx ) * ( this.ranges[ i ].max - this.ranges[ i ].min ) + this.ranges[ i ].min
            }
          }
        },

        sign: function( v ) {
          return v > 0 ? 1 : -1;
        },

        getBoundary: function( inRangeOf, value ) {

          for ( var i = 0, l = this.ranges.length; i < l; i++ ) {
            if ( inRangeOf <= this.ranges[ i ].max && inRangeOf >= this.ranges[ i ].min ) {
              // This range
              if ( value > this.ranges[ i ].max ) {
                return this.ranges[ i ].max;
              }

              return this.ranges[ i ].min;

              //return Math.abs( value - this.ranges[ i ].min ) / ( this.ranges[ i ].max - this.ranges[ i ].min );
            }
          }
        },

        getInRange: function( inRangeOf, value ) {
          for ( var i = 0, l = this.ranges.length; i < l; i++ ) {
            if ( inRangeOf <= this.ranges[ i ].max && inRangeOf >= this.ranges[ i ].min ) {
              // This range
              return ( value - this.ranges[ i ].min ) / ( this.ranges[ i ].diff ) * ( this.ranges[ i ].maxPx - this.ranges[ i ].minPx ) + this.ranges[ i ].minPx;

              return;
            }
          }

        },

        getRange: function( value ) {
          for ( var i = 0, l = this.ranges.length; i < l; i++ ) {
            if ( value <= this.ranges[ i ].max && value >= this.ranges[ i ].min ) {
              return [ i, ( value - this.ranges[ i ].min ) / ( this.ranges[ i ].diff ) * ( this.ranges[ i ].maxPx - this.ranges[ i ].minPx ) + this.ranges[ i ].minPx ]
            }
          }

          return [ undefined, undefined ];
        }
      };

      return GraphAxis;

    } )( build[ "./jquery" ] );

    /* 
     * Build: new source file 
     * File name : graph.axis.x.broken
     * File path : /Users/normanpellet/Documents/Web/graph/src/graph.axis.x.broken.js
     */

    build[ './graph.axis.x.broken' ] = ( function( $, GraphXAxis, GraphBrokenAxis ) {
      /** @global */
      /** @ignore */

      "use strict";

      function GraphXAxisBroken( graph, topbottom, options ) {
        this.init( graph, options );
        this.top = topbottom == 'top';
      }

      $.extend( GraphXAxisBroken.prototype, GraphXAxis.prototype, GraphBrokenAxis.prototype, {

        createBrokenLine: function( range ) {

          var line = document.createElementNS( this.graph.ns, 'line' );
          line.setAttribute( 'x1', '-3' );
          line.setAttribute( 'x2', '3' );
          line.setAttribute( 'y1', '-5' );
          line.setAttribute( 'y2', '5' );
          line.setAttribute( 'stroke', 'black' );

          return line;
        },

        placeBrokenLine: function( range, line, px ) {
          line.setAttribute( 'transform', 'translate(' + px + ', ' + 0 + ')' );
        }
      } );

      return GraphXAxisBroken;

    } )( build[ "./jquery" ], build[ "./graph.axis.x" ], build[ "./graph.axis.broken" ] );

    /* 
     * Build: new source file 
     * File name : graph.axis.y.broken
     * File path : /Users/normanpellet/Documents/Web/graph/src/graph.axis.y.broken.js
     */

    build[ './graph.axis.y.broken' ] = ( function( $, GraphYAxis, GraphBrokenAxis ) {
      /** @global */
      /** @ignore */

      "use strict";

      function GraphYAxisBroken( graph, leftright, options ) {

        this.init( graph, options );

        this.leftright = leftright;
        this.left = leftright == 'left';

      }

      $.extend( GraphYAxisBroken.prototype, GraphYAxis.prototype, GraphBrokenAxis.prototype, {

        createBrokenLine: function( range ) {

          var line = document.createElementNS( this.graph.ns, 'line' );
          line.setAttribute( 'x1', '-5' );
          line.setAttribute( 'x2', '5' );
          line.setAttribute( 'y1', '-3' );
          line.setAttribute( 'y2', '3' );
          line.setAttribute( 'stroke', 'black' );

          return line;
        },

        placeBrokenLine: function( range, line, px ) {
          line.setAttribute( 'transform', 'translate(' + 0 + ', ' + px + ')' );
        }

      } );

      return GraphYAxisBroken;

    } )( build[ "./jquery" ], build[ "./graph.axis.y" ], build[ "./graph.axis.broken" ] );

    /* 
     * Build: new source file 
     * File name : graph.axis.x.time
     * File path : /Users/normanpellet/Documents/Web/graph/src/graph.axis.x.time.js
     */

    build[ './graph.axis.x.time' ] = ( function( GraphAxis, util ) {
      /** @global */
      /** @ignore */

      "use strict";

      function GraphXAxis( graph, topbottom, options ) {

        this.wrapper = {
          1: document.createElementNS( graph.ns, 'g' ),
          2: document.createElementNS( graph.ns, 'g' )
        };
        this.groups = {
          1: [],
          2: []
        };

        var rect = document.createElementNS( graph.ns, 'rect' );
        rect.setAttribute( 'fill', '#c0c0c0' );
        rect.setAttribute( 'stroke', '#808080' );
        rect.setAttribute( 'height', '20' );
        rect.setAttribute( 'x', '0' );
        rect.setAttribute( 'y', '0' );

        this.rect = rect;

        this.wrapper[ 1 ].appendChild( this.rect );

        this.init( graph, options );

        this.group.appendChild( this.wrapper[ 1 ] );
        this.group.appendChild( this.wrapper[ 2 ] );

        this.wrapper[ 1 ].setAttribute( 'transform', 'translate( 0, 25 )' );
        this.wrapper[ 2 ].setAttribute( 'transform', 'translate( 0, 00 )' );
      }

      /*
       * Date Format 1.2.3
       * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
       * MIT license
       *
       * Includes enhancements by Scott Trenda <scott.trenda.net>
       * and Kris Kowal <cixar.com/~kris.kowal/>
       *
       * Accepts a date, a mask, or a date and a mask.
       * Returns a formatted version of the given date.
       * The date defaults to the current date/time.
       * The mask defaults to dateFormat.masks.default.
       */

      var dateFormat = function() {
        var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[WLloSZ]|"[^"]*"|'[^']*'/g,
          timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
          timezoneClip = /[^-+\dA-Z]/g,
          pad = function( val, len ) {
            val = String( val );
            len = len || 2;
            while ( val.length < len ) val = "0" + val;
            return val;
          },
          getWeek = function( d, f ) {
            var onejan = new Date( d[ f + 'FullYear' ](), 0, 1 );
            return Math.ceil( ( ( ( d - onejan ) / 86400000 ) + onejan[ f + 'Day' ]() + 1 ) / 7 );
          };

        // Regexes and supporting functions are cached through closure
        return function( date, mask, utc ) {
          var dF = dateFormat;

          // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
          if ( arguments.length == 1 && Object.prototype.toString.call( date ) == "[object String]" && !/\d/.test( date ) ) {
            mask = date;
            date = undefined;
          }

          // Passing date through Date applies Date.parse, if necessary
          date = date ? new Date( date ) : new Date;
          if ( isNaN( date ) ) throw SyntaxError( "invalid date:" + date );

          mask = String( dF.masks[ mask ] || mask || dF.masks[ "default" ] );

          // Allow setting the utc argument via the mask
          if ( mask.slice( 0, 4 ) == "UTC:" ) {
            mask = mask.slice( 4 );
            utc = true;
          }

          var _ = utc ? "getUTC" : "get",
            d = date[ _ + "Date" ](),
            D = date[ _ + "Day" ](),
            m = date[ _ + "Month" ](),
            y = date[ _ + "FullYear" ](),
            H = date[ _ + "Hours" ](),
            M = date[ _ + "Minutes" ](),
            s = date[ _ + "Seconds" ](),
            L = date[ _ + "Milliseconds" ](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
              d: d,
              dd: pad( d ),
              ddd: dF.i18n.dayNames[ D ],
              dddd: dF.i18n.dayNames[ D + 7 ],
              m: m + 1,
              mm: pad( m + 1 ),
              mmm: dF.i18n.monthNames[ m ],
              mmmm: dF.i18n.monthNames[ m + 12 ],
              yy: String( y ).slice( 2 ),
              yyyy: y,
              h: H % 12 || 12,
              hh: pad( H % 12 || 12 ),
              H: H,
              HH: pad( H ),
              M: M,
              MM: pad( M ),
              s: s,
              ss: pad( s ),
              l: pad( L, 3 ),
              L: pad( L > 99 ? Math.round( L / 10 ) : L ),
              t: H < 12 ? "a" : "p",
              tt: H < 12 ? "am" : "pm",
              T: H < 12 ? "A" : "P",
              TT: H < 12 ? "AM" : "PM",
              Z: utc ? "UTC" : ( String( date ).match( timezone ) || [ "" ] ).pop().replace( timezoneClip, "" ),
              o: ( o > 0 ? "-" : "+" ) + pad( Math.floor( Math.abs( o ) / 60 ) * 100 + Math.abs( o ) % 60, 4 ),
              S: [ "th", "st", "nd", "rd" ][ d % 10 > 3 ? 0 : ( d % 100 - d % 10 != 10 ) * d % 10 ],
              W: getWeek( date, _ ),
            };

          return mask.replace( token, function( $0 ) {
            return $0 in flags ? flags[ $0 ] : $0.slice( 1, $0.length - 1 );
          } );
        };
      }();

      // Some common format strings
      dateFormat.masks = {
        "default": "ddd mmm dd yyyy HH:MM:ss",
        shortDate: "m/d/yy",
        mediumDate: "mmm d, yyyy",
        longDate: "mmmm d, yyyy",
        fullDate: "dddd, mmmm d, yyyy",
        shortTime: "h:MM TT",
        mediumTime: "h:MM:ss TT",
        longTime: "h:MM:ss TT Z",
        isoDate: "yyyy-mm-dd",
        isoTime: "HH:MM:ss",
        isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
        isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
      };

      // Internationalization strings
      dateFormat.i18n = {
        dayNames: [
          "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
          "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        ],
        monthNames: [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
          "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
        ]
      };

      /* END DATE FORMAT */

      function getClosestIncrement( value, basis ) {
        return Math.round( value / basis ) * basis;
      }

      function roundDate( date, format ) {

        switch ( format.unit ) {

          case 's': // Round at n hour

            date.setSeconds( getClosestIncrement( date.getSeconds(), format.increment ) );
            date.setMilliseconds( 0 );

            break;

          case 'i': // Round at n hour

            date.setMinutes( getClosestIncrement( date.getMinutes(), format.increment ) );
            date.setSeconds( 0 );
            date.setMilliseconds( 0 );

            break;

          case 'h': // Round at n hour

            date.setHours( getClosestIncrement( date.getHours(), format.increment ) );

            date.setMinutes( 0 );
            date.setSeconds( 0 );
            date.setMilliseconds( 0 );

            break;

          case 'd':

            date.setMinutes( 0 );
            date.setSeconds( 0 );
            date.setMilliseconds( 0 );
            date.setHours( 0 );

            date.setDate( getClosestIncrement( date.getDate(), format.increment ) );

            break;

          case 'm':

            date.setMinutes( 0 );
            date.setSeconds( 0 );
            date.setMilliseconds( 0 );
            date.setHours( 0 );
            date.setDate( 1 );

            date.setMonth( getClosestIncrement( date.getMonth(), format.increment ) );

            break;

          case 'y':

            date.setMinutes( 0 );
            date.setSeconds( 0 );
            date.setMilliseconds( 0 );
            date.setHours( 0 );
            date.setDate( 1 );
            date.setMonth( 0 );

            //date.setYear( getClosest( date.getDate(), format.increment ) );

            break;

          default:
            throw "Date format not recognized";
            break;
        }

        return date;
      }

      function incrementDate( date, format ) {

        switch ( format.unit ) {

          case 's':

            date.setSeconds( date.getSeconds() + format.increment );
            date.setMilliseconds( 0 );

            break;

          case 'i':

            date.setMinutes( date.getMinutes() + format.increment );
            date.setSeconds( 0 );
            date.setMilliseconds( 0 );

            break;

          case 'h': // Round at n hour

            date.setHours( date.getHours() + format.increment );
            date.setMinutes( 0 );
            date.setSeconds( 0 );
            date.setMilliseconds( 0 );

            break;

          case 'd':

            date.setDate( date.getDate() + format.increment );
            date.setMinutes( 0 );
            date.setSeconds( 0 );
            date.setMilliseconds( 0 );
            date.setHours( 0 );

            break;

          case 'm':

            date.setMonth( date.getMonth() + format.increment );
            date.setMinutes( 0 );
            date.setSeconds( 0 );
            date.setMilliseconds( 0 );
            date.setHours( 0 );
            date.setDate( 1 );

            break;

          case 'y':

            date.setFullYear( date.getFullYear() + format.increment );

            date.setMinutes( 0 );
            date.setSeconds( 0 );
            date.setMilliseconds( 0 );
            date.setHours( 0 );
            date.setDate( 1 );
            date.setMonth( 0 );

            break;

          default:
            throw "Date format not recognized";
            break;
        }

        return date;
      }

      function getGroup( axis, level, number ) {

        if ( axis.groups[ level ][ number ] ) {
          axis.groups[ level ][ number ].group.setAttribute( 'display', 'block' );
          return axis.groups[ level ][ number ];
        }

        var g = {

          group: document.createElementNS( axis.graph.ns, 'g' ),
          text: document.createElementNS( axis.graph.ns, 'text' )
        };

        var line = document.createElementNS( axis.graph.ns, 'line' );

        line.setAttribute( 'stroke', 'black' );
        line.setAttribute( 'y1', 0 );
        switch ( level ) {

          case 2:

            line.setAttribute( 'y2', 6 );
            g.text.setAttribute( 'y', 15 );

            g.line = line;

            g.group.appendChild( g.line );
            break;

          case 1:

            line.setAttribute( 'y2', 20 );
            g.text.setAttribute( 'y', 10 );

            g.line1 = line;
            g.line2 = line.cloneNode();

            g.group.appendChild( g.line1 );
            g.group.appendChild( g.line2 );

            break;
        }

        g.text.setAttribute( 'text-anchor', 'middle' );
        g.text.setAttribute( 'dominant-baseline', 'middle' );

        g.group.appendChild( g.text );

        axis.getWrapper( level ).appendChild( g.group );

        return axis.groups[ level ][ number ] = g;
      }

      function hideGroups( axis, level, from ) {

        for ( ; from < axis.groups[ level ].length; from++ ) {

          hideGroup( axis.groups[ level ][ from ] )
        }
      }

      function hideGroup( group ) {
        group.group.setAttribute( 'display', 'none' );
      }

      function getDateText( date, format ) {

        return dateFormat( date, format );
      }

      function renderGroup( level, group, text, minPx, maxPx, x1, x2 ) {

        switch ( level ) {

          case 1:

            var x1B = Math.max( minPx, Math.min( maxPx, x1 ) ),
              x2B = Math.max( minPx, Math.min( maxPx, x2 ) );

            if ( isNaN( x2B ) || isNaN( x1B ) ) {
              return;
            }

            group.line1.setAttribute( 'x1', x1B );
            group.line2.setAttribute( 'x1', x2B );

            group.line1.setAttribute( 'x2', x1B );
            group.line2.setAttribute( 'x2', x2B );

            group.text.setAttribute( 'x', ( x1B + x2B ) / 2 );

            while ( text.length * 8 > x2B - x1B ) {

              text = text.substr( 0, text.length - 2 ) + ".";

              if ( text.length == 1 ) {
                text = "";
                break;
              }
            }

            group.text.textContent = text;
            break;

          case 2:

            if ( x1 < minPx || x1 > maxPx ) {

              hideGroup( group );
              return;
            }

            group.line.setAttribute( 'x1', x1 );
            group.line.setAttribute( 'x2', x1 );
            group.text.setAttribute( 'x', x1 );
            group.text.textContent = text;

            break;
        }

      }

      GraphXAxis.prototype = new GraphAxis();

      GraphXAxis.prototype.draw = function() { // Redrawing of the axis
        var visible;

        this.drawInit();

        this.cacheCurrentMax();
        this.cacheCurrentMin();

        if ( this.currentAxisMin == undefined || this.currentAxisMax == undefined ) {
          this.setMinMaxToFitSeries( true ); // We reset the min max as a function of the series

        }

        this.line.setAttribute( 'x1', this.getMinPx() );
        this.line.setAttribute( 'x2', this.getMaxPx() );
        this.line.setAttribute( 'y1', 0 );
        this.line.setAttribute( 'y2', 0 );

        var widthPx = this.maxPx - this.minPx;
        var widthTime = this.getCurrentInterval();

        var timePerPx = widthTime / widthPx;

        var maxVal = this.getCurrentMax();
        var minVal = this.getCurrentMin();

        this.rect.setAttribute( 'width', widthPx );
        this.rect.setAttribute( 'x', this.minPx );

        if ( !maxVal || !minVal ) {
          return 0;
        }

        var axisFormat = [

          {

            threshold: 20,
            increments: {

              1: {
                increment: 1, // 1 minute
                unit: 'i',
                format: 'HH"h"MM (dd/mm/yy)'
              },

              2: { // 10 seconds
                increment: 1,
                unit: 's',
                format: 'MM:ss"s"'
              }
            }
          },

          {

            threshold: 50,
            increments: {

              1: {
                increment: 1, // 1 minute
                unit: 'i',
                format: 'HH"h"MM (dd/mm/yy)'
              },

              2: { // 2 seconds
                increment: 2,
                unit: 's',
                format: 'MM:ss"s"'
              }
            }
          },

          {

            threshold: 100,
            increments: {

              1: {
                increment: 1, // 1 minute
                unit: 'i',
                format: 'HH"h"MM (dd/mm/yy)'
              },

              2: { // 5 seconds
                increment: 5,
                unit: 's',
                format: 'MM:ss"s"'
              }
            }
          },

          {

            threshold: 600,
            increments: {

              1: {
                increment: 10, // 1 minute
                unit: 'i',
                format: 'HH"h"MM (dd/mm/yy)'
              },

              2: { // 10 seconds
                increment: 30,
                unit: 's',
                format: 'MM:ss"s"'
              }
            }
          },

          { // One day

            threshold: 1000,
            increments: {

              1: { // 1h
                increment: 1,
                unit: 'h',
                format: 'HH"h"MM (dd/mm/yy)'
              },

              2: { // 10 minutes
                increment: 10,
                unit: 'i',
                format: 'MM"min"'
              }
            }
          },

          { // One day

            threshold: 1500,
            increments: {

              1: {
                increment: 1, // One day on the first axis
                unit: 'd',
                format: 'dd/mm/yyyy'
              },

              2: {
                increment: 1,
                unit: 'i',
                format: 'H"h"MM'
              }
            }
          },

          { // One day

            threshold: 3000,
            increments: {

              1: {
                increment: 1, // One day on the first axis
                unit: 'd',
                format: 'dd/mm/yyyy'
              },

              2: {
                increment: 2,
                unit: 'i',
                format: 'H"h"MM'
              }
            }
          },

          { // One day

            threshold: 8000,
            increments: {

              1: {
                increment: 1, // One day on the first axis
                unit: 'd',
                format: 'dd/mm/yyyy'
              },

              2: {
                increment: 10,
                unit: 'i',
                format: 'H"h"MM'
              }
            }
          },

          { // One day

            threshold: 26400,
            increments: {

              1: {
                increment: 1, // One day on the first axis
                unit: 'd',
                format: 'dd/mm/yyyy'
              },

              2: {
                increment: 20,
                unit: 'i',
                format: 'H"h"MM'
              }
            }
          },

          { // One day

            threshold: 86400,
            increments: {

              1: {
                increment: 1, // One day on the first axis
                unit: 'd',
                format: 'dd/mm/yyyy'
              },

              2: {
                increment: 1,
                unit: 'h',
                format: 'H"h"MM'
              }
            }
          },

          { // One day

            threshold: 200000,
            increments: {

              1: {

                increment: 1,
                unit: 'd',
                format: 'dd/mm/yyyy'
              },

              2: {

                increment: 2, // One day on the first axis
                unit: 'h',
                format: 'H"h"MM'
              }
            }
          },

          { // One day

            threshold: 400000,
            increments: {

              1: {

                increment: 1,
                unit: 'd',
                format: 'dd/mm/yyyy'
              },

              2: {

                increment: 6, // One day on the first axis
                unit: 'h',
                format: 'H"h"MM'
              }
            }
          },

          { // One day

            threshold: 1400000,
            increments: {

              1: {

                increment: 1,
                unit: 'd',
                format: 'dd/mm/yyyy'
              },

              2: {

                increment: 12, // One day on the first axis
                unit: 'h',
                format: 'HH"h"MM'
              }
            }
          },

          { // One day

            threshold: 6400000,
            increments: {

              1: {

                increment: 1,
                unit: 'm',
                format: 'mmmm yyyy'
              },

              2: {

                increment: 1, // One day on the first axis
                unit: 'd',
                format: 'dd'
              }
            }
          },

          { // One day

            threshold: 12400000,
            increments: {

              1: {

                increment: 1,
                unit: 'm',
                format: 'mmmm yyyy'
              },

              2: {

                increment: 2, // One day on the first axis
                unit: 'd',
                format: 'dd'
              }
            }
          },

          { // One day

            threshold: 86400000 * 0.5,
            increments: {

              1: {

                increment: 1,
                unit: 'm',
                format: 'mmmm yyyy'
              },

              2: {

                increment: 7, // One day on the first axis
                unit: 'd',
                format: 'dd'
              }
            }
          },

          { // One day

            threshold: 86400000 * 0.8,
            increments: {

              1: {

                increment: 1,
                unit: 'm',
                format: 'mmmm yyyy'
              },

              2: {

                increment: 15, // One day on the first axis
                unit: 'd',
                format: 'dd'
              }
            }
          },

          { // One month

            threshold: 86400000 * 1,
            increments: {

              1: {
                increment: 1,
                unit: 'y',
                format: 'yyyy'
              },

              2: {

                increment: 3, // One day on the first axis
                unit: 'm',
                format: 'mm/yyyy'
              }
            }
          },

          { // One month

            threshold: 86400000 * 2,
            increments: {

              1: {

                increment: 1,
                unit: 'y',
                format: 'yyyy'
              },

              2: {

                increment: 4, // One day on the first axis
                unit: 'm',
                format: 'mm/yyyy'
              }
            }
          },

          { // One month

            threshold: 86400000 * 10,
            increments: {

              1: {

                increment: 1,
                unit: 'y',
                format: 'yyyy'
              },

              2: {

                increment: 6, // One day on the first axis
                unit: 'm',
                format: 'mm/yyyy'
              }
            }
          },

          { // One month

            threshold: 86400000 * 12,
            increments: {

              1: {

                increment: 1,
                unit: 'y',
                format: 'yyyy'
              },

              2: {

                increment: 1, // One day on the first axis
                unit: 'y',
                format: 'yyyy'
              }
            }
          },

        ];

        var currentFormat;

        for ( i = 0; i < axisFormat.length; i++ ) {

          if ( axisFormat[ i ].threshold > timePerPx ) {
            currentFormat = axisFormat[ i ];

            break;
          }

        }

        if ( !currentFormat ) {
          currentFormat = axisFormat[ axisFormat.length - 1 ];
        }

        var xVal1,
          xVal2,
          level = 0,
          dateFirst,
          currentDate,
          text,
          group,
          i;

        for ( level = 1; level <= 2; level++ ) {

          if ( !util.isNumeric( minVal ) ) {
            hideGroups( this, level, 0 );
            break;
          }

          dateFirst = new Date( minVal );

          currentDate = roundDate( dateFirst, currentFormat.increments[ level ] );

          i = 0;

          do {
            /** @ignore */
            text = getDateText( currentDate, currentFormat.increments[ level ].format );
            group = getGroup( this, level, i );

            xVal1 = this.getPx( currentDate.getTime() );
            currentDate = incrementDate( currentDate, currentFormat.increments[ level ] );
            xVal2 = this.getPx( currentDate.getTime() );

            renderGroup( level, group, text, this.getMinPx(), this.getMaxPx(), xVal1, xVal2 );

            i++;
            if ( i > 100 ) {
              break;
            }
          } while ( currentDate.getTime() < maxVal );

          hideGroups( this, level, i );
        }

      };

      GraphXAxis.prototype.isX = function() {
        return true
      };

      GraphXAxis.prototype.getWrapper = function( level ) {
        return this.wrapper[ level ]
      };

      GraphXAxis.prototype.setShift = function( shift, totalDimension ) {
        this.shift = shift;
        this.group.setAttribute( 'transform', 'translate(0 ' + ( this.top ? this.shift : ( this.graph.getDrawingHeight() - this.shift ) ) + ')' )
      };

      GraphXAxis.prototype.getAxisPosition = function() {
        return 60;
      };

      GraphXAxis.prototype.setMinMaxFlipped = function() {

        var interval = this.maxPx - this.minPx;
        var maxPx = interval * this.options.span[ 1 ] + this.minPx;
        var minPx = interval * this.options.span[ 0 ] + this.minPx;

        this.minPxFlipped = this.isFlipped() ? maxPx : minPx;
        this.maxPxFlipped = this.isFlipped() ? minPx : maxPx;
      };

      return GraphXAxis;
    } )( build[ "./graph.axis" ], build[ "./graph.util" ] );

    /* 
     * Build: new source file 
     * File name : graph.legend
     * File path : /Users/normanpellet/Documents/Web/graph/src/graph.legend.js
     */

    build[ './graph.legend' ] = ( function( GraphPosition, util ) {
      /** @global */
      /** @ignore */

      /** 
       * Default legend configuration
       * @name LegendOptionsDefault
       * @object
       * @static
       * @prop {Boolean} frame - <code>true</code> to display a frame around the legend
       * @prop {Number} frameWidth - The width of the frame stroke
       * @prop {String} frameColor - The stroke color of the frame
       * @prop {String} backgroundColor - The background color of the frame
       * @prop {Number} paddingLeft - The left padding
       * @prop {Number} paddingRight - The right padding
       * @prop {Number} paddingTop - The top padding
       * @prop {Number} paddingBottom - The bottom padding
       * @prop {Boolean} shapesToggleable - <code>true</code> to toggle the shapes linked to serie with its status (shown or hidden)
       * @prop {Boolean} isSerieHideable - <code>true</code> to allow series to be hidden through the legend
       * @prop {Boolean} isSerieSelectable - <code>true</code> to allow series to be selected through the legend
       */
      var legendDefaults = {

        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        frame: true,
        frameWidth: 1,
        frameColor: 'black',
        paddingTop: 10,
        paddingLeft: 10,
        paddingBottom: 10,
        paddingRight: 10,
        frameRounding: 3,

        movable: false,

        shapesToggleable: true,
        isSerieHideable: true,
        isSerieSelectable: true

      };

      /** 
       * Legend constructor
       * @class Legend
       * @private
       * @example var legend = graph.makeLegend( {} );
       */
      var Legend = function( graph, options ) {

        this.options = $.extend( {}, legendDefaults, options );

        this.graph = graph;
        this.svg = document.createElementNS( this.graph.ns, 'g' );
        this.subG = document.createElementNS( this.graph.ns, 'g' );

        this.groups = [];
        this.rect = document.createElementNS( this.graph.ns, 'rect' );
        this.rectBottom = document.createElementNS( this.graph.ns, 'rect' );

        this.rect.setAttribute( 'x', 0 );
        this.rect.setAttribute( 'y', 0 );

        this.rectBottom.setAttribute( 'x', 0 );
        this.rectBottom.setAttribute( 'y', 0 );

        this.series = false;

        this.svg.setAttribute( 'display', 'none' );
        this.pos = {
          x: undefined,
          y: undefined,
          transformX: 0,
          transformY: 0
        };

        this.setEvents();

        this.eyeId = util.guid();
        this.eyeCrossedId = util.guid();

        var eyeClosed = util.SVGParser( '<svg xmlns="http://www.w3.org/2000/svg"><symbol id="' + this.eyeCrossedId + '" viewBox="0 -256 1850 1850"><rect pointer-events="fill" fill="transparent" x="-256" y="0" width="2106" height="1850" /><g transform="matrix(1,0,0,-1,30.372881,1214.339)"><path d="m 555,201 78,141 q -87,63 -136,159 -49,96 -49,203 0,121 61,225 Q 280,812 128,576 295,318 555,201 z m 389,759 q 0,20 -14,34 -14,14 -34,14 -125,0 -214.5,-89.5 Q 592,829 592,704 q 0,-20 14,-34 14,-14 34,-14 20,0 34,14 14,14 14,34 0,86 61,147 61,61 147,61 20,0 34,14 14,14 14,34 z m 363,191 q 0,-7 -1,-9 Q 1201,954 991,576 781,198 675,9 l -49,-89 q -10,-16 -28,-16 -12,0 -134,70 -16,10 -16,28 0,12 44,87 Q 349,154 228.5,262 108,370 20,507 0,538 0,576 q 0,38 20,69 153,235 380,371 227,136 496,136 89,0 180,-17 l 54,97 q 10,16 28,16 5,0 18,-6 13,-6 31,-15.5 18,-9.5 33,-18.5 15,-9 31.5,-18.5 16.5,-9.5 19.5,-11.5 16,-10 16,-27 z m 37,-447 Q 1344,565 1265,450.5 1186,336 1056,286 l 280,502 q 8,-45 8,-84 z m 448,-128 q 0,-35 -20,-69 Q 1733,443 1663,362 1513,190 1315.5,95 1118,0 896,0 l 74,132 q 212,18 392.5,137 180.5,119 301.5,307 -115,179 -282,294 l 63,112 q 95,-64 182.5,-153 87.5,-89 144.5,-184 20,-34 20,-69 z" fill="#c0c0c0"></path></g></symbol></svg>' );
        //  var eyeClosed = util.SVGParser('<svg xmlns="http://www.w3.org/2000/svg"><symbol id="' + this.eyeId + '" viewBox="0 0 100 100"><rect fill="black" x="0" y="0" width="100" height="100" /></symbol></svg>');

        /* var eyeClosed = document.createElementNS( this.graph.ns, "symbol");
    eyeClosed.setAttribute('id', this.eyeId );
    eyeClosed.setAttribute("viewBox", '0 0 100 100');

    var rect = document.createElementNS( this.graph.ns, "rect" );
    rect.setAttribute('width', 100 );
    rect.setAttribute('height', 100 );
    rect.setAttribute('x', 0 );
    rect.setAttribute('y', 0 );
    rect.setAttribute('fill', 'black');
    eyeClosed.appendChild( rect );
*/
        var eye = util.SVGParser( '<svg xmlns="http://www.w3.org/2000/svg"><symbol id="' + this.eyeId + '" viewBox="0 -256 1850 1850"><rect pointer-events="fill" x="-256" y="0" fill="transparent" width="2106" height="1850" /><g transform="matrix(1,0,0,-1,30.372881,1259.8983)"><path d="m 1664,576 q -152,236 -381,353 61,-104 61,-225 0,-185 -131.5,-316.5 Q 1081,256 896,256 711,256 579.5,387.5 448,519 448,704 448,825 509,929 280,812 128,576 261,371 461.5,249.5 662,128 896,128 1130,128 1330.5,249.5 1531,371 1664,576 z M 944,960 q 0,20 -14,34 -14,14 -34,14 -125,0 -214.5,-89.5 Q 592,829 592,704 q 0,-20 14,-34 14,-14 34,-14 20,0 34,14 14,14 14,34 0,86 61,147 61,61 147,61 20,0 34,14 14,14 14,34 z m 848,-384 q 0,-34 -20,-69 Q 1632,277 1395.5,138.5 1159,0 896,0 633,0 396.5,139 160,278 20,507 0,542 0,576 q 0,34 20,69 140,229 376.5,368 236.5,139 499.5,139 263,0 499.5,-139 236.5,-139 376.5,-368 20,-35 20,-69 z" fill="#444444" /></g></symbol></svg>' );

        this.svg.appendChild( document.adoptNode( eye.documentElement ) );
        this.svg.appendChild( document.adoptNode( eyeClosed.documentElement ) );

        this.svg.appendChild( this.subG );

        this.applyStyle();
      };

      Legend.prototype = {

        /** 
         * Sets the position of the legend
         * @param {Position} position - the position to set the legend to versus the graph main axes ({@link Graph#getXAxis} and {@link Graph#getYAxis})
         * @param {String} alignToX - "right" or "left". References the legend right or left boundary using the position parameter
         * @param {String} alignToY - "top" or "bottom". References the legend top or bottom boundary using the position parameter
         * @example legend.setPosition( { x: 'max', y: '0px' }, 'right', 'top' ); // The rightmost side of the legend will at the maximum value of the axis, and will be positioned at the top
         * @memberof Legend.prototype
         */
        setPosition: function( position, alignToX, alignToY ) {

          if ( !position ) {
            return;
          }

          this.position = position;
          this.alignToX = alignToX;
          this.alignToY = alignToY;

        },

        setDraggable: function( bln ) {
          this.options.movable = bln;

        },

        setAutoPosition: function( position ) {

          if ( [ 'bottom', 'left', 'top', 'right' ].indexOf( ( position = position.toLowerCase() ) ) > -1 ) {
            this.autoPosition = position;
            return this;
          }

          this.autoPosition = false;
        },

        calculatePosition: function() {

          if ( !this.autoPosition ) {
            this.graph.graphingZone.appendChild( this.getDom() );
          } else {
            this.graph.getDom().appendChild( this.getDom() );
          }

          var series = this.series || this.graph.getSeries(),
            posX = 0,
            posY = this.options.paddingTop;

          for ( var i = 0, l = series.length; i < l; i++ ) {

            if ( !series[ i ].isInLegend() && !this.series ) {
              continue;
            }

            if ( this.autoPosition == 'bottom' || this.autoPosition == 'top' ) {

              var bbox = this.groups[ i ].getBBox();

              if ( posX + bbox.width > this.graph.getDrawingWidth() - this.options.paddingRight ) {
                posY += 16;
                posX = 0;
              }
            }

            this.groups[ i ].setAttribute( 'transform', "translate( " + posX + ", " + posY + ")" );

            if ( this.autoPosition == 'bottom' || this.autoPosition == 'top' ) {

              posX += bbox.width + 10;
              posY += 0;

            } else {

              posX = 0;
              posY += 16;
            }
          }

          var bbox = this.subG.getBBox();

          /* Independant on box position */
          this.width = bbox.width + this.options.paddingRight + this.options.paddingLeft;
          this.height = bbox.height + this.options.paddingBottom + this.options.paddingTop;

          this.rect.setAttribute( 'width', this.width );
          this.rect.setAttribute( 'height', this.height );
          this.rect.setAttribute( 'fill', 'none' );
          this.rect.setAttribute( 'pointer-events', 'fill' );

          this.rect.setAttribute( 'display', 'none' );

          if ( this.options.movable ) {
            this.rectBottom.style.cursor = "move";
          }

          this.rectBottom.setAttribute( 'width', this.width );
          this.rectBottom.setAttribute( 'height', this.height );

          this.rectBottom.setAttribute( 'x', bbox.x - this.options.paddingTop );
          this.rectBottom.setAttribute( 'y', bbox.y - this.options.paddingLeft );
          /* End independant on box position */

          this.position = this.position || {};

          switch ( this.autoPosition ) {

            case 'bottom':
              this.position.y = this.graph.getHeight() + "px";
              this.position.x = ( ( this.graph.getWidth() - this.width ) / 2 ) + "px";
              this.alignToY = "bottom";
              this.alignToX = false;
              break;

            case 'left':
              this.position.x = "6px";
              this.position.y = ( ( this.graph.getHeight() - this.height ) / 2 ) + "px";
              this.alignToX = "left";
              this.alignToY = false;
              break;

            case 'right':
              this.position.x = this.graph.getWidth() + "px";
              this.position.y = ( ( this.graph.getHeight() - this.height ) / 2 ) + "px";
              this.alignToX = "right";
              this.alignToY = false;
              break;

            case 'top':
              this.position.x = ( ( this.graph.getWidth() - this.width ) / 2 ) + "px";
              this.position.y = "10px";
              this.alignToY = "top";
              this.alignToX = false;
              break;
          }

          var pos = new GraphPosition( this.position ),
            alignToY = this.alignToY,
            alignToX = this.alignToX;

          pos = pos.compute( this.graph, this.graph.getXAxis(), this.graph.getYAxis() );

          if ( !pos ) {
            return;
          }

          if ( alignToX == "right" ) {
            pos.x -= this.width;
          }

          if ( alignToY == "bottom" ) {
            pos.y -= this.height;
          }

          this.pos.transformX = pos.x;
          this.pos.transformY = pos.y;

          this._setPosition();

          if ( this.autoPosition ) {
            switch ( this.autoPosition ) {

              case 'bottom':
                this.graph.options.paddingBottom = this.height + 10;
                break;

              case 'left':
                this.graph.options.paddingLeft = this.width + 5;
                break;

              case 'right':
                this.graph.options.paddingRight = this.width + 10;
                break;

              case 'top':
                this.graph.options.paddingTop = this.height + 14;
                break;
            }

            this.graph.updateGraphingZone();

          }
        },

        /** 
         * Updates the legend position and content
         * @memberof Legend.prototype
         */
        update: function() {

          var self = this;

          this.applyStyle();

          while ( this.subG.hasChildNodes() ) {
            this.subG.removeChild( this.subG.lastChild );
          }

          this.svg.insertBefore( this.rectBottom, this.svg.firstChild );

          var series = this.series || this.graph.getSeries(),
            line,
            text,
            g;

          if ( series.length > 0 ) {
            this.svg.setAttribute( 'display', 'block' );
          } else {
            return;
          }

          if ( this.autoPosition == 'bottom' || this.autoPosition == 'top' ) {
            var fullWidth = this.graph.getDrawingWidth();
          }

          var posX, posY;

          for ( var i = 0, l = series.length; i < l; i++ ) {

            if ( !series[ i ].isInLegend() && !this.series ) {
              continue;
            }

            ( function( j ) {

              var g, line, text, xPadding = 0;

              if ( this.autoPosition == 'bottom' || this.autoPosition == 'top' ) {
                var fullWidth = this.graph.getDrawingWidth();
              }

              g = document.createElementNS( self.graph.ns, 'g' );
              self.subG.appendChild( g );
              var line = series[ j ].getSymbolForLegend();
              var marker = series[ j ].getMarkerForLegend();
              var text = series[ j ].getTextForLegend();

              var dx = 35;

              if ( this.isHideable() ) {
                dx += 20;

                var eyeUse = document.createElementNS( self.graph.ns, "use" );
                eyeUse.setAttributeNS( 'http://www.w3.org/1999/xlink', "xlink:href", "#" + this.eyeId );
                eyeUse.setAttribute( "width", 15 );
                eyeUse.setAttribute( "height", 15 );
                eyeUse.setAttribute( "x", 35 );
                eyeUse.setAttribute( "y", -8 );

                eyeUse.addEventListener( "click", function( e ) {
                  e.stopPropagation();

                  var id;
                  if ( series[ j ].isShown() ) {
                    series[ j ].hide();
                    id = self.eyeCrossedId;
                  } else {
                    series[ j ].show();
                    id = self.eyeId;
                  }

                  eyeUse.setAttributeNS( 'http://www.w3.org/1999/xlink', "xlink:href", "#" + id );

                } );

              }

              text.setAttribute( 'transform', 'translate(' + dx + ', 3)' );

              g.appendChild( line );

              if ( series[ j ].getType() == "scatter" ) {
                line.setAttribute( 'transform', 'translate( 20, 0 )' );
              }

              if ( marker ) {
                g.appendChild( marker );
              }

              if ( eyeUse ) {
                g.appendChild( eyeUse );
              }

              g.appendChild( text );

              self.groups[ j ] = g;

              g.addEventListener( 'click', function( e ) {

                var serie = series[ j ];

                if ( self.isSelectable() && !serie.isSelected() ) {

                  self.graph.selectSerie( serie );
                } else {

                  self.graph.unselectSerie( serie );
                }

              } );

            } ).call( this, i );
          }

          this.svg.appendChild( this.rect );
          this.calculatePosition();
        },

        /** 
         * @memberof Legend.prototype
         * @return {Boolean} true or false depending if the series can be hidden or not
         */
        isHideable: function() {
          return this.options.isSerieHideable;
        },

        /** 
         * @memberof Legend.prototype
         * @return {Boolean} true or false depending if the series can be selected or not
         */
        isSelectable: function() {
          return this.options.isSerieSelectable;
        },

        /** 
         * @memberof Legend.prototype
         * @return {Boolean} true or false depending if the series can be t or not
         */
        isToggleShapes: function() {
          return this.options.shapesToggleable;
        },

        /** 
         * @memberof Legend.prototype
         * @return {SVGGroupElement} The SVG group element wrapping the legend
         */
        getDom: function() {
          return this.svg;
        },

        setEvents: function() {

          var self = this;
          var pos = this.pos;

          var mousedown = function( e ) {

            e.stopPropagation();

            if ( self.options.movable ) {
              pos.x = e.clientX;
              pos.y = e.clientY;

              e.preventDefault();
              self.mousedown = true;
              self.graph.elementMoving( self );

              self.rect.setAttribute( 'display', 'block' );
            }
          };

          var mousemove = function( e ) {
            self.handleMouseMove( e );
          };

          this.rectBottom.addEventListener( 'mousedown', mousedown );
          this.rectBottom.addEventListener( 'mousemove', mousemove );
          this.rect.addEventListener( 'mousemove', mousemove );
        },

        handleMouseUp: function( e ) {

          e.stopPropagation();
          e.preventDefault();
          this.mousedown = false;
          this.rect.setAttribute( 'display', 'none' );
          this.graph.elementMoving( false );
        },

        handleMouseMove: function( e ) {

          if ( !this.mousedown ) {
            return;
          }

          var pos = this.pos;

          var deltaX = e.clientX - pos.x;
          var deltaY = e.clientY - pos.y;

          pos.transformX += deltaX;
          pos.transformY += deltaY;

          pos.x = e.clientX;
          pos.y = e.clientY;

          e.stopPropagation();
          e.preventDefault();

          this._setPosition();
        },

        _setPosition: function() {

          var pos = this.pos;
          if ( !isNaN( pos.transformX ) && !isNaN( pos.transformY ) && pos.transformX !== false && pos.transformY !== false ) {
            this.svg.setAttribute( 'transform', 'translate(' + pos.transformX + ', ' + pos.transformY + ')' );
          }
        },

        /** 
         * Re-applies the legend style
         * @memberof Legend.prototype
         */
        applyStyle: function() {

          if ( this.options.frame ) {
            this.rectBottom.setAttribute( 'stroke', this.options.frameColor );
            this.rectBottom.setAttribute( 'stroke-width', this.options.frameWidth + "px" );
            this.rectBottom.setAttribute( 'rx', this.options.frameRounding );
            this.rectBottom.setAttribute( 'ry', this.options.frameRounding );
          }

          this.rectBottom.setAttribute( 'fill', this.options.backgroundColor );

        },

        /** 
         * Re-applies the legend style
         * @memberof Legend.prototype
         * @param {...(GraphSerie|GraphSerie[])} a serie or an array of series
         */
        fixSeries: function() {
          var series = [];

          if ( arguments[ 0 ] === false ) {
            this.series = false;
            this.update();
            return;
          }

          for ( var i = 0, l = arguments.length; i < l; i++ ) {
            if ( Array.isArray( arguments[ i ] ) ) {
              series = series.concat( arguments[ i ] );
            } else {
              series.push( arguments[ i ] );
            }
          }

          this.update();
          this.series = series;
        },

        fixSeriesAdd: function( serie ) {
          this.series = this.series || [];
          this.series.push( serie );
        }

      };

      return Legend;

    } )( build[ "./graph.position" ], build[ "./graph.util" ] );

    /* 
     * Build: new source file 
     * File name : plugins/graph.plugin
     * File path : /Users/normanpellet/Documents/Web/graph/src/plugins/graph.plugin.js
     */

    build[ './plugins/graph.plugin' ] = ( function( EventEmitter ) {
      /** @global */
      /** @ignore */

      /**
       * @class Plugin
       * @interface
       */
      var Plugin = function() {};

      Plugin.prototype = new EventEmitter();

      /**
       * Init function called by jsGraph on load
       * @memberof Plugin
       */
      Plugin.prototype.init = function() {};

      /**
       * Handles the mousedown event from jsGraph
       * @param {Graph} graph - The graph instance
       * @param {Number} x - The x position in px
       * @param {Number} y - The y position in px
       * @param {Event} e - The original event
       * @param {SVGElement} target - The target element
       * @memberof Plugin
       */
      Plugin.prototype.onMouseDown = function() {};

      /**
       * Handles the mouseup event from jsGraph
       * @param {Graph} graph - The graph instance
       * @param {Number} x - The x position in px
       * @param {Number} y - The y position in px
       * @param {Event} e - The original event
       * @param {SVGElement} target - The target element
       * @memberof Plugin
       */
      Plugin.prototype.onMouseUp = function() {};

      /**
       * Handles the mousemove event from jsGraph
       * @param {Graph} graph - The graph instance
       * @param {Number} x - The x position in px
       * @param {Number} y - The y position in px
       * @param {Event} e - The original event
       * @param {SVGElement} target - The target element
       * @memberof Plugin
       */
      Plugin.prototype.onMouseMove = function() {};

      return Plugin;
    } )( build[ "./dependencies/eventEmitter/EventEmitter" ] );

    /* 
     * Build: new source file 
     * File name : plugins/graph.plugin.drag
     * File path : /Users/normanpellet/Documents/Web/graph/src/plugins/graph.plugin.drag.js
     */

    build[ './plugins/graph.plugin.drag' ] = ( function( Plugin ) {
      /** @global */
      /** @ignore */

      /** 
       * Constructor for the drag plugin. Do not use this constructor directly.
       * @class PluginDrag
       * @implements Plugin
       */
      var PluginDrag = function() {};

      PluginDrag.prototype = new Plugin();

      PluginDrag.prototype.defaults = {

        dragX: true,
        dragY: true,
        persistanceX: false,
        persistanceY: false
      };

      /**
       * @memberof PluginDrag
       * @private
       */
      PluginDrag.prototype.init = function( graph ) {

        this.graph = graph;
        this.time = null;
        this.totaltime = 2000;

        // x = ( 1 / 2 a t^2 + v0 * t * x0 );

      };

      /**
       * @memberof PluginDrag
       * @private
       */
      PluginDrag.prototype.onMouseDown = function( graph, x, y, e, target ) {
        this._draggingX = x;
        this._draggingY = y;

        this._lastDraggingX = this._draggingX;
        this._lastDraggingY = this._draggingY;

        this.stopAnimation = true;

        this.moved = false;

        return true;
      };

      /**
       * @memberof PluginDrag
       * @private
       */
      PluginDrag.prototype.onMouseMove = function( graph, x, y, e, target ) {

        var deltaX = x - this._draggingX;
        var deltaY = y - this._draggingY;

        if ( this.options.dragX ) {
          graph._applyToAxes( function( axis ) {
            axis.setCurrentMin( axis.getVal( axis.getMinPx() - deltaX ) );
            axis.setCurrentMax( axis.getVal( axis.getMaxPx() - deltaX ) );
          }, false, true, false );
        }

        if ( this.options.dragY ) {

          graph._applyToAxes( function( axis ) {
            axis.setCurrentMin( axis.getVal( axis.getMinPx() - deltaY ) );
            axis.setCurrentMax( axis.getVal( axis.getMaxPx() - deltaY ) );
          }, false, false, true );
        }

        this._lastDraggingX = this._draggingX;
        this._lastDraggingY = this._draggingY;

        this._draggingX = x;
        this._draggingY = y;

        this.moved = true;

        this.time = Date.now();

        this.emit( "dragging" );

        graph.draw( true );

      };

      PluginDrag.prototype.onMouseUp = function( graph, x, y, e, target ) {

        var dt = ( Date.now() - this.time );

        if ( x == this._lastDraggingX || y == this._lastDraggingY ) {

          if ( this.moved ) {
            this.emit( "dragged" );
          }

          return;
        }

        this.speedX = ( x - this._lastDraggingX ) / dt;
        this.speedY = ( y - this._lastDraggingY ) / dt;

        if ( isNaN( this.speedX ) || isNaN( this.speedY ) ) {
          this.emit( "dragged" );
          return;
        }

        graph._applyToAxes( function( axis ) {
          axis._pluginDragMin = axis.getCurrentMin();
          axis._pluginDragMax = axis.getCurrentMax();
        }, false, true, true );

        this.stopAnimation = false;
        this.accelerationX = -this.speedX / this.totaltime;
        this.accelerationY = -this.speedY / this.totaltime;

        if ( this.options.persistanceX || this.options.persistanceY ) {

          this._persistanceMove( graph );

        } else {

          this.emit( "dragged" );
        }

      };

      PluginDrag.prototype._persistanceMove = function( graph ) {

        var self = this;

        if ( self.stopAnimation ) {
          self.emit( "dragged" );
          return;
        }

        window.requestAnimationFrame( function() {

          var dt = Date.now() - self.time;
          var dx = ( 0.5 * self.accelerationX * dt + self.speedX ) * dt;
          var dy = ( 0.5 * self.accelerationY * dt + self.speedY ) * dt;

          if ( self.options.persistanceX ) {

            graph._applyToAxes( function( axis ) {

              axis.setCurrentMin( -axis.getRelVal( dx ) + axis._pluginDragMin );
              axis.setCurrentMax( -axis.getRelVal( dx ) + axis._pluginDragMax );

              axis.cacheCurrentMin();
              axis.cacheCurrentMax();
              axis.cacheInterval();

            }, false, true, false );
          }

          if ( self.options.persistanceY ) {

            graph._applyToAxes( function( axis ) {

              axis.setCurrentMin( -axis.getRelVal( dy ) + axis._pluginDragMin );
              axis.setCurrentMax( -axis.getRelVal( dy ) + axis._pluginDragMax );

              axis.cacheCurrentMin();
              axis.cacheCurrentMax();
              axis.cacheInterval();

            }, false, false, true );
          }

          graph.draw();

          if ( dt < self.totaltime ) {
            self.emit( "dragging" );
            self._persistanceMove( graph );
          } else {
            self.emit( "dragged" );
          }

        } );

      };

      return PluginDrag;

    } )( build[ "./plugins/graph.plugin" ] );

    /* 
     * Build: new source file 
     * File name : plugins/graph.plugin.shape
     * File path : /Users/normanpellet/Documents/Web/graph/src/plugins/graph.plugin.shape.js
     */

    build[ './plugins/graph.plugin.shape' ] = ( function( $, Plugin, util ) {
      /** @global */
      /** @ignore */

      "use strict";

      /**
       * @class PluginShape
       * @implements Plugin
       */
      var PluginShape = function() {};

      PluginShape.prototype = new Plugin();

      /**
       * Init method
       * @private
       * @memberof PluginShape
       */
      PluginShape.prototype.init = function( graph, options ) {

        this.graph = graph;
        this.shapeType = options.type;

      };

      /**
       * Sets the shape that is created by the plugin
       * @param {String} shapeType - The type of the shape
       * @memberof PluginShape
       */
      PluginShape.prototype.setShape = function( shapeType ) {
        this.shapeInfo.shapeType = shapeType;
      };

      /**
       * @private
       * @memberof PluginShape
       */
      PluginShape.prototype.onMouseDown = function( graph, x, y, e, target ) {

        if ( !this.shapeType && !this.options.url ) {
          return;
        }

        var self = this,
          selfPlugin = this;

        var xVal, yVal;

        this.count = this.count || 0;

        x -= graph.getPaddingLeft();
        y -= graph.getPaddingTop();

        xVal = graph.getXAxis().getVal( x );
        yVal = graph.getYAxis().getVal( y );

        var shapeInfo = {

          position: [ {
            x: xVal,
            y: yVal
          }, {
            x: xVal,
            y: yVal
          } ],

          onChange: function( newData ) {
            graph.triggerEvent( 'onAnnotationChange', newData );
          },

          locked: false,
          selectable: true,
          resizable: true,
          movable: true
        };

        $.extend( true, shapeInfo, this.options );

        this.emit( "beforeNewShape", shapeInfo );

        if ( this.graph.prevent( false ) ) {
          return;
        }

        var shape = graph.newShape( shapeInfo.type, shapeInfo );

        this.emit( "createdShape", shape );

        if ( shape ) {
          self.currentShape = shape;
          self.currentShapeEvent = e;
        }

        graph.once( "mouseUp", function() {
          self.emit( "newShape", shape );
        } )
      };

      /**
       * @private
       * @memberof PluginShape
       */
      PluginShape.prototype.onMouseMove = function( graph, x, y, e ) {

        var self = this;
        if ( self.currentShape ) {

          self.count++;

          var shape = self.currentShape;

          self.currentShape = false;

          if ( graph.selectedSerie ) {
            shape.setSerie( graph.selectedSerie );
          }

          shape.resizing = true;

          if ( shape.options && shape.options.onCreate ) {
            shape.options.onCreate.call( shape );
          }

          shape.draw();

          graph.selectShape( shape );

          shape.handleMouseDown( self.currentShapeEvent, true );
          shape.handleSelected = 1;
          shape.handleMouseMove( e, true );
        }
      };

      /**
       * @private
       * @memberof PluginShape
       */
      PluginShape.prototype.onMouseUp = function() {

        var self = this;
        if ( self.currentShape ) {
          // No need to kill it as it hasn't been actually put in the dom right now
          //self.currentShape.kill();
          self.currentShape = false;
        }
      };

      return PluginShape;

    } )( build[ "./jquery" ], build[ "./plugins/graph.plugin" ], build[ "./graph.util" ] );

    /* 
     * Build: new source file 
     * File name : plugins/graph.plugin.selectScatter
     * File path : /Users/normanpellet/Documents/Web/graph/src/plugins/graph.plugin.selectScatter.js
     */

    build[ './plugins/graph.plugin.selectScatter' ] = ( function( Plugin, util ) {
      /** @global */
      /** @ignore */

      /**
       * @class PluginSelectScatter
       * @implements Plugin
       */
      var PluginSelectScatter = function() {};

      PluginSelectScatter.prototype = new Plugin();

      /**
       * Init method
       * @private
       * @memberof PluginSelectScatter
       */
      PluginSelectScatter.prototype.init = function( graph, options ) {

        this._path = document.createElementNS( graph.ns, 'path' );

        util.setAttributeTo( this._path, {
          'display': 'none',
          'fill': 'rgba(0,0,0,0.1)',
          'stroke': 'rgba(0,0,0,1)',
          'shape-rendering': 'crispEdges',
          'x': 0,
          'y': 0,
          'height': 0,
          'width': 0,
          'd': ''
        } );

        this.graph = graph;

        graph.dom.appendChild( this._path );

      };

      /**
       * Assigns the scatter serie that should be selected to the plugin
       * @param {ScatterSerie} serie - The serie
       * @memberof PluginSelectScatter
       */
      PluginSelectScatter.prototype.setSerie = function( serie ) {
        this.serie = serie;
      };

      /**
       * @memberof PluginSelectScatter
       * @private
       */
      PluginSelectScatter.prototype.onMouseDown = function( graph, x, y, e, mute ) {

        if ( !this.serie ) {
          return;
        }

        this.path = 'M ' + x + ' ' + y + ' ';
        this.currentX = x;
        this.currentY = y;

        this.xs = [ this.serie.getXAxis().getVal( x - graph.getPaddingLeft() ) ];
        this.ys = [ this.serie.getYAxis().getVal( y - graph.getPaddingTop() ) ];
        this._path.setAttribute( 'd', '' );
        this._path.setAttribute( 'display', 'block' );

      };

      /**
       * @memberof PluginSelectScatter
       * @private
       */
      PluginSelectScatter.prototype.onMouseMove = function( graph, x, y, e, mute ) {

        if ( Math.pow( ( x - this.currentX ), 2 ) + Math.pow( ( y - this.currentY ), 2 ) > 25 ) {

          this.path += " L " + x + " " + y + " ";
          this.currentX = x;
          this.currentY = y;

          this.xs.push( this.serie.getXAxis().getVal( x - graph.getPaddingLeft() ) );
          this.ys.push( this.serie.getYAxis().getVal( y - graph.getPaddingTop() ) );

          this._path.setAttribute( 'd', this.path + " z" );

          this.findPoints();
        }
      };

      /**
       * @memberof PluginSelectScatter
       * @private
       */
      PluginSelectScatter.prototype.findPoints = function() {

        var data = this.serie.data;
        var selected = [];
        var counter = 0,
          j2;
        for ( var i = 0, l = data.length; i < l; i += 2 ) {

          counter = 0;
          for ( var j = 0, k = this.xs.length; j < k; j += 1 ) {

            if ( j == k - 1 ) {
              j2 = 0;
            } else {
              j2 = j + 1;
            }

            if ( ( ( this.ys[ j ] < data[ i + 1 ] && this.ys[ j2 ] > data[ i + 1 ] ) || ( this.ys[ j ] > data[ i + 1 ] && this.ys[ j2 ] < data[ i + 1 ] ) ) ) {

              if ( data[ i ] > ( ( data[ i + 1 ] - this.ys[ j ] ) / ( this.ys[ j2 ] - this.ys[ j ] ) ) * ( this.xs[ j2 ] - this.xs[ j ] ) + this.xs[ j ] ) {
                counter++;
              }
            }
          }

          if ( counter % 2 == 1 ) {
            selected.push( i / 2 );
            this.serie.selectPoint( i / 2, true, "selected" );
          } else {
            this.serie.unselectPoint( i / 2 );
          }

        }

        this.selected = selected;
        this.emit( "selectionProcess", selected );
      };

      /**
       * @memberof PluginSelectScatter
       * @private
       */
      PluginSelectScatter.prototype.onMouseUp = function( graph, x, y, e ) {
        this._path.setAttribute( 'display', 'none' );
        this.emit( "selectionEnd", this.selected );
      };

      return PluginSelectScatter;

    } )( build[ "./plugins/graph.plugin" ], build[ "./graph.util" ] );

    /* 
     * Build: new source file 
     * File name : plugins/graph.plugin.zoom
     * File path : /Users/normanpellet/Documents/Web/graph/src/plugins/graph.plugin.zoom.js
     */

    build[ './plugins/graph.plugin.zoom' ] = ( function( $, util, Plugin ) {
      /** @global */
      /** @ignore */

      /**
       * @class PluginZoom
       * @implements Plugin
       */
      var PluginZoom = function() {};

      PluginZoom.prototype = new Plugin();

      /**
       * Init method
       * @private
       * @memberof PluginZoom
       */
      PluginZoom.prototype.init = function( graph, options ) {

        this._zoomingGroup = document.createElementNS( graph.ns, 'g' );
        this._zoomingSquare = document.createElementNS( graph.ns, 'rect' );
        this._zoomingSquare.setAttribute( 'display', 'none' );

        util.setAttributeTo( this._zoomingSquare, {
          'display': 'none',
          'fill': 'rgba(171,12,12,0.2)',
          'stroke': 'rgba(171,12,12,1)',
          'shape-rendering': 'crispEdges',
          'x': 0,
          'y': 0,
          'height': 0,
          'width': 0
        } );

        this.graph = graph;
        graph.groupEvent.appendChild( this._zoomingGroup );
        this._zoomingGroup.appendChild( this._zoomingSquare );
      };

      PluginZoom.prototype.defaults = {
        "axes": "all"
      };

      /**
       * @private
       * @memberof PluginZoom
       */
      PluginZoom.prototype.onMouseDown = function( graph, x, y, e, mute ) {

        var zoomMode = this.options.zoomMode;

        if ( !zoomMode ) {
          return;
        }

        this._zoomingMode = zoomMode;

        if ( x === undefined ) {
          this._backedUpZoomMode = this._zoomingMode;
          this._zoomingMode = 'y';
          x = 0;
        }

        if ( y === undefined ) {
          this._backedUpZoomMode = this._zoomingMode;
          this._zoomingMode = 'x';
          y = 0;
        }

        this._zoomingXStart = x;
        this._zoomingYStart = y;
        this.x1 = x - graph.getPaddingLeft();
        this.y1 = y - graph.getPaddingTop();

        this._zoomingSquare.setAttribute( 'width', 0 );
        this._zoomingSquare.setAttribute( 'height', 0 );
        this._zoomingSquare.setAttribute( 'display', 'block' );

        switch ( this._zoomingMode ) {

          case 'x':
            this._zoomingSquare.setAttribute( 'y', graph.options.paddingTop );
            this._zoomingSquare.setAttribute( 'height', graph.getDrawingHeight() - graph.shift.bottom );
            break;

          case 'y':
            this._zoomingSquare.setAttribute( 'x', graph.options.paddingLeft /* + this.shift[1]*/ );
            this._zoomingSquare.setAttribute( 'width', graph.getDrawingWidth() /* - this.shift[1] - this.shift[2]*/ );
            break;

          case 'forceY2':

            this.y2 = graph.getYAxis().getPx( this.options.forcedY ) + graph.options.paddingTop;

            break;

        }

        if ( this.options.onZoomStart && !mute ) {
          this.options.onZoomStart( graph, x, y, e, mute );
        }
      };

      /**
       * @private
       * @memberof PluginZoom
       */
      PluginZoom.prototype.onMouseMove = function( graph, x, y, e, mute ) {

        //	this._zoomingSquare.setAttribute('display', 'none');

        //	this._zoomingSquare.setAttribute('transform', 'translate(' + Math.random() + ', ' + Math.random() + ') scale(10, 10)');
        switch ( this._zoomingMode ) {

          case 'xy':
            this._zoomingSquare.setAttribute( 'x', Math.min( this._zoomingXStart, x ) );
            this._zoomingSquare.setAttribute( 'y', Math.min( this._zoomingYStart, y ) );
            this._zoomingSquare.setAttribute( 'width', Math.abs( this._zoomingXStart - x ) );
            this._zoomingSquare.setAttribute( 'height', Math.abs( this._zoomingYStart - y ) );

            break;

          case 'forceY2':
            this._zoomingSquare.setAttribute( 'y', Math.min( this._zoomingYStart, this.y2 ) );
            this._zoomingSquare.setAttribute( 'height', Math.abs( this._zoomingYStart - this.y2 ) );
            this._zoomingSquare.setAttribute( 'x', Math.min( this._zoomingXStart, x ) );
            this._zoomingSquare.setAttribute( 'width', Math.abs( this._zoomingXStart - x ) );

            break;

          case 'x':
            this._zoomingSquare.setAttribute( 'x', Math.min( this._zoomingXStart, x ) );
            this._zoomingSquare.setAttribute( 'width', Math.abs( this._zoomingXStart - x ) );

            break;

          case 'y':
            this._zoomingSquare.setAttribute( 'y', Math.min( this._zoomingYStart, y ) );
            this._zoomingSquare.setAttribute( 'height', Math.abs( this._zoomingYStart - y ) );
            break;

        }

        if ( this.options.onZoomMove && !mute ) {

          this.options.onZoomMove( graph, x, y, e, mute );
        }
        //		this._zoomingSquare.setAttribute('display', 'block');

      };

      /**
       * @private
       * @memberof PluginZoom
       */
      PluginZoom.prototype.onMouseUp = function( graph, x, y, e, mute ) {

        var self = this;
        this.removeZone();
        var _x = x - graph.options.paddingLeft;
        var _y = y - graph.options.paddingTop;

        if ( ( x - this._zoomingXStart == 0 && this._zoomingMode != 'y' ) || ( y - this._zoomingYStart == 0 && this._zoomingMode != 'x' ) ) {
          return;
        }

        graph.cancelClick = true;

        if ( this.options.transition ) {

          var modeX = false,
            modeY = false;

          if ( this._zoomingMode == 'x' || this._zoomingMode == 'xy' || this._zoomingMode == 'forceY2' ) {

            this.fullX = false;
            this.toAxes( function( axis ) {

              axis._pluginZoomMin = axis.getCurrentMin();
              axis._pluginZoomMax = axis.getCurrentMax();

              axis._pluginZoomMinFinal = Math.min( axis.getVal( _x ), axis.getVal( self.x1 ) );
              axis._pluginZoomMaxFinal = Math.max( axis.getVal( _x ), axis.getVal( self.x1 ) );
            }, false, true, false );

            modeX = true;

          }

          if ( this._zoomingMode == 'y' || this._zoomingMode == 'xy' ) {

            this.fullY = false;
            this.toAxes( function( axis ) {

              axis._pluginZoomMin = axis.getCurrentMin();
              axis._pluginZoomMax = axis.getCurrentMax();

              axis._pluginZoomMinFinal = Math.min( axis.getVal( _y ), axis.getVal( self.y1 ) );
              axis._pluginZoomMaxFinal = Math.max( axis.getVal( _y ), axis.getVal( self.y1 ) );

            }, false, false, true );

            modeY = true;
          }

          if ( this._zoomingMode == 'forceY2' ) {

            this.fullY = false;
            this.toAxes( function( axis ) {

              axis._pluginZoomMin = axis.getCurrentMin();
              axis._pluginZoomMax = axis.getCurrentMax();

              axis._pluginZoomMinFinal = Math.min( axis.getVal( self.y2 ), axis.getVal( self.y1 ) );
              axis._pluginZoomMaxFinal = Math.max( axis.getVal( self.y2 ), axis.getVal( self.y1 ) );

            }, false, false, true );

            modeY = true;
          }

          this.transition( modeX, modeY, "zoomEnd" );

        } else {

          switch ( this._zoomingMode ) {
            case 'x':
              this.fullX = false;
              this.toAxes( '_doZoom', [ _x, this.x1 ], true, false );
              break;
            case 'y':
              this.fullY = false;
              this.toAxes( '_doZoom', [ _y, this.y1 ], false, true );
              break;
            case 'xy':
              this.fullX = false;
              this.fullY = false;
              this.toAxes( '_doZoom', [ _x, this.x1 ], true, false );
              this.toAxes( '_doZoom', [ _y, this.y1 ], false, true );
              break;

            case 'forceY2':

              this.fullX = false;
              this.fullY = false;

              this.toAxes( '_doZoom', [ _x, this.x1 ], true, false );
              this.toAxes( '_doZoom', [ this.y1, this.y2 ], false, true );

              break;
          }

          graph.prevent( true );
          graph.draw();

          if ( this._backedUpZoomMode ) {
            this._zoomingMode = this._backedUpZoomMode;
          }

          this.emit( "zoomed" );

        }

      };

      /**
       * @private
       * @memberof PluginZoom
       */
      PluginZoom.prototype.removeZone = function() {
        this._zoomingSquare.setAttribute( 'display', 'none' );
      };

      /**
       * @private
       * @memberof PluginZoom
       */
      PluginZoom.prototype.onMouseWheel = function( delta, e, options ) {

        if ( !options ) {
          options = {};
        }

        if ( !options.baseline ) {
          options.baseline = 0;
        }

        /*var serie;
        if ( ( serie = this.graph.getSelectedSerie() ) ) {

          if ( serie.getYAxis().handleMouseWheel( delta, e ) ) {
            return;
          }
        }*/

        var doX = ( options.direction == 'x' );
        var doY = !( options.direction !== 'y' );

        this.toAxes( 'handleMouseWheel', [ delta, e, options.baseline ], doX, doY );

        this.graph.drawSeries();

      };

      /**
       * @private
       * @memberof PluginZoom
       */
      PluginZoom.prototype.onDblClick = function( x, y, e, pref, mute ) {

        var graph = this.graph;
        this.emit( "beforeDblClick", {
          graph: graph,
          x: x,
          y: y,
          pref: pref,
          e: e,
          mute: mute
        } );

        if ( graph.prevent( false ) ) {
          return;
        }

        if ( this.options.transition ) {

          var modeX = false,
            modeY = false;

          if ( pref.mode == 'xtotal' || pref.mode == 'total' ) {

            this.toAxes( function( axis ) {
              axis._pluginZoomMin = axis.getCurrentMin();
              axis._pluginZoomMax = axis.getCurrentMax();

              axis._pluginZoomMinFinal = axis.getMinValue();
              axis._pluginZoomMaxFinal = axis.getMaxValue();

            }, false, true, false );

            modeX = true;

          }

          if ( pref.mode == 'ytotal' || pref.mode == 'total' ) {

            this.toAxes( function( axis ) {

              axis._pluginZoomMin = axis.getCurrentMin();
              axis._pluginZoomMax = axis.getCurrentMax();

              axis._pluginZoomMinFinal = axis.getMinValue();
              axis._pluginZoomMaxFinal = axis.getMaxValue();

            }, false, false, true );

            modeY = true;

          }

          if ( pref.mode == 'gradualX' || pref.mode == 'gradualY' || pref.mode == 'gradual' || pref.mode == 'gradualXY' ) {

            var x = false,
              y = false;

            if ( pref.mode == 'gradualX' || pref.mode == 'gradual' || pref.mode == 'gradualXY' ) {
              x = true;
              modeX = true;
            }

            if ( pref.mode == 'gradualY' || pref.mode == 'gradual' || pref.mode == 'gradualXY' ) {
              y = true;
              modeY = true;
            }

            this.toAxes( function( axis ) {

              axis._pluginZoomMin = axis.getCurrentMin();
              axis._pluginZoomMax = axis.getCurrentMax();

              axis._pluginZoomMinFinal = axis.getCurrentMin() - ( axis.getCurrentMax() - axis.getCurrentMin() );
              axis._pluginZoomMaxFinal = axis.getCurrentMax() + ( axis.getCurrentMax() - axis.getCurrentMin() );

            }, false, x, y );

          }

          this.transition( modeX, modeY, "dblClick" );
          return;
        }

        var xAxis = this.graph.getXAxis(),
          yAxis = this.graph.getYAxis();

        if ( pref.mode == 'xtotal' ) {

          this.toAxes( "setMinMaxToFitSeries", null, true, false );
          this.fullX = true;
          this.fullY = false;

        } else if ( pref.mode == 'ytotal' ) {

          this.toAxes( "setMinMaxToFitSeries", null, false, true );
          this.fullX = false;
          this.fullY = true;

        } else if ( pref.mode == 'total' ) {

          this.toAxes( "setMinMaxToFitSeries", null, true, true );

          this.fullX = true;
          this.fullY = true;
          // Nothing to do here
          /*        this.graph._applyToAxes( function( axis ) {

          axis.emit( 'zoom', axis.currentAxisMin, axis.currentAxisMax, axis );

        }, null, true, true );
*/
        } else {

          x -= this.graph.options.paddingLeft;
          y -= this.graph.options.paddingTop;

          var
            xMin = xAxis.getCurrentMin(),
            xMax = xAxis.getCurrentMax(),
            xActual = xAxis.getVal( x ),
            diffX = xMax - xMin,

            yMin = yAxis.getCurrentMin(),
            yMax = yAxis.getCurrentMax(),
            yActual = yAxis.getVal( y ),
            diffY = yMax - yMin;

          if ( pref.mode == 'gradualXY' || pref.mode == 'gradualX' ) {

            var ratio = ( xActual - xMin ) / ( xMax - xMin );
            xMin = Math.max( xAxis.getMinValue(), xMin - diffX * ratio );
            xMax = Math.min( xAxis.getMaxValue(), xMax + diffX * ( 1 - ratio ) );
            xAxis.setCurrentMin( xMin );
            xAxis.setCurrentMax( xMax );

            if ( xAxis.options.onZoom ) {
              xAxis.options.onZoom( xMin, xMax );
            }

            xAxis.cacheCurrentMin();
            xAxis.cacheCurrentMax();
            xAxis.cacheInterval();

          }

          if ( pref.mode == 'gradualXY' || pref.mode == 'gradualY' ) {

            var ratio = ( yActual - yMin ) / ( yMax - yMin );
            yMin = Math.max( yAxis.getMinValue(), yMin - diffY * ratio );
            yMax = Math.min( yAxis.getMaxValue(), yMax + diffY * ( 1 - ratio ) );
            yAxis.setCurrentMin( yMin );
            yAxis.setCurrentMax( yMax );

            if ( yAxis.options.onZoom ) {
              yAxis.options.onZoom( yMin, yMax );
            }

            yAxis.cacheCurrentMin();
            yAxis.cacheCurrentMax();
            yAxis.cacheInterval();

          }

        }

        this.graph.draw();
        /*
            this.emit( "dblClick", {
              graph: graph,
              x: x,
              y: y,
              pref: pref,
              e: e,
              mute: mute
            } );

            if ( this.options.onDblClick && !mute ) {
              this.options.onDblClick( graph, x, y, e, mute );
            }*/

      };

      PluginZoom.prototype.transition = function( modeX, modeY, eventName ) {

        var self = this,
          maxTime = 500;

        if ( !self.gradualUnzoomStart ) {
          self.gradualUnzoomStart = Date.now();
        }

        window.requestAnimationFrame( function() {

          var dt = Date.now() - self.gradualUnzoomStart;

          if ( dt > maxTime ) {
            dt = maxTime;
          }
          var progress = Math.sin( dt / maxTime * Math.PI / 2 );

          self.toAxes( function( axis ) {

            axis.setCurrentMin( axis._pluginZoomMin + ( axis._pluginZoomMinFinal - axis._pluginZoomMin ) * progress );
            axis.setCurrentMax( axis._pluginZoomMax + ( axis._pluginZoomMaxFinal - axis._pluginZoomMax ) * progress );

            axis.cacheCurrentMin();
            axis.cacheCurrentMax();
            axis.cacheInterval();

          }, false, modeX, modeY );

          self.graph.draw();

          if ( dt < maxTime ) {

            self.transition( modeX, modeY, eventName );
            self.emit( "zooming" );

          } else {

            self.emit( "zoomed" );

            if ( eventName ) {
              self.emit( eventName )
            }
            self.gradualUnzoomStart = 0;

          }

        } );
      };

      PluginZoom.prototype.isFullX = function() {
        return this.fullX;
      };

      PluginZoom.prototype.isFullY = function() {
        return this.fullY;
      };

      PluginZoom.prototype.toAxes = function( func, params, tb, lr ) {

        var axes = this.options.axes;

        if ( !this.graph.getSelectedSerie() ) {
          axes = 'all';
        }

        switch ( axes ) {

          case 'all':
            this.graph._applyToAxes.apply( this.graph, arguments );
            break;

          case 'serieSelected':

            var serie = this.graph.getSelectedSerie();
            if ( serie ) {

              if ( tb ) {

                if ( typeof func == "string" ) {
                  serie.getXAxis()[ func ].apply( serie.getXAxis(), params )
                } else {
                  func.apply( serie.getXAxis(), params );
                }
              }

              if ( lr ) {

                if ( typeof func == "string" ) {
                  serie.getYAxis()[ func ].apply( serie.getYAxis(), params )
                } else {
                  func.apply( serie.getYAxis(), params );
                }

              }
            }

            break;
        }
      };

      return PluginZoom;
    } )( build[ "./jquery" ], build[ "./graph.util" ], build[ "./plugins/graph.plugin" ], build[ "./plugins/ " ] );

    /* 
     * Build: new source file 
     * File name : graph.lru
     * File path : /Users/normanpellet/Documents/Web/graph/src/graph.lru.js
     */

    build[ './graph.lru' ] = ( function() {
      /** @global */
      /** @ignore */

      var memory = {},
        memoryHead = {},
        memoryCount = {},
        memoryLimit = {};

      function createStoreMemory( store, limit ) {
        limit = limit || 50;
        if ( !memory[ store ] ) {
          memory[ store ] = {};
          memoryCount[ store ] = 0;
        }

        memoryLimit[ store ] = limit;
      }

      function getFromMemory( store, index ) {
        var obj, head;

        if ( memory[ store ] && memory[ store ][ index ] ) {

          head = memoryHead[ store ];

          obj = memory[ store ][ index ];
          obj.prev = head;
          obj.next = head.next;
          head.next.prev = obj;
          head.next = obj;

          memoryHead[ store ] = obj;
          return obj.data;
        }
      }

      function storeInMemory( store, index, data ) {

        var toStore, toDelete, head;
        if ( memory[ store ] && memoryCount[ store ] !== undefined && memoryLimit[ store ] ) {
          head = memoryHead[ store ];

          if ( memory[ store ][ index ] ) {

            getFromMemory( store, index );
            memory[ store ][ index ].data.data = data;
            memory[ store ][ index ].data.timeout = Date.now();

          } else {

            toStore = {
              data: {
                data: data,
                timeout: Date.now()
              }
            };

            if ( typeof head == 'undefined' ) {
              toStore.prev = toStore;
              toStore.next = toStore;
            } else {
              toStore.prev = head.prev;
              toStore.next = head.next;
              head.next.prev = toStore;
              head.next = toStore;
            }

            memoryHead[ store ] = toStore;
            memory[ store ][ index ] = toStore;
            memoryCount[ store ]++;
          }

          // Remove oldest one
          if ( memoryCount[ store ] > memoryLimit[ store ] && head ) {
            toDelete = head.next;
            head.next.next.prev = head;
            head.next = head.next.next;
            toDelete.next.next = undefined;
            toDelete.next.prev = undefined;
            memoryCount[ store ]--;
          }

          return data;
        }
      }

      return {

        create: function( store, limitMemory ) {
          createStoreMemory( store, limitMemory );
        },

        get: function( store, index ) {
          var result;
          if ( ( result = getFromMemory( store, index ) ) != undefined ) {
            return result;
          }

        },

        store: function( store, index, value ) {
          storeInMemory( store, index, value );
          return value;
        },

        empty: function( store ) {
          emptyMemory( store );
        },

        exists: function( store ) {
          return ( memory[ store ] );
        }
      }
    } )();

    /* 
     * Build: new source file 
     * File name : plugins/graph.plugin.timeseriemanager
     * File path : /Users/normanpellet/Documents/Web/graph/src/plugins/graph.plugin.timeseriemanager.js
     */

    build[ './plugins/graph.plugin.timeseriemanager' ] = ( function( $, LRU, Plugin ) {
      /** @global */
      /** @ignore */

      /**
       * @class PluginTimeSerieManager
       * @implements Plugin
       */
      var PluginTimeSerieManager = function() {

        var self = this;

        this.series = [];
        this.plugins = [];
        this.currentSlots = {};

        this.requestLevels = {};
        this.update = function( noRecalculate, force ) {

          self.series.forEach( function( serie ) {

            self.updateSerie( serie, noRecalculate );

          } );

          if ( !noRecalculate ) {
            self.recalculateSeries( force );
          }
        }

      };

      PluginTimeSerieManager.prototype = new Plugin();

      PluginTimeSerieManager.prototype.defaults = {

        LRUName: "PluginTimeSerieManager",
        intervals: [ 1000, 15000, 60000, 900000, 3600000, 8640000 ],
        maxParallelRequests: 3,
        optimalPxPerPoint: 2,
        nbPoints: 1000,
        url: ""
      };

      /**
       * Init method
       * @private
       * @memberof PluginTimeSerieManager
       */
      PluginTimeSerieManager.prototype.init = function( graph, options ) {
        this.graph = graph;
        LRU.create( this.options.LRUName, 200 );
        this.requestsRunning = 0;

      };

      PluginTimeSerieManager.prototype.setURL = function( url ) {
        this.options.url = url;
        return this;
      };

      PluginTimeSerieManager.prototype.setAvailableIntervals = function() {
        this.options.intervals = arguments;
      };

      PluginTimeSerieManager.prototype.newSerie = function( serieName, serieOptions, serieType, dbElements, noZoneSerie ) {
        var s = this.graph.newSerie( serieName, serieOptions, serieType );

        this.currentSlots[ serieName ] = {
          min: 0,
          max: 0,
          interval: 0
        };

        s.on( "hide", function() {

          if ( s._zoneSerie ) {

            s._zoneSerie.hide();
          }
        } );

        s.on( "show", function() {

          if ( s._zoneSerie ) {
            s._zoneSerie.show();
          }
        } );

        s.setInfo( "timeSerieManagerDBElements", dbElements );

        if ( !noZoneSerie ) {
          s._zoneSerie = this.graph.newSerie( serieName + "_zone", {}, "zone" );
        }

        this.series.push( s );
        return s;
      };

      PluginTimeSerieManager.prototype.registerPlugin = function( plugin, event ) {

        var index;
        if ( ( index = this.plugins.indexOf( plugin ) ) > -1 ) {

          for ( var i = 1; i < arguments.length; i++ ) {
            plugin.removeListener( arguments[ i ], this.update );
          }
        }

        for ( var i = 1; i < arguments.length; i++ ) {
          plugin.on( arguments[ i ], this.update );
        }
      };

      PluginTimeSerieManager.prototype.updateSerie = function( serie, noRecalculate ) {

        var self = this;
        var from = serie.getXAxis().getCurrentMin();
        var to = serie.getXAxis().getCurrentMax();
        var priority = 1;

        var optimalInterval = this.getOptimalInterval( to - from );
        var optimalIntervalIndex = this.options.intervals.indexOf( optimalInterval );
        var interval;

        for ( var i = optimalIntervalIndex - 1; i <= optimalIntervalIndex + 1; i++ ) {

          interval = this.options.intervals[ i ];
          var startSlotId = self.computeSlotID( from, interval );
          var endSlotId = self.computeSlotID( to, interval );

          var intervalMultipliers = [
            [ 2, 5, 6 ],
            [ 1, 2, 4 ],
            [ 0, 1, 3 ]
          ];

          intervalMultipliers.forEach( function( multiplier ) {

            var firstSlotId = startSlotId - multiplier[ 0 ] * ( endSlotId - startSlotId );
            var lastSlotId = endSlotId + multiplier[ 0 ] * ( endSlotId - startSlotId );

            var slotId = firstSlotId;

            while ( slotId <= lastSlotId ) {

              if ( self.computeTimeMin( slotId, interval ) > Date.now() ) {
                break;
              }

              self.register( serie, slotId, interval, interval == optimalInterval ? multiplier[ 1 ] : multiplier[ 2 ], true, noRecalculate );
              slotId++;
            }

          } );

        }

        this.processRequests();
      };

      PluginTimeSerieManager.prototype.register = function( serie, slotId, interval, priority, noProcess, noRecalculate ) {

        var id = this.computeUniqueID( serie, slotId, interval );

        var data = LRU.get( this.options.LRUName, id );

        if ( !data || ( this.computeTimeMax( slotId, interval ) > Date.now() && data.timeout < ( Date.now() - ( noRecalculate ? 5000 : 100000 ) ) ) && priority == 1 ) {

          this.request( serie, slotId, interval, priority, id, noProcess );
        }
      };

      PluginTimeSerieManager.prototype.request = function( serie, slotId, interval, priority, slotName, noProcess ) {

        for ( var i in this.requestLevels ) {

          if ( i == priority ) {
            continue;
          }

          if ( this.requestLevels[ i ][ slotName ] ) {

            if ( this.requestLevels[ i ][ slotName ][ 0 ] !== 1 ) { // If the request is not pending

              delete this.requestLevels[ i ][ slotName ];

            } else {
              this.requestLevels[ i ][ slotName ][ 5 ] = priority;
            }

          }
        }

        if ( this.requestLevels[ priority ] && this.requestLevels[ priority ][ slotName ] ) {
          return;
        }

        this.requestLevels[ priority ] = this.requestLevels[ priority ] || {};
        this.requestLevels[ priority ][ slotName ] = [ 0, slotName, serie.getName(), slotId, interval, priority, serie.getInfo( 'timeSerieManagerDBElements' ) ];

        if ( !noProcess ) {
          this.processRequests();
        }
      };

      PluginTimeSerieManager.prototype.processRequests = function() {

        if ( this.requestsRunning >= this.options.maxParallelRequests ) {
          return;
        }

        var self = this,
          currentLevelChecking = 1,
          requestToMake;

        while ( true ) {

          for ( var i in this.requestLevels[ currentLevelChecking ] ) {

            if ( this.requestLevels[ currentLevelChecking ][ i ][ 0 ] == 1 ) { // Running request
              continue;
            }

            requestToMake = this.requestLevels[ currentLevelChecking ][ i ];
            break;
          }

          if ( requestToMake ) {
            break;
          }

          currentLevelChecking++;

          if ( currentLevelChecking > 10 ) {
            return;
          }

        }

        this.requestsRunning++;

        if ( !requestToMake ) {
          return;
        }

        requestToMake[ 0 ] = 1;

        $.ajax( {

          url: this.getURL( requestToMake ),
          method: 'get',
          dataType: 'json'

        } ).done( function( data ) {

          if ( data.status == 1 ) { // Success

            self.requestsRunning--;

            delete self.requestLevels[ currentLevelChecking ][ i ];

            LRU.store( self.options.LRUName, requestToMake[ 1 ], data.data ); // Element 1 is the unique ID
            self.processRequests();

            if ( requestToMake[ 5 ] == 1 && Object.keys( self.requestLevels[ 1 ] ).length == 0 ) {

              self.recalculateSeries( true );
            }
          }

        } );
      };

      PluginTimeSerieManager.prototype.computeTimeMax = function( slotId, interval ) {
        return ( slotId + 1 ) * ( interval * this.options.nbPoints );
      };

      PluginTimeSerieManager.prototype.computeTimeMin = function( slotId, interval ) {
        return ( slotId ) * ( interval * this.options.nbPoints );
      };

      PluginTimeSerieManager.prototype.getURL = function( requestElements ) {

        var url = this.options.url
          .replace( "<measurementid>", requestElements[ 2 ] )
          .replace( '<from>', this.computeTimeMin( requestElements[ 3 ], requestElements[ 4 ] ) )
          .replace( '<to>', this.computeTimeMax( requestElements[ 3 ], requestElements[ 4 ] ) )
          .replace( '<interval>', requestElements[ 4 ] );

        var dbElements = requestElements[ 6 ] || {};

        for ( var i in dbElements ) {
          url = url.replace( "<" + i + ">", dbElements[ i ] );
        }

        return url;
      };

      PluginTimeSerieManager.prototype.getOptimalInterval = function( totalspan ) {

        var optimalInterval = ( this.options.optimalPxPerPoint || 1 ) * totalspan / this.graph.getDrawingWidth(),
          diff = Infinity,
          optimalIntervalAmongAvailable;

        this.options.intervals.forEach( function( interval ) {

          var newDiff = Math.min( diff, Math.abs( interval - optimalInterval ) );
          if ( diff !== newDiff ) {

            optimalIntervalAmongAvailable = interval;
            diff = newDiff;
          }
        } );

        return optimalIntervalAmongAvailable || 1000;
      };

      PluginTimeSerieManager.prototype.computeUniqueID = function( serie, slotId, interval ) {
        var extra = "";
        var info = serie.getInfo( 'timeSerieManagerDBElements' );
        for ( var i in info ) {
          extra += ";" + i + ":" + info[ i ];
        }

        return serie.getName() + ";" + slotId + ";" + interval + extra;
      };

      PluginTimeSerieManager.prototype.computeSlotID = function( time, interval ) {
        return Math.floor( time / ( interval * this.options.nbPoints ) );
      };

      PluginTimeSerieManager.prototype.computeSlotTime = function( slotId, interval ) {
        return slotId * ( interval * this.options.nbPoints );
      };

      PluginTimeSerieManager.prototype.getZoneSerie = function( serie ) {
        return serie._zoneSerie;
      };

      PluginTimeSerieManager.prototype.updateZoneSerie = function( serieName ) {

        var serie = this.graph.getSerie( serieName );

        if ( !serie ) {
          return;
        }

        if ( !serie._zoneSerie ) {
          return;
        }

        serie._zoneSerie.setXAxis( serie.getXAxis() );
        serie._zoneSerie.setYAxis( serie.getYAxis() );
        serie._zoneSerie.setFillColor( serie.getLineColor() );
        serie._zoneSerie.setLineColor( serie.getLineColor() );
        serie._zoneSerie.setFillOpacity( 0.2 );
        serie._zoneSerie.setLineOpacity( 0.3 );
      };

      PluginTimeSerieManager.prototype.recalculateSeries = function( force ) {

        var self = this;

        if ( this.locked ) {
          return;
        }

        this.changed = false;

        this.series.map( function( serie ) {
          self.recalculateSerie( serie, force );
        } );

        /*if ( this.changed ) {
      self.graph._applyToAxes( "scaleToFitAxis", [ this.graph.getXAxis(), false, undefined, undefined, false, true ], false, true );
    }
*/
        this.changed = false;
        //self.graph.autoscaleAxes();

        self.graph.draw();
      };

      PluginTimeSerieManager.prototype.recalculateSerie = function( serie, force ) {

        var from = serie.getXAxis().getCurrentMin(),
          to = serie.getXAxis().getCurrentMax(),
          interval = this.getOptimalInterval( to - from );

        var startSlotId = this.computeSlotID( from, interval );
        var endSlotId = this.computeSlotID( to, interval );

        var data = [];
        var dataMinMax = [];
        var lruData;

        if ( !force && interval == this.currentSlots[ serie.getName() ].interval && this.currentSlots[ serie.getName() ].min <= startSlotId && this.currentSlots[ serie.getName() ].max >= endSlotId ) {
          return;
        }

        startSlotId -= 2;
        endSlotId += 2;

        this.currentSlots[ serie.getName() ].min = startSlotId;
        this.currentSlots[ serie.getName() ].max = endSlotId;
        this.currentSlots[ serie.getName() ].interval = interval;

        var slotId = startSlotId;

        while ( slotId <= endSlotId ) {

          if ( lruData = LRU.get( this.options.LRUName, this.computeUniqueID( serie, slotId, interval ) ) ) {

            data = data.concat( lruData.data.mean );
            dataMinMax = dataMinMax.concat( lruData.data.minmax );

          } else {

            this.recalculateSerieUpwards( serie, slotId, interval, data, dataMinMax )
          }

          slotId++;
        }

        this.changed = true;

        serie.setData( data );

        if ( serie._zoneSerie ) {
          serie._zoneSerie.setData( dataMinMax );
        }
      };

      PluginTimeSerieManager.prototype.setIntervalCheck = function( interval ) {

        if ( this.interval ) {
          clearInterval( this.interval )
        }

        var self = this;

        this.interval = setInterval( function() {
          self.update( true, false );
        }, interval );
      };

      PluginTimeSerieManager.prototype.recalculateSerieUpwards = function( serie, downSlotId, downInterval, data, dataMinMax ) {

        var intervals = this.options.intervals.slice( 0 );
        intervals.sort();

        var nextInterval = intervals[ intervals.indexOf( downInterval ) + 1 ] || -1;
        var lruData;
        if ( nextInterval < 0 ) {
          return [];
        }

        var newSlotTime = this.computeSlotTime( downSlotId, downInterval );
        var newSlotTimeEnd = this.computeSlotTime( downSlotId + 1, downInterval );
        var newSlotId = this.computeSlotID( newSlotTime, nextInterval ),
          start = false;

        if ( lruData = LRU.get( this.options.LRUName, this.computeUniqueID( serie, newSlotId, nextInterval ) ) ) {

          for ( var i = 0, l = lruData.data.mean.length; i < l; i += 2 ) {

            if ( lruData.data.mean[ i ] < newSlotTime ) {
              continue;

            } else if ( start === false ) {
              start = i;
            }

            if ( lruData.data.mean[ i ] >= newSlotTimeEnd ) {

              data = data.concat( lruData.data.mean.slice( start, i ) );
              dataMinMax = data.concat( lruData.data.minmax.slice( start, i ) );

              return;
            }
          }
        }

        return this.recalculateSerieUpwards( serie, newSlotId, nextInterval, data, dataMinMax );
      };

      PluginTimeSerieManager.prototype.lockRedraw = function() {
        this.locked = true;
      };

      PluginTimeSerieManager.prototype.unlockRedraw = function() {
        this.locked = false;
      };

      PluginTimeSerieManager.prototype.isRedrawLocked = function() {
        return !!this.locked;
      };

      return PluginTimeSerieManager;
    } )( build[ "./jquery" ], build[ "./graph.lru" ], build[ "./plugins/graph.plugin" ] );

    /* 
     * Build: new source file 
     * File name : series/graph.serie
     * File path : /Users/normanpellet/Documents/Web/graph/src/series/graph.serie.js
     */

    build[ './series/graph.serie' ] = ( function( EventEmitter, util ) {
      /** @global */
      /** @ignore */

      "use strict";

      /** 
       * Serie class to be extended
       * @class Serie
       * @static
       */
      function Serie() {}

      Serie.prototype = new EventEmitter();

      /** 
       * Sets data to the serie
       * @memberof Serie
       * @param {(Object|Array|Array[])} data - The data of the serie
       * @param {Boolean} [ oneDimensional=false ] - In some cases you may need to force the 1D type. This is required when one uses an array or array to define the data (see examples)
       * @param {String} [ type=float ] - Specify the type of the data. Use <code>int</code> to save memory (half the amount of bytes allocated to the data).
       * @example serie.setData( [ [ x1, y1 ], [ x2, y2 ], ... ] );
       * @example serie.setData( [ x1, y1, x2, y2, ... ] ); // Faster
       * @example serie.setData( [ [ x1, y1, x2, y2, ..., xn, yn ] , [ xm, ym, x(m + 1), y(m + 1), ...] ], true ) // 1D array with a gap in the middle
       * @example serie.setData( { x: x0, dx: spacing, y: [ y1, y2, y3, y4 ] } ); // Data with equal x separation. Fastest way
       */
      Serie.prototype.setData = function( data, oneDimensional, type ) {

        function isArray( arr ) {
          var stringed = Object.prototype.toString.call( arr );
          return stringed === '[object Array]' || stringed === '[object Int16Array]' || stringed === '[object Int32Array]' || stringed === '[object Float32Array]' || stringed === '[object Float64Array]' || stringed === '[object Uint8Array]' || stringed === '[object Uint16Array]' || stringed === '[object Uint32Array]' || stringed === '[object Int8Array]';
        }

        var z = 0,
          x,
          dx,
          oneDimensional = oneDimensional || false,
          type = type || 'float',
          arr,
          total = 0,
          continuous;

        // In its current form, empty is a performance hindering method because it forces all the DOM to be cleared.
        // We shouldn't need that for the lines
        //this.empty();

        this.minX = +Infinity;
        this.minY = +Infinity;
        this.maxX = -Infinity;
        this.maxY = -Infinity;

        var isDataArray = isArray( data );

        // Single object
        var datas = [];

        if ( !isDataArray && typeof data == 'object' ) {
          data = [ data ];
        } else if ( isDataArray && !isArray( data[ 0 ] ) && typeof data[ 0 ] !== 'object' ) { // [100, 103, 102, 2143, ...]
          data = [ data ];
          oneDimensional = true;
        } else if ( !isDataArray ) {
          util.throwError( "Data is not an array" );
          return;
        }

        // [[100, 0.145], [101, 0.152], [102, 0.153], [...]] ==> [[[100, 0.145], [101, 0.152], [102, 0.153], [...]]]
        var isData0Array = isArray( data[ 0 ] );

        var isData00Array = isArray( data[ 0 ][ 0 ] );
        if ( isData0Array && !oneDimensional && !isData00Array ) {
          data = [ data ];
        }
        if ( isData0Array ) {
          for ( var i = 0, k = data.length; i < k; i++ ) {

            arr = this._addData( type, !oneDimensional ? data[ i ].length * 2 : data[ i ].length );
            datas.push( arr );
            z = 0;

            for ( var j = 0, l = data[ i ].length; j < l; j++ ) {

              if ( !oneDimensional ) {
                arr[ z ] = ( data[ i ][ j ][ 0 ] );

                this._checkX( arr[ z ] );
                z++;
                arr[ z ] = ( data[ i ][ j ][ 1 ] );
                this._checkY( arr[ z ] );
                z++;
                total++;

              } else { // 1D Array
                arr[ z ] = data[ i ][ j ];
                this[ j % 2 == 0 ? '_checkX' : '_checkY' ]( arr[ z ] );

                z++;
                total += j % 2 ? 1 : 0;

              }
            }
          }

        } else if ( typeof data[ 0 ] == 'object' ) {

          if ( data[ 0 ].x ) {

            for ( var i = 0, l = data.length; i < l; i++ ) {

              var arr = this._addData( type, data[ i ].x.length * 2 );
              datas.push( arr );

              z = 0;
              for ( var j = 0, m = data[ 0 ].x.length; j < m; j++ ) { // Several piece of data together
                arr[ z ] = ( data[ i ].x[ j ] );
                z++;
                arr[ z ] = ( data[ i ].y[ j ] );
                z++;
                this._checkX( data[ i ].x[ j ] );
                this._checkY( data[ i ].y[ j ] );
                total++;
              }
            }

          } else {

            this.mode = 'x_equally_separated';

            var number = 0,
              numbers = [],
              datas = [],
              k = 0,
              o;

            if ( !data[ 0 ].y ) {
              console.log( data );
              util.throwError( "No y data" );
              return;
            }

            for ( var i = 0, l = data.length; i < l; i++ ) { // Several piece of data together
              number += data[ i ].y.length;
              continuous = ( i != 0 ) && ( !data[ i + 1 ] || data[ i ].x + data[ i ].dx * ( data[ i ].y.length ) == data[ i + 1 ].x );
              if ( !continuous ) {
                datas.push( this._addData( type, number ) );
                numbers.push( number );
                number = 0;
              }
            }

            this.xData = [];

            number = 0;
            k = 0;
            z = 0;

            for ( var i = 0, l = data.length; i < l; i++ ) {
              x = data[ i ].x;
              dx = data[ i ].dx;

              this.xData.push( {
                x: x,
                dx: dx
              } );

              o = data[ i ].y.length;
              this._checkX( x );
              this._checkX( x + dx * o );

              for ( var j = 0; j < o; j++ ) {
                /*datas[k][z] = (x + j * dx);
  						this._checkX(datas[k][z]);
  						z++;*/
                // 30 june 2014. To save memory I suggest that we do not add this stupid data.

                datas[ k ][ z ] = ( data[ i ].y[ j ] );
                this._checkY( datas[ k ][ z ] );
                z++;
                total++;

              }
              number += data[ i ].y.length;

              if ( numbers[ k ] == number ) {
                k++;
                number = 0;
                z = 0;
              }
            }
          }
        }

        // Determination of slots for low res spectrum
        var w = ( this.maxX - this.minX ) / this.graph.getDrawingWidth(),
          ws = [];

        var min = this.graph.getDrawingWidth() * 4;
        var max = total / 4;

        var min = this.graph.getDrawingWidth();
        var max = total;

        this.data = datas;

        if ( min > 0 ) {

          while ( min < max ) {
            ws.push( min );
            min *= 4;
          }

          this.slots = ws;

          if ( this.options.useSlots ) {

            this.calculateSlots();
          }
        }

        if ( this.isFlipped() ) {

          var maxX = this.maxX;
          var maxY = this.maxY;
          var minX = this.minX;
          var minY = this.minY;

          this.maxX = maxY;
          this.maxY = maxX;

          this.minX = minY;
          this.minY = minX;
        }

        this.dataHasChanged();
        this.graph.updateDataMinMaxAxes();
        return this;
      };

      Serie.prototype._addData = function( type, howmany ) {

        switch ( type ) {
          case 'int':
            var size = howmany * 4; // 4 byte per number (32 bits)
            break;
          case 'float':
            var size = howmany * 8; // 4 byte per number (64 bits)
            break;
        }

        var arr = new ArrayBuffer( size );

        switch ( type ) {
          case 'int':
            return new Int32Array( arr );
            break;

          default:
          case 'float':
            return new Float64Array( arr );
            break;
        }
      };

      /**
       * Returns the data in its current form
       * @returns {Array.<(Float64Array|Int32Array)>} An array containing the data chunks. Has only one member if the data has no gaps
       * @memberof Serie
       */
      Serie.prototype.getData = function() {
        return this.data;
      };

      /**
       * Sets the options of the serie (no extension of default options)
       * @param {Object} options - The options of the serie
       * @memberof Serie
       */
      Serie.prototype.setOptions = function( options ) {
        this.options = options || {};
      };

      /**
       * Removes the serie from the graph and optionnally repaints the graph. The method doesn't perform any axis autoscaling or repaint of the graph. This should be done manually.
       * @memberof Serie
       */
      Serie.prototype.kill = function() {

        this.graph.removeSerieFromDom( this );

        this.graph._removeSerie( this );

        if ( this.graph.legend ) {

          this.graph.legend.update();
        }

        this.killImpl();
      };

      Serie.prototype.killImpl = function() {

      };

      /**
       * Hides the serie
       * @memberof Serie
       * @param {Boolean} [ hideShapes = false ] - <code>true</code> to hide the shapes associated to the serie
       * @returns {Serie} The current serie
       */
      Serie.prototype.hide = function( hideShapes ) {
        this.hidden = true;
        this.groupMain.setAttribute( 'display', 'none' );

        this.getSymbolForLegend().setAttribute( 'opacity', 0.5 );
        this.getTextForLegend().setAttribute( 'opacity', 0.5 );

        this.hideImpl();

        if ( hideShapes ) {
          var shapes = this.graph.getShapesOfSerie( this );
          for ( var i = 0, l = shapes.length; i < l; i++ ) {
            shapes[ i ].hide();
          }
        }

        this.emit( "hide" );

        return this;
      };

      /**
       * Shows the serie
       * @memberof Serie
       * @param {Boolean} [showShapes=false] - <code>true</code> to show the shapes associated to the serie
       * @returns {Serie} The current serie
       */
      Serie.prototype.show = function( showShapes ) {
        this.hidden = false;
        this.groupMain.setAttribute( 'display', 'block' );

        this.getSymbolForLegend().setAttribute( 'opacity', 1 );
        this.getTextForLegend().setAttribute( 'opacity', 1 );

        this.showImpl();

        this.draw();

        if ( showShapes ) {
          var shapes = this.graph.getShapesOfSerie( this );
          for ( var i = 0, l = shapes.length; i < l; i++ ) {
            shapes[ i ].show();
          }
        }

        this.emit( "show" );

        return this;
      };

      Serie.prototype.hideImpl = function() {};
      Serie.prototype.showImpl = function() {};

      /**
       * Toggles the display of the serie (effectively, calls <code>.show()</code> and <code>.hide()</code> alternatively on each call)
       * @memberof Serie
       * @param {Boolean} [hideShapes=false] - <code>true</code> to hide the shapes associated to the serie
       * @returns {Serie} The current serie
       */
      Serie.prototype.toggleDisplay = function() {

        if ( !this.isShown() ) {
          this.show();
        } else {
          this.hide();
        }

        return this;
      };

      /**
       * Determines if the serie is currently visible
       * @memberof Serie
       * @returns {Boolean} The current visibility status of the serie
       */
      Serie.prototype.isShown = function() {
        return !this.hidden;
      };

      /**
       * Returns the x position of a certain value in pixels position, based on the serie's axis
       * @memberof Serie
       * @param {Number} val - Value to convert to pixels position
       * @returns {Number} The x position in px corresponding to the x value
       */
      Serie.prototype.getX = function( val ) {
        return ( val = this.getXAxis().getPx( val ) ) - val % 0.2;
      };

      /**
       * Returns the y position of a certain value in pixels position, based on the serie's axis
       * @memberof Serie
       * @param {Number} val - Value to convert to pixels position
       * @returns {Number} The y position in px corresponding to the y value
       */
      Serie.prototype.getY = function( val ) {
        return ( val = this.getYAxis().getPx( val ) ) - val % 0.2;
      };

      /**
       * Returns the selection state of the serie. Generic for most serie types
       * @memberof Serie
       * @returns {Boolean} <code>true</code> if the serie is selected, <code>false</code> otherwise
       */
      Serie.prototype.isSelected = function() {
        return this.selected || ( this.selectionType !== "unselected" );
      };

      Serie.prototype._checkX = function( val ) {
        this.minX = Math.min( this.minX, val );
        this.maxX = Math.max( this.maxX, val );
      };

      Serie.prototype._checkY = function( val ) {
        this.minY = Math.min( this.minY, val );
        this.maxY = Math.max( this.maxY, val );
      };

      /**
       * Getter for the serie name
       * @memberof Serie
       * @returns {String} The serie name
       */
      Serie.prototype.getName = function() {
        return this.name;
      };

      /* AXIS */

      /**
       * Assigns axes automatically, based on {@link Graph#getXAxis} and {@link Graph#getYAxis}.
       * @memberof Serie
       * @returns {Serie} The current serie
       */
      Serie.prototype.autoAxis = function() {

        if ( this.isFlipped() ) {
          this.setXAxis( this.graph.getYAxis() );
          this.setYAxis( this.graph.getXAxis() );
        } else {
          this.setXAxis( this.graph.getXAxis() );
          this.setYAxis( this.graph.getYAxis() );
        }

        // After axes have been assigned, the graph axes should update their min/max
        this.graph.updateDataMinMaxAxes();
        return this;
      };

      /**
       * Assigns an x axis to the serie
       * @memberof Serie
       * @param {Axis|Number} axis - The axis to use as an x axis. If an integer, {@link Graph#getXAxis} or {@link Graph#getYAxis} will be used
       * @returns {Serie} The current serie
       * @example serie.setXAxis( graph.getTopAxis( 1 ) ); // Assigns the second top axis to the serie
       */
      Serie.prototype.setXAxis = function( axis ) {

        if ( typeof axis == "number" ) {
          this.xaxis = this.isFlipped() ? this.graph.getYAxis( axis ) : this.graph.getXAxis( axis );
        } else {
          this.xaxis = axis;
        }

        this.graph.updateDataMinMaxAxes();

        return this;
      };

      /**
       * Assigns an y axis to the serie
       * @memberof Serie
       * @param {Axis|Number} axis - The axis to use as an y axis. If an integer, {@link Graph#getXAxis} or {@link Graph#getYAxis} will be used
       * @returns {Serie} The current serie
       * @example serie.setYAxis( graph.getLeftAxis( 4 ) ); // Assigns the 5th left axis to the serie
       */
      Serie.prototype.setYAxis = function( axis ) {
        if ( typeof axis == "number" ) {
          this.xaxis = this.isFlipped() ? this.graph.getXAxis( axis ) : this.graph.getYAxis( axis );
        } else {
          this.yaxis = axis;
        }

        this.graph.updateDataMinMaxAxes();

        return this;
      };

      /**
       * Assigns two axes to the serie
       * @param {GraphAxis} axis1 - First axis to assign to the serie (x or y)
       * @param {GraphAxis} axis2 - Second axis to assign to the serie (y or x)
       * @returns {Serie} The current serie
       * @memberof Serie
       */
      Serie.prototype.setAxes = function() {

        for ( var i = 0; i < 2; i++ ) {

          if ( arguments[ i ] ) {
            this[ ( arguments[ i ].isX() ? 'setXAxis' : 'setYAxis' ) ]( arguments[ i ] );
          }
        }

        return this;
      };

      /**
       * @returns {GraphAxis} The x axis assigned to the serie
       * @memberof Serie
       */
      Serie.prototype.getXAxis = function() {
        return this.xaxis;
      };

      /**
       * @returns {GraphAxis} The y axis assigned to the serie
       * @memberof Serie
       */
      Serie.prototype.getYAxis = function() {
        return this.yaxis;
      };

      /* */

      /* DATA MIN MAX */

      /**
       * @returns {Number} Lowest x value of the serie's data
       * @memberof Serie
       */
      Serie.prototype.getMinX = function() {
        return this.minX;
      };

      /**
       * @returns {Number} Highest x value of the serie's data
       * @memberof Serie
       */
      Serie.prototype.getMaxX = function() {
        return this.maxX;
      };

      /**
       * @returns {Number} Lowest y value of the serie's data
       * @memberof Serie
       */
      Serie.prototype.getMinY = function() {
        return this.minY;
      };

      /**
       * @returns {Number} Highest y value of the serie's data
       * @memberof Serie
       */
      Serie.prototype.getMaxY = function() {
        return this.maxY;
      };

      /**
       * Computes and returns a line SVG element with the same line style as the serie, or width 20px
       * @returns {SVGElement}
       * @memberof Serie
       */
      Serie.prototype.getSymbolForLegend = function() {

        if ( !this.lineForLegend ) {

          var line = document.createElementNS( this.graph.ns, 'line' );
          this.applyLineStyle( line );

          line.setAttribute( 'x1', 5 );
          line.setAttribute( 'x2', 25 );
          line.setAttribute( 'y1', 0 );
          line.setAttribute( 'y2', 0 );

          line.setAttribute( 'cursor', 'pointer' );

          this.lineForLegend = line;
        }

        return this.lineForLegend;

      };

      /**
       * Explicitely applies the line style to the SVG element returned by {@link Serie#getSymbolForLegend}
       * @see Serie#getSymbolForLegend
       * @returns {SVGElement}
       * @memberof Serie
       */
      Serie.prototype.setLegendSymbolStyle = function() {
        this.applyLineStyle( this.getSymbolForLegend() );
      };

      /**
       * @alias Serie#setLegendSymbolStyle
       * @memberof Serie
       */
      Serie.prototype.updateStyle = function() {
        this.setLegendSymbolStyle();
        this.graph.updateLegend();
      };

      /**
       * Computes and returns a text SVG element with the label of the serie as a text, translated by 35px
       * @returns {SVGElement}
       * @memberof Serie
       * @see Serie#getLabel
       */
      Serie.prototype.getTextForLegend = function() {

        if ( !this.textForLegend ) {

          var text = document.createElementNS( this.graph.ns, 'text' );
          text.setAttribute( 'cursor', 'pointer' );
          text.textContent = this.getLabel();

          this.textForLegend = text;
        }

        return this.textForLegend;
      };

      /**
       * @returns {Number} The current index of the serie
       * @memberof Serie
       */
      Serie.prototype.getIndex = function() {
        return this.graph.series.indexOf( this );
      };

      /**
       * @returns {String} The label or, alternatively - the name of the serie
       * @memberof Serie
       */
      Serie.prototype.getLabel = function() {
        return this.options.label || this.name;
      };

      /**
       * Sets the label of the serie. Note that this does not automatically updates the legend
       * @param {String} label - The new label of the serie
       * @returns {Serie} The current serie
       * @memberof Serie
       */
      Serie.prototype.setLabel = function( label ) {
        this.options.label = label;

        if ( this.textForLegend ) {
          this.textForLegend.textContent = label;
        }
        return this;
      };

      /* FLIP */

      /**
       * Assigns the flipping value of the serie. A flipped serie will have inverted axes. However this method does not automatically re-assigns the axes of the serie. Call {@link Serie#autoAxis} to re-assign the axes automatically, or any other axis setting method.
       * @param {Boolean} [flipped=false] - <code>true</code> to flip the serie
       * @returns {Serie} The current serie
       * @memberof Serie
       */
      Serie.prototype.setFlip = function( flipped ) {
        this.options.flip = flipped;
        return this;
      };

      /**
       * @returns {Boolean} <code>true</code> if the serie is flipped, <code>false</code> otherwise
       * @memberof Serie
       */
      Serie.prototype.getFlip = function() {
        return this.options.flip;
      };

      /**
       * @alias Serie#getFlip
       * @memberof Serie
       */
      Serie.prototype.isFlipped = function() {
        return this.options.flip;
      };

      /**
       * Sets the layer onto which the serie should be displayed. This method does not trigger a graph redraw.
       * @memberof Serie
       * @param {Number} layerIndex=1 - The index of the layer into which the serie will be drawn
       * @returns {Serie} The current serie
       */
      Serie.prototype.setLayer = function( layerIndex ) {
        this.options.layer = parseInt( layerIndex ) || 1;
        return this;
      };

      /**
       * Sets the layer onto which the serie should be displayed. This method does not trigger a graph redraw.
       * @memberof Serie
       * @returns {Nunber} The index of the layer into which the serie will be drawn
       */
      Serie.prototype.getLayer = function() {
        return this.options.layer || 1;
      };

      /**
       * Notifies jsGraph that the style of the serie has changed and needs to be redrawn on the next repaint
       * @param {String} selectionType - The selection for which the style may have changed
       * @returns {Serie} The current serie
       * @memberof Serie
       */
      Serie.prototype.styleHasChanged = function( selectionType ) {
        this._changedStyles = this._changedStyles || {};

        if ( selectionType === false ) {
          for ( var i in this._changedStyles ) {
            this._changedStyles[ i ] = false;
          }

        } else {
          this._changedStyles[ selectionType || "unselected" ] = true;
        }

        return this;
      };

      /**
       * Checks if the style has changed for a selection type
       * @param {String} selectionType - The selection for which the style may have changed
       * @returns {Boolean} <code>true</code> if the style has changed
       * @private
       * @memberof Serie
       */
      Serie.prototype.hasStyleChanged = function( selectionType ) {
        this._changedStyles = this._changedStyles || {};
        return this._changedStyles[ selectionType || "unselected" ];
      };

      /**
       * Notifies jsGraph that the data of the serie has changed
       * @returns {Serie} The current serie
       * @memberof Serie
       */
      Serie.prototype.dataHasChanged = function( arg ) {
        this._dataHasChanged = arg === undefined || arg;
        return this;
      };

      /**
       * Checks if the data has changed
       * @returns {Boolean} <code>true</code> if the data has changed
       * @private
       * @memberof Serie
       */
      Serie.prototype.hasDataChanged = function() {
        return this._dataHasChanged;
      };

      /**
       * Set a key/value arbitrary information to the serie. It is particularly useful if you have this serie has a reference through an event for instance, and you want to retrieve data associated to it
       * @param {String} prop - The property
       * @param value - The value
       * @returns {Serie} The current serie
       * @see Serie#getInfo
       * @memberof Serie
       */
      Serie.prototype.setInfo = function( prop, value ) {
        this.infos = this.infos || {};
        this.infos[ prop ] = value;
        return this;
      };

      /**
       * Retrives an information value from its key
       * @param {String} prop - The property
       * @returns The value associated to the prop parameter
       * @see Serie#setInfo
       * @memberof Serie
       */
      Serie.prototype.getInfo = function( prop, value ) {
        return ( this.infos || {} )[ prop ];
      };

      /**
       * @deprecated
       * @memberof Serie
       */
      Serie.prototype.setAdditionalData = function( data ) {
        this.additionalData = data;
        return this;
      };

      /**
       * @deprecated
       * @memberof Serie
       */
      Serie.prototype.getAdditionalData = function() {
        return this.additionalData;
      };

      /**
       * Flags the serie as selected
       * @returns {Serie} The current serie
       * @memberof Serie
       */
      Serie.prototype.select = function() {
        this.selected = true;
        return this;
      };

      /**
       * Flags the serie as unselected
       * @returns {Serie} The current serie
       * @memberof Serie
       */
      Serie.prototype.unselect = function() {
        this.selected = false;
        return this;
      };

      Serie.prototype.enableTracking = function( hoverCallback, outCallback ) {
        this._tracker = true;
        this._trackingCallback = hoverCallback;
        this._trackingOutCallback = outCallback;
      };

      Serie.prototype.disableTracking = function() {

        if ( this._trackerDom ) {
          this._trackerDom.parentNode.removeChild( this._trackerDom );
        }

        this._tracker = false;
        this._trackingCallback = null;
      };

      Serie.prototype.setLegend = function( bln ) {
        this._legend = bln;
      };

      Serie.prototype.isInLegend = function() {
        return this._legend === false ? false : true;
      };

      Serie.prototype.getMarkerForLegend = function() {
        return false;
      };

      Serie.prototype.getType = function() {
        return this.type;
      };
      return Serie;

    } )( build[ "./dependencies/eventEmitter/EventEmitter" ], build[ "./graph.util" ] );

    /* 
     * Build: new source file 
     * File name : series/slotoptimizer
     * File path : /Users/normanpellet/Documents/Web/graph/src/series/slotoptimizer.js
     */

    build[ './series/slotoptimizer' ] = ( function( util ) {
      /** @global */
      /** @ignore */

      var slotWorker;
      var queue = {};

      function createWorker() {

        var workerUrl = URL.createObjectURL( new Blob(
          [ " ( " +
            function() {
              onmessage = function( e ) {

                var data = e.data.data,
                  slotNb = e.data.slotNumber,
                  slot = e.data.slot,
                  flip = e.data.flip,
                  max = e.data.max,
                  min = e.data.min,
                  slotNumber,
                  dataPerSlot = slot / ( max - min );

                var slotsData = [];

                for ( var j = 0, k = data.length; j < k; j++ ) {

                  for ( var m = 0, n = data[ j ].length; m < n; m += 2 ) {

                    slotNumber = Math.floor( ( data[ j ][ m ] - min ) * dataPerSlot );

                    slotsData[ slotNumber ] = slotsData[ slotNumber ] || {
                      min: data[ j ][ m + 1 ],
                      max: data[ j ][ m + 1 ],
                      start: data[ j ][ m + 1 ],
                      stop: false,
                      x: data[ j ][ m ]
                    };

                    slotsData[ slotNumber ].stop = data[ j ][ m + 1 ];
                    slotsData[ slotNumber ].min = Math.min( data[ j ][ m + 1 ], slotsData[ slotNumber ].min );
                    slotsData[ slotNumber ].max = Math.max( data[ j ][ m + 1 ], slotsData[ slotNumber ].max );

                  }
                }

                postMessage( {
                  slotNumber: slotNb,
                  slot: slot,
                  data: slotsData,
                  _queueId: e.data._queueId
                } );
              };

            }.toString() + ")()"
          ]

          , {
            type: 'application/javascript'
          } ) );

        slotWorker = new Worker( workerUrl );

        slotWorker.onmessage = function( e ) {
          var id = e.data._queueId;
          delete e.data._queueId;
          queue[ id ].resolve( e.data.data );
          delete queue[ id ];
        }
      }

      return function( toOptimize ) {

        if ( !slotWorker ) {
          createWorker();
        }

        var requestId = util.guid();
        toOptimize._queueId = requestId;
        queue[ requestId ] = $.Deferred();

        slotWorker.postMessage( toOptimize );
        return queue[ requestId ];
      }

    } )( build[ "./graph.util" ] );

    /* 
     * Build: new source file 
     * File name : mixins/graph.mixin.errorbars
     * File path : /Users/normanpellet/Documents/Web/graph/src/mixins/graph.mixin.errorbars.js
     */

    build[ './mixins/graph.mixin.errorbars' ] = ( function( util ) {
      /** @global */
      /** @ignore */

      return function() {

        this.doErrorDraw = function( orientation, error, originVal, originPx, xpx, ypx ) {

          if ( !( error instanceof Array ) ) {
            error = [ error ];
          }

          var functionName = orientation == 'y' ? 'getY' : 'getX';
          var bars = orientation == 'y' ? [ 'top', 'bottom' ] : [ 'left', 'right' ];
          var j;

          if ( isNaN( xpx ) || isNaN( ypx ) ) {
            return;
          }

          for ( var i = 0, l = error.length; i < l; i++ ) {

            if ( error[ i ] instanceof Array ) { // TOP

              j = bars[ 0 ];
              this.errorstyles[ i ].paths[ j ] += " M " + xpx + " " + ypx;
              this.errorstyles[ i ].paths[ j ] += this.makeError( orientation, i, this[ functionName ]( originVal + error[ i ][ 0 ] ), originPx, j );

              j = bars[ 1 ];
              this.errorstyles[ i ].paths[ j ] += " M " + xpx + " " + ypx;
              this.errorstyles[ i ].paths[ j ] += this.makeError( orientation, i, this[ functionName ]( originVal - error[ i ][ 1 ] ), originPx, j );

            } else {

              j = bars[ 0 ];

              this.errorstyles[ i ].paths[ j ] += " M " + xpx + " " + ypx;
              this.errorstyles[ i ].paths[ j ] += this.makeError( orientation, i, this[ functionName ]( originVal + error[ i ] ), originPx, j );
              j = bars[ 1 ];
              this.errorstyles[ i ].paths[ j ] += " M " + xpx + " " + ypx;
              this.errorstyles[ i ].paths[ j ] += this.makeError( orientation, i, this[ functionName ]( originVal - error[ i ] ), originPx, j );
            }
          }
        };

        this.makeError = function( orientation, level, coord, origin, quadOrientation ) {

          var method;
          switch ( this.errorstyles[ level ].type ) {
            case 'bar':
              method = "makeBar";
              break;

            case 'box':
              method = "makeBox";
              break;
          }

          return this[ method + orientation.toUpperCase() ]( coord, origin, this.errorstyles[ level ][ quadOrientation ] );

        };

        this.makeBarY = function( coordY, origin, style ) {
          var width = !util.isNumeric( style.width ) ? 10 : style.width;
          return " V " + coordY + " m -" + ( width / 2 ) + " 0 h " + ( width ) + " m -" + ( width / 2 ) + " 0 V " + origin + " ";
        };

        this.makeBoxY = function( coordY, origin, style ) {
          return " m 5 0 V " + coordY + " h -10 V " + origin + " m 5 0 ";
        };

        this.makeBarX = function( coordX, origin, style ) {
          var height = !util.isNumeric( style.width ) ? 10 : style.width;
          return " H " + coordX + " m 0 -" + ( height / 2 ) + " v " + ( height ) + " m 0 -" + ( height / 2 ) + " H " + origin + " ";
        };

        this.makeBoxX = function( coordX, origin, style ) {

          return " v 5 H " + coordX + " v -10 H " + origin + " v 5 ";
        };

        this.setDataError = function( error ) {
          this.error = error;
          this.dataHasChanged();
          return this;
        };

        this.setErrorStyle = function( errorstyles ) {

          var self = this;

          errorstyles = errorstyles || [ 'box', 'bar' ];

          // Ensure array
          if ( !Array.isArray( errorstyles ) ) {
            errorstyles = [ errorstyles ];
          }

          var styles = [];
          var pairs = [
            [ 'y', 'top', 'bottom' ],
            [ 'x', 'left', 'right' ]
          ];

          function makePath( style ) {

            style.dom = document.createElementNS( self.graph.ns, 'path' );
            style.dom.setAttribute( 'fill', style.fillColor || 'none' );
            style.dom.setAttribute( 'stroke', style.strokeColor || 'black' );
            style.dom.setAttribute( 'stroke-opacity', style.strokeOpacity || 1 );
            style.dom.setAttribute( 'fill-opacity', style.fillOpacity || 1 );
            style.dom.setAttribute( 'stroke-width', style.strokeWidth || 1 );

            self.groupMain.appendChild( style.dom );
          }

          for ( var i = 0; i < errorstyles.length; i++ ) {
            // i is bar or box

            styles[ i ] = {};

            if ( typeof errorstyles[ i ] == "string" ) {

              errorstyles[ i ] = {
                type: errorstyles[ i ],
                y: {}
              };

            }

            styles[ i ].type = errorstyles[ i ].type;

            for ( var j = 0, l = pairs.length; j < l; j++ ) {

              if ( errorstyles[ i ][ pairs[ j ][ 0 ] ] ) { //.x, .y

                errorstyles[ i ][ pairs[ j ][ 1 ] ] = $.extend( true, {}, errorstyles[ i ][ pairs[ j ][ 0 ] ] );
                errorstyles[ i ][ pairs[ j ][ 2 ] ] = $.extend( true, {}, errorstyles[ i ][ pairs[ j ][ 0 ] ] );

              }

              for ( var k = 1; k <= 2; k++ ) {

                if ( errorstyles[ i ][ pairs[ j ][ k ] ] ) {

                  styles[ i ][ pairs[ j ][ k ] ] = errorstyles[ i ][ pairs[ j ][ k ] ];
                  makePath( styles[ i ][ pairs[ j ][ k ] ] );
                }
              }
            }
          }
          console.log( styles );
          /*
          // None is defined
          if( ! errorstyles[ i ].top && ! errorstyles[ i ].bottom ) {

            styles[ i ].top = errorstyles[ i ];
            styles[ i ].top.dom = document.createElementNS( this.graph.ns, 'path' );
            styles[ i ].bottom = errorstyles[ i ];
            styles[ i ].bottom.dom = document.createElementNS( this.graph.ns, 'path' );

          } else if( errrostyles[ i ].top ) {

            styles[ i ].bottom = null; // No bottom displayed
            styles[ i ].top = errrostyles[ i ].top;
            styles[ i ].top.dom = document.createElementNS( this.graph.ns, 'path' );

          } else {

            styles[ i ].bottom = errorstyles[ i ].bottom;
            styles[ i ].bottom.dom = document.createElementNS( this.graph.ns, 'path' );
            styles[ i ].top = null;
          }
  */

          this.errorstyles = styles;

          return this;
        };

        this.errorDrawInit = function() {
          var error;
          //  var pathError = "M 0 0 ";

          if ( this.errorstyles ) {

            for ( var i = 0, l = this.errorstyles.length; i < l; i++ ) {

              this.errorstyles[ i ].paths = {
                top: "",
                bottom: "",
                left: "",
                right: ""
              };

            }

          }
        };

        this.errorAddPoint = function( j, dataX, dataY, xpx, ypx ) {

          var error;
          if ( this.error && ( error = this.error[ j / 2 ] ) ) {

            //    pathError += "M " + xpx + " " + ypx;

            if ( error[ 0 ] ) {
              this.doErrorDraw( 'y', error[ 0 ], dataY, ypx, xpx, ypx );
            }

            if ( error[ 1 ] ) {
              this.doErrorDraw( 'x', error[ 1 ], dataX, xpx, xpx, ypx );
            }

          }

        };

        this.errorDraw = function() {

          if ( this.error && this.errorstyles ) {

            for ( var i = 0, l = this.errorstyles.length; i < l; i++ ) {

              for ( var j in this.errorstyles[ i ].paths ) {

                if ( this.errorstyles[ i ][ j ] && this.errorstyles[ i ][ j ].dom ) {
                  this.errorstyles[ i ][ j ].dom.setAttribute( 'd', this.errorstyles[ i ].paths[ j ] );
                }
              }
            }
          }
        }

      };

    } )( build[ "./graph.util" ] );

    /* 
     * Build: new source file 
     * File name : series/graph.serie.line
     * File path : /Users/normanpellet/Documents/Web/graph/src/series/graph.serie.line.js
     */

    build[ './series/graph.serie.line' ] = ( function( SerieLineNonInstanciable, SlotOptimizer, util, ErrorBarMixin ) {
      /** @global */
      /** @ignore */

      "use strict";

      /** 
       * Serie line
       * @class SerieLine
       * @example graph.newSerie( name, options, "line" );
       * @see Graph#newSerie
       * @augments Serie
       */
      function SerieLine() {}

      SerieLine.prototype = new SerieLineNonInstanciable();

      /**
       * Initializes the serie
       * @memberof SerieLine
       */
      SerieLine.prototype.init = function( graph, name, options ) {

        var self = this;

        this.selectionType = "unselected";
        this.markerFamilies = {};

        this.graph = graph;
        this.name = name;

        this.options = $.extend( true, {}, SerieLine.prototype.defaults, ( options || {} ) ); // Creates options
        util.mapEventEmission( this.options, this ); // Register events

        // Creates an empty style variable
        this.styles = {};

        // Unselected style
        this.styles.unselected = {
          lineColor: this.options.lineColor,
          lineStyle: this.options.lineStyle,
          lineWidth: this.options.lineWidth,
          markers: this.options.markers
        };

        this.styles.selected = {
          lineWidth: 3
        };

        this.extendStyles();

        if ( this.options.markers ) {
          this.setMarkers( this.options.markers, "unselected" );
        }

        this.shown = true;

        this.data = [];
        this._isMinOrMax = {
          x: {
            min: false,
            max: false
          },
          y: {
            min: false,
            max: false
          }
        };

        // Optimize is no markerPoints => save loops
        //      this.markerPoints = {};

        this.groupLines = document.createElementNS( this.graph.ns, 'g' );
        this.domMarker = document.createElementNS( this.graph.ns, 'path' );
        this.domMarker.style.cursor = 'pointer';

        this.groupMain = document.createElementNS( this.graph.ns, 'g' );
        this.additionalData = {};

        this.marker = document.createElementNS( this.graph.ns, 'circle' );
        this.marker.setAttribute( 'fill', 'black' );
        this.marker.setAttribute( 'r', 3 );
        this.marker.setAttribute( 'display', 'none' );

        this.markerLabel = document.createElementNS( this.graph.ns, 'text' );
        this.markerLabelSquare = document.createElementNS( this.graph.ns, 'rect' );
        this.markerLabelSquare.setAttribute( 'fill', 'white' );
        this.domMarkerHover = {};
        this.domMarkerSelect = {};
        this.markerHovered = 0;
        this.groupMarkerSelected = document.createElementNS( this.graph.ns, 'g' );

        //this.scale = 1;
        //this.shift = 0;
        this.lines = [];

        this.groupMain.appendChild( this.groupLines );

        this.groupMain.appendChild( this.marker );

        this.groupMain.appendChild( this.groupMarkerSelected );
        this.groupMain.appendChild( this.markerLabelSquare );
        this.groupMain.appendChild( this.markerLabel );

        this.independantMarkers = [];

        if ( this.initExtended1 ) {
          this.initExtended1();
        }

        if ( this.options.autoPeakPicking ) {

          this.picks = this.picks || [];

          for ( var n = 0, m = this.options.autoPeakPickingNb; n < m; n++ ) {

            var shape = this.graph.newShape( {

              type: 'label',
              label: {
                text: "",
                position: {
                  x: 0
                },
                anchor: 'middle',

              },

              selectable: true,

              shapeOptions: {
                minPosY: 15
              }

            } );

            shape.draw();
            shape.setSerie( self );
            self.picks.push( shape );

          }

        }

        this.groupLines.addEventListener( 'click', function( e ) {

          if ( self.options.selectableOnClick ) {

            if ( self.isSelected() ) {

              self.graph.unselectSerie( self );

            } else {
              self.graph.selectSerie( self );
            }
          }
        } );

      };

      /**
       * @name SerieLineDefaultOptions
       * @object
       * @static
       * @memberof SerieLine
       */
      SerieLine.prototype.defaults = {

        lineColor: 'black',
        lineStyle: 1,
        flip: false,
        label: "",
        lineWidth: 1,

        markers: false,
        trackMouse: false,
        trackMouseLabel: false,
        trackMouseLabelRouding: 1,
        lineToZero: false,

        autoPeakPicking: false,
        autoPeakPickingNb: 4,
        autoPeakPickingMinDistance: 10,
        autoPeakPickingFormat: false,
        autoPeakPickingAllowAllY: false,

        selectableOnClick: true,

        markersIndependant: false
      };

      /**
   * Sets the options of the serie
   * @see SerieLineDefaultOptions
   * @param {Object} options - A object containing the options to set
   * @return {SerieLine} The current serie
   * @memberof SerieLine
   
*/
      SerieLine.prototype.setOptions = function( options ) {
        this.options = $.extend( true, {}, SerieLine.prototype.defaults, ( options || {} ) );
        // Unselected style
        this.styles.unselected = {
          lineColor: this.options.lineColor,
          lineStyle: this.options.lineStyle,
          markers: this.options.markers
        };

        this.applyLineStyles();
        return this;
      };

      SerieLine.prototype.calculateSlots = function() {

        var self = this;
        this.slotsData = {};
        for ( var i = 0, l = this.slots.length; i < l; i++ ) {
          this.calculateSlot( this.slots[ i ], i );
        }
      };

      SerieLine.prototype.slotCalculator = function( slot, slotNumber ) {

        return SlotOptimizer( {

          min: this.minX,
          max: this.maxX,
          data: this.data,
          slot: slot,
          slotNumber: slotNumber,
          flip: this.getFlip()

        } );

      };

      SerieLine.prototype.calculateSlot = function( slot, slotNumber ) {
        var self = this;
        this.slotsData[ slot ] = this.slotCalculator( slot, slotNumber );
        this.slotsData[ slot ].pipe( function( data ) {

          self.slotsData[ slot ] = data;
          return data;
        } );
      };

      SerieLine.prototype.onMouseOverMarker = function( e, index ) {

        var toggledOn = this.toggleMarker( index, true, true );
        if ( this.options.onMouseOverMarker ) {

          this.options.onMouseOverMarker( index, this.infos ? ( this.infos[ index[ 0 ] ] || false ) : false, [ this.data[ index[ 1 ] ][ index[ 0 ] * 2 ], this.data[ index[ 1 ] ][ index[ 0 ] * 2 + 1 ] ] );
        }
      };

      SerieLine.prototype.onMouseOutMarker = function( e, index ) {
        this.markersOffHover();
        if ( this.options.onMouseOutMarker ) {
          this.options.onMouseOutMarker( index, this.infos ? ( this.infos[ index[ 0 ] ] || false ) : false, [ this.data[ index[ 1 ] ][ index[ 0 ] * 2 ], this.data[ index[ 1 ] ][ index[ 0 ] * 2 + 1 ] ] );
        }
      };

      /**
       * Selects one of the markers of the serie
       * @param {Number} index - The point index to select (starting at 0)
       * @param {Boolean} [force = undefined] - Forces state of the marker. <code>true</code> forces selection, <code>false</code> forces deselection. <code>undefined</code> toggles the state of the marker
       * @param {Boolean} [hover = false] - <code>true</code> to set the selection in mode "hover" (will disappear on mouse out of the marker). <code>false</code> to set the selection in mode "select" (will disappear when another marker is selected)
       * @returns {Boolean} The new state of the marker
       * @memberof SerieLine
       */
      SerieLine.prototype.toggleMarker = function( index, force, hover ) {

        var i = index[ 0 ],
          k = index[ 1 ] || 0;

        index = index.join();

        var _on;
        if ( typeof force === 'undefined' ) {
          _on = !hover ? !this.domMarkerSelect[ index ] : !this.domMarkerHover[ index ];
        }
        var el = this[ 'domMarker' + ( hover ? 'Hover' : 'Select' ) ];

        if ( _on || force === true ) {

          if ( !el[ index ] ) {

            var dom = document.createElementNS( this.graph.ns, 'path' );

            this.setMarkerStyleTo( dom, this.markerFamilies[ this.selectionType ][ this.getMarkerCurrentFamily( i ) ] );
            this[ 'domMarker' + ( hover ? 'Hover' : 'Select' ) ][ index ] = dom;
            this.groupMarkerSelected.appendChild( dom );

          } else {
            dom = el[ index ];
          }

          var x, y;

          if ( this.mode == 'x_equally_separated' ) {
            x = this._xDataToUse[ k ].x + i * this._xDataToUse[ k ].dx;
            y = this.data[ k ][ i ];
          } else {
            x = this.data[ k ][ i * 2 ];
            y = this.data[ k ][ i * 2 + 1 ];
          }

          x = this.getX( x );
          y = this.getY( y );

          dom.setAttribute( 'd', "M " + x + " " + y + " " + this.getMarkerPath( this.markerFamilies[ this.selectionType ][ this.getMarkerCurrentFamily( i ) ], 1 ) );

          if ( hover ) {
            this.markerHovered++;
          }

        } else if ( !_on || force === false ) {

          if ( ( hover && this.domMarkerHover[ index ] && !this.domMarkerSelect[ index ] ) || this.domMarkerSelect[ index ] ) {

            if ( !el[ index ] ) {
              return;
            }

            this.groupMarkerSelected.removeChild( el[ index ] );

            delete el[ index ];

            if ( hover )
              this.markerHovered--;
          }

        }

        return _on;
      };

      /**
       * Toggles off markers that have the hover mode "on"
       * @returns {SerieLine} The current serie
       * @memberof SerieLine
       */
      SerieLine.prototype.markersOffHover = function() {

        for ( var i in this.domMarkerHover ) {
          this.toggleMarker( i.split( ',' ), false, true );
        }
        return this;
      };

      /**
       * Toggles off markers that have the select mode "on"
       * @returns {SerieLine} The current serie
       * @memberof SerieLine
       */
      SerieLine.prototype.markersOffSelect = function() {

        for ( var i in this.domMarkerSelect ) {
          this.toggleMarker( i.split( ',' ), false, false );
        }
        return this;
      };

      SerieLine.prototype.onClickOnMarker = function( e, index ) {

        var toggledOn = this.toggleMarker( index );

        if ( toggledOn && this.options.onSelectMarker ) {
          this.options.onSelectMarker( index, this.infos ? ( this.infos[ index[ 0 ] ] || false ) : false );
        }

        if ( !toggledOn && this.options.onUnselectMarker ) {
          this.options.onUnselectMarker( index, this.infos ? ( this.infos[ index[ 0 ] ] || false ) : false );
        }

        if ( this.options.onToggleMarker ) {
          this.options.onToggleMarker( index, this.infos ? ( this.infos[ index[ 0 ] ] || false ) : false, toggledOn );
        }
      };

      SerieLine.prototype._getMarkerIndexFromEvent = function( e ) {
        var px = this.graph._getXY( e );

        //  return this.searchIndexByPxXY( ( px.x ), ( px.y ) );
        return this.searchIndexByPxXY( ( px.x - this.graph.getPaddingLeft() ), ( px.y - this.graph.getPaddingTop() ) );
      };

      SerieLine.prototype.onMouseWheel = function() {};

      /**
       * Cleans the DOM from the serie internal object (serie and markers). Mostly used internally when a new {@link Serie#setData} is called
       * @returns {SerieLine} The current serie
       * @memberof SerieLine
       */
      SerieLine.prototype.empty = function() {

        for ( var i = 0, l = this.lines.length; i < l; i++ ) {
          this.groupLines.removeChild( this.lines[ i ] );
        }
        this.lines = [];

        return this;
      };

      /**
       * Applies a selection to the serie
       * @param {String} [ selectionType = "selected" ] - The selection name
       * @returns {SerieLine} The current serie
       * @see SerieLine#unselect
       * @memberof SerieLine
       */
      SerieLine.prototype.select = function( selectionType ) {

        selectionType = selectionType || "selected";

        this.selected = selectionType !== "unselected";

        if ( !( !this.areMarkersShown() && !this.areMarkersShown( selectionType ) ) ) {
          this.selectionType = selectionType;

          this.draw(); // Drawing is absolutely required here
          this.applyLineStyles();
        } else {
          this.selectionType = selectionType;
          this.applyLineStyles();
        }

        this.applyLineStyle( this.getSymbolForLegend() );
        return this;
      };

      /**
       * Removes the selection to the serie. Effectively, calls {@link SerieLine#select}("unselected").
       * @returns {SerieLine} The current serie
       * @see SerieLine#select
       * @memberof SerieLine
       */
      SerieLine.prototype.unselect = function() {

        this.selected = false;
        return this.select( "unselected" );
      };

      /**
       * Degrades the data of the serie. This option is used for big data sets that have monotoneously increasing (or decreasing) x values.
       * For example, a serie containing 1'000'000 points, displayed over 1'000px, will have 1'000 points per pixel. Often it does not make sense to display more than 2-3 points per pixel.
       * <code>degrade( pxPerPoint )</code> allows a degradation of the serie, based on a a number of pixel per point. It computes the average of the data that would be displayed over each pixel range, as well as the minimum value and maximum value of the serie.
       * It then creates a zone serie that will be show the minimum and maximum values over each pixel ranges, and the averaged data will be used in the current serie.
       * @param {Object} options - A object containing the options to set
       * @return {SerieLine} The newly created zone serie
       * @example var zone = serie.degrade( 0.5, { fillColor: 'rgba(100, 100, 100, 0.2' } ); // Will display 2 points per pixels
       * zone.setLineColor('red');
       * @memberof SerieLine
       */
      SerieLine.prototype.degrade = function( pxPerP, options ) {

        var serie = this.graph.newSerie( this.name + "_degraded", options, 'zone' );

        this.degradationPx = pxPerP;

        if ( !serie ) {
          return;
        }

        serie.setData( [] );

        serie.setXAxis( this.getXAxis() );
        serie.setYAxis( this.getYAxis() );

        this.degradationSerie = serie;

        return serie;
      };

      SerieLine.prototype.drawInit = function() {

        var data, xData;

        this.currentLineId = 0;
        this.counter = 0;
        this._drawn = true;
        this.currentLine = "";

        // Degradation
        if ( this.degradationPx ) {

          data = getDegradedData( this );
          xData = data[ 1 ];
          data = data[ 0 ];
          this._dataToUse = data;
          this._xDataToUse = xData;

        } else {

          this._dataToUse = this.data;
          this._xDataToUse = this.xData;
        }

        this._optimizeMonotoneous = this.isXMonotoneous();

        this.optimizeMonotoneousDirection = ( this.XMonotoneousDirection() && !this.getXAxis().isFlipped() ) || ( !this.XMonotoneousDirection() && this.getXAxis().isFlipped() );

        this._optimizeBreak;
        this._optimizeBuffer;

        // Slots
        this._slotToUse = false;
        if ( this.options.useSlots && this.slots && this.slots.length > 0 ) {
          if ( this.isFlipped() ) {
            var slot = this.graph.getDrawingHeight() * ( this.maxY - this.minY ) / ( this.getYAxis().getCurrentMax() - this.getYAxis().getCurrentMin() );
          } else {
            var slot = this.graph.getDrawingWidth() * ( this.maxX - this.minX ) / ( this.getXAxis().getCurrentMax() - this.getXAxis().getCurrentMin() );
          }

          for ( var y = 0, z = this.slots.length; y < z; y++ ) {
            if ( slot < this.slots[ y ] ) {
              this._slotToUse = this.slotsData[ this.slots[ y ] ];
              this._slotId = y;
              break;
            }
          }
        }

        this.detectedPeaks = [];
        this.lastYPeakPicking = false;

      };

      SerieLine.prototype.removeLinesGroup = function() {
        this._afterLinesGroup = this.groupLines.nextSibling;
        this.groupMain.removeChild( this.groupLines );
      };

      SerieLine.prototype.insertLinesGroup = function() {

        if ( !this._afterLinesGroup ) {
          throw "Could not find group after lines to insertion."
        }

        this.groupMain.insertBefore( this.groupLines, this._afterLinesGroup );
        this._afterLinesGroup = false;
      };

      SerieLine.prototype.removeExtraLines = function() {

        var i = this.currentLineId,
          l = this.lines.length;

        for ( ; i < l; i++ ) {
          this.groupLines.removeChild( this.lines[ i ] );
        }

        this.lines.splice( this.currentLineId, l - ( this.currentLineId ) );
        this.currentLineId = 0;
      };

      SerieLine.prototype.detectPeaks = function( x, y ) {

        if ( !this.options.autoPeakPicking ) {
          return;
        }

        if ( !this.options.lineToZero ) {

          if ( !this.lastYPeakPicking ) {

            this.lastYPeakPicking = [ y, x ];

          } else {

            if ( ( y >= this.lastYPeakPicking[ 0 ] && this.lookForMaxima ) || ( y <= this.lastYPeakPicking[ 0 ] && this.lookForMinima ) ) {

              this.lastYPeakPicking = [ y, x ]

            } else if ( ( y < this.lastYPeakPicking[ 0 ] && this.lookForMaxima ) || ( y > this.lastYPeakPicking[ 0 ] && this.lookForMinima ) ) {

              if ( this.lookForMinima ) {
                this.lookForMinima = false;
                this.lookForMaxima = true;

              } else {

                this.lookForMinima = true;
                this.lookForMaxima = false;

                this.detectedPeaks.push( this.lastYPeakPicking );
                this.lastYPeakPicking = false;
              }

              this.lastYPeakPicking = [ y, x ];

            }
          }

        } else {
          this.detectedPeaks.push( [ y, x ] );
        }
      };

      /**
       * Draws the serie
       * @memberof SerieLine
       */
      SerieLine.prototype.draw = function( force ) { // Serie redrawing

        if ( force || this.hasDataChanged() ) {
          this.drawInit();

          var data = this._dataToUse,
            xData = this._xDataToUse,
            slotToUse = this._slotToUse;

          this.removeLinesGroup();
          this.eraseMarkers();

          this.lookForMaxima = true;
          this.lookForMinima = false;

          if ( this.error ) {
            this.errorDrawInit();
          }

          if ( !this._draw_slot() ) {

            if ( this.mode == 'x_equally_separated' ) {

              this._draw_equally_separated();

            } else {

              this._draw_standard();

            }
          }

          if ( this.error ) {
            this.errorDraw();
          }

          this.makePeakPicking();
          this.removeExtraLines();
          this.insertMarkers();
          this.insertLinesGroup();
        }

        // Unhovers everything
        for ( var i in this.domMarkerHover ) {
          this.toggleMarker( i.split( ',' ), false, true );
        }

        // Deselects everything
        for ( var i in this.domMarkerSelect ) {
          this.toggleMarker( i.split( ',' ), false, false );
        }

        this.applyLineStyle( this.getSymbolForLegend() );

        if ( this.hasStyleChanged( this.selectionType ) ) {
          this.updateStyle();
        }

        this.dataHasChanged( false );
      };

      SerieLine.prototype._draw_standard = function() {

        var self = this,
          data = this._dataToUse,
          toBreak,
          i = 0,
          l = data.length,
          j,
          k,
          m,
          x,
          y,
          k,
          o,
          lastX = false,
          lastY = false,
          xpx,
          ypx,
          xpx2,
          ypx2,
          xAxis = this.getXAxis(),
          yAxis = this.getYAxis(),
          xMin = xAxis.getCurrentMin(),
          yMin = yAxis.getCurrentMin(),
          xMax = xAxis.getCurrentMax(),
          yMax = yAxis.getCurrentMax();

        // Y crossing
        var yLeftCrossingRatio,
          yLeftCrossing,
          yRightCrossingRatio,
          yRightCrossing,
          xTopCrossingRatio,
          xTopCrossing,
          xBottomCrossingRatio,
          xBottomCrossing;

        var incrXFlip = 0;
        var incrYFlip = 1;

        var pointOutside = false;
        var lastPointOutside = false;
        var pointOnAxis;

        if ( this.isFlipped() ) {
          incrXFlip = 1;
          incrYFlip = 0;
        }

        for ( i = 0; i < l; i++ ) {

          toBreak = false;
          this.counter1 = i;

          this.currentLine = "";
          j = 0;
          k = 0;
          m = data[ i ].length;

          for ( j = 0; j < m; j += 2 ) {

            x = data[ i ][ j + incrXFlip ];
            y = data[ i ][ j + incrYFlip ];

            if ( ( x < xMin && lastX < xMin ) || ( x > xMax && lastX > xMax ) || ( ( ( y < yMin && lastY < yMin ) || ( y > yMax && lastY > yMax ) ) && !this.options.lineToZero ) ) {
              lastX = x;
              lastY = y;
              lastPointOutside = true;
              continue;
            }

            this.counter2 = j / 2;

            if ( this.markersShown() ) {
              this.getMarkerCurrentFamily( this.counter2 );
            }

            xpx2 = this.getX( x );
            ypx2 = this.getY( y );

            if ( xpx2 == xpx && ypx2 == ypx ) {
              continue;
            }

            pointOutside = ( x < xMin || y < yMin || x > xMax || y > yMax );

            if ( this.options.lineToZero ) {
              pointOutside = ( x < xMin || x > xMax );

              if ( pointOutside ) {
                continue;
              }
            } else {

              if ( pointOutside || lastPointOutside ) {

                if ( ( lastX === false || lastY === false ) && !lastPointOutside ) {

                  xpx = xpx2;
                  ypx = ypx2;
                  lastX = x;
                  lastY = y;

                } else {

                  pointOnAxis = [];
                  // Y crossing
                  yLeftCrossingRatio = ( x - xMin ) / ( x - lastX );
                  yLeftCrossing = y - yLeftCrossingRatio * ( y - lastY );
                  yRightCrossingRatio = ( x - xMax ) / ( x - lastX );
                  yRightCrossing = y - yRightCrossingRatio * ( y - lastY );

                  // X crossing
                  xTopCrossingRatio = ( y - yMin ) / ( y - lastY );
                  xTopCrossing = x - xTopCrossingRatio * ( x - lastX );
                  xBottomCrossingRatio = ( y - yMax ) / ( y - lastY );
                  xBottomCrossing = x - xBottomCrossingRatio * ( x - lastX );

                  if ( yLeftCrossingRatio < 1 && yLeftCrossingRatio > 0 && yLeftCrossing !== false && yLeftCrossing < yMax && yLeftCrossing > yMin ) {
                    pointOnAxis.push( [ xMin, yLeftCrossing ] );
                  }

                  if ( yRightCrossingRatio < 1 && yRightCrossingRatio > 0 && yRightCrossing !== false && yRightCrossing < yMax && yRightCrossing > yMin ) {
                    pointOnAxis.push( [ xMax, yRightCrossing ] );
                  }

                  if ( xTopCrossingRatio < 1 && xTopCrossingRatio > 0 && xTopCrossing !== false && xTopCrossing < xMax && xTopCrossing > xMin ) {
                    pointOnAxis.push( [ xTopCrossing, yMin ] );
                  }

                  if ( xBottomCrossingRatio < 1 && xBottomCrossingRatio > 0 && xBottomCrossing !== false && xBottomCrossing < xMax && xBottomCrossing > xMin ) {
                    pointOnAxis.push( [ xBottomCrossing, yMax ] );
                  }

                  if ( pointOnAxis.length > 0 ) {

                    if ( !pointOutside ) { // We were outside and now go inside

                      if ( pointOnAxis.length > 1 ) {
                        console.error( "Programmation error. Please e-mail me." );
                        console.log( pointOnAxis, xBottomCrossing, xTopCrossing, yRightCrossing, yLeftCrossing, y, yMin, yMax, lastY );
                      }

                      this._createLine();
                      this._addPoint( this.getX( pointOnAxis[ 0 ][ 0 ] ), this.getY( pointOnAxis[ 0 ][ 1 ] ), pointOnAxis[ 0 ][ 0 ], pointOnAxis[ 0 ][ 1 ], false, false, false );
                      this._addPoint( xpx2, ypx2, lastX, lastY, false, false, true );

                    } else if ( !lastPointOutside ) { // We were inside and now go outside

                      if ( pointOnAxis.length > 1 ) {
                        console.error( "Programmation error. Please e-mail me." );
                        console.log( pointOnAxis, xBottomCrossing, xTopCrossing, yRightCrossing, yLeftCrossing, y, yMin, yMax, lastY );
                      }

                      this._addPoint( this.getX( pointOnAxis[ 0 ][ 0 ] ), this.getY( pointOnAxis[ 0 ][ 1 ] ), pointOnAxis[ 0 ][ 0 ], pointOnAxis[ 0 ][ 1 ], false, false, false );

                    } else {

                      // No crossing: do nothing
                      if ( pointOnAxis.length == 2 ) {
                        this._createLine();

                        this._addPoint( this.getX( pointOnAxis[ 0 ][ 0 ] ), this.getY( pointOnAxis[ 0 ][ 1 ] ), pointOnAxis[ 0 ][ 0 ], pointOnAxis[ 0 ][ 1 ], false, false, false );
                        this._addPoint( this.getX( pointOnAxis[ 1 ][ 0 ] ), this.getY( pointOnAxis[ 1 ][ 1 ] ), pointOnAxis[ 0 ][ 0 ], pointOnAxis[ 0 ][ 1 ], false, false, false );
                      }

                    }
                  } else if ( !pointOutside ) {
                    this._addPoint( xpx2, ypx2, lastX, lastY, j, false, false );
                  } // else {
                  // Norman:
                  // This else case is not the sign of a bug. If yLeftCrossing == 0 or 1 for instance, pointOutside or lastPointOutside will be true
                  // However, there's no need to draw anything because the point is on the axis and will already be covered.
                  // 28 Aug 2015

                  /*
                    if ( lastPointOutside !== pointOutside ) {
                      console.error( "Programmation error. A crossing should have been found" );
                      console.log( yLeftCrossing, yLeftCrossingRatio, yMax, yMin );
                      console.log( yRightCrossing, yRightCrossingRatio, yMax, yMin );
                      console.log( xTopCrossing, xTopCrossingRatio, xMax, xMin );
                      console.log( xBottomCrossing, xBottomCrossingRatio, xMax, xMin );
                      console.log( pointOutside, lastPointOutside )

                    }
                    */
                  // }
                }

                xpx = xpx2;
                ypx = ypx2;
                lastX = x;
                lastY = y;

                lastPointOutside = pointOutside;

                continue;
              }

            }

            if ( isNaN( xpx2 ) || isNaN( ypx2 ) ) {
              if ( this.counter > 0 ) {

                this._createLine();
              }
              continue;
            }

            // OPTIMIZATION START
            if ( !this._optimize_before( xpx2, ypx2 ) ) {
              continue;

            }
            // OPTIMIZATION END

            this._addPoint( xpx2, ypx2, x, y, j, false, true );

            this.detectPeaks( x, y );

            // OPTIMIZATION START
            if ( !this._optimize_after( xpx2, ypx2 ) ) {
              toBreak = true;
              break;

            }
            // OPTIMIZATION END

            xpx = xpx2;
            ypx = ypx2;

            lastX = x;
            lastY = y;
          }

          this._createLine();

          if ( toBreak ) {
            break;
          }

        }

        if ( this._tracker ) {

          if ( this._trackerDom ) {
            this.groupLines.removeChild( this._trackerDom );
          }

          var cloned = this.groupLines.cloneNode( true );
          this.groupMain.appendChild( cloned );

          for ( var i = 0, l = cloned.children.length; i < l; i++ ) {

            cloned.children[ i ].setAttribute( 'stroke', 'transparent' );
            cloned.children[ i ].setAttribute( 'stroke-width', '25px' );
            cloned.children[ i ].setAttribute( 'pointer-events', 'stroke' );
          }

          self._trackerDom = cloned;

          self.groupMain.addEventListener( "mousemove", function( e ) {
            var coords = self.graph._getXY( e ),
              ret = self.handleMouseMove( false, false );
            self._trackingCallback( self, ret, coords.x, coords.y );
          } );

          self.groupMain.addEventListener( "mouseleave", function( e ) {
            self._trackingOutCallback( self );
          } );
        }
        return this;

      };

      SerieLine.prototype._draw_slot = function() {

        var self = this;
        if ( this._slotToUse ) {

          if ( this._slotToUse.done ) {

            this._slotToUse.done( function( data ) {
              self.drawSlot( data, self._slotId );
            } );

          } else {

            this.drawSlot( this._slotToUse, self._slotId );

          }
          return true;

        }

        return false;
      };

      SerieLine.prototype._draw_equally_separated = function() {

        var i = 0,
          data = this._dataToUse,
          xData = this._xDataToUse,
          l = data.length,
          j,
          k,
          m,
          x,
          y,
          xpx,
          ypx,
          toBreak,
          currentLine;

        for ( ; i < l; i++ ) {

          currentLine = "M ";
          j = 0;
          k = 0;
          m = data[ i ].length;

          this.counter1 = i;

          for ( ; j < m; j += 1 ) {

            this.counter2 = j;

            if ( this.markersShown() ) {

              this.getMarkerCurrentFamily( k );
            }

            if ( !this.isFlipped() ) {

              x = xData[ i ].x + j * xData[ i ].dx;
              y = data[ i ][ j ];

              xpx = this.getX( x );
              ypx = this.getY( y );

            } else {

              y = xData[ i ].x + j * xData[ i ].dx;
              x = data[ i ][ j ];

              ypx = this.getX( y );
              xpx = this.getY( x );

            }

            // OPTIMIZATION START
            if ( !this._optimize_before( xpx, ypx ) ) {
              continue;
            }
            // OPTIMIZATION END

            this._addPoint( xpx, ypx, x, y, j, false, false );

            // OPTIMIZATION START
            if ( !this._optimize_after( xpx, ypx ) ) {
              toBreak = true;
              break;
            }
            // OPTIMIZATION END

          }

          this._createLine();

          if ( toBreak ) {
            break;
          }
        }

      };

      SerieLine.prototype._optimize_before = function( xpx, ypx ) {

        if ( !this._optimizeMonotoneous ) {
          return true;
        }

        if ( ( this.optimizeMonotoneousDirection && xpx < this.getXAxis().getMathMinPx() ) || ( !this.optimizeMonotoneousDirection && xpx > this.getXAxis().getMathMaxPx() ) ) {

          //      if ( xpx < this._optimizeMinPxX ) {

          this._optimizeBuffer = [ xpx, ypx ];
          return false;
        }

        if ( this._optimizeBuffer ) {

          this._addPoint( this._optimizeBuffer[ 0 ], this._optimizeBuffer[ 1 ], false, false, false, false, false );
          this._optimizeBuffer = false;

        }

        return true;
      };

      SerieLine.prototype._optimize_after = function( xpx, ypx ) {

        if ( !this._optimizeMonotoneous ) {
          return true;
        }

        if ( ( this.optimizeMonotoneousDirection && xpx > this.getXAxis().getMathMaxPx() ) || ( !this.optimizeMonotoneousDirection && xpx < this.getXAxis().getMathMinPx() ) ) {

          return false;
        }

        return true;
      };

      /**
       * Hides the automatic peak picking (see the autoPeakPicking option)
       * @memberof SerieLine
       */
      SerieLine.prototype.hidePeakPicking = function( lock ) {

        if ( !this._hidePeakPickingLocked ) {
          this._hidePeakPickingLocked = lock;
        }

        hidePeakPicking( this );
      };

      /**
       * Shows the automatic peak picking (see the autoPeakPicking option)
       * @memberof SerieLine
       */
      SerieLine.prototype.showPeakPicking = function( unlock ) {

        if ( this._hidePeakPickingLocked && !unlock ) {
          return;
        }

        showPeakPicking( this );
      };

      SerieLine.prototype.killPeakPicking = function() {

        if ( this.picks ) {
          for ( var i = 0, l = this.picks.length; i < l; i++ ) {
            this.picks[ i ].kill();
          }
        }
      };

      SerieLine.prototype.killImpl = function() {
        this.killPeakPicking();
      };

      /**
       * @param {Number} k - Index of the point for which we should get the family
       * @memberof SerieLine
       */
      SerieLine.prototype.getMarkerCurrentFamily = function( k ) {

        if ( !this.markerPoints[ this.selectionType ] ) {
          return;
        }

        for ( var z = 0; z < this.markerPoints[ this.selectionType ].length; z++ ) {
          if ( this.markerPoints[ this.selectionType ][ z ][ 0 ] <= k ) { // This one is a possibility !
            if ( this.markerPoints[ this.selectionType ][ z ][ 1 ] >= k ) { // Verify that it's in the boundary
              this.markerCurrentFamily = this.markerPoints[ this.selectionType ][ z ][ 2 ];

            }
          } else {
            break;
          }

        }

        return this.markerCurrentFamily;

      };

      SerieLine.prototype.drawSlot = function( slotToUse, y ) {

        var k = 0;
        var i = 0,
          xpx, ypx, max;
        var j;

        if ( this.isFlipped() ) {

          var dataPerSlot = this.slots[ y ] / ( this.maxY - this.minY );

          var slotInit = Math.floor( ( this.getYAxis().getCurrentMin() - this.minY ) * dataPerSlot );
          var slotFinal = Math.ceil( ( this.getYAxis().getCurrentMax() - this.minY ) * dataPerSlot );

        } else {

          var dataPerSlot = this.slots[ y ] / ( this.maxX - this.minX );

          var slotInit = Math.floor( ( this.getXAxis().getCurrentMin() - this.minX ) * dataPerSlot );
          var slotFinal = Math.ceil( ( this.getXAxis().getCurrentMax() - this.minX ) * dataPerSlot );
        }

        for ( j = slotInit; j <= slotFinal; j++ ) {

          if ( !slotToUse[ j ] ) {
            continue;
          }

          if ( this.isFlipped() ) {

            ypx = Math.floor( this.getY( slotToUse[ j ].x ) );
            max = this.getX( slotToUse[ j ].max );

            /*if ( this.options.autoPeakPicking ) {
            allY.push( [ slotToUse[ j ].max, slotToUse[ j ].x ] );
          }
* @memberof SerieLine
*/
            this._addPoint( this.getX( slotToUse[ j ].start ), ypx, false, false, false, false, false );
            this._addPoint( max, ypx, false, false, false, true, false );
            this._addPoint( this.getX( slotToUse[ j ].min ), ypx, false, false, false, false, false );
            this._addPoint( this.getX( slotToUse[ j ].stop ), ypx, false, false, false, true, false );

            //    k++;
          } else {

            xpx = Math.floor( this.getX( slotToUse[ j ].x ) );
            max = this.getY( slotToUse[ j ].max );

            if ( this.options.autoPeakPicking ) {
              allY.push( [ slotToUse[ j ].max, slotToUse[ j ].x ] );
            }

            this._addPoint( xpx, this.getY( slotToUse[ j ].start ), false, false, false, false, false );
            this._addPoint( xpx, max, false, false, false, true, false );
            this._addPoint( xpx, this.getY( slotToUse[ j ].min ), false, false, false, false, false );
            this._addPoint( xpx, this.getY( slotToUse[ j ].stop ), false, false, false, true, false );

            //this.counter ++;
          }

        }

        this._createLine();
        i++;

      };

      SerieLine.prototype.setMarkerStyleTo = function( dom, family ) {

        if ( !dom || !family ) {
          console.trace();
          throw "Cannot set marker style. DOM does not exist.";
        }

        dom.setAttribute( 'fill', family.fillColor || 'transparent' );
        dom.setAttribute( 'stroke', family.strokeColor || this.getLineColor() );
        dom.setAttribute( 'stroke-width', family.strokeWidth || 1 );
      };

      /**
       * Hides the tracking marker (see the trackMouse option)
       * @memberof SerieLine
       */
      SerieLine.prototype.hideTrackingMarker = function() {
        this.marker.setAttribute( 'display', 'none' );
        this.markerLabel.setAttribute( 'display', 'none' );
        this.markerLabelSquare.setAttribute( 'display', 'none' );
      };

      SerieLine.prototype._addPoint = function( xpx, ypx, x, y, j, move, allowMarker ) {
        var pos;

        /*if( ! this.currentLineId ) {
        throw "No current line"
      }* @memberof SerieLine
*/

        if ( isNaN( xpx ) || isNaN( ypx ) ) {
          return;
        }

        if ( this.counter == 0 ) {
          this.currentLine = 'M ';
        } else {

          if ( this.options.lineToZero || move )
            this.currentLine += 'M ';
          else
            this.currentLine += "L ";
        }

        this.currentLine += xpx;
        this.currentLine += " ";
        this.currentLine += ypx;
        this.currentLine += " ";

        if ( this.options.lineToZero && ( pos = this.getYAxis().getPos( 0 ) ) !== undefined ) {

          this.currentLine += "L ";
          this.currentLine += xpx;
          this.currentLine += " ";
          this.currentLine += pos;
          this.currentLine += " ";

        }

        if ( this.error ) {
          this.errorAddPoint( j, x, y, xpx, ypx );
        }

        if ( !this.markerPoints ) {
          this.counter++;

          return;
        }

        if ( this.markersShown() && allowMarker !== false ) {
          drawMarkerXY( this, this.markerFamilies[ this.selectionType ][ this.markerCurrentFamily ], xpx, ypx );
        }

        this.counter++;

      };

      // Returns the DOM
      SerieLine.prototype._createLine = function() {

        var i = this.currentLineId++,
          line;

        // Creates a line if needed
        if ( this.lines[ i ] ) {
          line = this.lines[ i ];
        } else {

          line = document.createElementNS( this.graph.ns, 'path' );
          this.applyLineStyle( line );
          this.groupLines.appendChild( line );
          this.lines[ i ] = line;
        }

        if ( this.counter == 0 ) {
          line.setAttribute( 'd', '' );
        } else {
          line.setAttribute( 'd', this.currentLine );
        }

        this.currentLine = "M ";
        this.counter = 0;

        return line;
      };

      /**
       * Reapply the current style to the serie lines elements. Mostly used internally
       * @memberof SerieLine
       */
      SerieLine.prototype.applyLineStyles = function() {

        for ( var i = 0; i < this.lines.length; i++ ) {
          this.applyLineStyle( this.lines[ i ] );
        }
      };

      /**
       * Applies the current style to a line element. Mostly used internally
       * @memberof SerieLine
       */
      SerieLine.prototype.applyLineStyle = function( line ) {

        line.setAttribute( 'stroke', this.getLineColor() );
        line.setAttribute( 'stroke-width', this.getLineWidth() );
        if ( this.getLineDashArray() ) {
          line.setAttribute( 'stroke-dasharray', this.getLineDashArray() );
        } else {
          line.removeAttribute( 'stroke-dasharray' );
        }
        line.setAttribute( 'fill', 'none' );
        //	line.setAttribute('shape-rendering', 'optimizeSpeed');
      };

      /**
       * Updates the current style (lines + legend) of the serie. Use this method if you have explicitely changed the options of the serie
       * @example var opts = { lineColor: 'red' };
       * var s = graph.newSerie( "name", opts ).setData( someData );
       * opts.lineColor = 'green';
       * s.updateStyle(); // Sets the lineColor to green
       * s.draw(); // Would also do the same thing, but recalculates the whole serie display (including (x,y) point pairs)
       * @memberof SerieLine
       */
      SerieLine.prototype.updateStyle = function() {
        this.applyLineStyles();
        this.setLegendSymbolStyle();

        this.styleHasChanged( false );
      };

      // Revised August 2014. Ok
      SerieLine.prototype.getMarkerPath = function( family, add ) {

        var z = family.zoom || 1,
          add = add || 0,
          el = [];

        switch ( family.type ) {

          case 2:
            el = [ 'm', -2, -2, 'l', 4, 4, 'm', -4, 0, 'l', 4, -4 ];
            break;

          case 3:
            el = [ 'm', -2, 0, 'l', 4, 0, 'm', -2, -2, 'l', 0, 4 ];
            break;

          case 4:
            el = [ 'm', -1, -1, 'l', 2, 0, 'l', -1, 2, 'z' ];
            break;

          default:
          case 1:
            el = [ 'm', -2, -2, 'l', 4, 0, 'l', 0, 4, 'l', -4, 0, 'z' ];
            break;

        }

        if ( ( z == 1 || !z ) && !add ) {
          return el.join( " " );
        }

        var num = "number";

        if ( !el ) {
          return;
        }

        for ( var i = 0, l = el.length; i < l; i++ ) {

          if ( typeof el[ i ] == num ) {

            el[ i ] *= ( z + add );
          }
        }

        return el.join( " " );

      };

      // Revised August 2014. Ok
      SerieLine.prototype.getMarkerDom = function( family ) {

        var self = this;
        if ( !family.dom ) {
          var dom = document.createElementNS( this.graph.ns, 'path' );
          this.setMarkerStyleTo( dom, family );
          family.dom = dom;
          family.path = "";

          dom.addEventListener( 'mouseover', function( e ) {
            var closest = self._getMarkerIndexFromEvent( e );
            self.onMouseOverMarker( e, closest );
          } );

          dom.addEventListener( 'mouseout', function( e ) {
            var closest = self._getMarkerIndexFromEvent( e );
            self.onMouseOutMarker( e, closest );
          } );

          dom.addEventListener( 'click', function( e ) {
            var closest = self._getMarkerIndexFromEvent( e );
            self.onClickOnMarker( e, closest );
          } );

        }

        return family.dom;
      };

      // In case markers are not grouped in families but independant
      SerieLine.prototype.getMarkerDomIndependant = function( index1, index2, family ) {

        var self = this;
        var index = index1 + "," + index2;

        if ( !this.independantMarkers[ index ] ) {

          var dom = document.createElementNS( this.graph.ns, 'path' );
          this.setMarkerStyleTo( dom, family );

          dom.addEventListener( 'mouseover', function( e ) {

            self.onMouseOverMarker( e, [ index2, index1 ] );
          } );

          dom.addEventListener( 'mouseout', function( e ) {

            self.onMouseOutMarker( e, [ index2, index1 ] );
          } );

          dom.addEventListener( 'click', function( e ) {
            self.onClickOnMarker( e, [ index2, index1 ] );
          } );

          this.independantMarkers[ index ] = dom;
        }

        this.groupMain.appendChild( this.independantMarkers[ index ] );

        return this.independantMarkers[ index ];
      };

      /**
       * Searches the closest point pair (x,y) to the a pair of pixel position
       * @param {Number} x - The x position in pixels (from the left)
       * @param {Number} y - The y position in pixels (from the left)
       * @returns {Number} Index in the data array of the closest (x,y) pair to the pixel position passed in parameters
       * @memberof SerieLine
       */
      SerieLine.prototype.searchIndexByPxXY = function( x, y ) {

        var oldDist = false,
          xyindex = false,
          dist;

        var xData = this._xDataToUse,
          p_x,
          p_y;

        if ( this.mode == "x_equally_separated" ) {

          for ( var i = 0, l = this.data.length; i < l; i++ ) {
            for ( var k = 0, m = this.data[ i ].length; k < m; k += 1 ) {

              p_x = xData[ i ].x + k * xData[ i ].dx;
              p_y = this.data[ i ][ k ];
              dist = Math.pow( ( this.getX( p_x ) - x ), 2 ) + Math.pow( ( this.getY( p_y ) - y ), 2 );
              //console.log(x, y, dist, this.data[i][k], this.data[i][k + 1]);

              if ( !oldDist || dist < oldDist ) {
                oldDist = dist;
                xyindex = [ k, i ];
              }
            }
          }
        } else {

          for ( var i = 0, l = this.data.length; i < l; i++ ) {
            for ( var k = 0, m = this.data[ i ].length; k < m; k += 2 ) {

              p_x = this.data[ i ][ k ];
              p_y = this.data[ i ][ k + 1 ];
              dist = Math.pow( ( this.getX( p_x ) - x ), 2 ) + Math.pow( ( this.getY( p_y ) - y ), 2 );
              if ( !oldDist || dist < oldDist ) {
                oldDist = dist;
                xyindex = [ k / 2, i ];
              }
            }
          }

        }

        return xyindex;
      };

      /**
       * Performs a binary search to find the closest point index to an x value. For the binary search to work, it is important that the x values are monotoneous.
       * @param {Number} valX - The x value to search for
       * @returns {Object} Index in the data array of the closest (x,y) pair to the pixel position passed in parameters
       * @memberof SerieLine
       */
      SerieLine.prototype.searchClosestValue = function( valX ) {

        var xMinIndex;

        for ( var i = 0; i < this.data.length; i++ ) {

          if ( ( valX <= this.data[ i ][ this.data[ i ].length - 2 ] && valX >= this.data[ i ][ 0 ] ) ) {
            xMinIndex = this._searchBinary( valX, this.data[ i ], false );
          } else if ( ( valX >= this.data[ i ][ this.data[ i ].length - 2 ] && valX <= this.data[ i ][ 0 ] ) ) {
            xMinIndex = this._searchBinary( valX, this.data[ i ], true );
          } else {
            continue;
          }

          return {
            dataIndex: i,
            xMin: this.data[ i ][ xMinIndex ],
            xMax: this.data[ i ][ xMinIndex + 2 ],
            yMin: this.data[ i ][ xMinIndex + 1 ],
            yMax: this.data[ i ][ xMinIndex + 3 ],
            xBeforeIndex: xMinIndex / 2,
            xAfterIndex: xMinIndex / 2 + 1,
            xBeforeIndexArr: xMinIndex,
            xClosest: ( Math.abs( this.data[ i ][ xMinIndex + 2 ] - valX ) < Math.abs( this.data[ i ][ xMinIndex ] - valX ) ? xMinIndex + 2 : xMinIndex ) / 2
          }
        }
      };

      SerieLine.prototype.handleMouseMove = function( xValue, doMarker ) {

        var valX = xValue || this.getXAxis().getMouseVal(),
          xMinIndex,
          xMin,
          yMin,
          xMax,
          yMax;

        var value = this.searchClosestValue( valX );

        if ( !value )
          return;

        var ratio = ( valX - value.xMin ) / ( value.xMax - value.xMin );
        var intY = ( ( 1 - ratio ) * value.yMin + ratio * value.yMax );

        if ( doMarker && this.options.trackMouse ) {

          if ( value.xMin == undefined ) {

            return false;

          } else {

            var x = this.getX( this.getFlip() ? intY : valX );
            var y = this.getY( this.getFlip() ? valX : intY );

            this.marker.setAttribute( 'display', 'block' );
            this.marker.setAttribute( 'cx', x );
            this.marker.setAttribute( 'cy', y );

            this.markerLabel.setAttribute( 'display', 'block' );
            this.markerLabelSquare.setAttribute( 'display', 'block' );
            switch ( this.options.trackMouseLabel ) {
              case false:
                break;

              default:
                this.markerLabel.textContent = this.options.trackMouseLabel
                  .replace( '<x>', valX.toFixed( this.options.trackMouseLabelRouding ) )
                  .replace( '<y>', intY.toFixed( this.options.trackMouseLabelRouding ) );
                break;
            }

            this.markerLabel.setAttribute( 'x', x + 5 );
            this.markerLabel.setAttribute( 'y', y - 5 );

            this.markerLabelSquare.setAttribute( 'x', x + 5 );
            this.markerLabelSquare.setAttribute( 'y', y - 5 - this.graph.options.fontSize );
            this.markerLabelSquare.setAttribute( 'width', this.markerLabel.getComputedTextLength() + 2 );
            this.markerLabelSquare.setAttribute( 'height', this.graph.options.fontSize + 2 );
          }
        }

        return {
          xBefore: value.xMin,
          xAfter: value.xMax,
          yBefore: value.yMin,
          yAfter: value.yMax,
          trueX: valX,
          interpolatedY: intY,
          xBeforeIndex: value.xBeforeIndex,
          xIndexClosest: value.xClosest
        };
      };

      SerieLine.prototype._searchBinary = function( target, haystack, reverse ) {
        var seedA = 0,
          length = haystack.length,
          seedB = ( length - 2 );

        if ( haystack[ seedA ] == target )
          return seedA;

        if ( haystack[ seedB ] == target )
          return seedB;

        var seedInt;
        var i = 0;

        while ( true ) {
          i++;
          if ( i > 100 ) {
            throw "Error loop";
          }

          seedInt = ( seedA + seedB ) / 2;
          seedInt -= seedInt % 2; // Always looks for an x.

          if ( seedInt == seedA || haystack[ seedInt ] == target )
            return seedInt;

          //		console.log(seedA, seedB, seedInt, haystack[seedInt]);
          if ( haystack[ seedInt ] <= target ) {
            if ( reverse )
              seedB = seedInt;
            else
              seedA = seedInt;
          } else if ( haystack[ seedInt ] > target ) {
            if ( reverse )
              seedA = seedInt;
            else
              seedB = seedInt;
          }
        }
      };

      /**
       * Gets the maximum value of the y values between two x values. The x values must be monotoneously increasing
       * @param {Number} startX - The start of the x values
       * @param {Number} endX - The end of the x values
       * @returns {Number} Maximal y value in between startX and endX
       * @memberof SerieLine
       */
      SerieLine.prototype.getMax = function( start, end ) {

        var start2 = Math.min( start, end ),
          end2 = Math.max( start, end ),
          v1 = this.searchClosestValue( start2 ),
          v2 = this.searchClosestValue( end2 ),
          i, j, max = -Infinity,
          initJ, maxJ;

        //      console.log( start2, end2, v1, v2 );

        if ( !v1 ) {
          start2 = this.minX;
          v1 = this.searchClosestValue( start2 );
        }

        if ( !v2 ) {
          end2 = this.maxX;
          v2 = this.searchClosestValue( end2 );
        }

        if ( !v1 || !v2 ) {
          return -Infinity;
        }

        for ( i = v1.dataIndex; i <= v2.dataIndex; i++ ) {
          initJ = i == v1.dataIndex ? v1.xBeforeIndexArr : 0;
          maxJ = i == v2.dataIndex ? v2.xBeforeIndexArr : this.data[ i ].length;

          for ( j = initJ; j <= maxJ; j += 2 ) {
            max = Math.max( max, this.data[ i ][ j + 1 ] );
          }
        }

        return max;
      };

      /**
       * Gets the minimum value of the y values between two x values. The x values must be monotoneously increasing
       * @param {Number} startX - The start of the x values
       * @param {Number} endX - The end of the x values
       * @returns {Number} Maximal y value in between startX and endX
       * @memberof SerieLine
       */
      SerieLine.prototype.getMin = function( start, end ) {

        var start2 = Math.min( start, end ),
          end2 = Math.max( start, end ),
          v1 = this.searchClosestValue( start2 ),
          v2 = this.searchClosestValue( end2 ),
          i, j, min = Infinity,
          initJ, maxJ;

        if ( !v1 ) {
          start2 = this.minX;
          v1 = this.searchClosestValue( start2 );
        }

        if ( !v2 ) {
          end2 = this.maxX;
          v2 = this.searchClosestValue( end2 );
        }

        if ( !v1 || !v2 ) {
          return Infinity;
        }

        for ( i = v1.dataIndex; i <= v2.dataIndex; i++ ) {
          initJ = i == v1.dataIndex ? v1.xBeforeIndexArr : 0;
          maxJ = i == v2.dataIndex ? v2.xBeforeIndexArr : this.data[ i ].length;

          for ( j = initJ; j <= maxJ; j += 2 ) {
            min = Math.min( min, this.data[ i ][ j + 1 ] );
          }
        }

        return min;
      };

      /* LINE STYLE * @memberof SerieLine
       */

      SerieLine.prototype.setStyle = function( style, selectionType ) {
        //console.log( style, selectionType );
        this.styles[ selectionType ] = style;
        this.styleHasChanged( selectionType );

      };

      SerieLine.prototype.setLineStyle = function( number, selectionType ) {

        selectionType = selectionType || "unselected";
        this.styles[ selectionType ] = this.styles[ selectionType ] || {};
        this.styles[ selectionType ].lineStyle = number;

        this.styleHasChanged( selectionType );

        return this;
      };

      SerieLine.prototype.getLineStyle = function( selectionType ) {
        return this.getStyle( selectionType ).lineStyle;
      };

      SerieLine.prototype.getLineDashArray = function( selectionType ) {

        switch ( this.getStyle( selectionType ).lineStyle ) {

          case 2:
            return "1, 1";
            break;
          case 3:
            return "2, 2";
            break;
          case 3:
            return "3, 3";
            break;
          case 4:
            return "4, 4";
            break;
          case 5:
            return "5, 5";
            break;

          case 6:
            return "5 2";
            break;
          case 7:
            return "2 5";
            break;

          case 8:
            return "4 2 4 4";
            break;
          case 9:
            return "1,3,1";
            break;
          case 10:
            return "9 2";
            break;
          case 11:
            return "2 9";
            break;

          case false:
          case 1:
            return false;
            break;

          default:
            return this.styles[ selectionType || this.selectionType || "unselected" ].lineStyle;
            break;
        }

        this.styleHasChanged( selectionType );

      };

      SerieLine.prototype.getStyle = function( selectionType ) {
        return this.styles[ selectionType || this.selectionType || "unselected" ];
      };

      SerieLine.prototype.extendStyles = function() {
        for ( var i in this.styles ) {

          var s = this.styles[ i ];
          if ( s ) {
            this.styles[ i ] = $.extend( true, {}, this.styles.unselected, s );
          }
        }
      };
      /*  * @memberof SerieLine
       */

      SerieLine.prototype.setLineWidth = function( width, selectionType ) {

        selectionType = selectionType || "unselected";
        this.styles[ selectionType ] = this.styles[ selectionType ] || {};
        this.styles[ selectionType ].lineWidth = width;

        this.styleHasChanged( selectionType );

        return this;
      };

      SerieLine.prototype.getLineWidth = function( selectionType ) {

        return this.getStyle( selectionType ).lineWidth;
      };

      /* LINE COLOR * @memberof SerieLine
       */
      SerieLine.prototype.setLineColor = function( color, selectionType ) {

        selectionType = selectionType || "unselected";
        this.styles[ selectionType ] = this.styles[ selectionType ] || {};
        this.styles[ selectionType ].lineColor = color;

        this.styleHasChanged( selectionType );

        return this;
      };

      SerieLine.prototype.getLineColor = function( selectionType ) {

        return this.getStyle( selectionType ).lineColor;
      };

      /* * @memberof SerieLine
       */

      /* MARKERS * @memberof SerieLine
       */
      SerieLine.prototype.showMarkers = function( selectionType, redraw ) {
        selectionType = selectionType || "unselected";
        this.styles[ selectionType ] = this.styles[ selectionType ] || {};
        this.styles[ selectionType ].showMarkers = true;

        if ( redraw && this._drawn ) {
          this.draw();
        } else {
          this.styleHasChanged( selectionType );
        }

        return this;
      };

      SerieLine.prototype.hideMarkers = function( selectionType, redraw ) {

        selectionType = selectionType || "unselected";
        this.styles[ selectionType ].showMarkers = false;

        if ( redraw && this._drawn ) {
          this.draw();
        } else {
          this.styleHasChanged( selectionType );
        }
        return this;
      };

      SerieLine.prototype.markersShown = function( selectionType ) {
        return this.getStyle( selectionType ).showMarkers;
      };

      SerieLine.prototype.areMarkersShown = function() {
        return this.markersShown.apply( this, arguments );
      };

      SerieLine.prototype.isMarkersShown = function() {
        return this.markersShown.apply( this, arguments );
      };

      // Multiple markers
      SerieLine.prototype.setMarkers = function( families, selectionType ) {
        // Family has to be an object
        // Family looks like
        /*
				{
					type: 1,
					zoom: 1,
					strokeWidth: 1,
					strokeColor: '',
					fillColor: '',
          points: []
				}
			* @memberof SerieLine
*/

        this.styles[ selectionType || "unselected" ] = this.styles[ selectionType || "unselected" ] || {};

        this.showMarkers( selectionType, false );

        if ( !Array.isArray( families ) && typeof families == 'object' ) {
          families = [ families ];
        } else if ( !families ) {

          families = [ {
            type: 1,
            zoom: 1,
            points: 'all'
          } ];
        }

        this.styles[ selectionType || "unselected" ].markers = families;

        this._recalculateMarkerPoints( selectionType, families );

        this.styleHasChanged( selectionType );
        this.dataHasChanged( true ); // Data has not really changed, but marker placing is performed during the draw method

        return this;
      };

      SerieLine.prototype.setMarkersPoints = function( points, family, selectionType ) {

        family = family || 0;
        selectionType = selectionType || "unselected";

        if ( !this.styles[ selectionType ] || !this.styles[ selectionType ].markers ) {
          return;
        }

        this.styles[ selectionType ].markers[ family ].points = points;
        this._recalculateMarkerPoints( selectionType, this.styles[ selectionType ].markers );
      };

      SerieLine.prototype._recalculateMarkerPoints = function( selectionType, families ) {

        var markerPoints = [];
        // Overwriting any other undefined families
        markerPoints.push( [ 0, Infinity, null ] );

        for ( var i = 0, k = families.length; i < k; i++ ) {

          this.getMarkerDom( families[ i ] );
          families[ i ].markerPath = this.getMarkerPath( families[ i ] );

          if ( !families[ i ].points ) {
            families[ i ].points = 'all';
          }

          if ( !Array.isArray( families[ i ].points ) ) {
            families[ i ].points = [ families[ i ].points ];
          }

          for ( var j = 0, l = families[ i ].points.length; j < l; j++ ) {

            if ( families[ i ].points[ j ] == 'all' ) {

              markerPoints.push( [ 0, Infinity, i ] );

            } else if ( !Array.isArray( families[ i ].points[ j ] ) ) {

              markerPoints.push( [ families[ i ].points[ j ], families[ i ].points[ j ], i ] );
              //markerPoints.push( [ family[ i ].points[ j ] + 1, null ] );
            } else {

              markerPoints.push( [ families[ i ].points[ j ][ 0 ], families[ i ].points[ j ][ 1 ], i ] );

            }
          }
        }

        this.markerFamilies = this.markerFamilies || {};
        this.markerFamilies[ selectionType || "unselected" ] = families;

        // Let's sort if by the first index.
        markerPoints.sort( function( a, b ) {
          return ( a[ 0 ] - b[ 0 ] ) || ( a[ 2 ] == null ? -1 : 1 );
        } );

        this.markerPoints = this.markerPoints || {}; // By default, markerPoints doesn't exist, to optimize the cases without markers
        this.markerPoints[ selectionType || "unselected" ] = markerPoints;
      };

      SerieLine.prototype.insertMarkers = function( selectionType ) {

        if ( !this.markerFamilies || !this.markerFamilies[ selectionType || this.selectionType ] || this.options.markersIndependant ) {
          return;
        }

        for ( var i = 0, l = this.markerFamilies[ selectionType || this.selectionType ].length; i < l; i++ ) {
          this.markerFamilies[ selectionType || this.selectionType ][ i ].dom.setAttribute( 'd', this.markerFamilies[ selectionType || this.selectionType ][ i ].path );
          this.groupMain.appendChild( this.markerFamilies[ selectionType || this.selectionType ][ i ].dom );
          this.currentMarkersSelectionType = this.selectionType;
        }
      };

      SerieLine.prototype.getMarkerForLegend = function() {

        if ( !this.markerPoints || !this.markerPoints[ this.selectionType ] ) {
          return;
        }

        if ( !this.markerForLegend ) {

          var marker = document.createElementNS( this.graph.ns, 'path' );
          this.setMarkerStyleTo( marker, this.markerFamilies[ this.selectionType ][ 0 ] );

          marker.setAttribute( 'd', "M 14 0 " + this.getMarkerPath( this.markerFamilies[ this.selectionType ][ 0 ] ) );

          this.markerForLegend = marker;
        }

        return this.markerForLegend;
      };

      SerieLine.prototype.eraseMarkers = function() {

        var self = this;

        if ( this.options.markersIndependant ) {

          for ( var i in this.independantMarkers ) {
            self.groupMain.removeChild( this.independantMarkers[ i ] );
          }

          this.independantMarkers = {};

        } else if ( this.currentMarkersSelectionType ) {

          this.markerFamilies[ this.currentMarkersSelectionType ].map( function( el ) {
            self.groupMain.removeChild( el.dom );
            el.path = "";
          } );

          this.currentMarkersSelectionType = false;
        }

      };

      SerieLine.prototype.showImpl = function() {
        this.showPeakPicking();
      };

      SerieLine.prototype.hideImpl = function() {
        this.hidePeakPicking();
      };

      SerieLine.prototype.XIsMonotoneous = function() {
        this.xmonotoneous = true;
        return this;
      };

      SerieLine.prototype.isXMonotoneous = function() {
        return this.xmonotoneous || false;
      };

      SerieLine.prototype.XMonotoneousDirection = function() {

        return this.data && this.data[ 0 ] && ( this.data[ 0 ][ 2 ] - this.data[ 0 ][ 0 ] ) > 0;
      };

      SerieLine.prototype.makePeakPicking = function() {

        var self = this;
        var ys = this.detectedPeaks;

        var x,
          px,
          passed = [],
          px,
          i = 0,
          l = ys.length,
          k, m, y,
          index;

        var selected = self.graph.selectedShapes.map( function( shape ) {
          return shape.getProp( 'xval' );
        } );

        ys.sort( function( a, b ) {
          return b[ 0 ] - a[ 0 ];
        } );

        m = 0;

        for ( ; i < l; i++ ) {

          x = ys[ i ][ 1 ];
          px = self.getX( x );
          k = 0;
          y = self.getY( ys[ i ][ 0 ] );

          if ( px < self.getXAxis().getMinPx() || px > self.getXAxis().getMaxPx() ) {
            continue;
          }

          if ( !self.options.autoPeakPickingAllowAllY && ( y > self.getYAxis().getMinPx() || y < self.getYAxis().getMaxPx() ) ) {

            continue;
          }

          // Distance check
          for ( ; k < passed.length; k++ ) {
            if ( Math.abs( passed[ k ] - px ) < self.options.autoPeakPickingMinDistance ) {
              break;
            }
          }
          if ( k < passed.length ) {
            continue;
          }

          // Distance check end

          // If the retained one has already been selected somewhere, continue;
          if ( ( index = selected.indexOf( x ) ) > -1 ) {
            passed.push( px );
            continue;
          }

          if ( !self.picks[ m ] ) {
            return;
          }

          //console.log( this.getYAxis().getDataMax(), this.getYAxis().getCurrentMin(), y );
          //    self.picks[ m ].show();

          if ( this.getYAxis().getPx( ys[ i ][ 0 ] ) - 20 < 0 ) {

            self.picks[ m ].setLabelPosition( {
              x: x,
              y: "5px",
            } );

            self.picks[ m ].setLabelBaseline( 'hanging' );

          } else {

            self.picks[ m ].setLabelBaseline( 'no-change' );

            self.picks[ m ].setLabelPosition( {
              x: x,
              y: ys[ i ][ 0 ],
              dy: "-15px"
            } );

          }

          self.picks[ m ].setProp( 'xval', x );

          if ( self.options.autoPeakPickingFormat ) {

            self.picks[ m ].setLabelText( self.options.autoPeakPickingFormat.call( self.picks[ m ], x, m ) );
          } else {
            self.picks[ m ].setLabelText( String( Math.round( x * 1000 ) / 1000 ) );
          }

          self.picks[ m ].makeLabels();

          m++;
          while ( self.picks[ m ] && self.picks[ m ].isSelected() ) {
            m++;
          }

          if ( passed.length == self.options.autoPeakPickingNb ) {
            break;
          }
        }

      };

      function drawMarkerXY( graph, family, x, y ) {

        if ( !family ) {
          return;
        }

        if ( graph.options.markersIndependant ) {
          var dom = graph.getMarkerDomIndependant( graph.counter1, graph.counter2, family );
          var p = 'M ' + x + ' ' + y + ' ';
          p += family.markerPath + ' ';

          dom.setAttribute( 'd', p );
        }

        family.path = family.path || "";
        family.path += 'M ' + x + ' ' + y + ' ';
        family.path += family.markerPath + ' ';
      }

      function getDegradedData( graph ) { // Serie redrawing

        var self = graph,
          xpx,
          ypx,
          xpx2,
          ypx2,
          i = 0,
          l = graph.data.length,
          j = 0,
          k,
          m,
          degradationMin, degradationMax, degradationNb, degradationValue, degradation, degradationMinMax = [],
          incrXFlip = 0,
          incrYFlip = 1,
          degradeFirstX, degradeFirstXPx,
          optimizeMonotoneous = graph.isXMonotoneous(),
          optimizeMaxPxX = graph.getXAxis().getMathMaxPx(),
          optimizeBreak, buffer;

        if ( graph.isFlipped() ) {
          incrXFlip = 1;
          incrYFlip = 0;
        }

        var datas = [];
        var xData = [],
          dataY = [],
          sum = 0;

        if ( graph.mode == 'x_equally_separated' ) {

          if ( graph.isFlipped() ) {
            return [ graph.data, graph.xData ];
          }

          dataY = [];

          for ( ; i < l; i++ ) {

            j = 0;
            k = 0;
            m = graph.data[ i ].length;

            var delta = Math.round( graph.degradationPx / graph.getXAxis().getRelPx( graph.xData[ i ].dx ) );

            if ( delta == 1 ) {
              xData.push( graph.xData[ i ] );
              datas.push( graph.data[ i ] );
            }

            degradationMin = Infinity;
            degradationMax = -Infinity;

            for ( ; j < m; j += 1 ) {

              xpx = graph.xData[ i ].x + j * graph.xData[ i ].dx;

              if ( optimizeMonotoneous && xpx < 0 ) {
                buffer = [ xpx, ypx, graph.data[ i ][ j ] ];
                continue;
              }

              if ( optimizeMonotoneous && buffer ) {

                sum += buffer[ 2 ];
                degradationMin = Math.min( degradationMin, buffer[ 2 ] );
                degradationMax = Math.max( degradationMax, buffer[ 2 ] );

                buffer = false;
                k++;
              }

              sum += graph.data[ i ][ j ];
              degradationMin = Math.min( degradationMin, graph.data[ i ][ j ] );
              degradationMax = Math.max( degradationMax, graph.data[ i ][ j ] );

              if ( ( j % delta == 0 && j > 0 ) || optimizeBreak ) {

                dataY.push( sum / delta );

                degradationMinMax.push( ( graph.xData[ i ].x + j * graph.xData[ i ].dx - ( delta / 2 ) * graph.xData[ i ].dx ), degradationMin, degradationMax );

                degradationMin = Infinity;
                degradationMax = -Infinity;

                sum = 0;
              }

              if ( optimizeMonotoneous && xpx > optimizeMaxPxX ) {

                optimizeBreak = true;

                break;
              }

              k++;
            }

            datas.push( dataY );
            xData.push( {
              dx: delta * graph.xData[ i ].dx,
              x: graph.xData[ i ].x + ( delta * graph.xData[ i ].dx / 2 )
            } );
          }

          if ( graph.degradationSerie ) {
            graph.degradationSerie.setData( degradationMinMax );
            graph.degradationSerie.draw();
          }

          return [ datas, xData ]

        }

        for ( ; i < l; i++ ) {

          j = 0;
          k = 0;
          m = graph.data[ i ].length;

          degradationNb = 0;
          degradationValue = 0;

          degradationMin = Infinity;
          degradationMax = -Infinity;

          var data = [];
          for ( ; j < m; j += 2 ) {

            xpx2 = graph.getX( graph.data[ i ][ j + incrXFlip ] );

            if ( optimizeMonotoneous && xpx2 < 0 ) {

              buffer = [
                xpx2,
                graph.getY( graph.data[ i ][ j + incrYFlip ] ),
                graph.data[ i ][ j + incrXFlip ],
                graph.data[ i ][ j + incrYFlip ]
              ];

              continue;
            }

            if ( optimizeMonotoneous && buffer ) {

              degradationValue += buffer[ 3 ];
              degradationNb++;

              degradationMin = Math.min( degradationMin, buffer[ 3 ] );
              degradationMax = Math.max( degradationMax, buffer[ 3 ] );

              degradeFirstX = buffer[ 2 ];
              degradeFirstXPx = buffer[ 0 ];

              buffer = false;
              k++;

            } else if ( degradeFirstX === undefined ) {

              degradeFirstX = graph.data[ i ][ j + incrXFlip ];
              degradeFirstXPx = xpx2;
            }

            if ( Math.abs( xpx2 - degradeFirstXPx ) > graph.degradationPx && j < m ) {

              data.push(
                ( degradeFirstX + graph.data[ i ][ j + incrXFlip ] ) / 2,
                degradationValue / degradationNb
              );

              degradationMinMax.push( ( graph.data[ i ][ j + incrXFlip ] + degradeFirstX ) / 2, degradationMin, degradationMax );

              if ( degradeFirstXPx > optimizeMaxPxX ) {

                break;
              }

              degradeFirstX = undefined;
              degradationNb = 0;
              degradationValue = 0;
              degradationMin = Infinity;
              degradationMax = -Infinity;

              k++;
            }

            degradationValue += graph.data[ i ][ j + incrYFlip ];
            degradationNb++;

            degradationMin = Math.min( degradationMin, graph.data[ i ][ j + incrYFlip ] );
            degradationMax = Math.max( degradationMax, graph.data[ i ][ j + incrYFlip ] );

            if ( optimizeMonotoneous && xpx2 > optimizeMaxPxX ) {

              optimizeBreak = true;
            }

            xpx = xpx2;
            ypx = ypx2;

          }

          datas.push( data );

          if ( optimizeBreak ) {

            break;
          }
        }

        if ( graph.degradationSerie ) {
          graph.degradationSerie.setData( degradationMinMax );
          graph.degradationSerie.draw();
        }

        return [ datas ];
      };

      function hidePeakPicking( graph ) {

        if ( !graph.picks ) {
          return;
        }
        for ( var i = 0; i < graph.picks.length; i++ ) {
          graph.picks[ i ].hide();
        }

      }

      function showPeakPicking( graph ) {

        if ( !graph.picks ) {
          return;
        }

        for ( var i = 0; i < graph.picks.length; i++ ) {
          graph.picks[ i ].show();
        }
      }

      ErrorBarMixin.call( SerieLine.prototype ); // Add error bar mixin

      return SerieLine;
    } )( build[ "./series/graph.serie" ], build[ "./series/slotoptimizer" ], build[ "./graph.util" ], build[ "./mixins/graph.mixin.errorbars" ] );

    /* 
     * Build: new source file 
     * File name : series/graph.serie.contour
     * File path : /Users/normanpellet/Documents/Web/graph/src/series/graph.serie.contour.js
     */

    build[ './series/graph.serie.contour' ] = ( function( GraphSerie, util ) {
      /** @global */
      /** @ignore */

      "use strict";

      /** 
       * Constructor for the contour serie. Do not use this constructor directly, but use the {@link Graph#newSerie} method
       * @private
       * @class SerieContour
       * @inherits Serie
       * @example graph.newSerie( name, options, "contour" );
       * @see Graph#newSerie
       */
      var GraphSerieContour = function() {

        this.negativeDelta = 0;
        this.positiveDelta = 0;

        this.negativeThreshold = 0;
        this.positiveThreshold = 0;

      };

      GraphSerieContour.prototype = new GraphSerie();

      $.extend( GraphSerieContour.prototype, {

        /**
         * Sets the contour lines
         * @memberof SerieContour.prototype
         * @param {Object} data - The object data
         * @param {Number} data.minX - The minimum x value
         * @param {Number} data.maxX - The maximum x value
         * @param {Number} data.minY - The minimum y value
         * @param {Number} data.maxY - The maximum y value
         * @param {Object[]} data.segments - The segments making up the contour lines
         * @param {Number[]} data.segments.lines - An array of alternating (x1,y1,x2,y2) quadruplet
         * @param {Number} data.segments.zValue - The corresponding z-value of this array
         * @return {Serie} The current serie
         */
        setData: function( data, arg, type ) {

          var z = 0;
          var x, dx, arg = arg || "2D",
            type = type || 'float',
            i, l = data.length,
            j, k,
            arr, datas = [];

          if ( !( data instanceof Array ) ) {

            if ( typeof data == 'object' ) {
              // Def v2
              this.minX = data.minX;
              this.minY = data.minY;
              this.maxX = data.maxX;
              this.maxY = data.maxY;

              data = data.segments;
              l = data.length;
            }
          }

          for ( i = 0; i < l; i++ ) {
            k = data[ i ].lines.length;
            arr = this._addData( type, k );

            for ( j = 0; j < k; j += 2 ) {

              arr[ j ] = data[ i ].lines[ j ];
              this._checkX( arr[ j ] );
              arr[ j + 1 ] = data[ i ].lines[ j + 1 ];
              this._checkY( arr[ j + 1 ] );
            }

            datas.push( {
              lines: arr,
              zValue: data[ i ].zValue
            } );
          }
          this.data = datas;
          this.graph.updateDataMinMaxAxes();

          this.dataHasChanged( true );

          return this;
        },

        /**
         * Draws the serie if the data has changed
         * @memberof SerieContour.prototype
         * @param {Boolean} force - Forces redraw even if the data hasn't changed
         * @return {Serie} The current serie
         */
        draw: function( force ) {

          if ( force || this.hasDataChanged() ) {

            this.currentLine = 0;
            var x, y, xpx, ypx, xpx2, ypx2, i = 0,
              l = this.data.length,
              j = 0,
              k, m, currentLine, domLine, arr;
            this.minZ = Infinity;
            this.maxZ = -Infinity;

            var next = this.groupLines.nextSibling;
            this.groupMain.removeChild( this.groupLines );
            this.zValues = {};

            var incrXFlip = 0;
            var incrYFlip = 1;
            if ( this.getFlip() ) {
              incrXFlip = 0;
              incrYFlip = 1;
            }

            var minY = this.getYAxis().getCurrentMin();
            var minX = this.getXAxis().getCurrentMin();

            var maxX = this.getXAxis().getCurrentMax();
            var maxY = this.getYAxis().getCurrentMax();

            this.counter = 0;
            this.currentLineId = 0;

            for ( ; i < l; i++ ) {
              this.currentLine = "";
              j = 0;
              k = 0;

              for ( arr = this.data[ i ].lines, m = arr.length; j < m; j += 4 ) {

                var lastxpx, lastypx;

                if ( ( arr[ j + incrXFlip ] < minX && arr[ j + 2 + incrXFlip ] < minX ) || ( arr[ j + incrYFlip ] < minY && arr[ j + 2 + incrYFlip ] < minY ) || ( arr[ j + incrYFlip ] > maxY && arr[ j + 2 + incrYFlip ] > maxY || ( arr[ j + incrXFlip ] > maxX && arr[ j + 2 + incrXFlip ] > maxX ) ) ) {
                  continue;
                }

                xpx2 = this.getX( arr[ j + incrXFlip ] );
                ypx2 = this.getY( arr[ j + incrYFlip ] );

                xpx = this.getX( arr[ j + 2 + incrXFlip ] );
                ypx = this.getY( arr[ j + 2 + incrYFlip ] );

                if ( xpx == xpx2 && ypx == ypx2 ) {
                  continue;
                }

                /*	if( j > 0 && ( lastxpx !== undefined && lastypx !== undefined && Math.abs( xpx2 - lastxpx ) <= 30 && Math.abs( ypx2 - lastypx ) <= 30 ) ) {
  						currentLine += "L";
  					} else {
  						currentLine += "M";	
  					}
  */

                this.currentLine += "M ";
                this.currentLine += xpx2;
                this.currentLine += " ";
                this.currentLine += ypx2;

                this.currentLine += "L ";
                this.currentLine += xpx;
                this.currentLine += " ";
                this.currentLine += ypx;

                this.counter++;

                lastxpx = xpx;
                lastypx = ypx;

                k++;
              }

              this.currentLine += " z";

              domLine = this._createLine();
              domLine.setAttribute( 'data-zvalue', this.data[ i ].zValue );

              this.zValues[ this.data[ i ].zValue ] = {
                dom: domLine
              };

              this.minZ = Math.min( this.minZ, this.data[ i ].zValue );
              this.maxZ = Math.max( this.maxZ, this.data[ i ].zValue );
            }

            i++;

            for ( i = this.currentLine + 1; i < this.lines.length; i++ ) {
              this.groupLines.removeChild( this.lines[ i ] );
              this.lines.splice( i, 1 );
            }

            i = 0;

            for ( ; i < l; i++ ) {
              this.setColorTo( this.lines[ i ], this.data[ i ].zValue, this.minZ, this.maxZ );
            }

            this.onMouseWheel( 0, {
              shiftKey: false
            } );
            this.groupMain.insertBefore( this.groupLines, next );

          } else if ( this.hasStyleChanged( this.selectionType ) ) {

            for ( ; i < l; i++ ) {
              this.setColorTo( this.lines[ i ], this.data[ i ].zValue, this.minZ, this.maxZ );
            }

          }

        },

        onMouseWheel: function( delta, e, fixed, positive ) {

          delta /= 250;

          if ( fixed !== undefined ) {

            if ( !positive ) {
              this.negativeThreshold = -fixed * this.minZ;
              this.negativeDelta = -Math.pow( Math.abs( ( this.negativeThreshold / ( -this.minZ ) ) ), 1 / 3 );
            }

            if ( positive ) {
              this.positiveThreshold = fixed * this.maxZ;
              this.positiveDelta = Math.pow( this.positiveThreshold / ( this.maxZ ), 1 / 3 );
            }

          } else {

            if ( ( !e.shiftKey ) || !this.options.hasNegative ) {

              this.positiveDelta = Math.min( 1, Math.max( 0, this.positiveDelta + Math.min( 0.1, Math.max( -0.1, delta ) ) ) );
              this.positiveThreshold = this.maxZ * ( Math.pow( this.positiveDelta, 3 ) );

            } else {

              this.negativeDelta = Math.min( 0, Math.max( -1, this.negativeDelta + Math.min( 0.1, Math.max( -0.1, delta ) ) ) );
              this.negativeThreshold = -this.minZ * ( Math.pow( this.negativeDelta, 3 ) );

            }

          }

          if ( isNaN( this.positiveDelta ) ) {
            this.positiveDelta = 0;
          }

          if ( isNaN( this.negativeDelta ) ) {
            this.negativeDelta = 0;
          }

          for ( var i in this.zValues ) {

            this.zValues[ i ].dom.setAttribute( 'display', ( ( i >= 0 && i >= this.positiveThreshold ) || ( i <= 0 && i <= this.negativeThreshold ) ) ? 'block' : 'none' );

          }

          if ( this._shapeZoom ) {

            if ( !this.options.hasNegative ) {
              this._shapeZoom.hideHandleNeg();
            } else {

              this._shapeZoom.setHandleNeg( -( Math.pow( this.negativeDelta, 3 ) ), this.minZ );
              this._shapeZoom.showHandleNeg();
            }

            this._shapeZoom.setHandlePos( ( Math.pow( this.positiveDelta, 3 ) ), this.maxZ );
          }
        },

        /**
         * Sets rainbow colors based on hsl format
         * @memberof SerieContour.prototype
         * @param {Object} colors
         * @param {Object} colors.fromPositive
         * @param {Number} colors.fromPositive.h
         * @param {Number} colors.fromPositive.s
         * @param {Number} colors.fromPositive.l
         
         * @param {Object} colors.toPositive
         * @param {Number} colors.toPositive.h
         * @param {Number} colors.toPositive.s
         * @param {Number} colors.toPositive.l
         

         * @param {Object} colors.fromNegative
         * @param {Number} colors.fromNegative.h
         * @param {Number} colors.fromNegative.s
         * @param {Number} colors.fromNegative.l
         

         * @param {Object} colors.toNegative
         * @param {Number} colors.toNegative.h
         * @param {Number} colors.toNegative.s
         * @param {Number} colors.toNegative.l
         * @return {Serie} The current serie
         */
        setDynamicColor: function( colors ) {
          this.lineColors = colors;

          this.styleHasChanged();
        },

        setNegative: function( bln ) {
          this.options.hasNegative = bln;

          if ( bln ) {
            this.negativeThreshold = 0;
          }
        },

        setColorTo: function( line, zValue, min, max ) {

          if ( !this.lineColors ) {
            return;
          }

          var hsl = {
            h: 0,
            s: 0,
            l: 0
          };

          for ( var i in hsl ) {

            if ( zValue > 0 ) {
              hsl[ i ] = this.lineColors.fromPositive[ i ] + ( ( this.lineColors.toPositive[ i ] - this.lineColors.fromPositive[ i ] ) * ( zValue / max ) );
            } else {
              hsl[ i ] = this.lineColors.fromNegative[ i ] + ( ( this.lineColors.toNegative[ i ] - this.lineColors.fromNegative[ i ] ) * ( zValue / min ) );
            }
          }

          hsl.h /= 360;

          var rgb = util.hslToRgb( hsl.h, hsl.s, hsl.l );

          line.setAttribute( 'stroke', 'rgb(' + rgb.join() + ')' );
        },

        getSymbolForLegend: function() {

          if ( !this.lineForLegend ) {

            var line = document.createElementNS( this.graph.ns, 'ellipse' );

            line.setAttribute( 'cx', 7 );
            line.setAttribute( 'cy', 0 );
            line.setAttribute( 'rx', 8 );
            line.setAttribute( 'ry', 3 );

            line.setAttribute( 'cursor', 'pointer' );
            this.lineForLegend = line;

          }

          this.applyLineStyle( this.lineForLegend, this.maxZ );

          return this.lineForLegend;
        },

        applyLineStyle: function( line, overwriteValue ) {
          line.setAttribute( 'stroke', this.getLineColor() );
          line.setAttribute( 'stroke-width', this.getLineWidth() + ( this.isSelected() ? 2 : 0 ) );
          if ( this.getLineDashArray() ) {
            line.setAttribute( 'stroke-dasharray', this.getLineDashArray() );
          }
          line.setAttribute( 'fill', 'none' );

          this.setColorTo( line, ( ( overwriteValue !== undefined ) ? overwriteValue : line.getAttribute( 'data-zvalue' ) ), this.minZ, this.maxZ );
          //  line.setAttribute('shape-rendering', 'optimizeSpeed');

          this.hasStyleChanged( false );
        },

        setShapeZoom: function( shape ) {
          this._shapeZoom = shape;
        }

      } );

      return GraphSerieContour;

    } )( build[ "./series/graph.serie.line" ], build[ "./graph.util" ] );

    /* 
     * Build: new source file 
     * File name : series/graph.serie.line.broken
     * File path : /Users/normanpellet/Documents/Web/graph/src/series/graph.serie.line.broken.js
     */

    build[ './series/graph.serie.line.broken' ] = ( function( $, GraphLine ) {
      /** @global */
      /** @ignore */

      "use strict";

      function GraphSerie() {}
      $.extend( GraphSerie.prototype, GraphLine.prototype, {

        draw: function( force ) { // Serie redrawing

          if ( force || this.hasDataChanged() ) {

            this.drawInit();

            var data = this._dataToUse;
            var xData = this._xDataToUse;
            var slotToUse = this._slotToUse;

            var shape, self = this;

            this.removeLinesGroup();

            this.eraseMarkers();

            this.lookForMaxima = true;
            this.lookForMinima = false;

            if ( this.mode == 'x_equally_separated' ) {

              throw "Not supported";

            } else {

              this._draw_standard();
            }

            this.removeExtraLines();
            this.insertLinesGroup();

          }

          if ( this.hasStyleChanged( this.selectionType ) ) {
            this.updateStyle();
          }

        },

        _draw_standard: function() { // Serie redrawing

          var self = this,
            data = this._dataToUse,
            toBreak,
            i = 0,
            l = data.length,
            j,
            k,
            m,
            x,
            y,
            xpx,
            ypx,
            xpx2,
            ypx2;

          var lastRangeX, lastRangeY, lastX, lastY, lastXPx, lastYPx, insertMarkers;

          var incrXFlip = 0;
          var incrYFlip = 1;

          if ( this.isFlipped() ) {

            incrXFlip = 1;
            incrYFlip = 0;

          }

          for ( ; i < l; i++ ) {

            toBreak = false;

            this.currentLine = "";
            j = 0;
            k = 0;
            m = data[ i ].length;

            for ( ; j < m; j += 2 ) {

              x = data[ i ][ j + incrXFlip ];
              y = data[ i ][ j + incrYFlip ];

              var rangeX = this.getXAxis().getRange ? this.getXAxis().getRange( x ) : [ 1, this.getX( x ) ];
              var rangeY = this.getYAxis().getRange ? this.getYAxis().getRange( y ) : [ 1, this.getY( y ) ];

              //console.log( rangeX, rangeY );

              // We just gets into a new range, we must get the old point and draw it in the current range
              if (
                ( rangeX[ 0 ] != lastRangeX || rangeY[ 0 ] != lastRangeY ) &&
                rangeX[ 0 ] !== undefined &&
                rangeY[ 0 ] !== undefined &&
                j > 0
              ) {

                // Direct range change => add the new point to the old range
                if (
                  lastRangeX !== undefined &&
                  lastRangeY !== undefined
                ) {

                  this.break( lastX, lastY, lastXPx, lastYPx, x, y, k );
                  this._createLine();
                }

                this.break( x, y, rangeX[ 1 ], rangeY[ 1 ], lastX, lastY, k );

                // We must add the old point to the current range
                // use lastX, lastY for the last point

                this._addPoint( rangeX[ 1 ], rangeY[ 1 ] );

                // Just breaks
              } else if ( rangeX[ 0 ] == undefined || rangeY[ 0 ] == undefined && lastRangeX && lastRangeY ) {

                //currentLine = this.break( x, y, rangeX[ 1 ], rangeY[ 1 ], lastX, lastY, currentLine, k );
                this.break( lastX, lastY, lastXPx, lastYPx, x, y, k );
                this._createLine();

                // Adds the current point to the old range and break it
              } else if ( !isNaN( rangeX[ 1 ] ) && !isNaN( rangeY[ 1 ] ) ) {

                this._addPoint( rangeX[ 1 ], rangeY[ 1 ] )

              } else {

                //continue;
              }

              lastRangeX = rangeX[ 0 ];
              lastRangeY = rangeY[ 0 ];

              lastX = x;
              lastY = y;

              lastXPx = rangeX[ 1 ];
              lastYPx = rangeY[ 1 ];
            }

            this._createLine();
          }
        },

        break: function( refX, refY, refXPx, refYPx, x, y ) {

          var xRatio, yRatio, ratio, xPotential, yPotential, xBoundary, yBoundary;
          var xpx, ypx;

          if ( this.getXAxis()._broken ) {
            //xPotential = this.getXAxis().getInRange( refX, x );
            xBoundary = this.getXAxis().getBoundary( refX, x );
            xRatio = ( xBoundary - refX ) / ( x - refXPx );
          } else {
            xRatio = 1;
            xPotential = x;
          }

          if ( this.getYAxis()._broken ) {
            //yPotential = this.getYAxis().getInRange( refY, y );

            yBoundary = this.getYAxis().getBoundary( refY, y );
            yRatio = ( yBoundary - refY ) / ( y - refY );
          } else {
            yRatio = 1;
            yPotential = y;
          }

          var ratio = Math.min( yRatio, xRatio ),
            x = ratio * ( x - refX ) + refX,
            y = ratio * ( y - refY ) + refY;

          if ( this.getXAxis()._broken ) {
            xpx = this.getXAxis().getInRange( refX, x );
          } else {
            xpx = this.getX( x );
          }

          if ( this.getYAxis()._broken ) {
            ypx = this.getYAxis().getInRange( refY, y );
          } else {
            ypx = this.getY( y );
          }

          return this._addPoint( xpx, ypx );
        }

      } );

      return GraphSerie;
    } )( build[ "./jquery" ], build[ "./series/graph.serie.line" ] );

    /* 
     * Build: new source file 
     * File name : series/graph.serie.line.colored
     * File path : /Users/normanpellet/Documents/Web/graph/src/series/graph.serie.line.colored.js
     */

    build[ './series/graph.serie.line.colored' ] = ( function( SerieLineBase, SlotOptimizer, util, ErrorBarMixin ) {
      /** @global */
      /** @ignore */

      "use strict";

      /** 
       * Serie line
       * @class SerieLineColor
       * @example graph.newSerie( name, options, "line" );
       * @see Graph#newSerie
       * @augments SerieLine
       */
      function SerieLineColor() {}

      SerieLineColor.prototype = new SerieLineBase();

      SerieLineColor.prototype.initExtended1 = function() {

        this.lines = this.lines || {};
        if ( this.initExtended2 ) {
          this.initExtended2();
        }
      };

      SerieLineColor.prototype.setColors = function( colors ) {

        this.colors = colors;
      };

      SerieLineColor.prototype._draw_standard = function() {

        var self = this,
          data = this._dataToUse,
          toBreak,
          i = 0,
          l = data.length,
          j,
          k,
          m,
          x,
          y,
          k,
          o,
          lastX = false,
          lastY = false,
          xpx,
          ypx,
          xpx2,
          ypx2,
          xAxis = this.getXAxis(),
          yAxis = this.getYAxis(),
          xMin = xAxis.getCurrentMin(),
          yMin = yAxis.getCurrentMin(),
          xMax = xAxis.getCurrentMax(),
          yMax = yAxis.getCurrentMax();

        // Y crossing
        var yLeftCrossingRatio,
          yLeftCrossing,
          yRightCrossingRatio,
          yRightCrossing,
          xTopCrossingRatio,
          xTopCrossing,
          xBottomCrossingRatio,
          xBottomCrossing;

        var incrXFlip = 0;
        var incrYFlip = 1;

        var pointOutside = false;
        var lastPointOutside = false;
        var pointOnAxis;

        this.eraseLines();

        if ( this.isFlipped() ) {
          incrXFlip = 1;
          incrYFlip = 0;
        }

        for ( i = 0; i < l; i++ ) {

          toBreak = false;
          this.counter1 = i;

          this.currentLine = "";
          j = 0;
          k = 0;
          m = data[ i ].length;

          for ( j = 0; j < m; j += 2 ) {

            x = data[ i ][ j + incrXFlip ];
            y = data[ i ][ j + incrYFlip ];

            if ( ( x < xMin && lastX < xMin ) || ( x > xMax && lastX > xMax ) || ( ( ( y < yMin && lastY < yMin ) || ( y > yMax && lastY > yMax ) ) && !this.options.lineToZero ) ) {
              lastX = x;
              lastY = y;
              lastPointOutside = true;
              continue;
            }

            this.counter2 = j / 2;

            if ( this.markersShown() ) {
              this.getMarkerCurrentFamily( this.counter2 );
            }

            xpx2 = this.getX( x );
            ypx2 = this.getY( y );

            if ( xpx2 == xpx && ypx2 == ypx ) {
              continue;
            }

            pointOutside = ( x < xMin || y < yMin || x > xMax || y > yMax );
            /*
                    if ( this.options.lineToZero ) {
                      pointOutside = ( x < xMin || x > xMax );

                      if ( pointOutside ) {
                        continue;
                      }
                    } else {

                      if ( pointOutside || lastPointOutside ) {

                        if ( ( lastX === false || lastY === false ) && !lastPointOutside ) {

                          xpx = xpx2;
                          ypx = ypx2;
                          lastX = x;
                          lastY = y;

                        } else {

                          pointOnAxis = [];
                          // Y crossing
                          yLeftCrossingRatio = ( x - xMin ) / ( x - lastX );
                          yLeftCrossing = y - yLeftCrossingRatio * ( y - lastY );
                          yRightCrossingRatio = ( x - xMax ) / ( x - lastX );
                          yRightCrossing = y - yRightCrossingRatio * ( y - lastY );

                          // X crossing
                          xTopCrossingRatio = ( y - yMin ) / ( y - lastY );
                          xTopCrossing = x - xTopCrossingRatio * ( x - lastX );
                          xBottomCrossingRatio = ( y - yMax ) / ( y - lastY );
                          xBottomCrossing = x - xBottomCrossingRatio * ( x - lastX );

                          if ( yLeftCrossingRatio < 1 && yLeftCrossingRatio > 0 && yLeftCrossing !== false && yLeftCrossing < yMax && yLeftCrossing > yMin ) {
                            pointOnAxis.push( [ xMin, yLeftCrossing ] );
                          }

                          if ( yRightCrossingRatio < 1 && yRightCrossingRatio > 0 && yRightCrossing !== false && yRightCrossing < yMax && yRightCrossing > yMin ) {
                            pointOnAxis.push( [ xMax, yRightCrossing ] );
                          }

                          if ( xTopCrossingRatio < 1 && xTopCrossingRatio > 0 && xTopCrossing !== false && xTopCrossing < xMax && xTopCrossing > xMin ) {
                            pointOnAxis.push( [ xTopCrossing, yMin ] );
                          }

                          if ( xBottomCrossingRatio < 1 && xBottomCrossingRatio > 0 && xBottomCrossing !== false && xBottomCrossing < xMax && xBottomCrossing > xMin ) {
                            pointOnAxis.push( [ xBottomCrossing, yMax ] );
                          }

                          if ( pointOnAxis.length > 0 ) {

                            if ( !pointOutside ) { // We were outside and now go inside

                              if ( pointOnAxis.length > 1 ) {
                                console.error( "Programmation error. Please e-mail me." );
                                console.log( pointOnAxis, xBottomCrossing, xTopCrossing, yRightCrossing, yLeftCrossing, y, yMin, yMax, lastY );
                              }

                              this._createLine();
                              this._addPoint( this.getX( pointOnAxis[ 0 ][ 0 ] ), this.getY( pointOnAxis[ 0 ][ 1 ] ), pointOnAxis[ 0 ][ 0 ], pointOnAxis[ 0 ][ 1 ], false, false, false );
                              this._addPoint( xpx2, ypx2, lastX, lastY, false, false, true );

                            } else if ( !lastPointOutside ) { // We were inside and now go outside

                              if ( pointOnAxis.length > 1 ) {
                                console.error( "Programmation error. Please e-mail me." );
                                console.log( pointOnAxis, xBottomCrossing, xTopCrossing, yRightCrossing, yLeftCrossing, y, yMin, yMax, lastY );
                              }

                              this._addPoint( this.getX( pointOnAxis[ 0 ][ 0 ] ), this.getY( pointOnAxis[ 0 ][ 1 ] ), pointOnAxis[ 0 ][ 0 ], pointOnAxis[ 0 ][ 1 ], false, false, false );

                            } else {

                              // No crossing: do nothing
                              if ( pointOnAxis.length == 2 ) {
                                this._createLine();

                                this._addPoint( this.getX( pointOnAxis[ 0 ][ 0 ] ), this.getY( pointOnAxis[ 0 ][ 1 ] ), pointOnAxis[ 0 ][ 0 ], pointOnAxis[ 0 ][ 1 ], false, false, false );
                                this._addPoint( this.getX( pointOnAxis[ 1 ][ 0 ] ), this.getY( pointOnAxis[ 1 ][ 1 ] ), pointOnAxis[ 0 ][ 0 ], pointOnAxis[ 0 ][ 1 ], false, false, false );
                              }

                            }
                          } else if ( !pointOutside ) {
                            this._addPoint( xpx2, ypx2, lastX, lastY, j, false, false );
                          }
                        }

                        xpx = xpx2;
                        ypx = ypx2;
                        lastX = x;
                        lastY = y;

                        lastPointOutside = pointOutside;

                        continue;
                      }

                    }*/

            if ( isNaN( xpx2 ) || isNaN( ypx2 ) ) {
              if ( this.counter > 0 ) {

                //      this._createLine();
              }
              continue;
            }

            // OPTIMIZATION START
            if ( !this._optimize_before( xpx2, ypx2 ) ) {
              continue;
            }
            // OPTIMIZATION END

            var color = this.colors[ i ][ j / 2 ];

            this._addPoint( xpx2, ypx2, x, y, xpx, ypx, lastX, lastY, j, color, false, true );

            this.detectPeaks( x, y );

            // OPTIMIZATION START
            if ( !this._optimize_after( xpx2, ypx2 ) ) {
              toBreak = true;
              break;
            }
            // OPTIMIZATION END

            xpx = xpx2;
            ypx = ypx2;

            lastX = x;
            lastY = y;
          }

          // this._createLine();

          if ( toBreak ) {
            break;
          }

        }

        this.latchLines();

        if ( this._tracker ) {

          if ( this._trackerDom ) {
            this.groupLines.removeChild( this._trackerDom );
          }

          var cloned = this.groupLines.cloneNode( true );
          this.groupMain.appendChild( cloned );

          for ( var i = 0, l = cloned.children.length; i < l; i++ ) {

            cloned.children[ i ].setAttribute( 'stroke', 'transparent' );
            cloned.children[ i ].setAttribute( 'stroke-width', '25px' );
            cloned.children[ i ].setAttribute( 'pointer-events', 'stroke' );
          }

          self._trackerDom = cloned;

          self.groupMain.addEventListener( "mousemove", function( e ) {
            var coords = self.graph._getXY( e ),
              ret = self.handleMouseMove( false, false );
            self._trackingCallback( self, ret, coords.x, coords.y );
          } );

          self.groupMain.addEventListener( "mouseleave", function( e ) {
            self._trackingOutCallback( self );
          } );
        }
        return this;

      };

      SerieLineColor.prototype._addPoint = function( xpx, ypx, x, y, xpxbefore, ypxbefore, xbefore, ybefore, j, color, move, allowMarker ) {

        if ( xpxbefore === undefined || ypxbefore === undefined ) {
          return;
        }

        if ( isNaN( xpx ) || isNaN( ypx ) ) {
          return;
        }

        var line = this.lines[ color ];
        if ( !line ) {
          line = this.lines[ color ] = {
            object: document.createElementNS( this.graph.ns, 'path' ),
            path: "",
            color: color
          };
          line.object.setAttribute( 'stroke', color );
          line.color = color;
          //      this.applyLineStyle( line );
          this.groupLines.appendChild( line.object );
        }

        line.path += "M " + xpxbefore + " " + ypxbefore + " L " + xpx + " " + ypx;

        if ( this.error ) {
          this.errorAddPoint( j, x, y, xpx, ypx );
        }

        if ( this.markersShown() && allowMarker !== false ) {
          drawMarkerXY( this, this.markerFamilies[ this.selectionType ][ this.markerCurrentFamily ], xpx, ypx );
        }
      };

      SerieLineColor.prototype.removeExtraLines = function() {

      };

      // Returns the DOM
      SerieLineColor.prototype.latchLines = function() {

        for ( var i in this.lines ) {
          this.lines[ i ].object.setAttribute( 'd', this.lines[ i ].path );
        }
      };

      // Returns the DOM
      SerieLineColor.prototype.eraseLines = function() {

        for ( var i in this.lines ) {
          this.lines[ i ].path = "";
          this.lines[ i ].object.setAttribute( 'd', "" );
        }
      };

      /**
       * Applies the current style to a line element. Mostly used internally
       * @memberof SerieLine
       */
      SerieLineColor.prototype.applyLineStyle = function( line ) {

        //line.setAttribute( 'stroke', this.getLineColor() );
        line.setAttribute( 'stroke-width', this.getLineWidth() );
        if ( this.getLineDashArray() ) {
          line.setAttribute( 'stroke-dasharray', this.getLineDashArray() );
        } else {
          line.removeAttribute( 'stroke-dasharray' );
        }
        line.setAttribute( 'fill', 'none' );
        //	line.setAttribute('shape-rendering', 'optimizeSpeed');
      };

      return SerieLineColor;
    } )( build[ "./series/graph.serie.line" ], build[ "./series/slotoptimizer" ], build[ "./graph.util" ], build[ "./mixins/graph.mixin.errorbars" ] );

    /* 
     * Build: new source file 
     * File name : series/graph.serie.scatter
     * File path : /Users/normanpellet/Documents/Web/graph/src/series/graph.serie.scatter.js
     */

    build[ './series/graph.serie.scatter' ] = ( function( GraphSerieNonInstanciable, util, ErrorBarMixin ) {
      /** @global */
      /** @ignore */

      /** 
       * @class SerieScatter
       * @static
       * @augments Serie
       * @example graph.newSerie( name, options, "scatter" );
       * @see Graph#newSerie
       */
      var GraphSerieScatter = function() {};

      GraphSerieScatter.prototype = new GraphSerieNonInstanciable();

      /**
       * Initializes the series
       * @memberof GraphSerieScatter
       * @private
       */
      GraphSerieScatter.prototype.defaults = {};

      GraphSerieScatter.prototype.init = function( graph, name, options ) {

        var self = this;

        this.graph = graph;
        this.name = name;

        this.id = Math.random() + Date.now();

        this.shapes = []; // Stores all shapes

        this.shown = true;
        this.options = $.extend( true, {}, GraphSerieScatter.prototype.defaults, options );
        this.data = [];

        this.shapesDetails = [];
        this.shapes = [];

        util.mapEventEmission( this.options, this );

        this._isMinOrMax = {
          x: {
            min: false,
            max: false
          },
          y: {
            min: false,
            max: false
          }
        };

        this.groupPoints = document.createElementNS( this.graph.ns, 'g' );
        this.groupMain = document.createElementNS( this.graph.ns, 'g' );

        this.additionalData = {};

        this.selectedStyleGeneral = {};
        this.selectedStyleModifiers = {};

        /*
      this.groupPoints.addEventListener('mouseover', function(e) {
      
      });


      this.groupPoints.addEventListener('mouseout', function(e) {
      
      });
*/

        this.groupPoints.addEventListener( 'mouseover', function( e ) {
          var id = parseInt( $( e.target ).parent().attr( 'data-shapeid' ) );
          self.emit( "mouseover", id, self.data[ id * 2 ], self.data[ id * 2 + 1 ] );
        } );

        this.groupPoints.addEventListener( 'mouseout', function( e ) {
          var id = parseInt( $( e.target ).parent().attr( 'data-shapeid' ) );
          self.emit( "mouseout", id, self.data[ id * 2 ], self.data[ id * 2 + 1 ] );
        } );

        this.minX = Number.MAX_VALUE;
        this.minY = Number.MAX_VALUE;
        this.maxX = Number.MIN_VALUE;
        this.maxY = Number.MIN_VALUE;

        this.groupMain.appendChild( this.groupPoints );
        this.currentAction = false;

        if ( this.initExtended1 ) {
          this.initExtended1();
        }

        this.styles = {};
        this.styles.unselected = {};
        this.styles.selected = {};

        this.styles.unselected.default = {
          shape: 'circle',
          cx: 0,
          cy: 0,
          r: 3,
          stroke: 'transparent',
          fill: "black"
        };

        this.styles.selected.default = {
          shape: 'circle',
          cx: 0,
          cy: 0,
          r: 4,
          stroke: 'transparent',
          fill: "black"
        };

      };

      /** 
       * Sets data to the serie. The data serie is the same one than for a line serie, however the object definition is not available here
       * @memberof GraphSerieScatter
       * @see GraphSerie#setData
       */
      GraphSerieScatter.prototype.setData = function( data, oneDimensional, type ) {

        var z = 0,
          x,
          dx,
          oneDimensional = oneDimensional || "2D",
          type = type || 'float',
          arr,
          total = 0,
          continuous;

        this.empty();
        this.shapesDetails = [];
        this.shapes = [];

        if ( !data instanceof Array ) {
          return this;
        }

        if ( data instanceof Array && !( data[ 0 ] instanceof Array ) && typeof data[ 0 ] !== "object" ) { // [100, 103, 102, 2143, ...]
          oneDimensional = "1D";
        }

        var _2d = ( oneDimensional == "2D" );

        arr = this._addData( type, _2d ? data.length * 2 : data.length );

        z = 0;

        console.log( data );
        console.log( oneDimensional, _2d );

        for ( var j = 0, l = data.length; j < l; j++ ) {

          if ( _2d ) {
            arr[ z ] = ( data[ j ][ 0 ] );
            this._checkX( arr[ z ] );
            z++;
            arr[ z ] = ( data[ j ][ 1 ] );
            this._checkY( arr[ z ] );
            z++;
            total++;
          } else { // 1D Array
            arr[ z ] = data[ j ];
            this[ j % 2 == 0 ? '_checkX' : '_checkY' ]( arr[ z ] );
            z++;
            total += j % 2 ? 1 : 0;

          }
        }

        this.dataHasChanged();
        this.graph.updateDataMinMaxAxes();

        this.data = arr;

        return this;
      };

      /**
       * Removes all DOM points
       * @private
       * @memberof GraphSerieScatter
       */
      GraphSerieScatter.prototype.empty = function() {

        while ( this.groupPoints.firstChild ) {
          this.groupPoints.removeChild( this.groupPoints.firstChild );
        }
      };

      GraphSerieScatter.prototype.getSymbolForLegend = function() {

        if ( this.symbol ) {
          return this.symbol;
        }

        var g = document.createElementNS( this.graph.ns, 'g' );
        g.setAttribute( 'data-shapeid', -1 );
        var shape = this.doShape( g, this.styles[ "unselected" ].default );

        var style = this.getStyle( "unselected", -1, true );

        for ( var i in style[ -1 ] ) {
          if ( i == "shape" ) {
            continue;
          }
          shape.setAttribute( i, style[ -1 ][ i ] );
        }

        return g;

      };

      /**
       * Sets style to the scatter points
       * First argument is the style applied by default to all points
       * Second argument is an array of modifiers that allows customization of any point of the scatter plot. Data for each elements of the array will augment <code>allStyles</code>, so be sure to reset the style if needed.
       * All parameters - except <code>shape</code> - will be set as parameters to the DOM element of the shape
       *
       * @example
       * var modifiers = [];
       * modifiers[ 20 ] = { shape: 'circle', r: 12, fill: 'rgba(0, 100, 255, 0.3)', stroke: 'rgb(0, 150, 255)' };
       * serie.setStyle( { shape: 'circle', r: 2, fill: 'rgba(255, 0, 0, 0.3)', stroke: 'rgb(255, 100, 0)' }, modifiers ); // Will modify scatter point n°20
       *
       * @memberof GraphSerieScatter
       * @param {Object} allStyles - The general style for all markers
       * @param {Object} [ modifiers ] - The general style for all markers
       * @param {String} [ selectionMode="unselected" ] - The selection mode to which this style corresponds. Default is unselected
       *
       */
      GraphSerieScatter.prototype.setStyle = function( all, modifiers, mode ) {

        if ( typeof modifiers == "string" ) {
          mode = modifiers;
          modifiers = false;
        }

        if ( mode === undefined ) {
          mode = "unselected"
        }
        /*
      if( ! this.styles[ mode ] ) {

      }

      if ( mode !== "selected" && mode !== "unselected" ) {
        throw "Style mode is not correct. Should be selected or unselected";
      }
*/
        this.styles[ mode ] = this.styles[ mode ] || {};
        this.styles[ mode ].all = all;
        this.styles[ mode ].modifiers = modifiers;

        this.styleHasChanged( mode );

        return this;
      };

      /**
       * Redraws the serie
       * @private
       * @memberof SerieScatter.prototype
       *
       * @param {force} Boolean - Forces redraw even if the data hasn't changed
       */
      GraphSerieScatter.prototype.draw = function( force ) { // Serie redrawing

        if ( !force && !this.hasDataChanged() && !this.hasStyleChanged( 'unselected' ) ) {
          return;
        }

        var x,
          y,
          xpx,
          ypx,
          j = 0,
          k,
          m,
          currentLine,
          max,
          self = this;

        this._drawn = true;

        this.dataHasChanged( false );
        this.styleHasChanged( false );

        this.groupMain.removeChild( this.groupPoints );

        var incrXFlip = 0;
        var incrYFlip = 1;

        if ( this.getFlip() ) {
          incrXFlip = 1;
          incrYFlip = 0;
        }

        var totalLength = this.data.length / 2;
        var keys = [];

        j = 0;
        k = 0;
        m = this.data.length;

        if ( this.error ) {
          this.errorDrawInit();
        }

        for ( ; j < m; j += 2 ) {

          xpx = this.getX( this.data[ j + incrXFlip ] );
          ypx = this.getY( this.data[ j + incrYFlip ] );

          var valY = this.data[ j + incrYFlip ],
            coordY;

          if ( this.error ) {
            this.errorAddPoint( j, this.data[ j + incrXFlip ], this.data[ j + incrYFlip ], xpx, ypx );
          }

          this.shapesDetails[ j / 2 ] = this.shapesDetails[ j / 2 ] || [];
          this.shapesDetails[ j / 2 ][ 0 ] = xpx;
          this.shapesDetails[ j / 2 ][ 1 ] = ypx;
          keys.push( j / 2 );

          //this.shapes[ j / 2 ] = this.shapes[ j / 2 ] ||  undefined;
        }

        if ( this.error ) {
          this.errorDraw();
        }

        // This will automatically create the shapes      
        this.applyStyle( "unselected", keys );

        this.groupMain.appendChild( this.groupPoints );
      };

      GraphSerieScatter.prototype._addPoint = function( xpx, ypx, k ) {

        var g = document.createElementNS( this.graph.ns, 'g' );
        g.setAttribute( 'transform', 'translate(' + xpx + ', ' + ypx + ')' );
        g.setAttribute( 'data-shapeid', k );

        if ( this.extraStyle && this.extraStyle[ k ] ) {

          shape = this.doShape( g, this.extraStyle[ k ] );

        } else if ( this.stdStylePerso ) {

          shape = this.doShape( g, this.stdStylePerso );

        } else {

          shape = this.doShape( g, this.stdStyle );
        }

        this.shapes[ k ] = shape;
        this.groupPoints.appendChild( g );
      };

      GraphSerieScatter.prototype.doShape = function( group, shape ) {
        var el = document.createElementNS( this.graph.ns, shape.shape );
        group.appendChild( el );
        return el;
      };

      GraphSerieScatter.prototype.getStyle = function( selection, index, noSetPosition ) {

        var selection = selection || 'unselected';
        var indices;

        var styles = {};

        if ( typeof index == "number" ) {
          indices = [ index ];
        } else if ( Array.isArray( index ) ) {
          indices = index;
        }

        var shape, index, modifier, style, j; // loop variables
        var styleAll;

        if ( this.styles[ selection ].all !== undefined ) {

          styleAll = this.styles[ selection ].all;

          if ( typeof styleAll == "function" ) {

            styleAll = styleAll();

          } else if ( styleAll === false ) {

            styleAll = {};

          }
        }

        var i = 0,
          l = indices.length;

        for ( ; i < l; i++ ) {

          index = indices[ i ];
          shape = this.shapes[ index ];

          if ( ( modifier = this.styles[ selection ].modifiers ) && ( typeof modifier == "function" || modifier[ index ] ) ) {

            if ( typeof modifier == "function" ) {

              style = modifier( index, shape );

            } else if ( modifier[ index ] ) {

              style = modifier[ index ];

            }

            var tmp = $.extend( {}, styleAll, style );
            style = $.extend( style, tmp );

          } else if ( styleAll !== undefined ) {

            style = styleAll;

          } else {

            style = this.styles[ selection ].default;

          }

          if ( !shape ) { // Shape doesn't exist, let's create it

            var g = document.createElementNS( this.graph.ns, 'g' );
            g.setAttribute( 'data-shapeid', index );
            this.shapes[ index ] = this.doShape( g, style );
            this.groupPoints.appendChild( g );
            shape = this.shapes[ index ];
          }

          if ( !noSetPosition ) {
            shape.parentNode.setAttribute( 'transform', 'translate(' + this.shapesDetails[ index ][ 0 ] + ', ' + this.shapesDetails[ index ][ 1 ] + ')' );
          }

          styles[ index ] = style;
        }

        return styles;
      };

      GraphSerieScatter.prototype.applyStyle = function( selection, index, noSetPosition ) {

        var i, j;
        var styles = this.getStyle( selection, index, noSetPosition );

        for ( i in styles ) {

          for ( j in styles[ i ] ) {

            if ( j !== "shape" ) {

              if ( styles[ i ][ j ] ) {

                this.shapes[ i ].setAttribute( j, styles[ i ][ j ] );

              } else {

                this.shapes[ i ].removeAttribute( j );

              }

            }

          }

        }

      };

      GraphSerieScatter.prototype.unselectPoint = function( index ) {
        this.selectPoint( index, false );
      };

      GraphSerieScatter.prototype.selectPoint = function( index, setOn, selectionType ) {

        if ( this.shapesDetails[ index ][ 2 ] && this.shapesDetails[ index ][ 2 ] == selectionType ) {
          return;
        }

        if ( typeof setOn == "string" ) {
          selectionType = setOn;
          setOn = undefined;
        }

        if ( Array.isArray( index ) ) {
          return this.selectPoints( index );
        }

        if ( this.shapes[ index ] && this.shapesDetails[ index ] ) {

          if ( ( this.shapesDetails[ index ][ 2 ] || setOn === false ) && setOn !== true ) {

            var selectionStyle = this.shapesDetails[ index ][ 2 ];
            this.shapesDetails[ index ][ 2 ] = false;

            var allStyles = this.getStyle( selectionStyle, index, true );
            for ( var i in allStyles[ index ] ) {
              this.shapes[ index ].removeAttribute( i );
            }

            this.applyStyle( "unselected", index, true );

          } else {

            selectionType = selectionType || "selected";
            this.shapesDetails[ index ][ 2 ] = selectionType;

            this.applyStyle( selectionType, index, true );

          }

        }

      };

      ErrorBarMixin.call( GraphSerieScatter.prototype ); // Add error bar mixin

      return GraphSerieScatter;
    } )( build[ "./series/graph.serie" ], build[ "./graph.util" ], build[ "./mixins/graph.mixin.errorbars" ] );

    /* 
     * Build: new source file 
     * File name : series/graph.serie.zone
     * File path : /Users/normanpellet/Documents/Web/graph/src/series/graph.serie.zone.js
     */

    build[ './series/graph.serie.zone' ] = ( function( $, GraphSerieNonInstanciable, util ) {
      /** @global */
      /** @ignore */

      /** 
       * @class SerieZone
       * @static
       * @augments Serie
       * @example graph.newSerie( name, options, "scatter" );
       * @see Graph#newSerie
       */
      function GraphSerieZone() {}

      $.extend( GraphSerieZone.prototype, GraphSerieNonInstanciable.prototype, {

        /**
         * @name SerieZoneDefaultOptions
         * @object
         * @static
         * @param {String} fillColor - The color to fill the zone with
         * @param {String} lineColor - The line color
         * @param {String} lineWidth - The line width (in px)
         */
        defaults: {
          fillColor: 'rgba( 0, 0, 0, 0.1 )',
          lineColor: 'rgba( 0, 0, 0, 1 )',
          lineWidth: '1px',
        },

        init: function( graph, name, options ) {

          var self = this;

          this.graph = graph;
          this.name = name;

          this.selectionType = "unselected";

          this.id = Math.random() + Date.now();

          this.shown = true;
          this.options = $.extend( true, {}, GraphSerieZone.prototype.defaults, options );
          this.data = [];

          this.groupZones = document.createElementNS( this.graph.ns, 'g' );
          this.groupMain = document.createElementNS( this.graph.ns, 'g' );

          this.lineZone = document.createElementNS( this.graph.ns, 'path' );
          this.lineZone.setAttribute( 'stroke', 'black' );
          this.lineZone.setAttribute( 'stroke-width', '1px' );

          this.additionalData = {};

          this.minX = Number.MAX_VALUE;
          this.minY = Number.MAX_VALUE;
          this.maxX = Number.MIN_VALUE;
          this.maxY = Number.MIN_VALUE;

          this.groupMain.appendChild( this.groupZones );

          this.groupZones.appendChild( this.lineZone );

          this.currentAction = false;

          this.applyLineStyle( this.lineZone );
          this.styleHasChanged();

          this.clip = document.createElementNS( this.graph.ns, 'clipPath' );
          this.clipId = util.guid();
          this.clip.setAttribute( 'id', this.clipId );

          this.graph.defs.appendChild( this.clip );

          this.clipRect = document.createElementNS( this.graph.ns, 'rect' );
          this.clip.appendChild( this.clipRect );
          this.clip.setAttribute( 'clipPathUnits', 'userSpaceOnUse' );

          this.groupMain.setAttribute( 'clip-path', 'url(#' + this.clipId + ')' );
        },

        /**
         * Sets the data
         * @memberof SerieZone.prototype
         */
        setData: function( data, arg, type ) {

          var z = 0,
            x,
            dx,
            arg = arg || "2D",
            type = type || 'float',
            arr,
            total = 0,
            continuous;

          this.data = [];
          this.dataHasChanged();

          if ( !data instanceof Array ) {
            return;
          }

          var length;

          if ( data instanceof Array && !( data[ 0 ] instanceof Array ) ) { // [100, 103, 102, 2143, ...]
            arg = "1D";
            length = data.length * 1.5;

            if ( !( data[ 1 ] instanceof Array ) ) {
              arg = "1D_flat";
              length = data.length * 1;
            }

          } else {

            if ( data instanceof Array && !( data[ 0 ][ 1 ] instanceof Array ) ) { // [100, 103, 102, 2143, ...]
              arg = "2D_flat";
              length = data.length * 3;
            } else {
              arg = "2D";
              length = data.length * 3;
            }
          }

          arr = this._addData( type, length );

          z = 0;

          for ( var j = 0, l = data.length; j < l; j++ ) {

            if ( arg == "2D" || arg == "2D_flat" ) {

              arr[ z ] = ( data[ j ][ 0 ] );
              this._checkX( arr[ z ] );
              z++;

              if ( arg == "2D" ) {

                arr[ z ] = ( data[ j ][ 1 ][ 0 ] );
                this._checkY( arr[ z ] );
                z++;
                total++;

                arr[ z ] = ( data[ j ][ 1 ][ 1 ] );
                this._checkY( arr[ z ] );
                z++;
                total++;

              } else {

                arr[ z ] = ( data[ j ][ 1 ] );
                this._checkY( arr[ z ] );
                z++;
                total++;

                arr[ z ] = ( data[ j ][ 2 ] );
                this._checkY( arr[ z ] );
                z++;
                total++;
              }

            } else if ( arg == "1D_flat" ) { // 1D Array

              if ( j % 3 == 0 ) {
                arr[ z ] = data[ j ];
                this._checkX( arr[ z ] );
                z++;
                total++;

                continue;
              }

              arr[ z ] = data[ j ];
              this._checkY( arr[ z ] );
              z++;
              total++;

            } else {

              if ( j % 2 == 0 ) {
                arr[ z ] = data[ j ];
                this._checkX( arr[ z ] );
                z++;
                total++;
                continue;
              }

              arr[ z ] = data[ j ][ 0 ];
              this_checkY( arr[ z ] );
              z++;
              total++;

              arr[ z ] = data[ j ][ 1 ];
              this_checkY( arr[ z ] );
              z++;
              total++;
            }
          }

          this.graph.updateDataMinMaxAxes();
          this.data = arr;
          this.dataHasChanged();

          return this;
        },

        _addData: function( type, howmany ) {

          switch ( type ) {
            case 'int':
              var size = howmany * 4; // 4 byte per number (32 bits)
              break;
            case 'float':
              var size = howmany * 8; // 4 byte per number (64 bits)
              break;
          }

          var arr = new ArrayBuffer( size );

          switch ( type ) {
            case 'int':
              return new Int32Array( arr );
              break;

            default:
            case 'float':
              return new Float64Array( arr );
              break;
          }
        },

        /**
         * Removes all the dom concerning this serie from the drawing zone
         * @memberof SerieZone.prototype
         */
        empty: function() {

          while ( this.group.firstChild ) {
            this.group.removeChild( this.group.firstChild );
          }
        },

        /**
         * Redraws the serie
         * @private
         * @memberof SerieZone.prototype
         *
         * @param {force} Boolean - Forces redraw even if the data hasn't changed
         */
        draw: function( force ) { // Serie redrawing

          if ( force || this.hasDataChanged() ) {

            var x,
              y,
              xpx,
              ypx1,
              ypx2,
              j = 0,
              k,
              m,
              currentLine,
              max,
              self = this;

            var xmin = this.getXAxis().getMinPx(),
              xmax = this.getXAxis().getMaxPx(),
              ymin = this.getYAxis().getMinPx(),
              ymax = this.getYAxis().getMaxPx();

            this.clipRect.setAttribute( "x", Math.min( xmin, xmax ) );
            this.clipRect.setAttribute( "y", Math.min( ymin, ymax ) );
            this.clipRect.setAttribute( "width", Math.abs( xmax - xmin ) );
            this.clipRect.setAttribute( "height", Math.abs( ymax - ymin ) );

            this._drawn = true;

            this.groupMain.removeChild( this.groupZones );

            var totalLength = this.data.length / 2;

            j = 0;
            k = 0;
            m = this.data.length;

            var error;

            var lineTop = "";
            var lineBottom = "";

            var buffer;

            for ( ; j < m; j += 3 ) {

              xpx = this.getX( this.data[ j ] );
              ypx1 = this.getY( this.data[ j + 1 ] );
              ypx2 = this.getY( this.data[ j + 2 ] );

              if ( xpx < 0 ) {
                buffer = [ xpx, ypx1, ypx2 ];
                continue;
              }

              if ( buffer ) {

                if ( lineBottom !== "" ) {
                  lineBottom = " L " + lineBottom;
                }

                lineTop += buffer[ 0 ] + "," + Math.max( buffer[ 1 ], buffer[ 2 ] ) + " L ";
                lineBottom = xpx + "," + Math.min( buffer[ 1 ], buffer[ 2 ] ) + lineBottom;

                buffer = false;
                k++;
              }

              if ( lineBottom !== "" ) {
                lineBottom = " L " + lineBottom;
              }

              if ( ypx2 > ypx1 ) {
                lineTop += xpx + "," + ypx1 + " L ";
                lineBottom = xpx + "," + ypx2 + lineBottom;
              } else {
                lineTop += xpx + "," + ypx2 + " L ";
                lineBottom = xpx + "," + ypx1 + lineBottom;
              }

              if ( xpx > this.getXAxis().getMaxPx() ) {
                break;
              }
            }

            if ( lineTop.length > 0 && lineBottom.length > 0 ) {
              this.lineZone.setAttribute( 'd', "M " + lineTop + lineBottom + " z" );
            } else {
              this.lineZone.setAttribute( 'd', "" );
            }

            this.groupMain.appendChild( this.groupZones );
          }

          if ( this.hasStyleChanged( this.selectionType ) ) {
            this.applyLineStyle( this.lineZone );
            this.styleHasChanged( false );
          }

        },

        /**
         * Applies the computed style to the DOM element fed as a parameter
         * @private
         * @memberof SerieZone.prototype
         *
         * @param {SVGLineElement} line - The line to which the style has to be applied to
         */
        applyLineStyle: function( line ) {

          line.setAttribute( 'stroke', this.getLineColor() );
          line.setAttribute( 'stroke-width', this.getLineWidth() );
          line.setAttribute( 'fill', this.getFillColor() );
          line.setAttribute( 'fill-opacity', this.getFillOpacity() );
          line.setAttribute( 'stroke-opacity', this.getLineOpacity() );
        },

        /**
         * Sets the line width
         * @memberof SerieZone.prototype
         *
         * @param {Number} width - The line width
         * @returns {SerieZone} - The current serie
         */
        setLineWidth: function( width ) {
          this.options.lineWidth = width;
          this.styleHasChanged();
          return this;
        },

        /**
         * Gets the line width
         * @memberof SerieZone.prototype
         *
         * @returns {Number} - The line width
         */
        getLineWidth: function() {
          return this.options.lineWidth;
        },

        /**
         * Sets the line opacity
         * @memberof SerieZone.prototype
         *
         * @param {Number} opacity - The line opacity
         * @returns {SerieZone} - The current serie
         */
        setLineOpacity: function( opacity ) {
          this.options.lineOpacity = opacity;
          this.styleHasChanged();
          return this;
        },

        /**
         * Gets the line opacity
         * @memberof SerieZone.prototype
         *
         * @returns {Number} - The line opacity
         */
        getLineOpacity: function() {
          return this.options.lineOpacity;
        },

        /**
         * Sets the line color
         * @memberof SerieZone.prototype
         *
         * @param {String} color - The line color
         * @returns {SerieZone} - The current serie
         */
        setLineColor: function( color ) {
          this.options.lineColor = color;
          this.styleHasChanged();
          return this;
        },

        /**
         * Gets the line width
         * @memberof SerieZone.prototype
         *
         * @returns {Number} - The line width
         */
        getLineColor: function() {
          return this.options.lineColor;
        },

        /**
         * Sets the fill opacity
         * @memberof SerieZone.prototype
         *
         * @param {Number} opacity - The fill opacity
         * @returns {SerieZone} - The current serie
         */
        setFillOpacity: function( opacity ) {
          this.options.fillOpacity = opacity;
          this.styleHasChanged();
          return this;
        },

        /**
         * Gets the fill opacity
         * @memberof SerieZone.prototype
         *
         * @returns {Number} - The fill opacity
         */
        getFillOpacity: function() {
          return this.options.fillOpacity;
        },

        /**
         * Sets the fill color
         * @memberof SerieZone.prototype
         *
         * @param {Number} width - The line width
         * @returns {Number} - The line width
         */
        setFillColor: function( color ) {
          this.options.fillColor = color;
          this.styleHasChanged();
          return this;
        },

        /**
         * Gets the fill color
         * @memberof SerieZone.prototype
         *
         * @returns {Number} - The fill color
         */
        getFillColor: function() {
          return this.options.fillColor;
        },

        /**
         * Gets the maximum value of the y values between two x values. The x values must be monotoneously increasing
         * @param {Number} startX - The start of the x values
         * @param {Number} endX - The end of the x values
         * @returns {Number} Maximal y value in between startX and endX
         * @memberof SerieLine
         */
        getMax: function( start, end ) {

          var start2 = Math.min( start, end ),
            end2 = Math.max( start, end ),
            v1 = this.searchClosestValue( start2 ),
            v2 = this.searchClosestValue( end2 ),
            i, j, max = -Infinity,
            initJ, maxJ;

          //      console.log( start2, end2, v1, v2 );

          if ( !v1 ) {
            start2 = this.minX;
            v1 = this.searchClosestValue( start2 );
          }

          if ( !v2 ) {
            end2 = this.maxX;
            v2 = this.searchClosestValue( end2 );
          }

          if ( !v1 || !v2 ) {
            return -Infinity;
          }

          for ( i = v1.dataIndex; i <= v2.dataIndex; i++ ) {
            initJ = i == v1.dataIndex ? v1.xBeforeIndexArr : 0;
            maxJ = i == v2.dataIndex ? v2.xBeforeIndexArr : this.data[ i ].length;

            for ( j = initJ; j <= maxJ; j += 3 ) {
              max = Math.max( max, this.data[ i ][ j + 1 ], this.data[ i ][ j + 2 ] );
            }
          }

          return max;
        },

        /**
         * Gets the minimum value of the y values between two x values. The x values must be monotoneously increasing
         * @param {Number} startX - The start of the x values
         * @param {Number} endX - The end of the x values
         * @returns {Number} Maximal y value in between startX and endX
         * @memberof SerieLine
         */
        getMin: function( start, end ) {

          var start2 = Math.min( start, end ),
            end2 = Math.max( start, end ),
            v1 = this.searchClosestValue( start2 ),
            v2 = this.searchClosestValue( end2 ),
            i, j, min = Infinity,
            initJ, maxJ;

          if ( !v1 ) {
            start2 = this.minX;
            v1 = this.searchClosestValue( start2 );
          }

          if ( !v2 ) {
            end2 = this.maxX;
            v2 = this.searchClosestValue( end2 );
          }

          if ( !v1 || !v2 ) {
            return Infinity;
          }

          for ( i = v1.dataIndex; i <= v2.dataIndex; i++ ) {
            initJ = i == v1.dataIndex ? v1.xBeforeIndexArr : 0;
            maxJ = i == v2.dataIndex ? v2.xBeforeIndexArr : this.data[ i ].length;

            for ( j = initJ; j <= maxJ; j += 3 ) {
              min = Math.min( min, this.data[ i ][ j + 1 ], this.data[ i ][ j + 2 ] );
            }
          }

          return min;
        },

        /**
         * Performs a binary search to find the closest point index to an x value. For the binary search to work, it is important that the x values are monotoneous.
         * @param {Number} valX - The x value to search for
         * @returns {Object} Index in the data array of the closest (x,y) pair to the pixel position passed in parameters
         * @memberof SerieLine
         */
        searchClosestValue: function( valX ) {

          var xMinIndex;

          for ( var i = 0; i < this.data.length; i++ ) {

            if ( ( valX <= this.data[ i ][ this.data[ i ].length - 3 ] && valX >= this.data[ i ][ 0 ] ) ) {
              xMinIndex = this._searchBinary( valX, this.data[ i ], false );
            } else if ( ( valX >= this.data[ i ][ this.data[ i ].length - 3 ] && valX <= this.data[ i ][ 0 ] ) ) {
              xMinIndex = this._searchBinary( valX, this.data[ i ], true );
            } else {
              continue;
            }

            return {
              dataIndex: i,
              xMin: this.data[ i ][ xMinIndex ],
              xMax: this.data[ i ][ xMinIndex + 3 ],
              yMin: this.data[ i ][ xMinIndex + 1 ],
              yMax: this.data[ i ][ xMinIndex + 4 ],
              xBeforeIndex: xMinIndex / 3,
              xAfterIndex: xMinIndex / 3 + 1,
              xBeforeIndexArr: xMinIndex,
              xClosest: ( Math.abs( this.data[ i ][ xMinIndex + 3 ] - valX ) < Math.abs( this.data[ i ][ xMinIndex ] - valX ) ? xMinIndex + 3 : xMinIndex ) / 2
            }
          }
        },

        _searchBinary: function( target, haystack, reverse ) {
          var seedA = 0,
            length = haystack.length,
            seedB = ( length - 3 );

          if ( haystack[ seedA ] == target )
            return seedA;

          if ( haystack[ seedB ] == target )
            return seedB;

          var seedInt;
          var i = 0;

          while ( true ) {
            i++;
            if ( i > 100 ) {
              throw "Error loop";
            }

            seedInt = ( seedA + seedB ) / 3;
            seedInt -= seedInt % 3; // Always looks for an x.

            if ( seedInt == seedA || haystack[ seedInt ] == target )
              return seedInt;

            //    console.log(seedA, seedB, seedInt, haystack[seedInt]);
            if ( haystack[ seedInt ] <= target ) {
              if ( reverse )
                seedB = seedInt;
              else
                seedA = seedInt;
            } else if ( haystack[ seedInt ] > target ) {
              if ( reverse )
                seedA = seedInt;
              else
                seedB = seedInt;
            }
          }
        }

      } );

      return GraphSerieZone;
    } )( build[ "./jquery" ], build[ "./series/graph.serie" ], build[ "./graph.util" ] );

    /* 
     * Build: new source file 
     * File name : shapes/graph.shape
     * File path : /Users/normanpellet/Documents/Web/graph/src/shapes/graph.shape.js
     */

    build[ './shapes/graph.shape' ] = ( function( GraphPosition, util, EventEmitter ) {
      /** @global */
      /** @ignore */

      "use strict";

      /** 
       * Shape class that should be extended
       * @class Shape
       * @static
       */
      var Shape = function() {};

      Shape.prototype = new EventEmitter();

      /**
       * Initializes the shape
       * @memberof Shape
       * @param {Graph} graph - The graph containing the shape
       * @param {Object} properties - The properties object (not copied)
       * @return {Shape} The current shape
       */
      Shape.prototype.init = function( graph, properties ) {

        var self = this;

        this.graph = graph;
        this.properties = properties || {};
        this.handles = [];
        this.options = this.options || {};

        this.group = document.createElementNS( this.graph.ns, 'g' );

        this._selected = false;
        this.createDom();
        this.setEvents();

        if ( this._dom ) {
          this._dom.jsGraphIsShape = this;
        }

        this.group.jsGraphIsShape = this;

        this.classes = [];
        this.transforms = [];

        if ( this._data.masker ) {

          var maskPath = document.createElementNS( this.graph.ns, 'mask' );
          this.maskingId = Math.random();
          maskPath.setAttribute( 'id', this.maskingId );

          this.maskDomWrapper = document.createElementNS( this.graph.ns, 'rect' );
          this.maskDomWrapper.setAttribute( 'fill', 'white' );
          maskPath.appendChild( this.maskDomWrapper );

          var maskDom = this._dom.cloneNode();
          maskPath.appendChild( maskDom );

          this.maskDom = maskDom;

          this.graph.defs.appendChild( maskPath );
        }

        if ( this.group ) {

          if ( this._dom ) {
            this.group.appendChild( this._dom );
          }

          this.group.addEventListener( 'mouseover', function( e ) {

            self.handleMouseOver( e );

          } );

          this.group.addEventListener( 'mouseout', function( e ) {

            self.handleMouseOut( e );

          } );

          this.group.addEventListener( 'mousedown', function( e ) {

            self.graph.focus();

            self.handleMouseDown( e );
          } );

          this.group.addEventListener( 'click', function( e ) {
            self.handleClick( e );
          } );

          this.group.addEventListener( 'dblclick', function( e ) {

            //e.preventDefault();
            // e.stopPropagation();

            self.handleDblClick( e );
          } );
        }

        //			this.group.appendChild(this.rectEvent);

        this.initImpl();

        this.graph.emit( "shapeNew", this );
        return this;
      };

      /**
       * Implentation of the init method. To be extended if necessary on extended Shape classes
       * @memberof Shape
       */
      Shape.prototype.initImpl = function() {};

      /**
       * @memberof Shape
       * @return {Object} The shape's underlying data object
       */
      Shape.prototype.getData = function() {
        return this._data;
      };

      /**
       * @memberof Shape
       * @returns {String} The type of the shape
       */
      Shape.prototype.getType = function() {
        return this.type;
      };

      /**
       * Removes the shape from the DOM and unlinks it from the graph
       * @memberof Shape
       */
      Shape.prototype.kill = function( keepDom ) {

        this.graph.removeShapeFromDom( this );

        if ( !keepDom ) {
          this.graph._removeShape( this );
        }

        this.graph.stopElementMoving( this );
        this.graph.emit( "shapeRemoved", this );

        this._inDom = false;
      };

      /**
       * @memberof Shape
       * @alias Shape#kill
       */
      Shape.prototype.remove = Shape.prototype.kill;

      /**
       * Hides the shape
       * @memberof Shape
       * @return {Shape} The current shape
       */
      Shape.prototype.hide = function() {

        if ( this.hidden ) {
          return;
        }

        this.hidden = true;
        this.group.style.display = 'none';
        return this;
      };

      /**
       * Shows the shape
       * @memberof Shape
       * @return {Shape} The current shape
       */
      Shape.prototype.show = function() {

        if ( !this.hidden ) {
          return;
        }

        this.hidden = false;
        this.group.style.display = 'block';
        this.redraw();
        return this;

      };

      /**
       * Adds a class to the shape DOM
       * @memberof Shape
       * @param {String} className - The class to add
       * @return {Shape} The current shape
       */
      Shape.prototype.addClass = function( className ) {
        this.classes = this.classes || [];
        if ( this.classes.indexOf( className ) == -1 ) {
          this.classes.push( className );
        }
        this.makeClasses();
        return this;
      };

      /**
       * Removes a class from the shape DOM
       * @memberof Shape
       * @param {String} className - The class to remove
       * @return {Shape} The current shape
       */
      Shape.prototype.removeClass = function( className ) {
        this.classes.splice( this.classes.indexOf( className ), 1 );
        this.makeClasses();
        return this;
      };

      /**
       * Builds the classes
       * @memberof Shape
       * @private
       * @return {Shape} The current shape
       */
      Shape.prototype.makeClasses = function() {

        if ( this._dom ) {
          this._dom.setAttribute( 'class', this.classes.join( " " ) );
        }

        return this;
      };

      /**
       * Triggers a ```shapeChanged``` event on the graph
       * @memberof Shape
       * @return {Shape} The current shape
       */
      Shape.prototype.changed = function( event ) {

        if ( event ) {
          this.graph.emit( event, this );
        }

        this.graph.emit( 'shapeChanged', this );
        return this;
      };

      Shape.prototype.setEvents = function() {};

      /**
       * Creates an event receptacle with the coordinates of the shape bounding box
       * @memberof Shape
       * @return {Shape} The current shape
       */
      Shape.prototype.setEventReceptacle = function() {

        if ( !this.rectEvent ) {
          this.rectEvent = document.createElementNS( this.graph.ns, 'rect' );
          this.rectEvent.setAttribute( 'pointer-events', 'fill' );
          this.rectEvent.setAttribute( 'fill', 'transparent' );
          this.group.appendChild( this.rectEvent );
          this.rectEvent.jsGraphIsShape = this;
        }

        var box = this.group.getBBox();
        this.rectEvent.setAttribute( 'x', box.x );
        this.rectEvent.setAttribute( 'y', box.y - 10 );
        this.rectEvent.setAttribute( 'width', box.width );
        this.rectEvent.setAttribute( 'height', box.height + 20 );

      };

      /**
       * Assigns a serie to the shape
       * @memberof Shape
       * @param {Serie} The serie that owns the shape
       * @return {Shape} The current shape
       */
      Shape.prototype.setSerie = function( serie ) {
        this.serie = serie;
        this.xAxis = serie.getXAxis();
        this.yAxis = serie.getYAxis();
        return this;
      };

      /**
       * @memberof Shape
       * @return {Serie} The serie associated to the shape
       */
      Shape.prototype.getSerie = function() {
        return this.serie;
      };

      /**
       * Assigns the shape to the default x and y axes of the graph, only if they don't exist yet
       * @memberof Shape
       * @return {Shape} The current shape
       * @see Graph#getXAxis
       * @see Graph#getYAxis
       */
      Shape.prototype.autoAxes = function() {

        if ( !this.xAxis ) {
          this.xAxis = this.graph.getXAxis();
        }

        if ( !this.yAxis ) {
          this.yAxis = this.graph.getYAxis();
        }

        return this;
      };

      /**
       * Assigns the shape to an x axis
       * @memberof Shape
       * @param {XAxis} The X axis related to the shape
       * @return {Shape} The current shape
       */
      Shape.prototype.setXAxis = function( axis ) {
        this.xAxis = axis;
        return this;
      };

      /**
       * Assigns the shape to an y axis
       * @memberof Shape
       * @param {YAxis} The Y axis related to the shape
       * @return {Shape} The current shape
       */
      Shape.prototype.setYAxis = function( axis ) {
        this.yAxis = axis;
      };

      /**
       * Returns the x axis associated to the shape. If non-existent, assigns it automatically
       * @memberof Shape
       * @return {XAxis} The x axis associated to the shape. 
       */
      Shape.prototype.getXAxis = function() {

        if ( !this.xAxis ) {
          this.autoAxes();
        }

        return this.xAxis;
      };

      /**
       * Returns the y axis associated to the shape. If non-existent, assigns it automatically
       * @memberof Shape
       * @return {YAxis} The y axis associated to the shape. 
       */
      Shape.prototype.getYAxis = function() {

        if ( !this.yAxis ) {
          this.autoAxes();
        }

        return this.yAxis;
      };

      /**
       * Sets the layer of the shape
       * @memberof Shape
       * @param {Number} layer - The layer number (1 being the lowest)
       * @return {Shape} The current shape
       * @see Shape#getLayer
       */
      Shape.prototype.setLayer = function( layer ) {
        this.setProp( 'layer', layer );
        return this;
      };

      /**
       * Returns the layer on which the shape is placed
       * @memberof Shape
       * @return {Number} The layer number (1 being the lowest layer)
       */
      Shape.prototype.getLayer = function() {
        var layer = this.getProp( 'layer' );

        if ( layer !== undefined ) {
          return layer;
        }

        return 1;
      };

      /**
       * Initial drawing of the shape. Adds it to the DOM and creates the labels. If the shape was already in the DOM, the method simply recreates the labels and reapplies the shape style, unless ```force``` is set to ```true```
       * @param {Boolean} force - Forces adding the shape to the DOM (useful if the shape has changed layer)
       * @memberof Shape
       * @return {Shape} The current shape
       */
      Shape.prototype.draw = function( force ) {

        if ( !this._inDom || force ) {

          this.appendToDom();
          this._inDom = true;
        }

        this.makeLabels();
        this.redraw();
        this.applyStyle();

        return this;
      };

      /**
       * Redraws the shape. Repositions it, applies the style and updates the labels
       * @memberof Shape
       * @return {Shape} The current shape
       */
      Shape.prototype.redraw = function() {

        if ( this.hidden ) {
          return;
        }

        this.position = this.applyPosition();

        this.redrawImpl();
        if ( !this.position ) {
          return;
        }

        this.updateLabels();
        this._applyTransforms();
        return this;
      };

      /**
       * Implementation of the redraw method. Extended Shape classes should override this method
       * @memberof Shape
       */
      Shape.prototype.redrawImpl = function() {};

      /**
       * Sets all dumpable properties of the shape
       * @param {Object} properties - The properties object
       * @return {Shape} The current shape
       * @memberof Shape
       */
      Shape.prototype.setProperties = function( properties ) {
        this.properties = properties;

        if ( !Array.isArray( this.properties.position ) ) {
          this.properties.position = [ this.properties.position ];
        }
        var self = this;
        for ( var i = 0, l = this.properties.position.length; i < l; i++ ) {

          var pos = GraphPosition.check( this.properties.position[ i ], function( relativeTo ) {
            return self.getRelativePosition( relativeTo );
          } );

          this.properties.position[ i ] = pos;
        }

        this.emit( "propertiesChanged" );
        return this;
      };

      Shape.prototype.getRelativePosition = function( relativePosition ) {

        var result;
        if ( ( result = /position([0-9]*)/.exec( relativePosition ) ) !== null ) {
          return this.getPosition( result[ 1 ] );
        } else if ( ( result = /labelPosition([0-9]*)/.exec( relativePosition ) ) !== null ) {
          return this.getLabelPosition( result[ 1 ] );
        }

      };

      /**
       * Gets all dumpable properties of the shape
       * @return {Object} properties - The properties object
       * @memberof Shape
       */
      Shape.prototype.getProperties = function( properties ) {
        return this.properties;
      };

      /**
       * Sets a property to the shape that is remembered and can be later reexported (or maybe reimported)
       * @param {String} prop - The property to save
       * @param val - The value to save
       * @param [ index = 0 ] - The index of the property array to save the property
       * @return {Shape} The current shape
       * @memberof Shape
       */
      Shape.prototype.setProp = function( prop, val, index ) {
        this.properties = this.properties || {};
        this.properties[ prop ] = this.properties[ prop ] || [];
        this.properties[ prop ][ index || 0 ] = val;
        this.emit( "propertyChanged", prop );
        return this;
      };

      /**
       * Returns a property of the shape
       * @param {String} prop - The property to retrieve
       * @param [ index = 0 ] - The index of the property array
       * @memberof Shape
       */
      Shape.prototype.getProp = function( prop, index ) {
        return ( this.properties[ prop ] || [] )[ index || 0 ];
      };

      /**
       * Adds a property to the property array
       * @param {String} prop - The property to add
       * @param val - The value to save
       * @memberof Shape
       */
      Shape.prototype.addProp = function( prop, value ) {
        this.properties[ prop ] = this.properties[ prop ] || [];
        this.properties[ prop ].push( value );
      };

      /**
       * Resets the property array
       * @param {String} prop - The property to reset
       * @memberof Shape
       */
      Shape.prototype.resetProp = function( prop ) {
        this.properties[ prop ] = [];
      };

      /**
       * Sets a DOM property to the shape
       * @memberof Shape
       */
      Object.defineProperty( Shape.prototype, 'setDom', {
        enumerable: true,
        writable: false,
        configurable: false,
        value: function( prop, val ) {
          if ( this._dom ) {
            this._dom.setAttribute( prop, val );
          }
        }
      } );

      /**
       * Sets a DOM property to the shape group
       * @memberof Shape
       */
      Object.defineProperty( Shape.prototype, 'setDomGroup', {
        enumerable: true,
        writable: false,
        configurable: false,
        value: function( prop, val ) {
          if ( this.group ) {
            this.group.setAttribute( prop, val );
          }
        }
      } );

      /**
       * Saves the stroke color
       * @memberof Shape
       * @return {Shape} The current shape
       */
      Shape.prototype.setStrokeColor = function( color ) {
        this.setProp( 'strokeColor', color );
        return this;
      };

      /**
       * Returns the stroke color
       * @memberof Shape
       * @return {String} The stroke color of the shape
       */
      Shape.prototype.getStrokeColor = function() {
        return this.getProp( 'strokeColor' );
      };

      /**
       * Saves the fill color
       * @memberof Shape
       * @param {String} color - The filling color
       * @return {Shape} The current shape
       */
      Shape.prototype.setFillColor = function( color ) {
        this.setProp( 'fillColor', color );
        return this;
      };

      /**
       * Returns the fill color
       * @memberof Shape
       * @return {String} The fill color of the shape
       */
      Shape.prototype.getFillColor = function() {
        return this.getProp( 'fillColor' );
      };

      /**
       * Saves the opacity of the filling color of the shape
       * @memberof Shape
       * @param {Number} opacity - The filling opacity (0 to 1)
       * @return {Shape} The current shape
       */
      Shape.prototype.setFillOpacity = function( color ) {
        this.setProp( 'fillOpacity', color );
        return this;
      };

      /**
       * Saves the stroke width
       * @memberof Shape
       * @param {String} width - The stroke width
       * @return {Shape} The current shape
       */
      Shape.prototype.setStrokeWidth = function( width ) {
        this.setProp( 'strokeWidth', width );
        return this;
      };

      /**
       * Returns the stroke width
       * @memberof Shape
       * @return {String} The stroke width of the shape
       */
      Shape.prototype.getStrokeWidth = function() {
        return this.getProp( 'strokeWidth' );
      };

      /**
       * Saves the stroke dash array
       * @memberof Shape
       * @param {String} dasharray - The dasharray string
       * @example shape.setStrokeDasharray("5,5,1,4");
       * shape.applyStyle();
       * @return {Shape} The current shape
       */
      Shape.prototype.setStrokeDasharray = function( dasharray ) {
        this.setProp( 'strokeDasharray', dasharray );
        return this;
      };

      /**
       * Sets any extra attributes to the DOM element of the shape
       * @memberof Shape
       * @param {Object<String,String>} attributes - An extra attribute array to apply to the shape DOM
       * @example shape.setAttributes( { "data-bindable" : true } );
       * shape.applyStyle();
       * @return {Shape} The current shape
       */
      Shape.prototype.setAttributes = function( attributes ) {
        this.setProp( "attributes", attributes );
        return this;
      };

      /**
       * Adds a transform property to the shape.
       * @param {String} type - The transform type ("rotate", "transform" or "scale")
       * @param {String} args - The arguments following the transform
       * @memberof Shape
       * @return {Shape} The current shape
       */
      Shape.prototype.addTransform = function( type, args ) {
        this.addProp( 'transforms', {
          type: type,
          arguments: Array.isArray( args ) ? args : [ args ]
        } );
        return this;
      };

      /**
       * Resets the transforms
       * @memberof Shape
       * @see Shape#addTransform
       * @return {Shape} The current shape
       */
      Shape.prototype.resetTransforms = function() {
        this.resetProp( 'transforms' );
        return this;
      };

      /**
       * Sets the text of the label
       * @memberof Shape
       * @param {String} text - The text of the label
       * @param {Number} [ index = 0 ] - The index of the label
       * @return {Shape} The current shape
       */
      Shape.prototype.setLabelText = function( text, index ) {
        this.setProp( 'labelText', text, index || 0 );
        return this;
      };

      /**
       * Returns the text of the label
       * @memberof Shape
       * @param {Number} [ index = 0 ] - The index of the label
       * @return {String} The text of the label
       */
      Shape.prototype.getLabelText = function( text, index ) {
        return this.getProp( 'labelText', index || 0 );
      };

      /**
       * Displays a hidden label
       * @memberof Shape
       * @param {Number} [ index = 0 ] - The index of the label
       * @return {Shape} The current shape
       */
      Shape.prototype.displayLabel = function( index ) {
        this.setProp( 'labelVisible', true, index || 0 );
        return this;
      };

      /**
       * @alias Shape#displayLabel
       */
      Shape.prototype.showLabel = Shape.prototype.displayLabel;

      /**
       * Hides a displayed label
       * @memberof Shape
       * @param {Number} [ index = 0 ] - The index of the label
       * @return {Shape} The current shape
       */
      Shape.prototype.hideLabel = function( index ) {
        this.setProp( 'labelVisible', false, index || 0 );
        return this;
      };

      /**
       * Sets the color of the label
       * @memberof Shape
       * @param {String} color - The color of the label
       * @param {Number} [ index = 0 ] - The index of the label
       * @return {Shape} The current shape
       */
      Shape.prototype.setLabelColor = function( color, index ) {
        this.setProp( 'labelColor', color, index || 0 );
        return this;
      };

      /**
       * Sets the font size of the label
       * @memberof Shape
       * @param {String} size - The font size (in px) of the label
       * @param {Number} [ index = 0 ] - The index of the label
       * @return {Shape} The current shape
       */
      Shape.prototype.setLabelFontSize = function( size, index ) {
        this.setProp( 'labelFontSize', size, index || 0 );
        return this;
      };

      /**
       * Returns the position of the label
       * @memberof Shape
       * @param {Number} [ index = 0 ] - The index of the label
       * @return {Position} The current position of the label
       */
      Shape.prototype.getLabelPosition = function( index ) {
        return this.getProp( 'labelPosition', index || 0 );
      };

      /**
       * Sets the position of the label
       * @memberof Shape
       * @param {Position} position - The position of the label
       * @param {Number} [ index = 0 ] - The index of the label
       * @return {Shape} The current shape
       */
      Shape.prototype.setLabelPosition = function( position, index ) {

        var self;
        var pos = GraphPosition.check( position, function( relativeTo ) {
          return self.getRelativePosition( relativeTo );
        } );

        this.setProp( 'labelPosition', pos, index || 0 );
        return this;
      };

      /**
       * Sets the angle of the label
       * @memberof Shape
       * @param {Number} angle - The angle of the label in degrees (0 to 360°)
       * @param {Number} [ index = 0 ] - The index of the label
       * @return {Shape} The current shape
       */
      Shape.prototype.setLabelAngle = function( angle, index ) {
        this.setProp( 'labelAngle', angle, index || 0 );
        return this;
      };

      /**
       * Sets the baseline of the label, which affects its y position with respect to the text direction. For text along the x direction, different baselines will reference differently the text to the ```y``` coordinate.
       * @memberof Shape
       * @param {String} baseline - The baseline of the label. Most common baselines are ```no-change```, ```central```, ```middle``` and ```hanging```. You will find an explanation of those significations on the [corresponding MDN article]{@link https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/dominant-baseline}
       * @param {Number} [ index = 0 ] - The index of the label
       * @return {Shape} The current shape
       */
      Shape.prototype.setLabelBaseline = function( baseline, index ) {
        this.setProp( 'labelBaseline', baseline, index || 0 );
        return this;
      };

      /**
       * Sets the anchoring of the label. 
       * @memberof Shape
       * @param {String} anchor - The anchor of the label. Values can be ```start```, ```middle```, ```end``` or ```inherit```.
       * @param {Number} [ index = 0 ] - The index of the label
       * @return {Shape} The current shape
       */
      Shape.prototype.setLabelAnchor = function( anchor, index ) {
        this.setProp( 'labelAnchor', anchor, index || 0 );
        return this;
      };

      /**
       * Sets the anchoring of the label. 
       * @memberof Shape
       * @param {String} size - The font size in px
       * @param {Number} [ index = 0 ] - The index of the label
       * @return {Shape} The current shape
       */
      Shape.prototype.setLabelSize = function( size, index ) {
        this.setProp( 'labelSize', size, index || 0 );
        return this;
      };

      /**
       * Applies the generic style to the shape. This is a method that applies to most shapes, hence should not be overridden. However if you create a bundle of shapes that extend another one, you may use it to set common style properties to all your shapes.
       * @memberof Shape
       * @return {Shape} The current shape
       */
      Shape.prototype.applyGenericStyle = function() {

        this.setDom( "fill", this.getProp( "fillColor" ) );
        this.setDom( "fill-opacity", this.getProp( "fillOpacity" ) );
        this.setDom( "stroke", this.getProp( "strokeColor" ) );
        this.setDom( "stroke-width", this.getProp( "strokeWidth" ) );
        this.setDom( "stroke-dasharray", this.getProp( "strokeDasharray" ) );

        var attributes = this.getProp( "attributes" ) || {};

        for ( var i in attributes ) {
          this.setDom( i, typeof attributes[ i ] == "function" ? attributes[ i ].call( this, i ) : attributes[ i ] );
        }

        this._applyTransforms();

        return this;
      };

      /**
       * Applies the style to the shape. This method can be extended to apply specific style to the shapes
       * @memberof Shape
       * @return {Shape} The current shape
       */
      Shape.prototype.applyStyle = function() {
        return this.applyGenericStyle();
      };

      /**
       * Returns a computed position object
       * @memberof Shape
       * @param {(Number|Position)} [ index = 0 ] - The index of the position to compute
       * @param {Position} relToPosition - A base position from which to compute the position (useful for <code>dx</code> values)
       * @return {Object} The computed position object in the format <code>{ x: x_in_px, y: y_in_px }</code>
       */
      Shape.prototype.calculatePosition = function( index ) {

        var position;

        position = ( index instanceof GraphPosition ) ? index : this.getPosition( index );

        if ( !position ) {
          return;
        }

        if ( position && position.compute ) {
          return position.compute( this.graph, this.getXAxis(), this.getYAxis(), this.getSerie() );
        }

        this.graph.throw();
      };

      /**
       * @alias Shape#calculatePosition
       */
      Shape.prototype.computePosition = Shape.prototype.calculatePosition;

      /**
       * Returns a stored position object
       * @memberof Shape
       * @param {Number} [ index = 0 ] - The index of the position to compute
       * @return {Position} The current shape
       */
      Shape.prototype.getPosition = function( index ) {

        var pos = this.getProp( 'position', ( index || 0 ) );
        this.setProp( 'position', ( pos = GraphPosition.check( pos ) ), index );
        return pos;
      };

      /**
       * Sets a position object
       * @memberof Shape
       * @param {Position} position - The position object to store
       * @param {Number} [ index = 0 ] - The index of the position to store
       * @return {Position} The current shape
       */
      Shape.prototype.setPosition = function( position, index ) {

        var self = this;
        var pos = GraphPosition.check( position, function( relativeTo ) {
          return self.getRelativePosition( relativeTo );
        } );

        return this.setProp( 'position', pos, ( index || 0 ) );
      };

      /**
       * Applies the style to the shape. This method can be extended to apply specific style to the shapes
       * @memberof Shape
       * @private
       * @return {Shape} The current shape
       */
      Shape.prototype._applyTransforms = function() {

        var transforms = this.getProp( 'transforms' ),
          transformString = "";

        if ( !transforms ) {
          return;
        }
        transforms = Array.isArray( transforms ) ? transforms : [ transforms ];

        if ( transforms.length == 0 ) {
          return;
        }

        for ( var i = 0; i < transforms.length; i++ ) {

          transformString += transforms[ i ].type + "(";

          switch ( transforms[ i ].type ) {

            case 'translate':

              transformString += GraphPosition.getDeltaPx( transforms[ i ].arguments[ 0 ], this.getXAxis() ).replace( 'px', '' );
              transformString += ", ";
              transformString += GraphPosition.getDeltaPx( transforms[ i ].arguments[ 1 ], this.getYAxis() ).replace( 'px', '' );
              break;

            case 'rotate':

              transformString += transforms[ i ].arguments[ 0 ];
              transformString += ", ";

              if ( this.transforms[ i ].arguments.length == 1 ) {
                var p = this.getPosition( 0 );
                transformString += p.x + ", " + p.y;

              } else {

                transformString += GraphPosition.getDeltaPx( transforms[ i ].arguments[ 1 ], this.getXAxis() ).replace( 'px', '' );
                transformString += ", ";
                transformString += GraphPosition.getDeltaPx( transforms[ i ].arguments[ 2 ], this.getYAxis() ).replace( 'px', '' );
              }

              break;
          }

          transformString += ") ";
        }

        this.setDomGroup( 'transform', transformString );
        return this;
      };

      /**
       * Creates all the labels
       * @memberof Shape
       * @private
       * @returns {Shape} The current shape
       */
      Shape.prototype.makeLabels = function() {

        var self = this;
        this._labels = this._labels || [];

        this._labels.map( function( label ) {
          self.group.removeChild( label );
        } );

        this._labels = [];

        var i = 0;

        while ( this.getProp( "labelText", i ) ) {

          if ( !self._labels[ i ] ) {
            self._labels[ i ] = document.createElementNS( self.graph.ns, 'text' );
            self._labels[ i ].setAttribute( 'data-label-i', i );
            self._labels[ i ].jsGraphIsShape = self;
            self.group.appendChild( this._labels[ i ] );

            self._labels[ i ].addEventListener( 'dblclick', function( e ) {
              self.labelDblClickListener( e );
            } );

          }
          i++;
        }

        this.updateLabels();

        return this;
      };

      /**
       * Determines if the label is editable
       * @param {Number} labelIndex - The index of the label
       * @return {Boolean} ```true``` if the label is editable, ```false``` otherwise
       * @memberof Shape
       */
      Shape.prototype.isLabelEditable = function( labelIndex ) {
        return this.getProp( 'labelEditable', labelIndex || 0 );
      };

      /**
       * Applies the label data to the dom object
       * @memberof Shape
       * @private
       * @param {Number} labelIndex - The index of the label
       * @returns {Shape} The current shape
       */
      Shape.prototype.updateLabels = function() {

        var self = this;
        this._labels = this._labels || [];

        for ( var i = 0, l = this._labels.length; i < l; i++ ) {
          this._applyLabelData( i );

        }

      };

      /**
       * Applies the label data to the dom object
       * @memberof Shape
       * @private
       * @param {Number} labelIndex - The index of the label
       * @returns {Shape} The current shape
       */
      Shape.prototype._applyLabelData = function( labelIndex ) {

        labelIndex = labelIndex || 0;

        /** Sets the position */

        var visible = this.getProp( 'labelVisible', labelIndex );

        if ( !visible ) {
          this._labels[ labelIndex ].setAttribute( 'display', 'none' );
          return;
        } else {
          this._labels[ labelIndex ].setAttribute( 'display', 'initial' );
        }

        var position = this.calculatePosition( GraphPosition.check( this.getProp( "labelPosition", labelIndex ) ) );

        if ( isNaN( position.x ) || isNaN( position.y ) ) {
          /*console.warn( "Cannot compute positioning for labelIndex " + labelIndex + " with text " + this.getProp( "labelText", labelIndex ) );
          console.log( this, this._labels );
          console.trace();*/
          return;

        }

        if ( position.x != "NaNpx" && !isNaN( position.x ) && position.x !== "NaN" && position.x !== false ) {

          this._labels[ labelIndex ].setAttribute( 'x', position.x );
          this._labels[ labelIndex ].setAttribute( 'y', position.y );
        }

        /** Sets the angle */
        var currAngle = this.getProp( 'labelAngle', labelIndex ) || 0;
        if ( currAngle != 0 ) {

          var x = this._labels[ labelIndex ].getAttribute( 'x' ),
            y = this._labels[ labelIndex ].getAttribute( 'y' );

          this._labels[ labelIndex ].setAttribute( 'transform', 'rotate(' + currAngle + ' ' + x + ' ' + y + ')' );
        }

        /** Sets the baseline */
        this._labels[ labelIndex ].setAttribute( 'dominant-baseline', this.getProp( 'labelBaseline', labelIndex ) || 'no-change' );

        /** Sets the baseline */
        this._labels[ labelIndex ].textContent = this.getProp( 'labelText', labelIndex );

        /** Sets the color */
        this._labels[ labelIndex ].setAttribute( "fill", this.getProp( 'labelColor', labelIndex ) || 'black' );

        /** Sets the color */
        this._labels[ labelIndex ].setAttribute( "font-size", this.getProp( 'labelSize', labelIndex ) + "px" || "12px" );

        /** Sets the anchor */
        this._labels[ labelIndex ].setAttribute( 'text-anchor', this._getLabelAnchor( labelIndex ) );

        return this;
      };

      /**
       * Returns the anchor of the label
       * @memberof Shape
       * @private
       * @param {Number} labelIndex - The index of the label
       * @returns {String} The anchor in SVG string
       */
      Shape.prototype._getLabelAnchor = function( labelIndex ) {
        var anchor = this.getProp( 'labelAnchor', labelIndex );
        switch ( anchor ) {
          case 'middle':
          case 'start':
          case 'end':
            return anchor;
            break;

          case 'right':
            return 'end';
            break;

          case 'left':
            return 'start';
            break;

          default:
            return 'start';
            break;
        }
      };

      /**
       * Returns the shape selection status
       * @memberof Shape
       * @returns {Boolean} true is the shape is selected, false otherwise
       */
      Shape.prototype.isSelected = function() {
        return this._selectStatus || false;
      };

      /**
       * Sets or queries whether the shape can have handles. Even if the property is set to false, the getter can return true if the property ```statichandles``` is true (used when handles never disappear)
       * @memberof Shape
       * @param {Boolean} setter - If used, defined if the shape has handles or not
       * @returns {Boolean} true is the shape has handles, false otherwise
       * @example Shape.hasHandles( true ); // Sets that the shape has handles
       * @example Shape.hasHandles( false ); // Sets that the shape has no handles
       * @example Shape.hasHandles( ); // Queries the shape to determine if it has handles or not. Also returns true if handles are static
       */
      Shape.prototype.hasHandles = function( setter ) {

        if ( setter !== undefined ) {
          this.setProp( 'handles', setter );
        }

        return !!this.getProp( 'handles' ) || !!this.getProp( 'statichandles' );
      };

      /**
       * Adds shape handles 
       * @private 
       * @memberof Shape
       * @return {Shape} The current shape
       */
      Shape.prototype.addHandles = function() {

        if ( this.isLocked() ) {
          return;
        }

        if ( !this.handlesInDom ) {

          this.handlesInDom = true;

          for ( var i = 1; i < this.handles.length; i++ ) {

            if ( this.handles[ i ] ) {
              this.group.appendChild( this.handles[ i ] );
            }
          }
        }

        return this;
      };

      /**
       * Remove shape handles 
       * @private 
       * @memberof Shape
       * @return {Shape} The current shape
       */
      Shape.prototype.removeHandles = function() {

        this.hideHandles();
        this.handles = [];
      };

      /**
       * Hide shape handles 
       * @private 
       * @memberof Shape
       * @return {Shape} The current shape
       */
      Shape.prototype.hideHandles = function() {

        if ( !this.handlesInDom ) {
          return this;
        }

        for ( var i = 1; i < this.handles.length; i++ ) {
          this.group.removeChild( this.handles[ i ] );
        }

        this.handlesInDom = false;
        return this;
      };

      /**
       * @protected
       * @memberof Shape
       * @return {Boolean} ```true``` if the handles are in the DOM
       */
      Shape.prototype.areHandlesInDom = function() {

        return this.handlesInDom;
      };

      /**
       * Selects the shape. Should only be called from jsGraph main instance
       * @private
       * @memberof Shape
       * @param {Boolean} [ mute = false ] - Mutes the method (no event emission)
       * @returns {Shape} the current shape
       */
      Shape.prototype._select = function( mute ) {

        if ( !this.isSelectable() ) {
          return false;
        }

        // Put on the stack
        this.appendToDom();
        //this.graph.appendShapeToDom( this ); // Put the shape on top of the stack !

        this._selectStatus = true;
        var style = this.getSelectStyle();
        var style2 = {};
        for ( var i in style ) {
          if ( typeof style[ i ] == "function" ) {
            style2[ i ] = style[ i ].call( this );
          } else {
            style2[ i ] = style[ i ];
          }
        }

        util.saveDomAttributes( this._dom, style2, 'select' );
        console.log( this.hasHandles(), this.hasStaticHandles() );
        if ( this.hasHandles() && !this.hasStaticHandles() ) {
          this.addHandles();
          this.setHandles();
        }

        if ( !mute ) {
          this.graph.emit( "shapeSelected", this );
        }
      };

      /**
       * Unselects the shape. Should only be called from jsGraph main instance
       * @private
       * @memberof Shape
       * @param {Boolean} [ mute = false ] - Mutes the method (no event emission)
       * @returns {Shape} the current shape
       */
      Shape.prototype._unselect = function( mute ) {

        this._selectStatus = false;

        util.restoreDomAttributes( this._dom, 'select' );

        if ( this.hasHandles() && !this.hasStaticHandles() ) {
          this.hideHandles();
        }

        if ( !mute ) {
          this.graph.emit( "shapeUnselected", this );
        }
      };

      /**
       * Returns the special style of the shape when it is selected.
       * @memberof Shape
       * @see Shape#setSelectStyle
       * @param {Object<String,String>} The SVG attributes to apply to the shape
       */
      Shape.prototype.getSelectStyle = function() {
        return this.selectStyle;
      };

      /**
       * Defines the style that is applied to the shape when it is selected. The style extends the default style of the shape
       * @memberof Shape
       * @param {Object<String,String>} [ attr = {} ] - The SVG attributes to apply to the shape
       * @example rectangle.setSelectStyle( { fill: 'red' } );
       * @returns {Shape} the current shape
       */
      Shape.prototype.setSelectStyle = function( attr ) {
        this.selectStyle = attr;
        return this;
      };

      /**
       * Assigns static handles to the shape. In this mode, handles will not disappear
       * @memberof Shape
       * @param {Boolean} staticHandles - true to enable static handles, false to disable them.
       * @returns {Shape} the current shape
       */
      Shape.prototype.setStaticHandles = function( staticHandles ) {
        this.setProp( 'staticHandles', staticHandles );
      };

      /**
       * @memberof Shape
       * @returns {Boolean} ```true``` if the shape has static handles, ```false``` otherwise
       */
      Shape.prototype.hasStaticHandles = function( staticHandles ) {
        return !!this.getProp( 'staticHandles' );
      };

      /**
       * Creates the handles for the shape
       * @memberof Shape
       * @param {Number} nb - The number of handles
       * @param {String} type - The type of SVG shape to use
       * @param {Object<String,String>} [ attr = {} ] - The SVG attributes to apply to the handles
       * @param {Function} [ callbackEach ] - An additional callback the user can provide to further personalize the handles
       * @returns {Shape} the current shape
       * @private
       */
      Shape.prototype._createHandles = function( nb, type, attr, callbackEach ) {

        if ( this.handles && this.handles.length > 0 ) {
          return;
        }

        var self = this;

        for ( var i = 1, l = nb; i <= l; i++ ) {

          ( function( j ) {

            var self = this;

            var handle = document.createElementNS( self.graph.ns, type );
            handle.jsGraphIsShape = true;

            if ( attr ) {
              for ( var k in attr ) {
                handle.setAttribute( k, attr[ k ] );
              }
            }

            handle
              .addEventListener( 'mousedown', function( e ) {

                if ( self.isResizable() ) {

                  e.preventDefault();
                  e.stopPropagation();

                  self.graph.emit( "beforeShapeResize", self );

                  if ( !self.graph.prevent( false ) ) {

                    self.resizing = true;
                    self.handleSelected = j;
                    self.handleMouseDown( e );
                  }
                }

              } );

            if ( callbackEach ) {
              callbackEach( self.handles[ j ] );
            }

            self.handles[ j ] = handle;

          } ).call( this, i );

        }

        return this.handles;
      };

      /**
       * Creates the handles for the shape. Should be implemented by the children shapes classes.
       * @memberof Shape
       */
      Shape.prototype.createHandles = function() {

      };

      /**
       * Handles mouse down event
       * @private
       * @param {Event} e - The native event
       * @memberof Shape.prototype
       */
      Shape.prototype.handleMouseDownImpl = function() {};

      /**
       * Handles the mouse move event
       * @private
       * @param {Event} e - The native event
       * @memberof Shape.prototype
       */
      Shape.prototype.handleMouseMoveImpl = function() {};

      /**
       * Handles mouse up event
       * @private
       * @param {Event} e - The native event
       * @memberof Shape.prototype
       */
      Shape.prototype.handleMouseUpImpl = function() {};

      /**
       * Called when the shape is created
       * @private
       * @param {Event} e - The native event
       * @memberof Shape.prototype
       */
      Shape.prototype.handleCreateImpl = function() {};

      /**
       * Handles mouse down events
       * @param {Event} e - The native event
       * @return The result of the {@link Shape#handleMouseDownImpl} method
       * @memberof Shape.prototype
       */
      Shape.prototype.handleMouseDown = function( e ) {

        //this.handleSelected = false;

        if ( this.isLocked() ) {
          return;
        }

        if ( this.isMovable() || this.isResizable() ) {

          this.graph.elementMoving( this );
        }

        if ( this.getProp( 'selectOnMouseDown' ) ) {
          this.graph.selectShape( this );
        }

        if ( this.isMovable() ) {
          if ( !this.resizing ) {

            this.graph.emit( "beforeShapeMove", self );

            if ( !this.graph.prevent( false ) ) {

              this.moving = true;
            }
          } else {

          }
        }

        this._mouseCoords = this.graph._getXY( e );
        return this.handleMouseDownImpl( e, this._mouseCoords );
      };

      /**
       * Handles mouse click events
       * @param {Event} e - The native event
       * @return The result of the {@link Shape#handleMouseDownClick} method
       * @private
       */
      Shape.prototype.handleClick = function( e ) {

        if ( this.getProp( 'selectOnClick' ) ) {
          this.graph.selectShape( this );
        }

        if ( !this.isSelectable() ) {
          return false;
        }

        if ( !e.shiftKey ) {
          this.graph.unselectShapes();
        }

        this.graph.selectShape( this );
      };

      /**
       * Handles mouse click events
       * @param {Event} e - The native event
       * @return The result of the {@link Shape#handleMouseUpImpl} method
       * @private
       */
      Shape.prototype.handleMouseMove = function( e ) {
        //console.log( this.resizinh, this.moving, this.isSelected(), this._mouseCoords );
        if ( ( this.resizing || this.moving ) && !this.isSelected() ) {
          this.graph.selectShape( this );
        }

        this.graph.emit( "beforeShapeMouseMove", this );

        if ( this.graph.prevent( false ) || !this._mouseCoords ) {
          return false;
        }

        var coords = this.graph._getXY( e );
        var
          deltaX = this.getXAxis().getRelVal( coords.x - this._mouseCoords.x ),
          deltaY = this.getYAxis().getRelVal( coords.y - this._mouseCoords.y );

        if ( deltaX != 0 || deltaY !== 0 ) {
          this.preventUnselect = true;
        }

        this._mouseCoords = coords;

        var ret = this.handleMouseMoveImpl( e, deltaX, deltaY, coords.x - this._mouseCoords.x, coords.y - this._mouseCoords.y );

        return ret;

      };

      /**
       * Handles mouse up events
       * @param {Event} e - The native event
       * @return The result of the {@link Shape#handleMouseUpImpl} method
       * @private
       */
      Shape.prototype.handleMouseUp = function( e ) {

        if ( this.moving ) {

          this.graph.emit( "shapeMoved", this );

        }

        if ( this.handleSelected || this.resize ) {

          this.graph.emit( "shapeResized", this );

        }

        this.moving = false;
        this.resizing = false;
        this.handleSelected = false;
        this.graph.elementMoving( false );

        return this.handleMouseUpImpl( e );
      };

      /**
       * Handles double click events
       * @param {Event} e - The native event
       * @return The result of the {@link Shape#handleMouseDblClickImpl} method
       * @private
       */
      Shape.prototype.handleDblClick = function( e ) {

      };

      /**
       * Handles mouse over events
       * @param {Event} e - The native event
       * @return The result of the {@link Shape#handleMouseOverImpl} method
       * @private
       */
      Shape.prototype.handleMouseOver = function() {

        if ( this.getProp( "highlightOnMouseOver" ) ) {

          if ( !this.moving && !this.resizing ) {
            this.highlight();
          }
        }

        this.graph.emit( "shapeMouseOver", this );
      };

      /**
       * Handles mouse out events
       * @param {Event} e - The native event
       * @return The result of the {@link Shape#handleMouseOutImpl} method
       * @private
       */
      Shape.prototype.handleMouseOut = function() {

        if ( this.getProp( "highlightOnMouseOver" ) ) {
          this.unHighlight();
        }

        this.graph.emit( "shapeMouseOut", this );
      };

      /*
       *  Updated July 1st, 2015
       */

      /**
       * Locks the shape (prevents selection, resizing and moving)
       * @return {Shape} The current shape
       * @memberof Shape
       */
      Shape.prototype.lock = function() {
        this.setProp( 'locked', true );
        return this;
      };

      /**
       * Unlocks the shape (prevents selection, resizing and moving)
       * @return {Shape} The current shape
       * @memberof Shape
       */
      Shape.prototype.unlock = function() {
        this.setProp( 'locked', false );
        return this;
      };

      /**
       * @return {Boolean} True if the shape is locked, false otherwise
       * @memberof Shape
       */
      Shape.prototype.isLocked = function() {
        return this.getProp( 'locked' ) || this.graph.shapesLocked;
      };

      /**
       * Makes the shape moveable
       * @return {Shape} The current shape
       * @memberof Shape
       */
      Shape.prototype.movable = function( bln ) {
        this.setProp( 'movable', true );
      };

      /**
       * Makes the shape non-moveable
       * @return {Shape} The current shape
       * @memberof Shape
       */
      Shape.prototype.unmovable = function() {
        this.setProp( 'movable', false );
        return false;
      };

      /**
       * @return {Boolean} True if the shape is movable, false otherwise
       * @memberof Shape
       */
      Shape.prototype.isMovable = function() {
        return this.getProp( 'movable' );
      };

      /**
       * Makes the shape resizable
       * @return {Shape} The current shape
       * @memberof Shape
       */
      Shape.prototype.resizable = function() {
        this.setProp( 'resizable', true );
      };

      /**
       * Makes the shape non-resizable
       * @return {Shape} The current shape
       * @memberof Shape
       */
      Shape.prototype.unresizable = function() {
        this.setProp( 'resizable', false );
      };

      /**
       * @return {Boolean} True if the shape is resizable, false otherwise
       * @memberof Shape
       */
      Shape.prototype.isResizable = function() {
        return this.getProp( 'resizable' );
      };

      /**
       * Makes the shape selectable
       * @return {Shape} The current shape
       * @memberof Shape
       */
      Shape.prototype.selectable = function() {
        this.setProp( 'selectable', true );
      };

      /**
       * Makes the shape non-selectable
       * @return {Shape} The current shape
       * @memberof Shape
       */
      Shape.prototype.unselectable = function() {
        this.graph.unselectShape( this );
        this.setProp( 'selectable', false );
      };

      /**
       * @return {Boolean} True if the shape is selectable, false otherwise
       * @memberof Shape
       */
      Shape.prototype.isSelectable = function() {
        return this.getProp( 'selectable' );
      };

      /**
       * Highlights the shape with attributes
       * @memberof Shape
       * @returns {Shape} The current shape
       * @param {Object<String,String>} [ attributes ] - A hashmap of attributes to apply. If omitted, {@link Shape#getHighlightAttributes} will be called
       * @param {String} [ saveDomName=highlight ] - The name to which the current shape attributes will be saved to be recovered later with the {@link Shape#unHighlight} method
       * @example shape.highlight( { fill: 'red', 'fill-opacity': 0.5 } );
       * @see Shape#unHighlight
       */
      Shape.prototype.highlight = function( attributes, saveDomName ) {

        if ( !attributes ) {
          attributes = this.getHighlightAttributes();
        }

        if ( !saveDomName ) {
          saveDomName = "highlight";
        }

        util.saveDomAttributes( this._dom, attributes, saveDomName );
        this.highlightImpl();
        return this;
      };

      /**
       * Removes the highlight properties from the same
       * @memberof Shape
       * @returns {Shape} The current shape 
       * @param {String} [ saveDomName=highlight ] - The name to which the current shape attributes will be saved to be recovered later with the {@link Shape#unHighlight} method
       * @see Shape#highlight
       */
      Shape.prototype.unHighlight = function( saveDomName ) {

        if ( !saveDomName ) {
          saveDomName = "highlight";
        }

        util.restoreDomAttributes( this._dom, saveDomName );
        this.unHighlightImpl();
        return this;
      };

      Shape.prototype.highlightImpl = function() {};
      Shape.prototype.unHighlightImpl = function() {};

      /**
       * @memberof Shape
       * @returns {Object} The attributes taken by the shape when highlighted
       * @see Shape#highlight
       */
      Shape.prototype.getHighlightAttributes = function() {
        return this._highlightAttributes;
      };

      /**
       * Sets the attributes the shape will take when highlighted
       * @memberof Shape
       * @param {Object<String,String>} [ attributes ] - A hashmap of attributes to apply when the shape is highlighted
       * @returns {Shape} The current shape
       * @see Shape#highlight
       */
      Shape.prototype.setHighlightAttributes = function( attributes ) {
        this._highlightAttributes = attributes;
        return this;
      };

      /**
       * Returns the masking id of the shape. Returns null if the shape does not behave as a mask
       * @memberof Shape
       * @returns {String} The ```id``` attribute of the shape
       */
      Shape.prototype.getMaskingID = function() {
        return this.maskingId;
      };

      /**
       * Masks the current shape with another shape passed as the first parameter of the method
       * @memberof Shape
       * @param {Shape} maskingShape - The shape used to mask the current shape
       * @return {Shape} The current shape
       */
      Shape.prototype.maskWith = function( maskingShape ) {

        var maskingId;

        if ( maskingId = maskingShape.getMaskingID() ) {

          this._dom.setAttribute( 'mask', 'url(#' + maskingId + ')' );

        } else {

          this._dom.removeAttribute( 'mask' );
        }
      };

      /**
       * Manually updates the mask of the shape. This is needed because the shape needs to be surrounded by a white rectangle (because transparent is treated as black and will not render the shape)
       * This method will work well for rectangles but should be overridden for other shapes
       * @memberof Shape
       * @return {Shape} The current shape
       * @todo Explore a way to make it compatible for all kinds of shapes. Maybe the masker position should span the whole graph...
       */
      Shape.prototype.updateMask = function() {
        return;
        if ( !this.maskDom ) {
          return;
        }

        var position = {
          x: 'min',
          y: 'min'
        };
        var position2 = {
          x: 'max',
          y: 'max'
        };

        position = this._getPosition( position );
        position2 = this._getPosition( position2 );

        this.maskDomWrapper.setAttribute( 'x', Math.min( position.x, position2.x ) );
        this.maskDomWrapper.setAttribute( 'y', Math.min( position.y, position2.y ) );

        this.maskDomWrapper.setAttribute( 'width', Math.abs( position2.x - position.x ) );
        this.maskDomWrapper.setAttribute( 'height', Math.abs( position2.y - position.y ) );

        for ( var i = 0; i < this._dom.attributes.length; i++ ) {
          this.maskDom.setAttribute( this._dom.attributes[ i ].name, this._dom.attributes[ i ].value );
        }

        this.maskDom.setAttribute( 'fill', 'black' );

        return this;
      };

      Shape.prototype.labelDblClickListener = function( e ) {

        var i = parseInt( e.target.getAttribute( 'data-label-i' ) );

        var self = this;

        if ( isNaN( i ) ) {
          return;
        }

        if ( !this.isLabelEditable( i ) ) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        $( '<input type="text" />' ).attr( 'value', self.getProp( 'labelText', i ) ).prependTo( self.graph._dom ).css( {

          position: 'absolute',
          'margin-top': ( parseInt( e.target.getAttribute( 'y' ).replace( 'px', '' ) ) - 10 ) + "px",
          'margin-left': ( parseInt( e.target.getAttribute( 'x' ).replace( 'px', '' ) ) - 50 ) + "px",
          textAlign: 'center',
          width: '100px'

        } ).bind( 'blur', function() {

          $( this ).remove();

          self.setLabelText( $( this ).prop( 'value' ), i );
          self._labels[ i ].textContent = $( this ).prop( 'value' );

          self.changed( "shapeLabelChanged" );

        } ).bind( 'keyup', function( e ) {

          e.stopPropagation();
          e.preventDefault();

          if ( e.keyCode == 13 ) {
            $( this ).trigger( 'blur' );
          }

        } ).bind( 'keypress', function( e ) {

          e.stopPropagation();

        } ).bind( 'keydown', function( e ) {

          e.stopPropagation();

        } ).focus().get( 0 ).select();

      };

      /**
       * Appends the shape DOM to its parent
       * @memberof Shape
       * @private
       * @return {Shape} The current shape
       */
      Shape.prototype.appendToDom = function() {

        if ( this._forcedParentDom ) {

          this._forcedParentDom.appendChild( this.group );
        } else {
          this.graph.appendShapeToDom( this );
        }
        return this;
      };

      /**
       * Forces the DOM parent (instead of the normal layer)
       * @memberof Shape
       * @return {Shape} The current shape
       */
      Shape.prototype.forceParentDom = function( dom ) {

        this._forcedParentDom = dom;

        return this;
      };

      return Shape;

    } )( build[ "./graph.position" ], build[ "./graph.util" ], build[ "./dependencies/eventEmitter/EventEmitter" ] );

    /* 
     * Build: new source file 
     * File name : shapes/graph.shape.areaundercurve
     * File path : /Users/normanpellet/Documents/Web/graph/src/shapes/graph.shape.areaundercurve.js
     */

    build[ './shapes/graph.shape.areaundercurve' ] = ( function( $, GraphShape ) {
      /** @global */
      /** @ignore */

      "use strict";

      function GraphSurfaceUnderCurve( graph ) {

      }

      $.extend( GraphSurfaceUnderCurve.prototype, GraphShape.prototype, {
        createDom: function() {

          var self = this;
          this._dom = document.createElementNS( this.graph.ns, 'path' );
          //this._dom.setAttribute( 'pointer-events', 'stroke' );

          /*			this.handle1 = document.createElementNS(this.graph.ns, 'line');
			this.handle1.setAttribute(');

			this.handle2 = document.createElementNS(this.graph.ns, 'line');
			this.handle2.setAttribute('stroke-width', '3');
			this.handle2.setAttribute('stroke', 'transparent');
			this.handle2.setAttribute('pointer-events', 'stroke');
			this.handle2.setAttribute('cursor', 'ew-resize');*/

          //			this.setDom('cursor', 'move');
          //			this.doDraw = undefined;

          /*			this.graph.contextListen( this._dom, [
				
				['<li><a><span class="ui-icon ui-icon-cross"></span> Remove integral</a></li>', 
				function(e) {
					self.kill();
					self.graph.triggerEvent('onAnnotationRemove', self.data);
				}]

			]);*/

        },

        createHandles: function() {

          this._createHandles( 2, 'line', {
            'stroke-width': '3',
            'stroke': 'transparent',
            'pointer-events': 'stroke',
            'cursor': 'ew-resize'
          } );

        },

        handleMouseMoveImpl: function( e, deltaX, deltaY ) {

          if ( this.isLocked() ) {
            return;
          }

          if ( this.moving ) {

            this.getPosition( 0 ).deltaPosition( 'x', deltaX, this.getXAxis() );
            this.getPosition( 1 ).deltaPosition( 'x', deltaX, this.getXAxis() );

          } else if ( this.serie && this.handleSelected ) {

            this.resizingPosition = this.handleSelected == 1 ? this.getPosition( 0 ) : this.getPosition( 1 );

            var value = this.serie.searchClosestValue( this.getXAxis().getVal( this.graph._getXY( e ).x - this.graph.getPaddingLeft() ) );

            if ( !value ) {
              return;
            }

            if ( this.resizingPosition.x != value.xMin ) {
              this.preventUnselect = true;
            }

            this.resizingPosition.x = value.xMin;

          } else if ( this.handleSelected ) {

            this.resizingPosition = this.handleSelected == 1 ? this.getPosition( 0 ) : this.getPosition( 1 );
            this.resizingPosition.deltaPosition( 'x', deltaX, this.getXAxis() );
          }

          this.applyPosition();
        },
        /*
            redrawImpl: function() {
              //var doDraw = this.setPosition();
              //	this.setDom('fill', 'url(#' + 'patternFill' + this.graph._creation + ')')

              if ( this.position != this.doDraw ) {
                this.group.setAttribute( "visibility", this.position ? "visible" : 'hidden' );
                this.doDraw = this.position;
              }
            },
        */
        applyPosition: function() {

          if ( !this.serie ) {
            return;
          }

          var posXY = this.computePosition( 0 ),
            posXY2 = this.computePosition( 1 ),
            w = Math.abs( posXY.x - posXY2.x ),
            x = Math.min( posXY.x, posXY2.x );

          //  this.reversed = x == posXY2.x;

          if ( w < 2 || x + w < 0 || x > this.graph.getDrawingWidth() ) {
            this.setDom( 'd', "" );
            return false;
          }

          var v1 = this.serie.searchClosestValue( this.getPosition( 0 ).x ),
            v2 = this.serie.searchClosestValue( this.getPosition( 1 ).x ),
            v3,
            i,
            j,
            init,
            max,
            k,
            x,
            y,
            firstX,
            firstY,
            currentLine,
            maxY = 0,
            minY = Number.MAX_VALUE;

          if ( !v1 || !v2 ) {
            return false;
          }

          if ( v1.xBeforeIndex > v2.xBeforeIndex ) {
            v3 = v1;
            v1 = v2;
            v2 = v3;

            //this.handleSelected = ( this.handleSelected == 1 ) ? 2 : 1;
          }

          this.counter = 0;

          for ( i = v1.dataIndex; i <= v2.dataIndex; i++ ) {
            this.currentLine = "";
            init = i == v1.dataIndex ? v1.xBeforeIndexArr : 0;
            max = i == v2.dataIndex ? v2.xBeforeIndexArr : this.serie.data[ i ].length;
            k = 0;

            if ( init == max ) {
              max++;
            }

            for ( j = init; j <= max; j += 2 ) {

              x = this.serie.getX( this.serie.data[ i ][ j + 0 ] );
              y = this.serie.getY( this.serie.data[ i ][ j + 1 ] );

              maxY = Math.max( this.serie.data[ i ][ j + 1 ], maxY );
              minY = Math.min( this.serie.data[ i ][ j + 1 ], minY );

              if ( j == init ) {
                this.firstX = x;
                this.firstY = y;
              }

              if ( k > 0 ) {
                this.currentLine += " L " + x + " " + y + " "
              } else {
                this.currentLine += " M " + x + " " + y + " ";
              }

              //this.serie._addPoint( x, y, false, this.currentLine );
              k++;

            }

            this.lastX = x;
            this.lastY = y;

            if ( !this.firstX || !this.firstY || !this.lastX || !this.lastY ) {
              return;
            }

            this.currentLine += " V " + this.getYAxis().getPx( 0 ) + " H " + this.firstX + " z";
            this.setDom( 'd', this.currentLine );
          }

          this.maxY = this.serie.getY( maxY );
          this.setHandles();

          this.changed();

          return true;
        },

        setHandles: function() {

          if ( !this.firstX ) {
            return;
          }

          var posXY = this.computePosition( 0 ),
            posXY2 = this.computePosition( 1 );

          if ( posXY.x < posXY2.x ) {

            this.handles[ 1 ].setAttribute( 'x1', this.firstX );
            this.handles[ 1 ].setAttribute( 'x2', this.firstX );

            this.handles[ 2 ].setAttribute( 'x1', this.lastX );
            this.handles[ 2 ].setAttribute( 'x2', this.lastX );

          } else {

            this.handles[ 1 ].setAttribute( 'x1', this.lastX );
            this.handles[ 1 ].setAttribute( 'x2', this.lastX );

            this.handles[ 2 ].setAttribute( 'x1', this.firstX );
            this.handles[ 2 ].setAttribute( 'x2', this.firstX );

          }
          this.handles[ 1 ].setAttribute( 'y1', this.getYAxis().getMaxPx() );
          this.handles[ 1 ].setAttribute( 'y2', this.serie.getY( 0 ) );

          this.handles[ 2 ].setAttribute( 'y1', this.getYAxis().getMaxPx() );
          this.handles[ 2 ].setAttribute( 'y2', this.serie.getY( 0 ) );
        },

        /*
            setLabelPosition: function( labelIndex )  {

              if ( this.firstX, this.lastX, this.lastPointY, this.firstPointY ) {
                var x = ( this.firstX + this.lastX ) / 2 + "px";
                var y = ( this.lastPointY + this.firstPointY ) / 2 + "px";
                var flip = this.serie ? this.serie.isFlipped() :  false;

                this._setLabelPosition( labelIndex, {
                  x: flip ? y : x,
                  y: flip ? x : y
                } );
              }
            },*/

      } );

      return GraphSurfaceUnderCurve;
    } )( build[ "./jquery" ], build[ "./shapes/graph.shape" ] );

    /* 
     * Build: new source file 
     * File name : shapes/graph.shape.line
     * File path : /Users/normanpellet/Documents/Web/graph/src/shapes/graph.shape.line.js
     */

    build[ './shapes/graph.shape.line' ] = ( function( GraphShape ) {
      /** @global */
      /** @ignore */

      "use strict";

      /** 
       * Represents a line that extends the Shape class
       * @class LineShape
       * @augments Shape
       * @see Graph#newShape
       */
      function LineShape( graph, options ) {

      }

      LineShape.prototype = new GraphShape();

      /**
       * Creates the DOM
       * @memberof LineShape
       * @private
       * @return {Shape} The current shape
       */
      LineShape.prototype.createDom = function() {

        this._dom = document.createElementNS( this.graph.ns, 'line' );

        this.setStrokeColor( 'black' );
        this.setStrokeWidth( 1 );
      };

      /**
       * Creates the handles
       * @memberof LineShape
       * @private
       * @return {Shape} The current shape
       */
      LineShape.prototype.createHandles = function() {

        this._createHandles( 2, 'rect', {
          transform: "translate(-3 -3)",
          width: 6,
          height: 6,
          stroke: "black",
          fill: "white",
          cursor: 'nwse-resize'
        } );
      };

      /**
       * Recalculates the positions and applies them
       * @memberof LineShape
       * @private
       * @return {Boolean} Whether the shape should be redrawn
       */
      LineShape.prototype.applyPosition = function() {

        var position = this.calculatePosition( 0 );
        var position2 = this.calculatePosition( 1 );

        if ( !position || !position.x || !position.y ) {
          return;
        }

        this.setDom( 'x2', position.x );
        this.setDom( 'y2', position.y );

        this.setDom( 'y1', position2.y );
        this.setDom( 'x1', position2.x );

        this.currentPos2x = position2.x;
        this.currentPos2y = position2.y;

        this.currentPos1x = position.x;
        this.currentPos1y = position.y;

        return true;
      };

      /**
       * Handles mouse move events
       * @memberof LineShape
       * @private
       */
      LineShape.prototype.handleMouseMoveImpl = function( e, deltaX, deltaY, deltaXPx, deltaYPx ) {

        if ( this.isLocked() ) {
          return;
        }

        var pos = this.getPosition( 0 );
        var pos2 = this.getPosition( 1 );

        var posToChange;
        if ( this.handleSelected == 1 ) {

          posToChange = pos;

        } else if ( this.handleSelected == 2 ) {

          posToChange = pos2;
        }

        if ( posToChange ) {

          if ( !this._data.vertical ) {
            posToChange.deltaPosition( 'x', deltaX, this.getXAxis() );
          }

          if ( !this._data.horizontal ) {
            posToChange.deltaPosition( 'y', deltaY, this.getYAxis() );
          }
        }

        if ( this.moving ) {

          // If the pos2 is defined by a delta, no need to move them
          if ( pos.x ) {
            pos.deltaPosition( 'x', deltaX, this.getXAxis() );
          }
          if ( pos.y ) {
            pos.deltaPosition( 'y', deltaY, this.getYAxis() );
          }

          // If the pos2 is defined by a delta, no need to move them
          if ( pos2.x ) {
            pos2.deltaPosition( 'x', deltaX, this.getXAxis() );
          }
          if ( pos2.y ) {
            pos2.deltaPosition( 'y', deltaY, this.getYAxis() );
          }

        }

        if ( this._data.forcedCoords ) {

          var forced = this._data.forcedCoords;

          if ( forced.y !== undefined ) {

            if ( typeof forced.y == "function" ) {
              pos2.y = pos.y = forced.y( this );
            } else {
              pos2.y = forced.y;
              pos.y = forced.y;
            }
          }

          if ( forced.x !== undefined ) {

            if ( typeof forced.x == "function" ) {
              pos2.x = pos.x = forced.x( this );
            } else {
              pos2.x = forced.x;
              pos.x = forced.x;
            }
          }
        }

        if ( this.rectEvent ) {
          this.setEventReceptacle();
        }

        this.redraw();
        this.changed();
        this.setHandles();

        return true;

      };

      /**
       * Sets the handle position
       * @memberof LineShape
       * @private
       */
      LineShape.prototype.setHandles = function() {

        if ( !this.areHandlesInDom() ) {
          return;
        }

        if ( isNaN( this.currentPos1x ) ) {
          return;
        }

        this.handles[ 1 ].setAttribute( 'x', this.currentPos1x );
        this.handles[ 1 ].setAttribute( 'y', this.currentPos1y );

        this.handles[ 2 ].setAttribute( 'x', this.currentPos2x );
        this.handles[ 2 ].setAttribute( 'y', this.currentPos2y );
      };

      /**
       * Creates an line receptacle with the coordinates of the line, but continuous and thicker
       * @memberof LineShape
       * @return {Shape} The current shape
       */
      LineShape.prototype.setEventReceptacle = function() {

        if ( !this.currentPos1x ) {
          return;
        }

        if ( !this.rectEvent ) {
          this.rectEvent = document.createElementNS( this.graph.ns, 'line' );
          this.rectEvent.setAttribute( 'pointer-events', 'stroke' );
          this.rectEvent.setAttribute( 'stroke', 'transparent' );
          this.rectEvent.jsGraphIsShape = this;
          this.group.appendChild( this.rectEvent );
        }

        this.rectEvent.setAttribute( 'x1', this.currentPos1x );
        this.rectEvent.setAttribute( 'y1', this.currentPos1y );
        this.rectEvent.setAttribute( 'x2', this.currentPos2x );
        this.rectEvent.setAttribute( 'y2', this.currentPos2y );
        this.rectEvent.setAttribute( "stroke-width", this.getProp( "strokeWidth" ) + 2 );
      };

      return LineShape;

    } )( build[ "./shapes/graph.shape" ] );

    /* 
     * Build: new source file 
     * File name : shapes/graph.shape.arrow
     * File path : /Users/normanpellet/Documents/Web/graph/src/shapes/graph.shape.arrow.js
     */

    build[ './shapes/graph.shape.arrow' ] = ( function( GraphLine ) {
      /** @global */
      /** @ignore */

      /** 
       * Arrow shape
       * @class ArrowShape
       * @static
       */
      function ArrowShape( graph ) {

      }

      ArrowShape.prototype = new GraphLine();

      ArrowShape.prototype.createDom = function() {

        this._dom = document.createElementNS( this.graph.ns, 'line' );
        this._dom.setAttribute( 'marker-end', 'url(#arrow' + this.graph._creation + ')' );

        this._createHandles( this.nbHandles, 'rect', {
          transform: "translate(-3 -3)",
          width: 6,
          height: 6,
          stroke: "black",
          fill: "white",
          cursor: 'nwse-resize'
        } );

        this.setStrokeColor( 'black' );
        this.setStrokeWidth( 1 );

      };

      return ArrowShape;

    } )( build[ "./shapes/graph.shape.line" ] );

    /* 
     * Build: new source file 
     * File name : shapes/graph.shape.ellipse
     * File path : /Users/normanpellet/Documents/Web/graph/src/shapes/graph.shape.ellipse.js
     */

    build[ './shapes/graph.shape.ellipse' ] = ( function( $, GraphShape ) {
      /** @global */
      /** @ignore */

      function GraphEllipse( graph, options ) {}

      $.extend( GraphEllipse.prototype, GraphShape.prototype, {

        createDom: function() {
          this._dom = document.createElementNS( this.graph.ns, 'ellipse' );
        },

        applyPosition: function() {

          var pos = this.computePosition( 0 );

          this.setDom( 'cx', pos.x || 0 );
          this.setDom( 'cy', pos.y || 0 );

          this.setDom( 'rx', this.getProp( 'rx' ) || 0 );
          this.setDom( 'ry', this.getProp( 'ry' ) || 0 );

          return true;
        },

        handleMouseUpImpl: function() {

          /*	if( pos2.y < pos.y ) {
				var y = pos.y;
				pos.y = pos2.y;
				pos2.y = y;
			}
		*/
          this.triggerChange();
        },

        handleMouseMoveImpl: function( e, deltaX, deltaY, deltaXPx, deltaYPx ) {
          return;

        }

      } );

      return GraphEllipse;

    } )( build[ "./jquery" ], build[ "./shapes/graph.shape" ] );

    /* 
     * Build: new source file 
     * File name : shapes/graph.shape.label
     * File path : /Users/normanpellet/Documents/Web/graph/src/shapes/graph.shape.label.js
     */

    build[ './shapes/graph.shape.label' ] = ( function( $, GraphShape ) {
      /** @global */
      /** @ignore */

      /** 
       * Represents a label that extends the Shape class
       * @class LabelShape
       * @augments Shape
       * @see Graph#newShape
       */
      function LabelShape( graph, options ) {
        this.selectStyle = {
          stroke: 'red'
        };

      }

      LabelShape.prototype = new GraphShape();

      $.extend( LabelShape.prototype, GraphShape.prototype, {

        createDom: function() {
          return false;
        },

        applyPosition: function() {
          return true;
        }

      } );

      return LabelShape;

    } )( build[ "./jquery" ], build[ "./shapes/graph.shape" ] );

    /* 
     * Build: new source file 
     * File name : shapes/graph.shape.nmrintegral
     * File path : /Users/normanpellet/Documents/Web/graph/src/shapes/graph.shape.nmrintegral.js
     */

    build[ './shapes/graph.shape.nmrintegral' ] = ( function( $, GraphSurfaceUnderCurve, GraphPosition ) {
      /** @global */
      /** @ignore */

      "use strict";

      function GraphNMRIntegral( graph, options ) {
        this.nbHandles = 2;

      }

      $.extend( GraphNMRIntegral.prototype, GraphSurfaceUnderCurve.prototype, {

        createHandles: function() {

          this._createHandles( 2, 'rect', {
            transform: "translate(-3 -3)",
            width: 6,
            height: 6,
            stroke: "black",
            fill: "white"
          } );
        },

        applyPosition: function() {

          var posXY = this.calculatePosition( 0 ),
            posXY2 = this.calculatePosition( 1 ),
            w,
            x,
            axis = this.getAxis();

          var baseLine = this.yBaseline || 30;
          var points = [];

          if ( !posXY || !posXY2 ) {
            return;
          }

          if ( !this.serie.isFlipped() ) {

            baseLine = this.getYAxis().getPx( 0 ) - baseLine;

            w = Math.abs( posXY.x - posXY2.x );
            x = Math.min( posXY.x, posXY2.x );

          } else {

            baseLine = this.getXAxis().getPx( 0 ) - baseLine;

            w = Math.abs( posXY.y - posXY2.y );
            x = Math.min( posXY.y, posXY2.y );
          }

          this.computedBaseline = baseLine;
          this.reversed = x == posXY2.x;

          var pos1 = this.getPosition( 0 );
          var pos2 = this.getPosition( 1 );

          if (
            ( axis == 'x' && ( w < 2 || x + w < 0 || x > this.graph.getDrawingWidth() ) ) ||
            ( axis == 'y' && ( w < 2 || x + w < 0 || x > this.graph.getDrawingHeight() ) )
          ) {

            points = [
              [ 0, 0 ]
            ];
            this.hideLabel( 0 );
            this.setDom( "d", "" );

          } else {

            this.showLabel( 0 );

            var v1 = this.serie.searchClosestValue( pos1[ axis ] ),
              v2 = this.serie.searchClosestValue( pos2[ axis ] ),
              v3,
              i,
              j,
              init,
              max,
              k,
              x,
              y,
              firstX,
              firstY,
              currentLine = "",
              maxY = 0,
              incrYFlip = 1,
              incrXFlip = 0,
              minY = Number.MAX_VALUE;

            if ( !v1 || !v2 ) {
              return false;
            }

            posXY.y = v1.yMin;
            posXY2.y = v2.yMin;

            if ( v1.xBeforeIndex > v2.xBeforeIndex ) {
              v3 = v1;
              v1 = v2;
              v2 = v3;
            }

            var firstX, firstY, lastX, lastY, firstXVal, firstYVal, lastXVal, lastYVal, sum = 0,
              diff;
            var ratio = this.scaling;

            if ( this.serie.isFlipped() ) {
              incrYFlip = 0;
              incrXFlip = 1;
            }

            for ( i = v1.dataIndex; i <= v2.dataIndex; i++ ) {

              init = i == v1.dataIndex ? v1.xBeforeIndexArr : 0;
              max = i == v2.dataIndex ? v2.xBeforeIndexArr : this.serie.data[ i ].length;
              k = 0;

              for ( j = init; j <= max; j += 2 ) {

                x = this.serie.getX( this.serie.data[ i ][ j + incrXFlip ] );
                y = this.serie.getY( this.serie.data[ i ][ j + incrYFlip ] );

                if ( this.serie.isFlipped() ) {
                  var x2 = x;
                  x = y;
                  y = x2;
                }

                if ( !firstX ) {
                  firstX = x;
                  firstY = y;
                  firstXVal = this.serie.data[ i ][ j + incrXFlip ];
                  firstYVal = this.serie.data[ i ][ j + incrYFlip ];
                }

                if ( lastX == undefined ) {
                  lastX = x;
                  lastY = y;

                  lastXVal = this.serie.data[ i ][ j + incrXFlip ];
                  lastYVal = this.serie.data[ i ][ j + incrYFlip ];

                  continue;
                }

                sum += ( this.serie.data[ i ][ j + incrXFlip ] - lastXVal ) * ( this.serie.data[ i ][ j + incrYFlip ] ) * 0.5;

                lastXVal = this.serie.data[ i ][ j + incrXFlip ];

                if ( x == lastX && y == lastY ) {
                  continue;
                }

                lastX = x;
                lastY = y;

                points.push( [ x, sum ] );
                k++;
              }

              this.lastX = x;
              this.lastY = y;

              if ( !firstX || !firstY || !this.lastX || !this.lastY ) {
                return;
              }

            }

            if ( sum == 0 ) {
              sum = 1; // Will look line a line anyway
            }

            var ratio;

            if ( !this.ratio ) {
              ratio = 150 / sum;
            } else {
              ratio = this.ratio;
            }

            for ( var i = 0, l = points.length; i < l; i++ ) {
              //   console.log( points[ i ][ 1 ] / sum );
              points[ i ][ 1 ] = baseLine - ( points[ i ][ 1 ] ) * ratio;

              if ( i == 0 ) {
                this.firstPointY = points[ i ][ 1 ];
              }
              currentLine += " L " + points[ i ][ incrXFlip ] + ", " + points[ i ][ incrYFlip ] + " ";

              this.lastPointY = points[ i ][ 1 ];
            }

            this.points = points;
            this.sum = sum;

            var lastY = firstY,
              lastX = this.lastX;

            var interX = firstX;
            diff = Math.min( 20, lastX - firstX );

            if ( this.serie.isFlipped() ) {
              currentLine = " M " + baseLine + ", " + firstX + " " + currentLine;
            } else {
              currentLine = " M " + firstX + ", " + baseLine + " " + currentLine;
            }

            this.setDom( 'd', currentLine );

            this.firstX = firstX;
            this.firstY = firstY;

            this.maxY = this.serie.getY( maxY );
            if ( this._selected ) {
              this.select();
            }
          }

          this.setLabelPosition( new GraphPosition( {
            x: ( pos1.x + pos2.x ) / 2,
            y: ( this.firstPointY + this.lastPointY ) / 2 + "px"
          } ) );

          this.updateLabels();

          this.changed();

          this.setHandles();

          return true;
        },

        getAxis: function() {
          return this._data.axis || 'x';
        },

        setScale: function( maxPx, integration ) {
          this.maxPx = maxPx;
          this.maxIntegration = integration;
        },

        setYBaseline: function( y ) {
          this.yBasline = y;
        },

        selectStyle: function() {
          this.setDom( 'stroke-width', '2px' );
        },

        selectHandles: function() {}, // Cancel areaundercurve

        setHandles: function() {

          if ( this.points == undefined ) {
            return;
          }

          this.addHandles();

          var posXY = this.calculatePosition( 0 ),
            posXY2 = this.calculatePosition( 1 );

          this.handles[ 1 ].setAttribute( 'x', posXY.x );
          this.handles[ 1 ].setAttribute( 'y', posXY.y );

          this.handles[ 2 ].setAttribute( 'x', posXY2.x );
          this.handles[ 2 ].setAttribute( 'y', posXY2.y );

        }

      } );

      return GraphNMRIntegral;
    } )( build[ "./jquery" ], build[ "./shapes/graph.shape.areaundercurve" ], build[ "./graph.position" ] );

    /* 
     * Build: new source file 
     * File name : shapes/graph.shape.rect
     * File path : /Users/normanpellet/Documents/Web/graph/src/shapes/graph.shape.rect.js
     */

    build[ './shapes/graph.shape.rect' ] = ( function( GraphShape, util ) {
      /** @global */
      /** @ignore */

      /** 
       * Represents a rectangle that extends the Shape class
       * @class RectangleShape
       * @augments Shape
       * @see Graph#newShape
       */
      function RectangleShape( graph, options ) {

      }

      RectangleShape.prototype = new GraphShape();

      /**
       * Creates the DOM
       * @memberof RectangleShape
       * @private
       * @return {Shape} The current shape
       */
      RectangleShape.prototype.createDom = function() {
        var self = this;
        this._dom = document.createElementNS( this.graph.ns, 'rect' );

        this.setStrokeColor( 'black' );
        this.setStrokeWidth( 1 );
        this.setFillColor( 'transparent' );

        return this;
      };

      /**
       * Creates the Handles
       * @memberof RectangleShape
       * @private
       * @return {Shape} The current shape
       */
      RectangleShape.prototype.createHandles = function() {
        if ( !this.hasHandles() ) {
          return;
        }

        /*
              this._data.handles = this._data.handles ||  {
                type: 'corners'
              };
        */
        var handles = this.getProp( 'handles' );

        if ( typeof handles != "object" ) {
          handles = {};
        }

        if ( !handles.type ) {
          handles.type = "corners";
        }

        switch ( handles.type ) {

          case 'sides':

            util.extend( handles, {
              sides: {
                top: true,
                bottom: true,
                left: true,
                right: true
              }
            } );

            var j = 0;
            for ( var i in handles.sides ) {
              if ( handles.sides[ i ] ) {
                j++;
              }
            }

            this._createHandles( j, 'g' ).map( function( g ) {

              var r = document.createElementNS( self.graph.ns, 'rect' );
              r.setAttribute( 'x', '-3' );
              r.setAttribute( 'width', '6' );
              r.setAttribute( 'y', '-6' );
              r.setAttribute( 'height', '12' );
              r.setAttribute( 'stroke', 'black' );
              r.setAttribute( 'fill', 'white' );
              r.setAttribute( 'cursor', 'pointer' );

              g.appendChild( r );

            } );

            var j = 1;

            for ( var i in handles.sides ) {
              if ( handles.sides[ i ] ) {
                this.handles[ i ] = this[ 'handle' + j ];
                this.sides[ j ] = i;
                j++;
              }
            }

            break;

          case 'corners':
            this._createHandles( 4, 'rect', {
              transform: "translate(-3 -3)",
              width: 6,
              height: 6,
              stroke: "black",
              fill: "white"
            } );

            if ( this.handles ) {
              this.handles[ 2 ].setAttribute( 'cursor', 'nesw-resize' );
              this.handles[ 4 ].setAttribute( 'cursor', 'nesw-resize' );

              this.handles[ 1 ].setAttribute( 'cursor', 'nwse-resize' );
              this.handles[ 3 ].setAttribute( 'cursor', 'nwse-resize' );
            }

            break;

        }
        return this;
      };

      /**
       * Updates the position
       * @memberof RectangleShape
       * @private
       * @return {Shape} The current shape
       */
      RectangleShape.prototype.applyPosition = function() {

        var pos = this.computePosition( 0 ),
          pos2 = this.computePosition( 1 ),
          x,
          y,
          width,
          height;

        if ( pos.x < pos2.x ) {
          x = pos.x;
          width = pos2.x - pos.x;
        } else {
          x = pos2.x;
          width = pos.x - pos2.x;
        }

        if ( pos.y < pos2.y ) {
          y = pos.y;
          height = pos2.y - pos.y;
        } else {
          y = pos2.y;
          height = pos.y - pos2.y;
        }

        this.currentX = x;
        this.currentY = y;
        this.currentW = width;
        this.currentH = height;

        if ( !isNaN( x ) && !isNaN( y ) && x !== false && y !== false ) {

          this.setDom( 'width', width );
          this.setDom( 'height', height );
          this.setDom( 'x', x );
          this.setDom( 'y', y );

          this.setHandles();
          this.updateMask();

          return true;
        }

        return false;
      };

      /**
       * Implements mouse move event
       * @memberof RectangleShape
       * @private
       * @return {Shape} The current shape
       */
      RectangleShape.prototype.handleMouseMoveImpl = function( e, deltaX, deltaY, deltaXPx, deltaYPx ) {

        var handles = this.getProp( 'handles' );

        if ( !this.moving && !this.handleSelected ) {
          return;
        }

        var pos = this.getPosition( 0 );
        var pos2 = this.getPosition( 1 );

        var invX = this.getXAxis().isFlipped(),
          invY = this.getYAxis().isFlipped(),
          posX = pos.x,
          posY = pos.y,
          pos2X = pos2.x,
          pos2Y = pos2.y;

        if ( this.moving ) {

          pos.deltaPosition( 'x', deltaX, this.getXAxis() );
          pos.deltaPosition( 'y', deltaY, this.getYAxis() );

          pos2.deltaPosition( 'x', deltaX, this.getXAxis() );
          pos2.deltaPosition( 'y', deltaY, this.getYAxis() );

        } else {

          switch ( handles.type ) {

            case 'sides':
              // Do nothing for now

              switch ( this.sides[ this.handleSelected ] ) {

                case 'left':
                  pos.deltaPosition( 'x', deltaX, this.getXAxis() );
                  break;

                case 'right':
                  pos2.deltaPosition( 'x', deltaX, this.getXAxis() );
                  break;

                case 'top':
                  pos.deltaPosition( 'y', deltaY, this.getYAxis() );
                  break;

                case 'bottom':
                  pos2.deltaPosition( 'y', deltaY, this.getYAxis() );
                  break;

              }

              break;

            case 'corners':
            default:

              if ( this.handleSelected == 1 ) {

                pos.deltaPosition( 'x', deltaX, this.getXAxis() );
                pos.deltaPosition( 'y', deltaY, this.getYAxis() );

              } else if ( this.handleSelected == 2 ) {

                pos2.deltaPosition( 'x', deltaX, this.getXAxis() );
                pos.deltaPosition( 'y', deltaY, this.getYAxis() );

              } else if ( this.handleSelected == 3 ) {

                pos2.deltaPosition( 'y', deltaY, this.getYAxis() );
                pos2.deltaPosition( 'x', deltaX, this.getXAxis() );

              } else if ( this.handleSelected == 4 ) {

                pos.deltaPosition( 'x', deltaX, this.getXAxis() );
                pos2.deltaPosition( 'y', deltaY, this.getYAxis() );

              }

              break;

          }
        }

        this.redraw();
        this.changed();
        this.setHandles();

        return true;

      };

      /**
       * Places handles properly
       * @memberof RectangleShape
       * @private
       * @return {Shape} The current shape
       */
      RectangleShape.prototype.setHandles = function() {

        if ( this.isLocked() || ( !this.isSelectable() && !this._staticHandles ) ) {
          return;
        }

        if ( !this.handlesInDom ) {
          return;
        }

        var pos = this.computePosition( 0 );
        var pos2 = this.computePosition( 1 );

        var handles = this.getProp( 'handles' );

        switch ( handles.type ) {

          case 'sides':

            if ( this.handles.left ) {
              this.handles.left.setAttribute( 'transform', 'translate(' + this.currentX + ' ' + ( this.currentY + this.currentH / 2 ) + ')' );
            }

            if ( this.handles.right ) {
              this.handles.right.setAttribute( 'transform', 'translate( ' + ( this.currentX + this.currentW ) + ' ' + ( this.currentY + this.currentH / 2 ) + ')' );
            }

            if ( this.handles.top ) {
              this.handles.top.setAttribute( 'transform', 'translate( ' + ( this.currentX + this.currentW / 2 ) + ' ' + this.currentY + ')' );
            }

            if ( this.handles.bottom ) {
              this.handles.bottom.setAttribute( 'transform', 'translate( ' + ( this.currentX + this.currentW / 2 ) + ' ' + ( this.currentY + this.currentH ) + ')' );
            }

            break;

          case 'corners':
          default:

            this.handles[ 1 ].setAttribute( 'x', pos.x );
            this.handles[ 1 ].setAttribute( 'y', pos.y );

            this.handles[ 2 ].setAttribute( 'x', pos2.x );
            this.handles[ 2 ].setAttribute( 'y', pos.y );

            this.handles[ 3 ].setAttribute( 'x', pos2.x );
            this.handles[ 3 ].setAttribute( 'y', pos2.y );

            this.handles[ 4 ].setAttribute( 'x', pos.x );
            this.handles[ 4 ].setAttribute( 'y', pos2.y );

            break;

        }

      };

      return RectangleShape;

    } )( build[ "./shapes/graph.shape" ], build[ "./graph.util" ] );

    /* 
     * Build: new source file 
     * File name : shapes/graph.shape.peakintegration2d
     * File path : /Users/normanpellet/Documents/Web/graph/src/shapes/graph.shape.peakintegration2d.js
     */

    build[ './shapes/graph.shape.peakintegration2d' ] = ( function( $, GraphRect ) {
      /** @global */
      /** @ignore */

      var lineHeight = 5;

      function GraphPeakIntegration2D( graph, options ) {
        this.nbHandles = 4;
      }

      $.extend( GraphPeakIntegration2D.prototype, GraphRect.prototype, {

        createDom: function() {

          this._dom = document.createElementNS( this.graph.ns, 'rect' );
          this._dom.element = this;

          this.createHandles( this.nbHandles, 'rect', {
            transform: "translate(-3 -3)",
            width: 6,
            height: 6,
            stroke: "black",
            fill: "white",
            cursor: 'nwse-resize'
          } );
        },

        redrawImpl: function() {

          this.setPosition();
          this.setHandles();
          this.setBindableToDom( this._dom );
        }

      } );

      return GraphPeakIntegration2D;

    } )( build[ "./jquery" ], build[ "./shapes/graph.shape.rect" ] );

    /* 
     * Build: new source file 
     * File name : shapes/graph.shape.peakinterval
     * File path : /Users/normanpellet/Documents/Web/graph/src/shapes/graph.shape.peakinterval.js
     */

    build[ './shapes/graph.shape.peakinterval' ] = ( function( $, GraphLine ) {
      /** @global */
      /** @ignore */

      "use strict";

      function GraphPeakInterval( graph ) {

      }

      $.extend( GraphPeakInterval.prototype, GraphLine.prototype, {
        createDom: function() {
          this._dom = document.createElementNS( this.graph.ns, 'line' );
          this._dom.setAttribute( 'marker-end', 'url(#verticalline' + this.graph._creation + ')' );
          this._dom.setAttribute( 'marker-start', 'url(#verticalline' + this.graph._creation + ')' );
        },

        setLabelPosition: function( labelIndex ) {
          var pos1 = this._getPosition( this.getFromData( 'pos' ) );
          var pos2 = this._getPosition( this.getFromData( 'pos2' ), this.getFromData( 'pos' ) );

          this._setLabelPosition( labelIndex, this._getPosition( this.get( 'labelPosition', labelIndex ), {
            x: ( pos1.x + pos2.x ) / 2 + "px",
            y: ( pos1.y + pos2.y ) / 2 + "px"
          } ) );

        },

        afterDone: function() {

        }
      } );

      return GraphPeakInterval;

    } )( build[ "./jquery" ], build[ "./shapes/graph.shape.line" ] );

    /* 
     * Build: new source file 
     * File name : shapes/graph.shape.peakinterval2
     * File path : /Users/normanpellet/Documents/Web/graph/src/shapes/graph.shape.peakinterval2.js
     */

    build[ './shapes/graph.shape.peakinterval2' ] = ( function( $, GraphLine ) {
      /** @global */
      /** @ignore */

      "use strict";
      var lineHeight = 5;

      function GraphPeakInterval2( graph, options ) {
        this.nbHandles = 2;

      }

      $.extend( GraphPeakInterval2.prototype, GraphLine.prototype, {

        createDom: function() {
          this._dom = document.createElementNS( this.graph.ns, 'line' );
          this.line1 = document.createElementNS( this.graph.ns, 'line' );
          this.line2 = document.createElementNS( this.graph.ns, 'line' );

          this.group.appendChild( this.line1 );
          this.group.appendChild( this.line2 );

          this.line1.setAttribute( 'stroke', 'black' );
          this.line2.setAttribute( 'stroke', 'black' );

          this.createHandles( this.nbHandles, 'rect', {
            transform: "translate(-3 -3)",
            width: 6,
            height: 6,
            stroke: "black",
            fill: "white",
            cursor: 'nwse-resize'
          } );

          this._dom.element = this;
        },

        redrawImpl: function() {

          this.setPosition();
          this.setPosition2();
          this.setHandles();

          this.redrawLines( lineHeight );

          this.setBindableToDom( this._dom );
        },

        redrawLines: function( height ) {

          var xs = this.findxs();

          var x1 = this._getPosition( {
            x: xs[ 0 ]
          } );
          var x2 = this._getPosition( {
            x: xs[ 1 ]
          } );

          if ( x1.x && x2.x && this.currentPos2y && this.currentPos1y ) {
            this.line1.setAttribute( 'x1', x1.x );
            this.line1.setAttribute( 'x2', x1.x );

            this.line2.setAttribute( 'x1', x2.x );
            this.line2.setAttribute( 'x2', x2.x );

            this.setLinesY( height );
          }

        },

        setLinesY: function( height ) {

          this.line1.setAttribute( 'y1', this.currentPos2y - height );
          this.line1.setAttribute( 'y2', this.currentPos2y + height );

          this.line2.setAttribute( 'y1', this.currentPos1y - height );
          this.line2.setAttribute( 'y2', this.currentPos1y + height );

        },

        findxs: function() {

          var posXY = this._getPosition( this.getFromData( 'pos' ) ),
            posXY2 = this._getPosition( this.getFromData( 'pos2' ), this.getFromData( 'pos' ) ),
            w = Math.abs( posXY.x - posXY2.x ),
            x = Math.min( posXY.x, posXY2.x );

          this.reversed = x == posXY2.x;

          if ( w < 2 || x + w < 0 || x > this.graph.getDrawingWidth() ) {
            return false;
          }

          var v1 = this.serie.searchClosestValue( this.getFromData( 'pos' ).x ),
            v2 = this.serie.searchClosestValue( this.getFromData( 'pos2' ).x ),
            v3,
            i,
            j,
            init,
            max,
            k,
            x,
            y,
            firstX,
            firstY,
            currentLine = "",
            maxY = 0,
            minY = Number.MAX_VALUE;

          if ( !v1 || !v2 ) {
            return false;
          }

          if ( v1.xBeforeIndex > v2.xBeforeIndex ) {
            v3 = v1;
            v1 = v2;
            v2 = v3;
          }

          var firstX, firstY, lastX, lastY, sum = 0,
            diff;
          var ratio = this.scaling;
          var points = [];
          var sums = [],
            xs = [];

          for ( i = v1.dataIndex; i <= v2.dataIndex; i++ ) {

            init = i == v1.dataIndex ? v1.xBeforeIndexArr : 0;
            max = i == v2.dataIndex ? v2.xBeforeIndexArr : this.serie.data[ i ].length;
            k = 0;

            for ( j = init; j <= max; j += 2 ) {

              x = this.serie.data[ i ][ j + 0 ];
              y = this.serie.data[ i ][ j + 1 ];

              if ( !firstX ) {
                firstX = x;
                firstY = y;
              }

              if ( lastX == undefined ) {
                lastX = x;
                lastY = y;
              }

              sum += Math.abs( ( x - lastX ) * ( y - lastY ) * 0.5 );
              sums.push( sum );
              xs.push( x );

              lastX = x;
              lastY = y;

              k++;
            }

            this.lastX = x;
            this.lastY = y;

            if ( !firstX || !firstY || !this.lastX || !this.lastY ) {
              return false;
            }
          }

          if ( sum == 0 ) {
            return [ firstX, lastX ];
          }

          var limInf = 0.05 * sum,
            limSup = 0.95 * sum,
            xinf = false,
            xsup = false;

          for ( var i = 0, l = sums.length; i < l; i++ ) {

            if ( sums[ i ] > limInf ) {
              xinf = i;
              break;
            }
          }

          for ( var i = sums.length; i > 0; i-- ) {

            if ( sums[ i ] < limSup ) {
              xsup = i;
              break;
            }
          }

          return [ xs[ xinf ], xs[ xsup ] ];
        },

        highlight: function() {

          if ( this.isBindable() ) {
            this._dom.setAttribute( 'stroke-width', '5' );
            this.setLinesY( lineHeight + 2 );
          }
        },

        unhighlight: function() {

          if ( this.isBindable() ) {
            this.setStrokeWidth();
            this.setLinesY( lineHeight );
          }
        }
      } );

      return GraphPeakInterval2;
    } )( build[ "./jquery" ], build[ "./shapes/graph.shape.line" ] );

    /* 
     * Build: new source file 
     * File name : shapes/graph.shape.rangex
     * File path : /Users/normanpellet/Documents/Web/graph/src/shapes/graph.shape.rangex.js
     */

    build[ './shapes/graph.shape.rangex' ] = ( function( GraphSurfaceUnderCurve ) {
      /** @global */
      /** @ignore */

      var GraphRangeX = function( graph ) {};
      $.extend( GraphRangeX.prototype, GraphSurfaceUnderCurve.prototype, {

        createDom: function() {
          this._dom = document.createElementNS( this.graph.ns, 'rect' );
          this._dom.setAttribute( 'class', 'rangeRect' );
          this._dom.setAttribute( 'cursor', 'move' );

          //this._dom.setAttribute( 'pointer-events', 'stroke' );

          var self = this;
          this.nbHandles = 2;
          this.createHandles( this.nbHandles, 'g', {
            'stroke-width': '3',
            'stroke': 'transparent',
            'pointer-events': 'stroke',
            'cursor': 'ew-resize'
          }, function( handle ) {
            self._makeHandle( handle );
          } );

          this.setDom( 'cursor', 'move' );
          this.doDraw = undefined;
        },

        setPosition: function() {

          var posXY = this._getPosition( this.getFromData( 'pos' ) ),
            posXY2 = this._getPosition( this.getFromData( 'pos2' ), this.getFromData( 'pos' ) ),
            w = Math.abs( posXY.x - posXY2.x ),
            x = Math.min( posXY.x, posXY2.x );

          this.reversed = x == posXY2.x;

          if ( w < 2 || x + w < 0 || x > this.graph.getDrawingWidth() ) {
            return false;
          }

          this.setDom( 'x', x );
          this.setDom( 'width', w );
          this.setDom( 'y', 0 );
          this.setDom( 'height', this.graph.getDrawingHeight() - this.graph.shift.bottom );

          this.setHandles( x, w );

          return true;
        },

        setHandles: function( x, w ) {
          /*         this.group.appendChild( this.handle1 );
      this.group.appendChild( this.handle2 );
*/

          var posXY = this._getPosition( this.getFromData( 'pos' ) ),
            posXY2 = this._getPosition( this.getFromData( 'pos2' ), this.getFromData( 'pos' ) ),
            w = Math.abs( posXY.x - posXY2.x ),
            x = Math.min( posXY.x, posXY2.x );

          this.handle1.setAttribute( 'transform', 'translate(' + ( x - 6 ) + " " + ( ( this.graph.getDrawingHeight() - this.graph.shift.bottom ) / 2 - 10 ) + ")" );
          this.handle2.setAttribute( 'transform', 'translate(' + ( x + w - 6 ) + " " + ( ( this.graph.getDrawingHeight() - this.graph.shift.bottom ) / 2 - 10 ) + ")" );

        },

        selectHandles: function() {}, // Cancel areaundercurve

        _makeHandle: function( rangeHandle ) {

          rangeHandle.setAttribute( 'id', "rangeHandle" + this.graph._creation );

          var r = document.createElementNS( this.graph.ns, 'rect' );
          r.setAttribute( 'rx', 0 );
          r.setAttribute( 'ry', 0 );
          r.setAttribute( 'stroke', 'black' );
          r.setAttribute( 'fill', 'white' );

          r.setAttribute( 'width', 10 );
          r.setAttribute( 'height', 20 );
          r.setAttribute( 'x', 0 );
          r.setAttribute( 'y', 0 );
          r.setAttribute( 'shape-rendering', 'crispEdges' );
          r.setAttribute( 'cursor', 'ew-resize' );
          rangeHandle.appendChild( r );

          var l = document.createElementNS( this.graph.ns, 'line' );
          l.setAttribute( 'x1', 4 );
          l.setAttribute( 'x2', 4 );
          l.setAttribute( 'y1', 4 );
          l.setAttribute( 'y2', 18 );
          l.setAttribute( 'stroke', 'black' );
          l.setAttribute( 'shape-rendering', 'crispEdges' );
          l.setAttribute( 'cursor', 'ew-resize' );
          rangeHandle.appendChild( l );

          var l = document.createElementNS( this.graph.ns, 'line' );
          l.setAttribute( 'x1', 6 );
          l.setAttribute( 'x2', 6 );
          l.setAttribute( 'y1', 4 );
          l.setAttribute( 'y2', 18 );
          l.setAttribute( 'stroke', 'black' );
          l.setAttribute( 'shape-rendering', 'crispEdges' );
          l.setAttribute( 'cursor', 'ew-resize' );
          rangeHandle.appendChild( l );

          return rangeHandle;
        }
      } );

      return GraphRangeX;
    } )( build[ "./shapes/graph.shape.areaundercurve" ] );

    /* 
     * Build: new source file 
     * File name : shapes/graph.shape.cross
     * File path : /Users/normanpellet/Documents/Web/graph/src/shapes/graph.shape.cross.js
     */

    build[ './shapes/graph.shape.cross' ] = ( function( $, GraphShape ) {
      /** @global */
      /** @ignore */

      function GraphCross( graph, options ) {
        this.nbHandles = 1;

      }

      $.extend( GraphCross.prototype, GraphShape.prototype, {

        getLength: function() {
          return this.options.length || 10;
        },

        createDom: function() {

          this._dom = document.createElementNS( this.graph.ns, 'path' );
          this._dom.setAttribute( 'd', 'M -' + ( this.getLength() / 2 ) + ' 0 h ' + ( this.getLength() ) + ' m -' + ( this.getLength() / 2 ) + ' -' + ( this.getLength() / 2 ) + ' v ' + ( this.getLength() ) + '' );

          this.createHandles( this.nbHandles, 'rect', {
            transform: "translate(-3 -3)",
            width: 6,
            height: 6,
            stroke: "black",
            fill: "white",
            cursor: 'nwse-resize'
          } );

        },

        setPosition: function() {
          var position = this._getPosition( this.getFromData( 'pos' ) );

          if ( !position.x || !position.y ) {
            return;
          }

          this.setDom( 'transform', 'translate( ' + position.x + ', ' + position.y + ')' );

          this.currentPos1x = position.x;
          this.currentPos1y = position.y;

          return true;
        },

        redrawImpl: function() {

          this.setPosition();
          this.setHandles();

        },

        handleCreateImpl: function() {

          return;
        },

        handleMouseDownImpl: function( e ) {

          this.moving = true;

          return true;
        },

        handleMouseUpImpl: function() {

          this.triggerChange();
          return true;
        },

        handleMouseMoveImpl: function( e, deltaX, deltaY, deltaXPx, deltaYPx ) {

          if ( this.isLocked() ) {
            return;
          }

          var pos = this.getFromData( 'pos' );

          if ( this.moving ) {

            pos.x = this.graph.deltaPosition( pos.x, deltaX, this.getXAxis() );
            pos.y = this.graph.deltaPosition( pos.y, deltaY, this.getYAxis() );
          }

          this.redrawImpl();

          return true;

        },

        setHandles: function() {

          if ( this.isLocked() ) {
            return;
          }

          if ( !this._selected || this.currentPos1x == undefined ) {
            return;
          }

          this.addHandles();

          this.handle1.setAttribute( 'x', this.currentPos1x );
          this.handle1.setAttribute( 'y', this.currentPos1y );
        },

        selectStyle: function() {
          this.setDom( 'stroke', 'red' );
          this.setDom( 'stroke-width', '2' );
        }

      } );

      return GraphCross;

    } )( build[ "./jquery" ], build[ "./shapes/graph.shape" ] );

    /* 
     * Build: new source file 
     * File name : shapes/graph.shape.zoom2d
     * File path : /Users/normanpellet/Documents/Web/graph/src/shapes/graph.shape.zoom2d.js
     */

    build[ './shapes/graph.shape.zoom2d' ] = ( function( $, GraphShape ) {
      /** @global */
      /** @ignore */

      function Zoom2DShape() {}

      $.extend( Zoom2DShape.prototype, GraphShape.prototype, {

        createDom: function() {
          this._dom = document.createElementNS( this.graph.ns, 'g' );

          var rect = document.createElementNS( this.graph.ns, 'rect' );
          rect.setAttribute( 'rx', 3 );
          rect.setAttribute( 'ry', 3 );

          rect.setAttribute( 'height', 100 );
          rect.setAttribute( 'width', 6 );
          rect.setAttribute( 'fill', 'rgb(150, 140, 180)' );
          rect.setAttribute( 'stroke', 'rgb( 40, 40, 40 )' );
          rect.setAttribute( 'stroke-width', '1px' );
          rect.setAttribute( 'x', 0 );
          rect.setAttribute( 'y', 0 );

          this.rect = rect;

          this._dom.appendChild( rect );

          var handlePos = document.createElementNS( this.graph.ns, 'rect' );

          handlePos.setAttribute( 'height', 5 );
          handlePos.setAttribute( 'width', 12 );
          handlePos.setAttribute( 'fill', 'rgb(190, 180, 220)' );
          handlePos.setAttribute( 'stroke', 'rgb( 40, 40, 40 )' );
          handlePos.setAttribute( 'stroke-width', '1px' );
          handlePos.setAttribute( 'x', -3 );
          handlePos.setAttribute( 'y', 0 );
          handlePos.setAttribute( 'class', 'positive' );
          handlePos.setAttribute( 'cursor', 'pointer' );

          var handleNeg = document.createElementNS( this.graph.ns, 'rect' );

          handleNeg.setAttribute( 'height', 5 );
          handleNeg.setAttribute( 'width', 12 );
          handleNeg.setAttribute( 'fill', 'rgb(190, 180, 220)' );
          handleNeg.setAttribute( 'stroke', 'rgb( 40, 40, 40 )' );
          handleNeg.setAttribute( 'stroke-width', '1px' );
          handleNeg.setAttribute( 'x', -3 );
          handleNeg.setAttribute( 'y', 0 );
          handleNeg.setAttribute( 'class', 'negative' );
          handleNeg.setAttribute( 'cursor', 'pointer' );

          this._dom.appendChild( handlePos );
          this._dom.appendChild( handleNeg );

          this.handlePos = handlePos;
          this.handleNeg = handleNeg;
        },

        setPosition: function() {
          var position = this._getPosition( this.getFromData( 'pos' ) );

          if ( !position || !position.x || !position.y ) {
            return;
          }

          this.setDom( 'transform', 'translate(' + position.x + ', ' + position.y + ')' );
          return true;
        },

        setHandleNeg: function( value, max ) {

          this.handleNeg.setAttribute( 'y', ( value ) * 45 + 55 )
        },

        setHandlePos: function( value, max ) {

          this.handlePos.setAttribute( 'y', ( 1 - value ) * 45 )
        },

        redrawImpl: function() {
          this.setPosition();
        },

        handleCreateImpl: function() {

          this.resize = true;
          this.handleSelected = 2;

        },

        handleMouseDownImpl: function( e ) {

          this.selected = e.target.getAttribute( 'class' ) == 'positive' ? 'positive' : ( e.target.getAttribute( 'class' ) == 'negative' ? 'negative' : false );
          return true;
        },

        handleMouseUpImpl: function() {

          this.selected = false;
          this.triggerChange();
          return true;
        },

        addSerie: function( serie ) {
          this.series.push( serie );
        },

        handleMouseMoveImpl: function( e ) {

          var o = $( this._dom ).offset();
          var cY = e.pageY - o.top;
          //console.log( this.selected );

          if ( this.selected == "negative" ) {

            if ( cY > 100 ) {
              cY = 100;
            } else if ( cY < 55 ) {
              cY = 55;
            }

            //this.handleNeg.setAttribute('y', cY);
            //console.log( cY);
            cY = -( cY - 55 ) / 45;

            this.series.map( function( s ) {
              s.onMouseWheel( false, false, cY, false );
            } );

          }

          if ( this.selected == "positive" ) {

            if ( cY < 0 ) {
              cY = 0;
            } else if ( cY > 45 ) {
              cY = 45;
            }

            // this.handlePos.setAttribute('y', cY);  
            cY = ( 45 - cY ) / 45;

            this.series.map( function( s ) {
              s.onMouseWheel( false, false, cY, true );
            } );

          }

        },

        selectStyle: function() {
          this.setDom( 'stroke', 'red' );
          this.setDom( 'stroke-width', '2' );
        },

        hideHandleNeg: function() {
          this.handleNeg.setAttribute( 'display', 'none' );
          this.rect.setAttribute( 'height', 45 );
        },

        showHandleNeg: function() {
          this.handleNeg.setAttribute( 'display', 'block' );
          this.rect.setAttribute( 'height', 100 );
        },

        setHandles: function() {}

      } );

      return Zoom2DShape;

    } )( build[ "./jquery" ], build[ "./shapes/graph.shape" ] );

    /* 
     * Build: new source file 
     * File name : shapes/graph.shape.peakboundariescenter
     * File path : /Users/normanpellet/Documents/Web/graph/src/shapes/graph.shape.peakboundariescenter.js
     */

    build[ './shapes/graph.shape.peakboundariescenter' ] = ( function( GraphLine ) {
      /** @global */
      /** @ignore */

      /** 
       * Arrow shape
       * @class ArrowShape
       * @static
       */
      function PeakBoundariesMiddleShape( graph ) {
        this.lineHeight = 6;
      }

      PeakBoundariesMiddleShape.prototype = new GraphLine();

      PeakBoundariesMiddleShape.prototype.createDom = function() {

        this._dom = document.createElementNS( this.graph.ns, 'line' );
        this.line1 = document.createElementNS( this.graph.ns, 'line' );
        this.line2 = document.createElementNS( this.graph.ns, 'line' );
        this.line3 = document.createElementNS( this.graph.ns, 'line' );

        this.rectBoundary = document.createElementNS( this.graph.ns, 'path' );

        this.rectBoundary.setAttribute( 'fill', 'transparent' );
        this.rectBoundary.setAttribute( 'stroke', 'none' );
        this.rectBoundary.setAttribute( 'pointer-events', 'fill' );

        this.rectBoundary.jsGraphIsShape = true;

        this.group.appendChild( this.rectBoundary );
        this.group.appendChild( this.line1 );
        this.group.appendChild( this.line2 );
        this.group.appendChild( this.line3 );
        this._dom.element = this;
      };

      PeakBoundariesMiddleShape.prototype.createHandles = function() {
        this._createHandles( 3, 'rect', {
          transform: "translate(-3 -3)",
          width: 6,
          height: 6,
          stroke: "black",
          fill: "white",
          cursor: 'nwse-resize'
        } );
      };

      PeakBoundariesMiddleShape.prototype.redrawImpl = function() {

        this.line1.setAttribute( 'stroke', this.getStrokeColor() );
        this.line2.setAttribute( 'stroke', this.getStrokeColor() );
        this.line3.setAttribute( 'stroke', this.getStrokeColor() );

        this.line1.setAttribute( 'stroke-width', this.getStrokeWidth() );
        this.line2.setAttribute( 'stroke-width', this.getStrokeWidth() );
        this.line3.setAttribute( 'stroke-width', this.getStrokeWidth() );

        this.setHandles();
        this.redrawLines();
      };

      PeakBoundariesMiddleShape.prototype.redrawLines = function() {

        var posLeft = this.computePosition( 0 );
        var posRight = this.computePosition( 1 );
        var posCenter = this.computePosition( 2 );

        if ( posLeft.x && posRight.x && posCenter.x && this.posYPx ) {

          var height = this.lineHeight;
          this.rectBoundary.setAttribute( 'd', 'M ' + posLeft.x + ' ' + ( this.posYPx - height ) + ' v ' + ( 2 * height ) + ' H ' + posRight.x + " v " + ( -2 * height ) + "z" );
          this.line1.setAttribute( 'x1', posLeft.x );
          this.line1.setAttribute( 'x2', posLeft.x );

          this.line2.setAttribute( 'x1', posRight.x );
          this.line2.setAttribute( 'x2', posRight.x );

          this.line3.setAttribute( 'x1', posCenter.x );
          this.line3.setAttribute( 'x2', posCenter.x );

          this._dom.setAttribute( 'x1', posLeft.x );
          this._dom.setAttribute( 'x2', posRight.x );

          this.setLinesY( height );
        }

      };

      PeakBoundariesMiddleShape.prototype.setLinesY = function() {

        if ( !this.posYPx ) {
          return;
        }

        var height = this.lineHeight;

        this.line1.setAttribute( 'y1', this.posYPx - height );
        this.line1.setAttribute( 'y2', this.posYPx + height );

        this.line2.setAttribute( 'y1', this.posYPx - height );
        this.line2.setAttribute( 'y2', this.posYPx + height );

        this.line3.setAttribute( 'y1', this.posYPx - height );
        this.line3.setAttribute( 'y2', this.posYPx + height );

        this._dom.setAttribute( 'y1', this.posYPx );
        this._dom.setAttribute( 'y2', this.posYPx );

      };

      PeakBoundariesMiddleShape.prototype.setHandles = function() {

        if ( !this.posYPx ) {
          return;
        }

        var posLeft = this.computePosition( 0 );
        var posRight = this.computePosition( 1 );
        var posCenter = this.computePosition( 2 );

        if ( posLeft.x && posRight.x && posCenter.x ) {

          this.handles[ 1 ].setAttribute( 'x', posLeft.x );
          this.handles[ 1 ].setAttribute( 'y', this.posYPx );

          this.handles[ 2 ].setAttribute( 'x', posRight.x );
          this.handles[ 2 ].setAttribute( 'y', this.posYPx );

          this.handles[ 3 ].setAttribute( 'x', posCenter.x );
          this.handles[ 3 ].setAttribute( 'y', this.posYPx );
        }
      };

      PeakBoundariesMiddleShape.prototype.setY = function( y ) {
        this.posYPx = y;
      };

      PeakBoundariesMiddleShape.prototype.setLineHeight = function( height ) {
        this.lineHeihgt = height;
      };

      PeakBoundariesMiddleShape.prototype.handleMouseMoveImpl = function( e, deltaX, deltaY ) {

        if ( this.isLocked() ) {
          return;
        }

        var posLeft = this.getPosition( 0 );
        var posRight = this.getPosition( 1 );
        var posCenter = this.getPosition( 2 );

        switch ( this.handleSelected ) {

          case 1: // left
            posLeft.deltaPosition( 'x', deltaX, this.getXAxis() );

            if ( Math.abs( posCenter.x - posRight.x ) > Math.abs( posRight.x - posLeft.x ) || Math.abs( posCenter.x - posLeft.x ) > Math.abs( posRight.x - posLeft.x ) ) {
              posCenter.x = posLeft.x + ( posRight.x - posLeft.x ) * 0.1;
            }
            break;

          case 2: // left

            posRight.deltaPosition( 'x', deltaX, this.getXAxis() );

            if ( Math.abs( posCenter.x - posRight.x ) > Math.abs( posRight.x - posLeft.x ) || Math.abs( posCenter.x - posLeft.x ) > Math.abs( posRight.x - posLeft.x ) ) {
              posCenter.x = posRight.x + ( posLeft.x - posRight.x ) * 0.1;
            }

            break;

          case 3: // left

            posCenter.deltaPosition( 'x', deltaX, this.getXAxis() );

            if ( Math.abs( posCenter.x - posRight.x ) > Math.abs( posRight.x - posLeft.x ) || Math.abs( posCenter.x - posLeft.x ) > Math.abs( posRight.x - posLeft.x ) ) {
              return;
            } else {

            }

            break;

        }

        this.setLabelPosition( {
          y: this.getLabelPosition( 0 ).y,
          x: posCenter.x
        } );

        this.updateLabels();
        this.redrawLines();
        this.setHandles();
      };

      PeakBoundariesMiddleShape.prototype.applyPosition = function() {
        return true;
      };

      return PeakBoundariesMiddleShape;
    } )( build[ "./shapes/graph.shape.line" ] );

    /* 
     * Build: new source file 
     * File name : graph.toolbar
     * File path : /Users/normanpellet/Documents/Web/graph/src/graph.toolbar.js
     */

    build[ './graph.toolbar' ] = ( function() {
      /** @global */
      /** @ignore */

      var toolbarDefaults = {

        buttons: [ 'none', 'rect', 'line', 'areaundercurve' ]

      };

      var ns = 'http://www.w3.org/2000/svg';
      var nsxlink = "http://www.w3.org/1999/xlink";

      function makeSvg() {
        var dom = document.createElementNS( ns, 'svg' );
        dom.setAttributeNS( "http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink" );
        dom.setAttribute( 'xmlns', ns );

        return dom;
      }

      function makeSvgLine() {

        var dom = makeSvg();

        var line = document.createElementNS( ns, 'line' );
        line.setAttribute( 'x1', 16 );
        line.setAttribute( 'y1', 3 );
        line.setAttribute( 'x2', 4 );
        line.setAttribute( 'y2', 15 );

        line.setAttribute( 'stroke', '#aa0000' );

        dom.appendChild( line );
        return dom;
      }

      function makeSvgRect() {

        var dom = makeSvg();
        var line = document.createElementNS( ns, 'rect' );
        line.setAttribute( 'x', 4 );
        line.setAttribute( 'y', 4 );
        line.setAttribute( 'width', 12 );
        line.setAttribute( 'height', 12 );
        line.setAttribute( 'stroke', 'black' );
        line.setAttribute( 'fill', '#dd0000' );

        dom.appendChild( line );
        return dom;
      }

      function makeSvgAUC() {

        var pathD = "M 4,18 C 8,10 14,1 18,18";

        var dom = makeSvg();
        var path1 = document.createElementNS( ns, 'path' );
        path1.setAttribute( 'd', pathD );
        path1.setAttribute( 'stroke', "black" );
        path1.setAttribute( 'fill', "transparent" );

        var path2 = document.createElementNS( ns, 'path' );
        path2.setAttribute( 'd', pathD + " Z" );
        path2.setAttribute( 'stroke', "red" );
        path2.setAttribute( 'fill', "rgba(255, 0, 0, 0.1)" );

        dom.appendChild( path2 );
        dom.appendChild( path1 );

        return dom;

      }

      var Toolbar = function( graph, options ) {

        var self = this;

        this.options = $.extend( true, {}, toolbarDefaults, options );
        this.graph = graph;
        this.div = $( "<ul />" ).addClass( 'graph-toolbar' );

        this.graph.getPlugin( './graph.plugin.shape' ).then( function( plugin ) {

          self.plugin = plugin;

          if ( !self.plugin ) {
            return;
          }

          self.div.on( 'click', 'li', function() {

            var shape = $( this ).attr( 'data-shape' );
            self.plugin.setShape( shape );

            $( this ).parent().children().removeClass( 'selected' );
            $( this ).addClass( 'selected' );
          } );

          self.makeButtons();
        } );
      };

      Toolbar.prototype = {

        makeButtons: function() {

          var self = this;
          for ( var i = 0, l = this.options.buttons.length; i < l; i++ ) {

            this.div.append( this.makeButton( this.options.buttons[ i ] ) );
          }
        },

        makeButton: function( button ) {

          var div = $( "<li />" );
          switch ( button ) {

            case 'line':
              div
                .html( makeSvgLine() )
                .attr( 'data-shape', 'line' );
              break;

            case 'rect':
              div
                .html( makeSvgRect() )
                .attr( 'data-shape', 'rect' );
              break;

            case 'areaundercurve':
              div
                .html( makeSvgAUC() )
                .attr( 'data-shape', 'areaundercurve' );
              break;
          }

          return div;
        },

        getDom: function() {
          return this.div;
        }

      };

      return Toolbar;

    } )();

    /* 
     * Build: new source file 
     * File name : graph
     * File path : /Users/normanpellet/Documents/Web/graph/src/graph.js
     */

    return ( function( Graph,

      GraphPosition,

      GraphAxis,
      GraphXAxis,
      GraphYAxis,
      GraphXAxisBroken,
      GraphYAxisBroken,
      GraphXAxisTime,
      GraphLegend,

      GraphPlugin,
      GraphPluginDrag,
      GraphPluginShape,
      GraphPluginSelectScatter,
      GraphPluginZoom,
      GraphPluginTimeSerieManager,

      GraphSerie,
      GraphSerieContour,
      GraphSerieLine,
      GraphSerieLineBroken,
      GraphSerieLineColor,
      GraphSerieScatter,
      GraphSerieZone,

      GraphShape,
      GraphShapeAreaUnderCurve,
      GraphShapeArrow,
      GraphShapeEllipse,
      GraphShapeLabel,
      GraphShapeLine,
      GraphShapeNMRIntegral,
      GraphShapePeakIntegration2D,
      GraphShapePeakInterval,
      GraphShapePeakInterval2,
      GraphShapeRangeX,
      GraphShapeRect,
      GraphShapeCross,
      GraphShapeZoom2D,
      GraphShapePeakBoundariesCenter,

      GraphToolbar

    ) {
      /** @global */
      /** @ignore */

      // Corrent naming is important here !

      Graph.registerConstructor( "graph.position", GraphPosition );

      Graph.registerConstructor( "graph.axis.x", GraphXAxis );
      Graph.registerConstructor( "graph.axis.y", GraphYAxis );
      Graph.registerConstructor( "graph.axis.x.broken", GraphXAxisBroken );
      Graph.registerConstructor( "graph.axis.y.broken", GraphYAxisBroken );
      Graph.registerConstructor( "graph.axis.x.time", GraphXAxisTime );

      Graph.registerConstructor( "graph.serie.line", GraphSerieLine );
      Graph.registerConstructor( "graph.serie.line.color", GraphSerieLineColor );
      Graph.registerConstructor( "graph.serie.contour", GraphSerieContour );
      Graph.registerConstructor( "graph.serie.line.broken", GraphSerieLineBroken );
      Graph.registerConstructor( "graph.serie.scatter", GraphSerieScatter );
      Graph.registerConstructor( "graph.serie.zone", GraphSerieZone );

      Graph.registerConstructor( "graph.plugin.shape", GraphPluginShape );
      Graph.registerConstructor( "graph.plugin.drag", GraphPluginDrag );
      Graph.registerConstructor( "graph.plugin.zoom", GraphPluginZoom );
      Graph.registerConstructor( "graph.plugin.selectScatter", GraphPluginSelectScatter );
      Graph.registerConstructor( "graph.plugin.timeSerieManager", GraphPluginTimeSerieManager );

      Graph.registerConstructor( "graph.shape", GraphShape );
      Graph.registerConstructor( "graph.shape.areaundercurve", GraphShapeAreaUnderCurve );
      Graph.registerConstructor( "graph.shape.arrow", GraphShapeArrow );
      Graph.registerConstructor( "graph.shape.ellipse", GraphShapeEllipse );
      Graph.registerConstructor( "graph.shape.label", GraphShapeLabel );
      Graph.registerConstructor( "graph.shape.line", GraphShapeLine );
      Graph.registerConstructor( "graph.shape.nmrintegral", GraphShapeNMRIntegral );
      Graph.registerConstructor( "graph.shape.peakintegration2d", GraphShapePeakIntegration2D );
      Graph.registerConstructor( "graph.shape.peakinterval", GraphShapePeakInterval );
      Graph.registerConstructor( "graph.shape.peakinterval2", GraphShapePeakInterval2 );
      Graph.registerConstructor( "graph.shape.rangex", GraphShapeRangeX );
      Graph.registerConstructor( "graph.shape.rect", GraphShapeRect );
      Graph.registerConstructor( "graph.shape.rectangle", GraphShapeRect );
      Graph.registerConstructor( "graph.shape.cross", GraphShapeCross );
      Graph.registerConstructor( "graph.shape.zoom2d", GraphShapeZoom2D );
      Graph.registerConstructor( "graph.shape.peakboundariescenter", GraphShapePeakBoundariesCenter );

      Graph.registerConstructor( "graph.toolbar", GraphToolbar );
      Graph.registerConstructor( "graph.legend", GraphLegend );

      return Graph;

    } )( build[ "./graph.core" ], build[ "./graph.position" ], build[ "./graph.axis" ], build[ "./graph.axis.x" ], build[ "./graph.axis.y" ], build[ "./graph.axis.x.broken" ], build[ "./graph.axis.y.broken" ], build[ "./graph.axis.x.time" ], build[ "./graph.legend" ], build[ "./plugins/graph.plugin" ], build[ "./plugins/graph.plugin.drag" ], build[ "./plugins/graph.plugin.shape" ], build[ "./plugins/graph.plugin.selectScatter" ], build[ "./plugins/graph.plugin.zoom" ], build[ "./plugins/graph.plugin.timeseriemanager" ], build[ "./series/graph.serie" ], build[ "./series/graph.serie.contour" ], build[ "./series/graph.serie.line" ], build[ "./series/graph.serie.line.broken" ], build[ "./series/graph.serie.line.colored" ], build[ "./series/graph.serie.scatter" ], build[ "./series/graph.serie.zone" ], build[ "./shapes/graph.shape" ], build[ "./shapes/graph.shape.areaundercurve" ], build[ "./shapes/graph.shape.arrow" ], build[ "./shapes/graph.shape.ellipse" ], build[ "./shapes/graph.shape.label" ], build[ "./shapes/graph.shape.line" ], build[ "./shapes/graph.shape.nmrintegral" ], build[ "./shapes/graph.shape.peakintegration2d" ], build[ "./shapes/graph.shape.peakinterval" ], build[ "./shapes/graph.shape.peakinterval2" ], build[ "./shapes/graph.shape.rangex" ], build[ "./shapes/graph.shape.rect" ], build[ "./shapes/graph.shape.cross" ], build[ "./shapes/graph.shape.zoom2d" ], build[ "./shapes/graph.shape.peakboundariescenter" ], build[ "./graph.toolbar" ] );

  };

  if ( typeof define === "function" && define.amd ) {
    define( [ 'jquery' ], function( $ ) {
      return Graph( $ );
    } );
  } else if ( window ) {

    if ( !window.jQuery ) {
      throw "jQuery has not been loaded. Abort graph initialization."
      return;
    }

    window.Graph = Graph( window.jQuery );
  }

} ) );