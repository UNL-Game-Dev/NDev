
/**
 * Crafty component for scrolling a background by a factor less than the
 * viewport scrolls.
 */
Crafty.c("Parallax", {
	
	init:
	function() {
		this.bind("ViewportScroll", function() {
			// Oppose the viewport movement.
			this.x = Math.round((400 - Crafty.viewport.x) * this.factor);
			this.y = Math.round((300 - Crafty.viewport.y) * this.factor);
		});
	},
	
	/**
	 * Sets the factor of camera movement to apply to this entity. 0.0 means
	 * there is no movement along with camera, 1.0 means it is normal.
	 */
	scrollFactor:
	function(factor) {
		this.factor = 1.0 - factor;
		return this;
	}
});
