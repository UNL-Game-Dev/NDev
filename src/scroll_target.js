/**
 * A reference to the last-activated scroll target. Only this scroll target is
 * actually applied.
 */
var currentTarget = null;

/**
 * Scrolls on the 2D entity that has this component, if it is the target.
 */
Crafty.c("ScrollTarget", {
	init:
	function() {
		this.bind("UpdateViewport", function() {
			if(currentTarget == this) {
				Crafty.viewport.x = -Math.floor(this.x - 400);
				Crafty.viewport.y = -Math.floor(this.y - 300);
			}
		});
	},

	makeScrollTarget:
	function() {
		currentTarget = this;
	}
});