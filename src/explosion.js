/**
 * Hazardous blast wave that grows in size over a certain amount of time,
 * pushing all free physics objects out of the way.
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
		
		this.requires("2D, Canvas, Color, Tween, Delay, Collision, Hazard," +
					  "Destructive")
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
		Crafty.trigger("Quake");
		return this;
	}
});
