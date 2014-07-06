Crafty.c("Controls", {
	
	init:
	function() {
		// Mapping of controls.
		this._ctrlKeyMapping = new Relation();
		
		// Keep track of key presses for double keystrokes.
		this._keyLastPressed = {};
		this._keyDoublePressed = {};
		
		this._doublePressTimeout = 250;
		
		this._doublePressKeyCodeOffset = 10000;
		
		// When key is pressed, trigger the corresponding control event(s).
		this.bind("KeyDown", function(ev) {
			var keyCode = ev.keyCode;
			
			// Check for double key press.
			var now = _.now();
			var keyLastPressed = this._keyLastPressed[keyCode] || 0;
			var doublePressMappedControls = [];
			if(now - keyLastPressed < this._doublePressTimeout) {
				this._keyDoublePressed[keyCode] = true;
				var doublePressKeyCode = this._encodeDoublePress(keyCode);
				doublePressMappedControls = this._ctrlKeyMapping.getReverse(doublePressKeyCode);
			}
			
			// Save the time of this keypress.
			this._keyLastPressed[keyCode] = now;
			
			// Process controls.
			var singlePressMappedControls = this._ctrlKeyMapping.getReverse(keyCode);
			var mappedControls = singlePressMappedControls.concat(doublePressMappedControls);
			
			_(mappedControls).each(function(control) {
				Crafty.trigger("ControlPressed", {
					control: control,
					type: "controlpressed",
					keyEvent: ev
				});
			});
		});
		
		// When key is released, trigger the corresponding control event(s).
		this.bind("KeyUp", function(ev) {
			var keyCode = ev.keyCode;
			
			// Check for release of a double key press.
			var doublePressMappedControls = [];
			if(this._keyDoublePressed[keyCode]) {
				delete this._keyDoublePressed[keyCode];
				var doublePressKeyCode = this._encodeDoublePress(keyCode);
				doublePressMappedControls = this._ctrlKeyMapping.getReverse(doublePressKeyCode);
			}
			
			// Process controls.
			var singlePressMappedControls = this._ctrlKeyMapping.getReverse(keyCode);
			var mappedControls = singlePressMappedControls.concat(doublePressMappedControls);
			_(mappedControls).each(function(control) {
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
		var newMapping = {};
		_(mapping).each(function(keys, control) {
			keys = _(keys).isArray() ? keys : [keys];
			newMapping[control] = _(keys).map(function(key) {
				return (_(key).isObject() && !_(key.double).isUndefined())
						? this._encodeDoublePress(key.double)
						: key;
			}, this);
		}, this);
		this._ctrlKeyMapping.map(newMapping);
	},
	
	keyDown:
	function(key) {
		
		// See if key given is a control name.
		if(this._ctrlKeyMapping.containsLeft(key)) {
			var mappedKeys = this._ctrlKeyMapping.getForward(key);
			return _(mappedKeys).find(function(mappedKey) {
				return Crafty.keydown[mappedKey];
			}) != undefined;
		}
		
		var mappedKey = Crafty.keys[key];
		if(mappedKey !== undefined) {
			return Crafty.keydown[mappedKey];
		}
		
		return Crafty.keydown[key];
	},
	
	getControl:
	function(control) {
		return {
			horizontal: (this.keyDown("left") ? -1 : 0)
				+ (this.keyDown("right") ? +1 : 0),
			vertical: (this.keyDown("down") ? -1 : 0)
				+ (this.keyDown("up") ? +1 : 0)
		}[control.toLowerCase()];
	},
	
	_encodeDoublePress:
	function(keyCode) {
		return keyCode + this._doublePressKeyCodeOffset;
	}
});

// Relation class.
function Relation(dict) {
	
	this._forwardMapping = {};
	this._reverseMapping = {};
	
	// Add a mapping.
	this._addPair = function(key, value) {
		if(this._forwardMapping[key] !== undefined) {
			this._forwardMapping[key].push(value);
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
			var mappedRightValues = this._forwardMapping[key];
			if(_(mappedRightValues).contains(value)) {
				this._forwardMapping[key] = _(mappedRightValues).without(value);
				if(this._forwardMapping[key].length === 0) {
					delete this._forwardMapping[key];
				}
			}
		}
		if(this._reverseMapping[value] !== undefined) {
			if(_(this._reverseMapping[value]).contains(key)) {
				this._reverseMapping[key] =
					_(this._reverseMapping[value]).without(key);
				if(this._reverseMapping[value].length === 0) {
					delete this._reverseMapping[value];
				}
			}
		}
	}
	
	// Make some mappings using a dictionary.
	this._map = function(dict) {
		dict = dict || {};
		_(dict).each(function(values, key) {
			// Make sure values is a list of values, not just a value.
			if(!_(values).isArray()) {
				values = [values];
			}
			_(values).each(function(value, index) {
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
	return _(this._forwardMapping).keys();
};

Relation.prototype.rightValues = function() {
	return _(this._reverseMapping).keys();
};
