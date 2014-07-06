/**
 * Objects that can be pushed.
 */
Crafty.c("Pushable", {
	init:
	function() {
		this.requires("2D, Physical, PhysicsGravity, Inertia," +
					  "DefaultPhysicsDraw, TileConstraint, GroundFriction");
	},
	
	push:
	function(norm) {
		this._phX += norm[0];
	}
});
