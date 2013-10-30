
/**
 * Component that controls a physical object in a platformer style. Uses arrow 
 * keys for movement at the moment.
 */
Crafty.c("PlatformControls", {

	init:
	function() {
		this.grounded = false;

		this._sensor = Crafty.e("2D");
		this._sensor.w = this.w - 2;
		// This affects how far down the platforming physics will detect a
		// slope to stick to.
		this._sensor.h = 18;
		this._sensor.addComponent("Collision");
		
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
					var d = dot(n,
						[this._phX - this._phPX, this._phY - this._phPY]);
					// Don't quite fully extract from collision.
					// Want to keep grounded!
					d *= 0.999;
					this._phX -= n[0] * d;
					this._phY -= n[1] * d;
				}
			}

			// Jump if on the ground and want to.
			if(this.grounded && Crafty.keydown[Crafty.keys.UP_ARROW]) {
				this._phY = this._phPY - 5;
				this.grounded = false;
				// Don't try to stick.
				lastGrounded = false;
			}

			// If not grounded, apply gravity.
			if(!this.grounded) {
				this._phAY += 280;
			}

			// If the player has left the ground, try to stick to the ground.
			if(!this.grounded && lastGrounded) {
				this._groundStick();
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

	_groundStick:
	function() {
		// Update position of the ground detector.
		this._sensor.x = this._phX + 1;
		this._sensor.y = this._phY + this.h;
		// Find ground normals beneath the player.
		var sensorHits = this._sensor.hit("Tile");
		// For now, apply the first found sensor hit.
		if(sensorHits.length) {
			var sensorHit = sensorHits[0];
			var n = [sensorHit.normal.x, sensorHit.normal.y];
			if(dot(n, [0,-1]) > 0) {
				// This is a upwards-facing slope, ok!

				// Find the component of current velocity in the direction
				// of the normal.
				var d = dot(n, [this._phX - this._phPX, 0]);
				// Remove that component from the velocity, so that the player
				// slides along this surface.
				this._phX -= n[0] * d;
				this._phY -= n[1] * d;

				console.log("Pulling towards", sensorHit.normal);
			}
		}
	}
});
