
/**
 * Component that controls a physical object in a platformer style. Uses arrow 
 * keys for movement at the moment.
 */
Crafty.c("PlatformControls", {

	init:
	function() {
		this.grounded = false;

		// A sensor that is exactly the same as the platforming character.
		this._sensor = Crafty.e("2D");
		this._sensor.w = this.w;
		this._sensor.h = this.h;
		this._sensor.addComponent("Collision");

		this._upHeld = false;
		this._forceRemaining = 0;
		
		this.bind("PrePhysicsTick", function() {
			// The key "x" target difference.
			var kx =
				(Crafty.keydown[Crafty.keys.RIGHT_ARROW] ? 1 : 0) +
				(Crafty.keydown[Crafty.keys.LEFT_ARROW] ? -1 : 0);

			// Set the physics velocity.
			this._phX = this._phPX + kx * 2.8;

			var lastGrounded = this.grounded;
			this.grounded = false;
			// Search through all normals for a ground normal.
			for(var i = this.currentNormals.length - 1; i >= 0; --i) {
				var n = norm(this.currentNormals[i]);
				if(dot(n, [0,-1]) > 0) {
					this.grounded = true;
				}
			}

			if(!Crafty.keydown[Crafty.keys.UP_ARROW]) {
				this._upHeld = false;
			}
			// Jump if on the ground and want to.
			if(this.grounded && Crafty.keydown[Crafty.keys.UP_ARROW]) {
				this.grounded = false;
				// Don't try to stick.
				lastGrounded = false;
				this._upHeld = true;
				this._forceRemaining = 2.0;
			}
			if(this._upHeld &&
					Crafty.keydown[Crafty.keys.UP_ARROW] &&
					this._forceRemaining > 0) {
				this._forceRemaining -= 0.08;
				this._phY = this._phPY - this._forceRemaining - 2;
			}

			// See if sticking makes sense now, and if it does, do so.
			if(this.grounded || lastGrounded) {
				this._groundStick();
			}

			// If not grounded, apply gravity.
			if(!this.grounded) {
				this._phAY += 580;
			}

		}).bind("EvaluateInertia", function() {
			if(this.grounded) {
				// If on the ground, use simple weird physics!
				this._phPX = this._phX;
				this._phPY = this._phY;
				this._phX = this._phX;
				this._phY = this._phY;

				this._phY += 0.01;
				
			} else {
				// If in the air, use normal inertial physics.
				var px = this._phPX;
				var py = this._phPY;
				this._phPX = this._phX;
				this._phPY = this._phY;
				this._phX += this._phX - px;
				this._phY += this._phY - py;
			}
		});
	},

	/**
	 * Keeps the player moving along a slope, up to 45 degrees either way.
	 */
	_groundStick:
	function() {
		// Here, need a specific order to work.
		// First check to see if the player can move sideways.
		// If not, check to see how much up is necessary.
		// If so, check to see how much down is necessary.
		
		// Find the xvel first.
		var xvel = Math.abs(this._phX - this._phPX)*2;

		// Use the sensor because changing this.x/y updates graphics.
		this._sensor.x = this._phX;

		if(this._sensor.hit("Tile")) {
			// Player can't move sideways.
			// Iterate upwards to see if the player can stick up.
			for(var y = this._sensor.y; y >= this._phY - xvel; --y) {
				this._sensor.y = y;
				if(!this._sensor.hit("Tile")) {
					// If the player moves up to y, they can stick!
					// Move the player to y+1, so that the player is
					// still in the ground after sticking.
					this._phY = this._sensor.y + 1;
					this.grounded = true;
					break;
				}
			}
		} else {
			// Player can move sideways.
			// Iterate downwards to see if the player can stick down.
			for(var y = this._sensor.y; y <= this._phY + xvel; ++y) {
				this._sensor.y = y;
				if(this._sensor.hit("Tile")) {
					// If the player moves down to y, they can stick!
					// Move the player to y+1, so that the player is
					// put in the ground after sticking.
					this._phY = this._sensor.y + 1;
					this.grounded = true;
					break;
				}
			}
		}
	}
});
