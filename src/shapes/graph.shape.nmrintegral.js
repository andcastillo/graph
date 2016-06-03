define( [ './graph.shape.areaundercurve', '../graph.position' ], function( GraphSurfaceUnderCurve, GraphPosition ) {

  "use strict";

  var GraphNMRIntegral = function( graph, options ) {
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

      if ( !posXY ||  !posXY2 ) {
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

        if ( sum == 0 )  {
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
      return this._data.axis ||  'x';
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
} );