/**
 * Crafty component that carries out physics ticks in order.
 *
 * This is so that we can have a more controlled sequence that can be relied
 * upon to execute in a specific order.
 */
Crafty.c("PhysicsTicker", {
	
	enabled: true,
	
	init:
	function() {
		this.bind("EnterFrame", function() {
			if(this.enabled) {
				Crafty.trigger("PrePhysicsTick");
				Crafty.trigger("EvaluateAccel");
				Crafty.trigger("UpdateCollisions");
				Crafty.trigger("EvaluateHits");
				Crafty.trigger("ResolveConstraint");
				Crafty.trigger("EvaluateInertia");
			}
			Crafty.trigger("UpdateDraw");
			Crafty.trigger("UpdateViewport");
		});
	}
});
