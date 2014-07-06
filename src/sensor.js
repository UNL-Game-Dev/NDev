/**
 * Senses entities at a given offset from the current entity.
 */

Crafty.c("Sensor", {
	
	init:
	function() {
		// A sensor that is exactly the same as the current entity.
		this._sensor = Crafty.e("2D");
		this._sensor.w = this.w;
		this._sensor.h = this.h;
		this._sensor.addComponent("Collision");
	},
	
	sense:
	function(component, x, y, margin) {
		margin = margin || 0;
		this._sensor.w = this.w + margin * 2;
		this._sensor.h = this.h + margin * 2;
		this._sensor.x = x - margin;
		this._sensor.y = y - margin;
		
		return this._sensor.hit(component || "Collision");
	}
});
