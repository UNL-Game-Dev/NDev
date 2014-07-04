Crafty.c("Controls", {
	init:
	function() {
		this._keyMapping = {
			left: Crafty.keys.LEFT_ARROW,
			right: Crafty.keys.RIGHT_ARROW,
			up: Crafty.keys.UP_ARROW,
			down: Crafty.keys.DOWN_ARROW
		};
	},
	
	mapKeys:
	function(mapping) {
		for(var control in mapping) {
			var mappedKey = mapping[control];
			this._keyMapping[control] = Crafty.keys[mappedKey];
		}
	},
	
	keyDown:
	function(key) {
		if(typeof key === typeof "") {
			key = key.toLowerCase();
		}
		var mappedKey = this._keyMapping[key];
		if(mappedKey !== undefined) {
			if(Crafty.keys[mappedKey]) {
				return Crafty.keydown[Crafty.keys[mappedKey]];
			}
			return Crafty.keydown[mappedKey];
		}
		mappedKey = Crafty.keys[key];
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
