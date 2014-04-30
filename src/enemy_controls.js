/**
 * Based on PlatformControls.
 * Controls basic walking enemies.
 */
Crafty.c("EnemyGroundControls", {
	
	airControlFactor: 0.6,
	accelerateDV: 0.2,
	slowToStopDV: 0.3,
	activeBrakeDV: 0.5,
	
	init:
	function() {
		this.grounded = false;
		
		// A sensor that is exactly the same as the platforming character.
		this._sensor = Crafty.e("2D");
		this._sensor.w = this.w;
		this._sensor.h = this.h;
		this._sensor.addComponent("Collision");
		
		this._forceRemaining = 0;
		
		this._vx = 0;
		
		this.bind("PrePhysicsTick", function() {
			
			this.target = Crafty("Player");
			
			// The desired x direction.
			var kx = (this.target.x > this.x ? 1 : 0) + (this.target.x < this.x ? -1 : 0);
			
			var lastGrounded = this.grounded;
			this.grounded = false;
			// Search through all normals for a ground normal.
			for(var i = this.currentNormals.length - 1; i >= 0; --i) {
				var n = normalize(this.currentNormals[i]);
				if(dot(n, [0,-1]) > 0) {
					this.grounded = true;
					break;
				}
			}
			
			/*
			// Saving this for when enemies have animations.
			if(!this.grounded && lastGrounded) {
				this.trigger("Fall");
			} else if(this.grounded && !lastGrounded) {
				if(kx != 0) {
					this.trigger("Walk");
				} else {
					this.trigger("Land");
				}
			}
			*/
			
			// Jump if on the ground and not moving.
			if(this._vx == 0 && this.grounded) {
				//this.trigger("Jump");
				this.grounded = false;
				// Don't try to stick.
				lastGrounded = false;
				this._forceRemaining = 2.0;
			}
			if(this._forceRemaining > 0) {
				this._forceRemaining -= 0.08;
				this._phY = this._phPY - this._forceRemaining - 2;
			}
			
			// The desired x vel.
			var desvx = kx * 2.0;
			// Add to the physics velocity.
			// This depends on being in the ground or not.
			if(!this.grounded) {
				// If not, lose a lot of control.
				desvx *= this.airControlFactor;
			}
			
			var avx = Math.abs(this._vx);
			var adesvx = Math.abs(desvx);
			
			if(iSign(this._vx) == iSign(desvx)) {
				// attempting to increase velocity.
				if(adesvx > avx) {
					// If their velocity's greater than the current, let them
					// increase the velocity by a little.
					this._vx = approach(this._vx, desvx, this.accelerateDV);
				} else {
					// Don't make them slow down when they're attempting to keep
					// going!
				}
			} else if(desvx == 0.0) {
				// enemy might want to stop.
				this._vx = approach(this._vx, desvx, this.slowToStopDV);
			} else {
				// Trying to turn around.
				// This is like "braking" in preparation to accelerate the other
				// direction, so do it a little quicker.
				this._vx = approach(this._vx, desvx, this.activeBrakeDV);
			}
			
			this._phX = this._phPX + this._vx;
			
			// See if sticking makes sense now, and if it does, do so.
			if(this.grounded || lastGrounded) {
				this._groundStick();
			}
			
			// If not grounded, apply gravity.
			if(!this.grounded) {
				this._phAY += 580;
			}
			
		});

		this.bind("EvaluateInertia", function() {
			if(this.grounded) {
				// If on the ground, use simple weird physics!
				
				// If just about stopped horizontally, reset _vx.
				if(approx(this._phPX, this._phX, 0.01)) {
					this._vx = 0;
				}
				
				this._phPX = this._phX;
				this._phPY = this._phY;
				this._phX = this._phX;
				this._phY = this._phY;
				
				this._phY += 0.01;
			} else {
				// If just about stopped vertically, stop jump
				// prematurely if there was a jump in progress.
				if(approx(this._phPY, this._phY, 0.1)) {
					this._forceRemaining = 0.0;
				}
				
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
	 * Keeps the enemy moving along a slope, up to 45 degrees either way.
	 */
	_groundStick:
	function() {
		// Here, need a specific order to work.
		// First check to see if the enemy can move sideways.
		// If not, check to see how much up is necessary.
		// If so, check to see how much down is necessary.
		
		// Find the xvel first.
		var xvel = Math.abs(this._phX - this._phPX)*2;
		
		// Use the sensor because changing this.x/y updates graphics.
		this._sensor.x = this._phX;
		this._sensor.y = this._phY;
		
		if(this._sensor.hit("Tile")) {
			// Enemy can't move sideways.
			// Iterate upwards to see if the enemy can stick up.
			for(var y = this._sensor.y; y >= this._phY - xvel; --y) {
				this._sensor.y = y;
				if(!this._sensor.hit("Tile")) {
					// If the enemy moves up to y, they can stick!
					// Move the enemy to y+1, so that the enemy is
					// still in the ground after sticking.
					this._phY = this._sensor.y + 1;
					this.grounded = true;
					break;
				}
			}
		} else {
			// Enemy can move sideways.
			// Iterate downwards to see if the enemy can stick down.
			for(var y = this._sensor.y; y <= this._phY + xvel; ++y) {
				this._sensor.y = y;
				if(this._sensor.hit("Tile")) {
					// If the enemy moves down to y, they can stick!
					// Move the enemy to y+1, so that the enemy is
					// put in the ground after sticking.
					this._phY = this._sensor.y + 1;
					this.grounded = true;
					break;
				}
			}
		}
	}
});

/**
 * Controls basic flying enemies.
 */
Crafty.c("EnemyAirControls", {
	
	vx: 0.0,		// x velocity
	vy: 0.0,		// y velocity
	acc: 0.1,		// rate at which vx and vy change
	maxSpeed: 2.0,	// hard limit on vx and vy
	
	init:
	function() {
		
		this.requires("Inertia");
		
		this.bind("PrePhysicsTick", function() {
			
			this.target = Crafty("Player");
			
			// This should all be improved...
			var dx = this.target.x - this.x;
			var dy = this.target.y - this.y;
			if(dx != 0 && dy != 0) {
				var dist = Math.sqrt(dx * dx + dy * dy);
				this.vx += this.acc * dx / dist;
				this.vy += this.acc * dy / dist;
				if(this.vx > this.maxSpeed) {
					this.vx = this.maxSpeed;
				} else if(this.vx < -this.maxSpeed) {
					this.vx = -this.maxSpeed;
				}
				if(this.vy > this.maxSpeed) {
					this.vy = this.maxSpeed;
				} else if(this.vy < -this.maxSpeed) {
					this.vy = -this.maxSpeed;
				}
				if(this._phX == this._phPX) {
					this.vx *= 0.1;
				}
				if(this._phY == this._phPY) {
					this.vy *= 0.1;
				}
			}
			
			// Set x and y speed.
			this._phX = this._phPX + this.vx;
			this._phY = this._phPY + this.vy;
		});
	}
 });
