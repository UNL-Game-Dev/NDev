
/**
 * Component that controls a physical object in a platformer style. Uses arrow 
 * keys for movement at the moment.
 */
Crafty.c("PlatformControls", {

	init:
	function() {
		this.grounded = false;
		
		this.bind("PrePhysicsTick", function() {
			// The key "x" target difference.
			var kx =
				(Crafty.keydown[Crafty.keys.RIGHT_ARROW] ? 1 : 0) +
				(Crafty.keydown[Crafty.keys.LEFT_ARROW] ? -1 : 0);

			// Set the physics velocity.
			this._phX = this._phPX + kx * 2.8;

			// Track change in groundedness
			var prevGrounded = this.grounded;
			this.grounded = false;
			// Search through all normals for a ground normal.
			for(var i = this.currentNormals.length - 1; i >= 0; --i) {
				if(dot(this.currentNormals[i], [0,-1]) > 0) {
					this.grounded = true;
				}
			}

			// Jump if on the ground and want to.
			if(this.grounded && Crafty.keydown[Crafty.keys.UP_ARROW]) {
				this._phY = this._phPY - 5;
				this.grounded = false;
			}

			if(this.grounded) {
				this._phY = this._phPY + 5;
			}
			if(!this.grounded && prevGrounded) {
			}
		}).bind("EvaluateInertia", function() {
			// If in the air, use normal intertial physics.
			var px = this._phPX;
			var py = this._phPY;
			this._phPX = this._phX;
			this._phPY = this._phY;
			this._phX += this._phX - px;
			this._phY += this._phY - py;
		});
	}

});
