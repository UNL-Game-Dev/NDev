Crafty.c("Swinging", {
	init:
	function() {
		this.swingingXSpeed = 4;
		this.requires("2D, Physical, Controls");
		this.requires("StateMachine").state("Swinging", {
			EvaluateInertia:
			function() {
				var dx = this._phX - this._phPX;
				var dy = this._phY - this._phPY;
				this._phPX = this._phX;
				this._phPY = this._phY;
				this._phX += dx;
				this._phY += dy;
			},
			
			PrePhysicsTick:
			function() {
				var vx = this._phX - this._phPX;
				var kx = this.getControl("Horizontal");
				vx = approach(vx, kx * this.swingingXSpeed, 0.1);
				this._phX = this._phPX + vx;
			}
		});
	}
});
