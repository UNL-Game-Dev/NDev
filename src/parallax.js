
/**
 * Crafty component for scrolling a background by a factor less than the
 * viewport scrolls.
 */
Crafty.c("Parallax", {

	init:
	function() {
		this.bind("EnterFrame", function() {
			Crafty.viewport.x -= 1; // Debug code.
			this.x = -Crafty.viewport.x / this.factor;
			this.y = -Crafty.viewport.y / this.factor;
		});
	},

	scrollFactor:
	function(factor) {
		this.factor = factor;
	}

});

