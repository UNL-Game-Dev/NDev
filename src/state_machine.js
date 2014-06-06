/**
 * A state machine that binds event handlers to states.
 */
Crafty.c("StateMachine", {
	
	init:
	function() {
		this._stateBindings = {};
		this._states = {};
	},
	
	initState:
	function(stateName, eventHandlers) {
		this._stateBindings[stateName] = eventHandlers;
		this._states[stateName] = false;
		
		return this;
	},
	
	setState:
	function() {
		for(var state in this._states) {
			if($.inArray(state, arguments) >= 0) {
				if(!this._states[state]) {
					this._states[state] = true;
					this._applyStateBindings(state);
				}
			} else {
				if(this._states[state]) {
					this._states[state] = false;
					this._unapplyStateBindings(state);
				}
			}
		}
		
		return this;
	},
	
	addState:
	function() {
		for(var state in this._states) {
			if($.inArray(state, arguments) >= 0) {
				if(!this._states[state]) {
					this._states[state] = true;
					this._applyStateBindings(state);
				}
			}
		}
		
		return this;
	},
	
	removeState:
	function() {
		for(var state in this._states) {
			if($.inArray(state, arguments) >= 0) {
				if(this._states[state]) {
					this._states[state] = false;
					this._unapplyStateBindings(state);
				}
			}
		}
		
		return this;
	},
	
	_applyStateBindings:
	function(state) {
		var bindings = this._stateBindings[state];
		for(var event in bindings) {
			var handler = bindings[event];
			this.bind(event, handler);
		}
	},
	
	_unapplyStateBindings:
	function(state) {
		var bindings = this._stateBindings[state];
		for(var event in bindings) {
			var handler = bindings[event];
			this.unbind(event, handler);
		}
	}
});
