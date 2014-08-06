/**
 * A reference to the last-activated scroll target. Only this scroll target is
 * actually applied.
 */
var currentTarget = null;

/**
 * Speed at which view follows player.
 */
var scrollSpeed = 0.15;

/**
 * Scrolls on the 2D entity that has this component, if it is the target.
 */
Crafty.c("ScrollTarget", {
	init:
	function() {
		this.requires("2D");
		this.bind("UpdateViewport", function() {
			if(currentTarget == this) {
				var offsetX = Crafty.viewport._width / Crafty.viewport._scale / 2.0;
				var offsetY = Crafty.viewport._height / Crafty.viewport._scale / 2.0;
				var targetX = -Math.floor(this.x + this.w / 2.0 - offsetX);
				var targetY = -Math.floor(this.y + this.h / 2.0 - offsetY);
				Crafty.viewport.x += Math.ceil((targetX - Crafty.viewport.x) * scrollSpeed);
				Crafty.viewport.y += Math.ceil((targetY - Crafty.viewport.y) * scrollSpeed);
			}
		});
	},
	
	makeScrollTarget:
	function() {
		currentTarget = this;
		return this;
	},
	
	removeScrollTarget:
	function() {
		currentTarget = null;
		return this;
	}
});
