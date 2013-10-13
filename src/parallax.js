
/**
 * Crafty component for scrolling a background by a factor less than the
 * viewport scrolls.
 */
Crafty.c("Parallax", {

	init:
	function() {
		this.bind("UpdateParallax", function() {
			// Oppose the viewport movement.
			this.x = -Crafty.viewport.x * this.factor;
			this.y = -Crafty.viewport.y * this.factor;
		});
	},

	/**
	 * Sets the factor of camera movement to apply to this entity. 0.0 means
	 * there is no movement along with camera, 1.0 means it is normal.
	 */
	scrollFactor:
	function(factor) {
		this.factor = 1.0 - factor;
	}

});

// Sets the viewport position /and/ deals with parallax objects to avoid
// shiftiness with the background due to old position being used.
Crafty.c("Scroller", {
	
	init:
	function() {
		this.target = null;
		this.bind("UpdateDraw", function() {
			// Oppose the viewport movement.
			if(this.target != null) {
				Crafty.viewport.x = -this.target._x + 800/2;
				Crafty.viewport.y = -this.target._y + 600/2;
			}
			Crafty.trigger("UpdateParallax");
		});
	},

});

