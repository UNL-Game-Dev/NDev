/**
 * Tiles that make things slide.
 */
Crafty.c("Slippery", {

	init:
	function() {
		this
		// Base components
			.requires("2D")
			.requires("Collision")
		// Attributes
			.attr({
				// Factor that determines how slippery the tile is.
				slip: 0.1
			});

		// Sensor for detecting objects resting on top.
		this._sensor = Crafty.e("2D");
		this._sensor.w = this.w;
		this._sensor.h = this.h;
		this._sensor.addComponent("Collision");

		this.bind("EvaluateHits", function() {
			this._sensor.x = this.x;
			this._sensor.y = this.y - 1;
			
			var hit = this._sensor.hit("Player");
			if(hit) {
				Crafty.trigger("Slide", this.slip);
			}
		});
	}
});
