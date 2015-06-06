/**
 * Dynamite that can be thrown. Generates an Explosion entity.
 */

Crafty.c("Dynamite", {
	
	init:
	function() {
		
		// Time, in seconds, before dynamite explodes.
		this.fuseDelay = 1.0;
		
		this.requires("2D, Canvas, Physical, Inertia, PhysicsGravity, dynamite, TileConstraint, Delay");
	},
	
	/**
	 * Ignite the dynamite. Will explode after the fuse delay.
	 */
	ignite:
	function() {
		this.delay(function() {
			Crafty.e("Explosion").attr({ x: this.x, y: this.y }).explode();
			this.destroy();
		}, this.fuseDelay * 1000);
	}
});
