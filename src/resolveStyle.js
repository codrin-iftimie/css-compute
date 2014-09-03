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


function prioritizeParents(parents, forSelector){
	// prioritizize by specifity
	// in case they have the same length
	var byLength = []
	var max = parents.length;
	
	parents.forEach(function(parent){
		var elems = parent.split(' ');
		elems.splice(0, 1);
		if(byLength[elems.length -1]){
			byLength[elems.length - 1].push(parent)
		} else {
			byLength[elems.length - 1] = [parent];
		}
	})
	parents = [];
	byLength.forEach(function(count){
		if(count.length > 1){
			count.sort(function(par1, par2){
				var score1 = getScore(par1, forSelector);
				var score2 = getScore(par2, forSelector);
				return score1 > score2;
			});

			count.forEach(function(parent){
				parents.push(parent);
			});
		} else {
			if(count.length === 1){
				parents.push(count[0])
			}
		}

	});

	return parents;
}

var getScore = function(parent, forSelector){
	elems = parent.split(' ');
	elems.splice(0, 1);
	var sum = 0;
	var indexOfFirstElem = forSelector.indexOf(elems[0])
	elems.forEach(function(elem){
		var indexOfElem = forSelector.indexOf(elem);
		sum += indexOfElem
	})
	var rating = forSelector.length - indexOfFirstElem;
	return sum + rating;
}

var resolveStyle = function(forSelector, allDeclarations, allInharitances){
	var lastElem = forSelector[forSelector.length - 1];
	var parents = [];

	if(allInharitances[lastElem]){
		for (var i = 0; i < allInharitances[lastElem].length; i++) {
			parents.push(allInharitances[lastElem][i])
		};
	}

	var existingDeclarations = []
	if(allDeclarations[lastElem]){
		for (var i = 0; i < allDeclarations[lastElem].length; i++) {
		 	existingDeclarations.push(allDeclarations[lastElem][i])
		};
	}
	var validParents = [];

	parents = prioritizeParents(parents, forSelector);

	parents.forEach(function(parent){
		var isValid = true;
		var elems = parent.split(' ');
		elems.splice(0, 1);
		var firstElem = elems[0];
		var indexOfFirst = forSelector.indexOf(firstElem);
		if(indexOfFirst >= 0){
			var selectClone = [];
			forSelector.forEach(function(elem){
				selectClone.push(elem);
			})
			selectClone.splice(0, indexOfFirst);
			var checks = 0;
			elems.forEach(function(elem, indexOfElem){
				var indexInsideSelector = selectClone.indexOf(elem);
				if(indexInsideSelector === -1){
					isValid = false;
					return;
				}
				if(indexOfElem < indexInsideSelector){
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
	})
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