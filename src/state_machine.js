/**
 * A state machine that binds event handlers to states.
 */
Crafty.c("StateMachine", {
	
	init:
	function() {
		this._stateBindings = {};
		this._states = {};
	},
	
	/**
	 * Initialize a state by name and handlers.
	 * 
	 * Extra handlers for pseudo-events for states:
	 *     EnterState - called on entering the current state
	 *     ExitState - called on exiting the current state
	 */
	state:
	function(stateName, eventHandlers) {
		this._stateBindings[stateName] = eventHandlers;
		this._states[stateName] = false;
		
		return this;
	},
	
	/**
	 * Set one or more states to active.
	 */
	setState:
	function() {
		for(var state in this._states) {
			if($.inArray(state, arguments) >= 0) {
				if(!this._states[state]) {
					this._states[state] = true;
					this._applyState(state, true);
				}
			} else {
				if(this._states[state]) {
					this._states[state] = false;
					this._applyState(state, false);
				}
			}
		}
		
		return this;
	},
	
	/**
	 * Add one or more states to the current active states.
	 */
	addState:
	function() {
		for(var state in this._states) {
			if($.inArray(state, arguments) >= 0) {
				if(!this._states[state]) {
					this._states[state] = true;
					this._applyState(state, true);
				}
			}
		}
		
		return this;
	},
	
	/**
	 * Remove one or more states from the current active states.
	 */
	removeState:
	function() {
		for(var state in this._states) {
			if($.inArray(state, arguments) >= 0) {
				if(this._states[state]) {
					this._states[state] = false;
					this._applyState(state, false);
				}
			}
		}
		
		return this;
	},
	
	/**
	 * Bind or unbind all handlers for a particular state, and fire handlers
	 * for exiting/entering state.
	 */
	_applyState:
	function(state, apply) {
		var bindings = this._stateBindings[state];
		
		// Ignore if state is undefined.
		if(!bindings) {
			return;
		}
		
		// If unapplying the state, fire the exit handler now.
		if(!apply) {
			if(typeof bindings.ExitState === "function") {
				bindings.ExitState.call(this);
			}
		}
		
		for(var event in bindings) {
			// EnterState and ExitState are not really event bindings, so don't
			// bind/unbind them.
			if(event === "EnterState" || event === "ExitState") {
				continue;
			}
			
			var handler = bindings[event];
			if(apply) {
				this.bind(event, handler);
			} else {
				this.unbind(event, handler);
			}
		}
		
		// If applying the state, fire the enter handler now.
		if(apply) {
			if(typeof bindings.EnterState === "function") {
				bindings.EnterState.call(this);
			}
		}
	}
});
