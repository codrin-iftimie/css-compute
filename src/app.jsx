var ReactCompositeComponentBase = require('react/lib/ReactCompositeComponent').Base
var mountComponent = ReactCompositeComponentBase.prototype.mountComponent;
ReactCompositeComponentBase.prototype.mountComponent = function(){
  if(this._descriptor.props._parent){
    arguments[1].parent = this._descriptor.props._parent
  }
  return mountComponent.apply(this, arguments);
}

var updateComponent = ReactCompositeComponentBase.prototype.updateComponent;
ReactCompositeComponentBase.prototype.updateComponent = function(){
  this.cssUpdate = true;
  console.log(arguments)
  return updateComponent.apply(this, arguments);
  this.cssUpdate = true;
}


var ReactMultiChild = require('react/lib/ReactMultiChild');

var mountChildren = ReactMultiChild.Mixin.mountChildren;

var CssHelper = {
  _getStyle: function(css){
    // return;
    return ComputeCSS(css, allDeclarations, allInharitances);
  },
  _getClassName: function(node, parent){
    var stop = false;
    if(parent){
      if(!node.tagName && !node.cssUpdate){
        node.props._parent = parent;
        return;
      }
      var existingClasses = parent.props.parentClassName;
      var allClasses = [];
      for (var i = 0; i < existingClasses.length; i++) {
        allClasses.push(existingClasses[i])
      };
      if(node.props.className){
        allClasses.push('.' + node.props.className);
      } else {
        allClasses.push(node.tagName);
      }
      node.props.parentClassName = allClasses;
    } else {
      //root node
      node.props.parentClassName = ['.' + node.props.className];
    }
    node.props.style = CssHelper._getStyle(node.props.parentClassName);
  },
  _getFirstChild: function(node, startFrom){
    startFrom = startFrom || 0;
    var kids = node.props.children;
 
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
    CssHelper._getClassName(node, parent);
    var lastChild = 0;
    var firstNode = CssHelper._getFirstChild(node);
    if(firstNode){
      lastChild = firstNode[0] + 1;
      node = firstNode[1];
    } else {
      node = null;
    }
    while(node){
      CssHelper._walkTheDom(node, parNode);
      var nextNode = CssHelper._getFirstChild(parNode, lastChild);
      if(nextNode){
        node = nextNode[1];
        lastChild = nextNode[0] + 1;
      } else {
        node = null;
      }
    }
  }
}
var once = false;
ReactMultiChild.Mixin.mountChildren = function(){
  var out = mountChildren.apply(this, arguments);
  return out;
};

var ReactDOMComponent = require('react/lib/ReactDOMComponent');
var _createOpenTagMarkupAndPutListeners = ReactDOMComponent.prototype._createOpenTagMarkupAndPutListeners;

ReactDOMComponent.prototype._createOpenTagMarkupAndPutListeners = function(){
  if(!once){
    CssHelper._walkTheDom(this);
    once = true;
  }
  if(arguments[0].parent){
    CssHelper._walkTheDom(this, arguments[0].parent);
  }

  var out = _createOpenTagMarkupAndPutListeners.apply(this, arguments);
  return out;
}

var _createContentMarkup = ReactDOMComponent.prototype._createContentMarkup;

ReactDOMComponent.prototype._createContentMarkup = function(){
  var out = _createContentMarkup.apply(this, arguments);
  return out;
}

/** @jsx React.DOM */
var React = require("react/addons");
var ComputeCSS = require("./resolveStyle.js");
var CSS = require('../styles/main.css.js');
var allDeclarations = CSS.allDeclarations;
var allInharitances = CSS.allInharitances;
var classSet = React.addons.classSet;



var ComputeMixin = {
  componentDidMount: function(){
  },
  componentDidUpdate: function(){
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
  console.log(React)
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
