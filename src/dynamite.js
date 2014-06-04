/**
 * Dynamite that can be thrown. Generates an Explosion entity.
 */

Crafty.c("Dynamite", {
	
	init:
	function() {
		
		// Time, in seconds, before dynamte explodes.
		this.fuseDelay = 1.0;
		
		this
		// Base components
			.requires("2D, Canvas, Physical, Inertia, PhysicsGravity, dynamite,"
					  + "TileConstraint, Delay");
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

/**
 * Explosion. This will be made better
 */

Crafty.c("Explosion", {
	
	init:
	function() {
		
		// Relative strength of the explosion. Adjust if needed.
		this.strength = 0.5;
		
		// Duration of the explosion, in seconds.
		this.time = 0.3;
		
		// Size of the explosion, in pixels.
		this.size = 200;
		
		this.requires("2D, Canvas, Color, Tween, Delay, Collision, Hazard")
			.attr({ w: 0, h: 0 })
			.color("#ff8800");
	},
	
	/**
	 * This actually sets the explosion off.
	 */
	explode:
	function() {
		
		this.attr({
				w: 0,
				h: 0,
				alpha: 1
			})
			.tween({
				x: this.x - this.size / 2,
				y: this.y - this.size / 2,
				w: this.size,
				h: this.size,
				alpha: 0
			}, this.time * 1000)
			.delay(this.destroy, this.time * 1000)
			.onHit("Physical", function(hits) {
				for(var i = 0; i < hits.length; i++) {
					var hit = hits[i];
					var ob = hit.obj;
					var px = ob.x - (this.x + this.w / 2),
						py = ob.y - (this.y + this.h / 2);
					var fac = this.strength / (dist([px, py]));
					ob.applyImpulse(px * fac, py * fac);
				}
			});
		return this;
	}
});
