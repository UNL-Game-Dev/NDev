Crafty.c("Controls", {
	
	init:
	function() {
		// Mapping of controls.
		this._ctrlKeyMapping = new Relation();
		
		// When key is pressed, trigger the corresponding control event(s).
		this.bind("KeyDown", function(ev) {
			var mappedControls = this._ctrlKeyMapping.getReverse(ev.keyCode);
			_.each(mappedControls, function(control) {
				Crafty.trigger("ControlPressed", {
					control: control,
					type: "controlpressed",
					keyEvent: ev
				});
			});
		});
		
		// When key is released, trigger the corresponding control event(s).
		this.bind("KeyUp", function(ev) {
			var mappedControls = this._ctrlKeyMapping.getReverse(ev.keyCode);
			_.each(mappedControls, function(control) {
				Crafty.trigger("ControlReleased", {
					control: control,
					type: "controlreleased",
					keyEvent: ev
				});
			});
		});
	},
	
	mapKeys:
	function(mapping) {
		this._ctrlKeyMapping.map(mapping);
	},
	
	keyDown:
	function(key) {
		
		// See if key given is a control name.
		if(this._ctrlKeyMapping.containsLeft(key)) {
			return _.find(this._ctrlKeyMapping.getForward(key), function(mappedKey) {
				return Crafty.keydown[mappedKey];
			}) != undefined;
		}
		
		var mappedKey = Crafty.keys[key];
		if(mappedKey !== undefined) {
			return Crafty.keydown[mappedKey];
		}
		
		return Crafty.keydown[key];
	},
	
	keyUp:
	function(key) {
		return !this.keyDown(key);
	},
	
	getControl:
	function(control) {
		return {
			horizontal: (this.keyDown("left") ? -1 : 0)
				+ (this.keyDown("right") ? +1 : 0),
			vertical: (this.keyDown("down") ? -1 : 0)
				+ (this.keyDown("up") ? +1 : 0)
		}[control.toLowerCase()];
	}
});

function Relation(dict) {
	
	this._forwardMapping = {};
	this._reverseMapping = {};
	
	this._addPair = function(key, value) {
		if(this._forwardMapping[key] !== undefined) {
			this._fowardMapping[key].push(value);
		} else {
			this._forwardMapping[key] = [value];
		}
		if(this._reverseMapping[value] !== undefined) {
			this._reverseMapping[value].push(key);
		} else {
			this._reverseMapping[value] = [key];
		}
	};
	
	// Remove a mapping.
	this._removePair = function(key, value) {
		if(this._forwardMapping[key] !== undefined) {
			if(_.contains(this._forwardMapping[key], value)) {
				this._forwardMapping[key] = _.without(this._forwardMapping[key],
				                                      value);
				if(this._forwardMapping[key].length === 0) {
					delete this._forwardMapping[key];
				}
			}
		}
		if(this._reverseMapping[value] !== undefined) {
			if(_.contains(this._reverseMapping[value], key)) {
				this._reverseMapping[key] =
					_.without(this._reverseMapping[value],
					          key);
				if(this._reverseMapping[value].length === 0) {
					delete this._reverseMapping[value];
				}
			}
		}
	}
	
	// Make some mappings using a dictionary.
	this._map = function(dict) {
		dict = dict || {};
		_.each(dict, function(values, key) {
			// Make sure values is a list of values, not just a value.
			if(typeof values !== typeof []) {
				values = [values];
			}
			_.each(values, function(value, index) {
				this._addPair(key, value);
			}, this);
		}, this);
	};
}

Relation.prototype.add = function(key, value) {
	this._addPair(key, value);
};

Relation.prototype.remove = function(key, value) {
	this._removePair(key, value);
};

Relation.prototype.containsLeft = function(key) {
	return this._forwardMapping[key] !== undefined;
};

Relation.prototype.containsRight = function(value) {
	return this._reverseMapping[value] !== undefined;
};

Relation.prototype.map = function(dict) {
	this._map(dict);
};

Relation.prototype.getForward = function(key) {
	return this._forwardMapping[key] || [];
};

Relation.prototype.getReverse = function(value) {
	return this._reverseMapping[value] || [];
};

Relation.prototype.leftValues = function() {
	return Object.keys(this._forwardMapping);
};

Relation.prototype.rightValues = function() {
	return Object.keys(this._reverseMapping);
};
