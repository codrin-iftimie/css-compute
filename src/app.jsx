/** @jsx React.DOM */
var React = require("react/addons");
var ComputeCSS = require("./resolveStyle.js");
var CSS = require('../styles/main.css.js');
var allDeclarations = CSS.allDeclarations;
var allInharitances = CSS.allInharitances;
var classSet = React.addons.classSet;
var ReactOwner = require('react/lib/ReactOwner');

var ComputeMixin = {
  getInitialState: function(){
    return {
      force: false
    }
  },
  componentDidMount: function(){
  },
  componentDidUpdate: function(){
    if(this._owner){
      this._owner.updateStyle();
    }
  }
}

var hook = function(React){
  var createClass = React.createClass;
  React.createClass = function(reactClass){
    var mixins = reactClass.mixins || [];
    mixins.push(ComputeMixin);
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
	_getStyle: function(css){
		// return;
		return ComputeCSS(css, allDeclarations, allInharitances);
	},
	 _getClassName: function(node, parent){

    if(!node.tagName){
    	this._subRender(node, parent);
    	return;
    }

    if(parent){
    	var existingClasses = parent.props.parentClassName;
    	var allClasses = [];
    	for (var i = 0; i < existingClasses.length; i++) {
    		allClasses.push(existingClasses[i])
    	};
	    allClasses.push('.' + node.props.className);
	    node.props.parentClassName = allClasses;
    } else {
    	//root node
    	node.props.parentClassName = ['.' + node.props.className];
    }
    node.props.style = this._getStyle(node.props.parentClassName);
  },
  _getFirstChild: function(node, startFrom){
    startFrom = startFrom || 0;
    var kids = node.props.children;
    
    if(kids && typeof kids !== 'string' && kids.render){
      this._subRender(kids, node);
    }
 
 
    if(!kids || startFrom === kids.length) {
      return ;
    }

    for (var i = startFrom; i < kids.length; i++) {
      var kid = kids[i];
      if(typeof kid === 'object'){
        return [i, kid];
      }
    };
  },
  _walkTheDom: function(node, parent){
    var parNode = node;
    this._getClassName(node, parent);
    var lastChild = 0;
    var firstNode = this._getFirstChild(node);
    if(firstNode){
      lastChild = firstNode[0] + 1;
      node = firstNode[1];
    } else {
      node = null;
    }
    while(node){
      if(node.props.ref){
        node._owner = this;
        node._pendingOwner = this;
      }
      this._walkTheDom(node, parNode);
      var nextNode = this._getFirstChild(parNode, lastChild);
      if(nextNode){
        node = nextNode[1];
        lastChild = nextNode[0] + 1;
      } else {
        node = null;
      }
    }
  },
  _subRender: function(comp, parent){
    if(comp.getInitialState){
      comp.state = comp.getInitialState();
    }
    var orignalRender = comp._render || comp.render;
    var render = comp._render ? comp._render() : comp.render();
    this._walkTheDom(render, parent);
    comp._render = orignalRender;
    comp.render = function(){ return render };
  },
  updateStyle: function(){
    this._subRender(this, null);
    this.forceUpdate();
  },
  componentDidMount: function(){
    this.updateStyle();
	},
  _handleButtonClick: function(){
    this.refs['first-child-comp'].setState({
      test: true
    });
  },
	render: function(){
		var className = classSet({
			"grandmother": true
		});
		return(
			<div className={className}>
				grandmother
				<div className="mother">
					mother
					<div className="daughter">
						something
						<ChildComp  ref="first-child-comp"/>
					</div>
          <ChildComp />
				</div>
        <ChildComp />
        <button onClick={this._handleButtonClick}>I will change something</button>
			</div>
		)
	}
});
var comp3 = React.renderComponent(
	<App/>,
	document.getElementById("test")
);
