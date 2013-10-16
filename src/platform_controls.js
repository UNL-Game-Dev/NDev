
/**
 * Component that controls a physical object in a platformer style. Uses arrow 
 * keys for movement at the moment.
 */
Crafty.c("PlatformControls", {

	init:
	function() {
		this.bind("EvaluateAccel", function() {
			// The key "x" target difference.
			var kx =
				(Crafty.keydown[Crafty.keys.RIGHT_ARROW] ? 1 : 0) +
				(Crafty.keydown[Crafty.keys.LEFT_ARROW] ? -1 : 0);

			// Set the physics velocity.
			this._phX = this._phPX + kx * 2.8;

			// Keep track if a ground normal was found.
			var grounded = false;
			// Search through all normals for a ground normal.
			for(var i = this.currentNormals.length - 1; i >= 0; --i) {
				if(dot(this.currentNormals[i], [0,-1]) > 0) {
					grounded = true;
				}
			}
			
			// Jump if on the ground and want to.
			if(grounded && Crafty.keydown[Crafty.keys.UP_ARROW]) {
				this._phY = this._phPY - 5;
			}
		});
	}

});
