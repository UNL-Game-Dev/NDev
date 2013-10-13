
Crafty.c("PlatformControls", {

	init:
	function() {
		this.bind("EvaluateAccel", function() {
			var kx =
				(Crafty.keydown[Crafty.keys.RIGHT_ARROW] ? 1 : 0) +
				(Crafty.keydown[Crafty.keys.LEFT_ARROW] ? -1 : 0);
			this._phX = this._phPX + kx * 2.8;
		});
	}

});
