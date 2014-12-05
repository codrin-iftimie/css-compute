require("./css");

/** @jsx React.DOM */
var React = require("react/addons");
var classSet = React.addons.classSet;
var Perf = React.addons.Perf;

var PerfMixin = {
  componentDidMount: function(){
  },
  componentDidUpdate: function(){
  }
}


var hook = function(React){
  var createClass = React.createClass;
  React.createClass = function(reactClass){
    var mixins = reactClass.mixins || [];
    reactClass.mixins = mixins;
    return createClass(reactClass);
  }
};

hook(React);

var ChildComp = React.createClass({
  getInitialState: function(){
    return {
      test: false
    }
  },
	render: function(){
		var className = classSet({
      "child-comp": true,
      "extra-class": this.state.test
    });
    return(
			<div className={className}>
        lsssss
      </div>
		);
	}
});
var App = React.createClass({
  mixins: [PerfMixin],
  getInitialState: function(){
    return{
      globalTest: false
    }
  },
  _handleButtonClick: function(){
    this.refs['first-child-comp'].setState({
      test: true
    });
    this.setState({
      globalTest: !this.state.globalTest
    })
  },
	render: function(){
		var className = classSet({
			"grandmother": true,
      "extra-class": this.state.globalTest
		});
		return(
			<div className={className}>
				grandmother
				<div className="mother">
					mother
					<span className="daughter">
						something
						<ChildComp  ref="first-child-comp"/>
            <span className="some-other-com">mother of god</span>
					</span>
          <ChildComp />
				</div>
        <ChildComp />
        <div className="some-other-com">god of the arena</div>
        <button onClick={this._handleButtonClick}>I will change something</button>
			</div>
		)
	}
});
var comp3 = React.render(
	<App/>,
	document.getElementById("test")
);
