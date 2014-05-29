/**
 * Dynamite.
 */

Crafty.c("Dynamite", {
	
	init:
	function() {
		this
		// Base components
			.requires("2D, Canvas, Physical, Inertia, PhysicsGravity, dynamite,"
					  + "TileConstraint");
	}
});
