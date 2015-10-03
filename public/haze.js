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
        <PSI data={ this.state.data.readings }/>
        <Map data={ this.state.data.readings }/>
      </div>
    );
  }
});

var PSI = React.createClass({
  render: function() {
    var psi = this.props.data.overall;
   return (
      <div className="psi">     
         { psi }
      </div>
   ); 
  }  
});

var Map = React.createClass({
  render: function(){
      return (
        <div className="map">
          <div className="row">
            <div className="col-left">&nbsp;</div>
            <div className="col-center">{ this.props.data.north }</div>
            <div className="col-right">&nbsp;</div>
          </div>
          <div className="row">
            <div className="col-left">{ this.props.data.west }</div>
            <div className="col-center">{ this.props.data.center }</div>
            <div className="col-right">{ this.props.data.east }</div>
          </div>
          <div className="row">
            <div className="col-left">&nbsp;</div>
            <div className="col-center">{ this.props.data.south }</div>
            <div className="col-right">&nbsp;</div>
          </div>        
        </div>
      );
    }
});

React.render(
  <Reading url="/psi/region/all" pollInterval={1000} />, document.getElementById('content')
);