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
		this.time = 0.5;
		
		// Size of the explosion, in pixels.
		this.size = 200;
		
		this.requires("2D, Canvas, Tween, Delay, Collision, Hazard, Destructive, SpriteAnimation, explosion");
	},
	
	/**
	 * This actually sets the explosion off.
	 */
	explode:
	function() {
		this
            .attr({
                x: this.x - 45,
                y: this.y - 45
            })
            .animate('explosion')
			.delay(this.destroy, this.time * 1000)
			.onHit("Enemy", function(hits) {
				_(hits).each(function(hit) {
					hit.obj.destroy();
				});
			})
			.onHit("Physical", function(hits) {
				_(hits).each(function(hit) {
					var ob = hit.obj;
					var px = ob.x - (this.x + this.w / 2),
						py = ob.y - (this.y + this.h / 2);
					var fac = this.strength / (dist([px, py]));
					ob.applyImpulse(px * fac, py * fac);
				}, this);
			});
		Crafty.trigger("Quake");
		return this;
	}
});
