/**
 * Controls component that maps keys to controls.
 */
Crafty.c("Controls", {
	
	init:
	function() {
		// Mapping of controls.
		this._ctrlKeyMapping = new Relation();
		
		// Keep track of key presses and double keystrokes.
		this._keydown = {};
		this._keyLastPressed = {};
		this._doublePressTimeout = 250;
		this._doublePressKeyCodeOffset = 10000;
		
		// When key is pressed, trigger the corresponding control event(s).
		this.bind("KeyDown", function(ev) {
			var keyCode = ev.keyCode;
			this._keydown[keyCode] = true;
			
			// Check for double key press.
			var now = _.now();
			var keyLastPressed = this._keyLastPressed[keyCode] || 0;
			var doublePressMappedControls = [];
			if(now - keyLastPressed < this._doublePressTimeout) {
				this._updateDoublePressKeyStatus(keyCode, true);
				doublePressMappedControls =
				    this._getDoublePressMappedControls(keyCode);
			} else {
				// Save the time of this keypress.
				this._keyLastPressed[keyCode] = now;
			}
			
			// Process controls.
			var singlePressMappedControls = this._ctrlKeyMapping
			                                    .getReverse(keyCode);
			var mappedControls = singlePressMappedControls
			                         .concat(doublePressMappedControls);
			
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
			delete this._keydown[keyCode];
			
			// Check for release of a double key press.
			var doublePressMappedControls = [];
			if(this._keyIsDoublePressed(keyCode)) {
				this._updateDoublePressKeyStatus(keyCode, false);
				doublePressMappedControls =
				    this._getDoublePressMappedControls(keyCode);
			}
			
			// Process controls.
			var singlePressMappedControls = this._ctrlKeyMapping
			                                    .getReverse(keyCode);
			var mappedControls = singlePressMappedControls
			                         .concat(doublePressMappedControls);
			
			_(mappedControls).each(function(control) {
				Crafty.trigger("ControlReleased", {
					control: control,
					type: "controlreleased",
					keyEvent: ev
				});
			});
		});
	},
	
	/**
	 * Apply key mapping from a dictionary.
	 */
	mapKeys:
	function(mappingDict) {
		var newMapping = {};
		_(mappingDict).each(function(keys, control) {
			keys = _(keys).isArray() ? keys : [keys];
			newMapping[control] = _(keys).map(function(key) {
				return (_(key).isObject() && !_(key.double).isUndefined())
						? this._encodeDoublePress(key.double)
						: key;
			}, this);
		}, this);
		this._ctrlKeyMapping.map(newMapping);
		
		return this;
	},
	
	/**
	 * Load key mapping from an XML file.
	 */
	loadKeyMapping:
	function(filename) {
		$.ajax({
			type: "GET",
			url: filename,
			context: this,
			success: function (data) {
				var keyMapping = {};
				
				data = $(data).children("controls");
				
				_(data.children("control")).each(function(controlElement) {
					controlElement = $(controlElement);
					var controlName = controlElement.attr("name");
					var keyElements = controlElement.children("key");
					var mappedKeys = _(keyElements).map(function(keyElement) {
						keyElement = $(keyElement);
						var double = (keyElement.attr("double") || "").trim()
						                        .toLowerCase();
						var keyName = keyElement.text().trim();
						var keyCode = Crafty.keys[keyName];
						if(double && double !== "false") {
							return { double: keyCode };
						} else {
							return keyCode;
						}
					});
					keyMapping[controlName] = mappedKeys;
				});
				this.mapKeys(keyMapping);
			}
		});
		
		return this;
	},
	
	/**
	 * See if a key is down, given a control name or key code.
	 */
	keyDown:
	function(key) {
		
		// See if key given is a control name.
		if(this._ctrlKeyMapping.containsLeft(key)) {
			var mappedKeys = this._ctrlKeyMapping.getForward(key);
			return _(mappedKeys).find(function(mappedKey) {
				return this._keyIsDown(mappedKey);
			}, this) !== undefined;
		}
		
		var mappedKey = Crafty.keys[key];
		if(!_(mappedKey).isUndefined()) {
			return this._keyIsDown(mappedKey);
		}
		
		return this._keyIsDown(key);
	},
	
	/**
	 * Get the value of a control class, given the control class name.
	 * (a la Unity)
	 */
	getControl:
	function(control) {
		control = control.toLowerCase();
		if(control === "horizontal") {
			return (this.keyDown("left") ? -1 : 0)
			     + (this.keyDown("right") ? +1 : 0);
		} else if(control === "vertical") {
			return (this.keyDown("down") ? +1 : 0)
			     + (this.keyDown("up") ? -1 : 0);
		} else if(control === "direction") {
			var kx = (this.keyDown("left") ? -1 : 0)
			       + (this.keyDown("right") ? +1 : 0);
			var ky = (this.keyDown("down") ? +1 : 0)
			       + (this.keyDown("up") ? -1 : 0);
			if(kx != 0 && ky != 0) {
				return [0.707 * kx, 0.707 * ky];
			} else {
				return [kx, ky];
			}
		}
	},
	
	/**
	 * Encode a double press into its key code representation.
	 */
	_encodeDoublePress:
	function(keyCode) {
		return keyCode + this._doublePressKeyCodeOffset;
	},
	
	/**
	 * See whether a key is down based on a key code.
	 */
	_keyIsDown:
	function(keyCode) {
		return this._keydown[keyCode] || false;
	},
	
	/**
	 * See whether a double-pressed key is being held down.
	 */
	_keyIsDoublePressed:
	function(keyCode) {
		var doublePressKeyCode = this._encodeDoublePress(keyCode);
		return this._keydown[doublePressKeyCode] || false;
	},
	
	/**
	 * Update status of double-pressed key to be pressed or not pressed.
	 */
	_updateDoublePressKeyStatus:
	function(keyCode, pressed) {
		var doublePressKeyCode = this._encodeDoublePress(keyCode);
		if(pressed) {
			this._keydown[doublePressKeyCode] = true;
			this._keyLastPressed[doublePressKeyCode] = _.now();
		} else {
			delete this._keydown[doublePressKeyCode];
		}
	},
	
	/**
	 * Get the controls mapped to a double-pressed key.
	 */
	_getDoublePressMappedControls:
	function(keyCode) {
		var doublePressKeyCode = this._encodeDoublePress(keyCode);
		return this._ctrlKeyMapping.getReverse(doublePressKeyCode);
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
