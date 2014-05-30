/**
 * Dynamite.
 */

Crafty.c("Dynamite", {
	
	init:
	function() {
		var explodeDelay = 1000;
		this
		// Base components
			.requires("2D, Canvas, Physical, Inertia, PhysicsGravity, dynamite,"
					  + "TileConstraint, Delay")
			.delay(function() {
				Crafty.e("Explosion").attr({ x: this.x, y: this.y }).explode();
				this.destroy();
			}, explodeDelay);
	}
});

/**
 * Explosion. This will be made better
 */

Crafty.c("Explosion", {
	
	init:
	function() {
		this
			.requires("2D, Canvas, Color, Tween, Delay")
			.attr({ w: 10, h: 10})
			.color("#ff8800");
	},
	
	explode:
	function() {
		var amt = 60;
		var time = 300;
		this.tween({
				x: this.x - amt,
				y: this.y - amt,
				w: this.w + amt * 2,
				h: this.h + amt * 2,
				alpha: 0
			}, time)
			.delay(this.destroy, time);
		return this;
	}
});
