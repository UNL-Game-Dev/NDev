/**
 * Component that controls a physical object in a platformer style. Uses arrow
 * keys for movement at the moment.
 *
 * Also fires events indicating standing still, walking, jumping, falling, and landing.
 */
Crafty.c("PlatformControls", {

	// What factor of normal control the player retains in the air.
	airControlFactor: 0.6,

	// The differences in velocity to apply in certain situations:
	// Accelerating up to max speed.
	accelerateDV: 0.2,
	// Passively slowing down to a stop on the ground.
	slowToStopDV: 0.3,
	// Actively slowing down when turning around.
	activeBrakeDV: 0.5,

	// Time to recover after being hit.
	recoveryTime: 1.0,

	init:
	function() {
		this.grounded = false;
		this.direction = "right";

		// A sensor that is exactly the same as the platforming character.
		this._sensor = Crafty.e("2D");
		this._sensor.w = this.w;
		this._sensor.h = this.h;
		this._sensor.addComponent("Collision");

		this._upHeld = false;
		this._forceRemaining = 0;

		this.invincible = false;

		// Fire walk and stand events.
		this.bind("KeyDown", function(ev) {
			if(ev.keyCode === Crafty.keys.LEFT_ARROW || ev.keyCode === Crafty.keys.RIGHT_ARROW) {
				// Update direction based on which key was pressed.
				if(ev.keyCode === Crafty.keys.LEFT_ARROW) {
					this.direction = "left";
				} else if (ev.keyCode === Crafty.keys.RIGHT_ARROW) {
					this.direction = "right";
				}

				this.trigger("Walk");
			}
			if(ev.keyCode == Crafty.keys.SPACE &&
					Crafty("PickupState").hasPickup("pistol")) {
				var bullet = Crafty.e("Projectile");
				bullet.setPhysPos(this.x, this.y);
				if(this.direction == "left") {
					bullet._phX = bullet._phPX - 10;
				} else {
					bullet._phX = bullet._phPX + 10;
				}
				if(Crafty.keydown[Crafty.keys.UP_ARROW]) {
					bullet._phX = bullet._phPX;
					bullet._phY = bullet._phPY - 10;
				} else if(Crafty.keydown[Crafty.keys.DOWN_ARROW]) {
					bullet._phX = bullet._phPX;
					bullet._phY = bullet._phPY + 10;
				}
			}
		});
		this.bind("KeyUp", function(ev) {
			if(ev.keyCode === Crafty.keys.LEFT_ARROW || ev.keyCode === Crafty.keys.RIGHT_ARROW) {
				if(Crafty.keydown[Crafty.keys.LEFT_ARROW]) {
					this.direction = "left";
					this.trigger("Walk");
				} else if(Crafty.keydown[Crafty.keys.RIGHT_ARROW]) {
					this.direction = "right";
					this.trigger("Walk");
				} else {
					if(this.grounded) {
						this.trigger("Stand");
					}
				}
			}
		});

		// A strange, non-physical x velocity. (Does not get affected as player
		// goes up and down slopes, like it normally would if phAX/phX used!)
		this._vx = 0;

		this.bind("PrePhysicsTick", function() {
			// The key "x" target difference.
			var kx =
				(Crafty.keydown[Crafty.keys.RIGHT_ARROW] ? 1 : 0) +
				(Crafty.keydown[Crafty.keys.LEFT_ARROW] ? -1 : 0);

			var lastGrounded = this.grounded;
			this.grounded = false;
			// Search through all normals for a ground normal.
			for(var i = this.currentNormals.length - 1; i >= 0; --i) {
				var n = norm(this.currentNormals[i]);
				if(dot(n, [0,-1]) > 0) {
					this.grounded = true;
					break;
				}
			}

			if(!this.grounded && lastGrounded) {
				this.trigger("Fall");
			} else if(this.grounded && !lastGrounded) {
				if((Crafty.keydown[Crafty.keys.LEFT_ARROW] && !Crafty.keydown[Crafty.keys.RIGHT_ARROW])
				|| (Crafty.keydown[Crafty.keys.RIGHT_ARROW] && !Crafty.keydown[Crafty.keys.LEFT_ARROW])) {
					this.trigger("Walk");
				} else {
					this.trigger("Land");
				}
			}

			if(!Crafty.keydown[Crafty.keys.UP_ARROW]) {
				this._upHeld = false;
			}
			// Jump if on the ground and want to.
			if(this.grounded && Crafty.keydown[Crafty.keys.UP_ARROW]) {
				this.trigger("Jump");
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

			// The desired x vel.
			var desvx = kx * 2.8;
			// Add to the physics velocity.
			// This depends on the player being in the ground or not.
			if(!this.grounded) {
				// If not, lose a lot of control.
				desvx *= this.airControlFactor;
			}

			var avx = Math.abs(this._vx);
			var adesvx = Math.abs(desvx);

			if(iSign(this._vx) == iSign(desvx)) {
				// Player's attempting to increase velocity.
				if(adesvx > avx) {
					// If their velocity's greater than the current, let them
					// increase the velocity by a little.
					this._vx = approach(this._vx, desvx, this.accelerateDV);
				} else {
					// Don't make them slow down when they're attempting to keep
					// going!
				}
			} else if(desvx == 0.0) {
				// Player might want to stop.
				this._vx = approach(this._vx, desvx, this.slowToStopDV);
			} else {
				// The player is trying to turn around.
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

		}).bind("EvaluateInertia", function() {
			if(this.grounded) {
				// If on the ground, use simple weird physics!

				// If player was just about stopped horizontally, reset _vx.
				if(approx(this._phPX, this._phX, 0.01)) {
					this._vx = 0;
				}

				this._phPX = this._phX;
				this._phPY = this._phY;
				this._phX = this._phX;
				this._phY = this._phY;

				this._phY += 0.01;

			} else {
				// If player was just about stopped vertically, stop jump
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
		this._sensor.y = this._phY;

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
	},

	applyImpulse:
	function(px, py) {
		this._phX = this._phPX + px;
		this._phY = this._phPY + py;
	}
});

function approx(a, b, maxErr) {
	return Math.abs(a - b) <= maxErr;
}

/**
 * Returns a number that's closer to desired, constrained by:
 * old + [-1.0, 1.0] * step
 */
function approach(old, desired, step) {
	if(old + step >= desired && old - step <= desired) {
		// If within step from desired, just return desired.
		return desired;
	}
	if(old < desired)
		return old + step;
	if(old > desired)
		return old - step;
}

/**
 * The integer sign of a number.
 */
function iSign(n) {
	if(n > 0) return 1;
	if(n < 0) return -1;
	return 0;
}
