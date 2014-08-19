/** @jsx React.DOM */
var React = require("react/addons");
var ComputeCSS = require("./resolveStyle.js");
var CSS = require('../styles/main.css.js');
var allDeclarations = CSS.allDeclarations;
var allInharitances = CSS.allInharitances;
var classSet = React.addons.classSet;

var ChildComp = React.createClass({
	render: function(){
		return(
			<div className="child-comp">
        lsssss
      </div>
		)
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
      this._subRender(kids, node)
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
  	var render = comp.render();
  	this._walkTheDom(render, parent)
  	comp.render = function(){ return render }
  },
	componentDidMount: function(){
		var render = this.render();
		this._walkTheDom(render);
		this.render = function(){ return render};
		this.forceUpdate();
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
						<ChildComp />
					</div>
          <ChildComp />
				</div>
        <ChildComp />
			</div>
		)
	}
});
var comp3 = React.renderComponent(
	<App/>,
	document.getElementById("test")
);
