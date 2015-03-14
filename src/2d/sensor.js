/**
 * Senses entities at a given offset from the current entity.
 */

Crafty.c("Sensor", {

	init:
	function() {
		// A sensor that coincides with the current entity.
		this._sensor = Crafty.e("2D");
		this._sensor.w = this.w;
		this._sensor.h = this.h;
		this._sensor.addComponent("Collision");
		this.sensorBounds = [0, 0, this.w, this.h];
	},

	sense:
	function(component, x, y, margin, local) {
		margin = margin || 0;
		if(local === undefined) {
			local = true;
		}

		var bounds = this.sensorBounds;
		this._sensor.x = (local ? this.x : 0) + x + bounds[0] - margin;
		this._sensor.y = (local ? this.y : 0) + y - bounds[1] - margin;
		this._sensor.w = bounds[2] - bounds[0] + 2 * margin;
		this._sensor.h = bounds[3] - bounds[1] + 2 * margin;

		var hits = this._sensor.hit(component || "Collision");
		var id = this.getId();
		return hits && _(hits).filter(function(hit) {
			return hit.obj.getId() !== id;
		}).value() || false;
	}
});
