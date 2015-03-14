/**
 * Shake the viewport as if an earthquake were occurring.
 */
Crafty.c("EarthquakeViewport", {
	/**
	 * The number of pixels to shift in the x or y direction
	 */
	factor: 0,

	init:
	function() {
		this.bind("UpdateViewport", function() {
			if (this.factor > 0) {
				var earthquakeX = Math.floor(Math.random()*this.factor);
				var earthquakeY = Math.floor(Math.random()*this.factor);
				var signX = Math.floor(Math.random()*2) == 0 ? -1 : 1;
				var signY = Math.floor(Math.random()*2) == 0 ? -1 : 1;
				earthquakeX *= signX;
				earthquakeY *= signY;
				Crafty.viewport.x += earthquakeX;
				Crafty.viewport.y += earthquakeY;
			}
		});

		this.bind("Quake", function() {
			this.startQuake();
			var quakeViewportHandler = this;
			Crafty("Clock").schedule(function() { quakeViewportHandler.stopQuake(); }, 0.5 /* seconds */);
		});
	},
	
	/**
	 * Begin quake with option first parameter to set the factor by which to quake.
	 */
	startQuake:
	function() {
		if(arguments.length === 1 && typeof arguments[0] === "number") {
			// If parameter supplied, use it and floor to ensure integer
			this.factor = Math.floor(arguments[0]);
		}
		else {
			// default
			this.factor = 4;
		}
	},

	/**
	 * Stop quake by setting the factor to 0.
	 */
	stopQuake:
	function() {
		this.factor = 0;
	}
});
