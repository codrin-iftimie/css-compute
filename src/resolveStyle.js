var specificity = require("specificity"),
		_ = require("lodash");

function overwriteDeclarations(existingDeclarations, newDeclarations){
	var out = _.clone(existingDeclarations),
			newProps = [],
			isNewProp = false;

	if(out.length === 0) {
		return _.clone(newDeclarations);
	}

	_.forEach(newDeclarations, function(newDeclaration){
		out.forEach(function(existingDeclaration){
			isNewProp = true;
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
	});
	return out;
}


function prioritizeParents(parents){
	parents.sort(function(par1, par2){
		return specificity.calculate(par1) > specificity.calculate(par2);
	});
	return parents;
}

function findSelect(what, where){
	var trueIndex = where.indexOf(what);
	if(trueIndex < 0){
		for (var i = 0; i < where.length; i++) {
			var theWhere = where[i];
			var thisWhere = theWhere.split('.');
			thisWhere.splice(0, 1);
			for (var j = 0; j < thisWhere.length; j++) {
				subSelect = '.' + thisWhere[j]
				if(subSelect === what){
					return i;
				};
			}
		};
	}
	return trueIndex;
}

var composedSelectorIndex = [0, 0];
var resolveStyle = function(forSelector, allDeclarations, allInharitances){
	var lastElem = forSelector[forSelector.length - 1];


	var parents = [];
	if(allInharitances[lastElem]){
		var composedLastElem = lastElem.split('.');
		composedLastElem.splice(0, 1);
		if(composedLastElem.length > 1){
			for (var i = 0; i < composedLastElem.length; i++) {
				var tmpPars = allInharitances[composedLastElem[i]]
				if(tmpPars){
					for (var j = 0; j < tmpPars.length; j++) {
						parents.push(tmpPars[j])
					};
				}
			};
		}
		for (var i = 0; i < allInharitances[lastElem].length; i++) {
			parents.push(allInharitances[lastElem][i])
		};
	}
	var existingDeclarations = [];
	if(allDeclarations[lastElem]){
		for (var i = 0; i < allDeclarations[lastElem].length; i++) {
		 	existingDeclarations.push(allDeclarations[lastElem][i])
		};
	}

	var lastElems = lastElem.split('.');
	lastElems.splice(0, 1);

	if(lastElems.length > 1){
		for (var i = 0; i < lastElems.length; i++) {
			var sub = '.' + lastElems[i];
			if(allDeclarations[sub]){
				for (var j = 0; j < allDeclarations[sub].length; j++) {
				 	existingDeclarations.push(allDeclarations[sub][j])
				};
			}
		};
	}

	var validParents = [];

	parents = prioritizeParents(parents, forSelector);
	parents.forEach(function(parent){
		var isValid = true;
		var elems = parent.split(' ');
		elems.splice(0, 1);
		var firstElem = elems[0];
		var indexOfFirst = findSelect(firstElem, forSelector);
		if(indexOfFirst >= 0){
			var selectClone = [];
			forSelector.forEach(function(elem){
				selectClone.push(elem);
			})
			selectClone.splice(0, indexOfFirst);
			var checks = 0;
			elems.forEach(function(elem, indexOfElem){
				var indexInsideSelector = findSelect(elem, selectClone);
				if(indexInsideSelector === -1){
					isValid = false;
				}
				if(indexOfElem <= indexInsideSelector){
					checks ++;
				}
			});
			if(isValid && checks === elems.length){
				isValid = true;
			}
		} else {
			isValid = false;
		}
		if(isValid){
			validParents.push(parent);
		}
	});
	validParents.forEach(function(valid){
		valid = valid.substr(1);
		if(allDeclarations[valid]){
			var validDeclarations = []
			for (var i = 0; i < allDeclarations[valid].length; i++) {
			 	validDeclarations.push(allDeclarations[valid][i])
			};
			existingDeclarations = overwriteDeclarations(existingDeclarations, validDeclarations);
		}
	});

	var out = {};
	existingDeclarations.forEach(function(elem){
		var prop = elem.property
		out[prop] = elem.value
	});
	return out;
}
module.exports = resolveStyle;
