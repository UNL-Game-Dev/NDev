
/**
 * Crafty component that carries out physics ticks in order.
 */
Crafty.c("PhysicsTicker", {

	init:
	function() {
		this.bind("EnterFrame", function() {
			Crafty.trigger("EvaluateAccel");
			Crafty.trigger("ResolveConstraint");
			Crafty.trigger("EvaluateInertia");
		});
	}

});

/**
 * Crafty component for being affected by basic tile collision response.
 */
Crafty.c("Physical", {

	init: 
	function() {
		// Note: only use _x for getting, or else screen pos not updated.
		this._px = this._x;
		this._py = this._y;

		this.bind("EvaluateAccel", function() {
		}).bind("ResolveConstraint", function() {
		}).bind("EvaluateInertia", function() {
		});
	}

});

