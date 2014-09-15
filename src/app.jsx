var ComputeCSS = require("./resolveStyle.js");
var CSS = require('../styles/main.css.js');
var allDeclarations = CSS.allDeclarations;
var allInharitances = CSS.allInharitances;
var ReactCompositeComponentBase = require('react/lib/ReactCompositeComponent').Base

var _renderValidatedComponent = ReactCompositeComponentBase.prototype._renderValidatedComponent;
ReactCompositeComponentBase.prototype._renderValidatedComponent = function(){
  var out = _renderValidatedComponent.apply(this, arguments);
  CssHelper._walkTheDom(out, this.props._parent);
  return out;
}


var ReactMultiChild = require('react/lib/ReactMultiChild');

var mountChildren = ReactMultiChild.Mixin.mountChildren;

var CssHelper = {
  _getStyle: function(css){
    // return;
    return ComputeCSS(css, allDeclarations, allInharitances);
  },
  _classNameToSelector: function(className){
    if(!className){ return; }

    var classNames = className.split(' ')
    if(classNames.length > 0){
      return '.' + classNames.join('.');
    } else {
      return '.' + className;
    }

  },
  _getClassName: function(node, parent){
    var stop = false;
    var selector = CssHelper._classNameToSelector(node.props.className);
    if(parent){

      if(!node.tagName){
        node.props._parent = parent;
        return;
      }
      var existingClasses = parent.props.parentClassName;
      var allClasses = [];
      for (var i = 0; i < existingClasses.length; i++) {
        allClasses.push(existingClasses[i])
      };
      if(selector){
        allClasses.push(selector);
      } else {
        allClasses.push(node.tagName);
      }
      node.props.parentClassName = allClasses;
    } else {
      //root node
      node.props.parentClassName = [selector];
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

/** @jsx React.DOM */
var React = require("react/addons");
var classSet = React.addons.classSet;



var ComputeMixin = {
  updateStyle: function(){
      if(this.props._parent){
        CssHelper._walkTheDom(this._descriptor._renderedComponent, this.props._parent);
      } else {
        CssHelper._walkTheDom(this._descriptor._renderedComponent);
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
      globalTest: true
    })
  },
	render: function(){
    console.log('-----------------------------')
		var className = classSet({
			"grandmother": true,
      "extra-class": this.state.globalTest
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
