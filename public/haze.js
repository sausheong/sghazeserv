// Copyright (c) 2015 Chang Sau Sheong
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var Reading = React.createClass({
  loadFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({
          data: data
        });
      }.bind(this),
        error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {
      data: {
            	"last_updated": "Retrieving data...",
            	"readings":{
            		"overall":0,
            		"north":0, 
            		"south":0, 
            		"east":0, 
            		"west":0, 
            		"center":0
            	},
            	"descriptors":{
            		"overall":"Retrieving ...",
            		"north":"Retrieving ...", 
            		"south":"Retrieving ...", 
            		"east":"Retrieving ...", 
            		"west":"Retrieving ...", 
            		"center":"Retrieving ..."
            	}
            }
    };
  },
  componentDidMount: function() {
    this.loadFromServer();
    setInterval(this.loadFromServer, this.props.pollInterval);
  },
  render: function() {
    return ( 
      <div className="reading">
        <PSI data={ this.state.data }/>
        <Map data={ this.state.data }/>
      </div>
    );
  }
});

var PSI = React.createClass({
  render: function() {
    return (
        <div className="psi-container">
            <div className="psi">
                { this.props.data.readings.overall }
                <div className="date">{ this.props.data.last_updated }</div>
            </div>
        </div>
   );
  }
});

var Map = React.createClass({
  getInitialState: function() {
    return {
      states: [
        {
            "type": "Feature",
            "properties": {"region": "West"},
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                [103.608, 1.218],
                [103.632, 1.352],
                [103.665, 1.406],
                [103.726, 1.374],
                [103.754, 1.299],
                [103.675, 1.226],
                [103.608, 1.218]
                ]]
            }
        },
        {
            "type": "Feature",
            "properties": {"region": "North"},
            "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [103.665, 1.406],
                [103.724, 1.451],
                [103.760, 1.440],
                [103.814, 1.471],
                [103.910, 1.422],
                [103.908, 1.384],
                [103.726, 1.374],
                [103.665, 1.406]
            ]]
            }
        },
        {
            "type": "Feature",
            "properties": {"region": "East"},
            "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [103.910, 1.422],
                [103.951, 1.384],
                [103.986, 1.394],
                [104.049, 1.346],
                [104.011, 1.308],
                [103.913, 1.299],
                [103.908, 1.384],
                [103.910, 1.422]
            ]]
            }
        },
        {
            "type": "Feature",
            "properties": {"region": "Center"},
            "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [103.726, 1.374],
                [103.908, 1.384],
                [103.913, 1.299],
                [103.754, 1.299],
                [103.726, 1.374]
            ]]
            }
        }, 
        {
            "type": "Feature",
            "properties": {"region": "South"},
            "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [103.754, 1.299],
                [103.913, 1.299],
                [103.832, 1.231],
                [103.754, 1.299]
            ]]
            }
        }
      ],
      map: null,
      north: new L.Label(),
      east: new L.Label(),
      south: new L.Label(),
      west: new L.Label(),
      center: new L.Label()
    }
  },

  componentDidMount: function() {
    var map = L.map('map').setView([1.346, 103.83], 12);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info legend');
      div.innerHTML = "<div>" +
        "<div class='good'>Good: 0 - 50</div>" +
        "<div class='moderate'>Moderate: 51 - 100</div>" +
        "<div class='unhealthy'>Unhealthy: 101 - 200</div>" +
        "<div class='very-unhealthy'>Very unhealthy: 200 - 300</div>" +
        "<div class='hazardous'>Hazardous: above 300</div>";


      return div;
    };
    legend.addTo(map);
    this.setState({map: map});
  },

  _getColor: function( reading ) {
    var color;
    switch(true) {
        case (reading <= 50):
            color = "#4CAF50";
            break;
        case (reading <= 100):
            color = "#2196F3";
            break;
        case (reading <= 200):
            color = "#FFEB3B";
            break;
        case (reading <= 300):
            color = "#FFC107";
            break;
        default:
            color = "#F44336";
            break;
    }
    return color;
  },

  render: function(){
    if (this.state.map != null) {
        var that = this;
        L.geoJson(this.state.states, {
        style: function(feature) {
          var region = feature.properties.region.toLowerCase();
          return {
            color: that._getColor(that.props.data.readings[region]),
            weight: 2,
            opacity: 1,
            dashArray: '3',
            fillOpacity: 0.2
          }
        },
        onEachFeature: function (feature, layer) {
          var region = feature.properties.region.toLowerCase();
          that.state[region].setContent("<div class='psi'>" + that.props.data.readings[region] + "</div>");
          that.state[region].setLatLng(layer.getBounds().getCenter());
          if (that.state.map != null)
              that.state.map.showLabel(that.state[region]);
        }
      }).addTo(this.state.map);
    }
      return (
          <div>
            <div id="map">
            </div>
          </div>
      );
    }
});

var Region = React.createClass({
  render: function() {
    return (
      <div className={ this.props.alignment }>
        { this.props.reading }
        <div className="descriptor">{ this.props.descriptor }</div>
      </div>
    );
  }
});

React.render(
  <Reading url="/psi/region/all" pollInterval={10000000} />, document.getElementById('content')
);
