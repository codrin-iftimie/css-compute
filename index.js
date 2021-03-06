var css = require('css'),
		fs = require('fs'),
		_ = require('lodash');


var allDeclarations = {};
var allInharitances = {};


function pushIfNotExist(where, what){
	if(where.indexOf(what) === -1){
		where.push(what)
	}
}

function overwriteDeclarations(existingDeclarations, newDeclarations){
	var out = [];
	var newProps = [];

	existingDeclarations.forEach(function(existingDeclaration){
		var declar = {
			property: existingDeclaration.property,
			value: existingDeclaration.value
		}
		out.push(declar);
	});
	newDeclarations.forEach(function(newDeclaration){
		var isNewProp = true;
		out.forEach(function(existingDeclaration){
			if(existingDeclaration.property === newDeclaration.property) {
				//if we have the same property 
				// we replace the existing value with the new one
				isNewProp = false;
				existingDeclaration.value = newDeclaration.value;
			} 
		});
		if(isNewProp){
			newProps.push(newDeclaration);
		}
	});
	newProps.forEach(function(prop){
		out.push(prop);
	})
	return out;
}

function mergeDeclarations(selector, newDeclarations){
	var parsedDeclarations = _.map(newDeclarations, function(declar){
		return {
			property: declar.property,
			value: declar.value
		}
	});

	if(allDeclarations[selector]){

		//problably we have to merge declarations
		var existingDeclarations = allDeclarations[selector];
		existingDeclarations = _.map(existingDeclarations, function(declar){
			return {
				property: declar.property,
				value: declar.value
			}
		});
		existingDeclarations = overwriteDeclarations(existingDeclarations, parsedDeclarations);

	} else {

		allDeclarations[selector] = [];
		parsedDeclarations.forEach(function(parsedDeclaration){
			allDeclarations[selector].push(parsedDeclaration);
		})

	}
}

function orderByLength(parents){
	return _.sortBy(parents, function(elem){
		return elem.length;
	})
}

function prioritizeParents(parents){
	parents = orderByLength(parents);	
	return parents;
}

function registerParent(selectorElems, index){
	var lastElem = selectorElems[selectorElems.length -1];	
	var parent = '';
	for (var i = 0; i <= index; i++) {
		parent += ' ' + selectorElems[i]
	};
	if(parent.charAt(0) === ' '){
		parent.substr(1);
	}

	//don't register himself as his parent
	if(index === selectorElems.length - 1){
		return;
	}

	//composed lastElem
	var lastElems = lastElem.split('.');
	lastElems.splice(0, 1);
	if(lastElems.length > 1){
		for (var i = 0; i < lastElems.length; i++) {
			addParentFor(lastElems[i], parent);
		};	
	}
	addParentFor(lastElem, parent);

}

function addParentFor(lastElem, parent){
	//register parents
	allInharitances[lastElem] = allInharitances[lastElem] || [];
	pushIfNotExist(allInharitances[lastElem], parent + ' ' + lastElem);
}

function computeRules(rules){

	var simpleRules = [];

	rules.forEach(function(rule){

		if(rule.type === 'rule'){

		var selectors = rule.selectors;
		var declarations = rule.declarations;

		selectors.forEach(function(selector){
			mergeDeclarations(selector, declarations);

			var selectorElems = selector.split(' ');

			//if composed selector
			if(selectorElems.length > 1){
				//map each parent to it's child
				selectorElems.forEach(function(elem, index){
					var subSelectors = elem.split('.');
					if(subSelectors.length > 2){
						for (var i = 0; i < subSelectors.length; i++) {
							var selectorElemsCopy = selectorElems.slice(0);
							if(subSelectors[i] !== '') {
								selectorElemsCopy[index] = '.' + subSelectors[i];
								registerParent(selectorElemsCopy, index)
							}
						};
					}
					registerParent(selectorElems, index)
				})
			}

		})

	}

	})


}

fs.readFile(
	'/home/codrin/Work/css-compute/styles/main.css',
	'utf8',
	function (err,data) {
		var ast = css.parse(data);
		var rules = ast.stylesheet.rules
		var computedRules = computeRules(rules);
		fs.writeFile(
			'/home/codrin/Work/css-compute/styles/main.css.js',
			'module.exports = { \n' +  
				'allDeclarations:'  + JSON.stringify(allDeclarations) + ', \n' +
				'allInharitances:'  + JSON.stringify(allInharitances) + ' \n};'
		);
	}
)