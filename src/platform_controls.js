
Crafty.c("PlatformControls", {

	init:
	function() {
		this.bind("EvaluateAccel", function() {
			var kx =
				(Crafty.keydown[Crafty.keys.RIGHT_ARROW] ? 1 : 0) +
				(Crafty.keydown[Crafty.keys.LEFT_ARROW] ? -1 : 0);
			this._phX = this._phPX + kx * 2.8;

			var grounded = false;
			for(var i = this.currentNormals.length - 1; i >= 0; --i) {
				if(dot(this.currentNormals[i], [0,-1]) > 0) {
					grounded = true;
				}
			}

			if(grounded && Crafty.keydown[Crafty.keys.UP_ARROW]) {
				this._phY = this._phPY - 5;
			}
		});
	}

});
