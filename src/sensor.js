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
		this.sensorBounds = [0, 0, this.w, this.h];
	},
	
	sense:
	function(component, x, y, margin) {
		margin = margin || 0;
		
		var bounds = this.sensorBounds;
		this._sensor.x = x + bounds[0] - margin;
		this._sensor.y = y - bounds[1] - margin;
		this._sensor.w = bounds[2] - bounds[0] + 2 * margin;
		this._sensor.h = bounds[3] - bounds[1] + 2 * margin;
		
		var hits = this._sensor.hit(component || "Collision");
		return hits && _(hits).any(function(hit) {
			return hit.obj.getId() !== this.getId();
		}, this);
	}
});
