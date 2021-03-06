/**
 * Component that controls a physical object in a platformer style.
 *
 * Also fires events indicating standing still, walking, jumping, falling, and
 * landing.
 */
Crafty.c("PlatformState", {

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

	// Object crouch-state
	isCrouching: false,

	init:
	function() {

		this.requires("TileConstraint, Sensor, Groundable, Controls");

		// Direction that we are facing in the x-direction.
		this.dx = +1;

		this._isJumping = false;
		this._forceRemaining = 0;

		// Track whether we have performed the double jump or not
		this._secondJump = false;

		this.invincible = false;

		this.stopInMidAir = true;

		// X position at which to pivot when turning left/right, relative to the player's center.
		this._turnPivot = 0;

		// A strange, non-physical x velocity. (Does not get affected as player
		// goes up and down slopes, like it normally would if phAX/phX used!)
		this._vx = 0;

		// Bind event handlers.
		this.requires("StateMachine").state("Platform", {

			EnterState:
			function() {
				// Ensure walking in the correct direction upon entering this
				// state.
				if(this.dx < 0 && this.keyDown("right")) {
					this.dx = +1;
					this.trigger("Walk");
				}
				else if(this.dx > 0 && this.keyDown("left")) {
					this.dx = -1;
					this.trigger("Walk");
				}
			},

			ControlPressed:
			function(ev) {
				if(ev.control === "left" || ev.control === "right") {
					// Update direction based on which key was pressed.
					if(ev.control === "left") {
						this.dx = -1;
					} else if (ev.control === "right") {
						this.dx = +1;
					}

					if(this.keyDown("down") && this.isGrounded()) {
						this.trigger("Crawl");
					} else {
						this.trigger("Walk");
					}
				} else if(ev.control === "down") {
					if(this.getControl("Horizontal") != 0) {
						this.trigger("Crawl");
					}
					else {
						if (this.isGrounded()) {
							this.trigger("Crouch");
						}
					}
				} else if(ev.control === "jump") {
					if(this.isGrounded() && !this._isJumping) {
						this.trigger("Jump");
						this._jump();
					} else if(!this.isGrounded() && !this._isJumping && !this._secondJump) {
						this.trigger("Jump");
						this._jump();
					}
				} else if(ev.control === "phase") {
					this.attemptPhase = true;
				}
			},

			ControlReleased:
			function(ev) {
				if(ev.control === "left" || ev.control === "right") {
					if(this.keyDown("left")) {
						this.dx = -1;
						if (this.keyDown("down")) {
							this.trigger("Crawl");
						} else {
							this.trigger("Walk");
						}
					} else if(this.keyDown("right")) {
						this.dx = +1;
						if (this.keyDown("down")) {
							this.trigger("Crawl");
						} else {
							this.trigger("Walk");
						}
					} else {
						if(this.isGrounded()) {
							if (this.keyDown("down")) {
								this.trigger("Crouch");
							} else {
								this.trigger("Stand");
							}
						}
					}
				} else if(ev.control === "down") {
					if(this.getControl("Horizontal") != 0) {
						this.trigger("Walk");
					} else {
						if(this.isGrounded()) {
							this.trigger("Stand");
						}
					}
				} else if(ev.control === "jump") {
					this._isJumping = false;
				}
			},

			PrePhysicsTick:
			function() {

				// See if touching ladder. If so, switch to ladder state.
				if((this.dx > 0
				&& this.sense("ClimbableLeft", 5, 0, 0))
				|| (this.dx < 0
				&& this.sense("ClimbableRight", -5, 0, 0))) {
					this.setState("Climb");
					return;
				}

				// The key "x" target difference.
				var kx = this.getControl("Horizontal");

				// Check for pushable objects and push them.
				var pushableRight = this.hitNormal([-1,0], "Pushable");
				var pushableLeft = this.hitNormal([+1,0], "Pushable");
				if(pushableRight) {
					pushableRight.push([+1,0]);
				}
				if(pushableLeft) {
					pushableLeft.push([-1,0]);
				}

				// The longer you hold the jump key, the higher you will go.
				if(this._forceRemaining > 0) {
					this._forceRemaining -= this.keyDown("jump") ? 0.08 : 0.25;
					this._phY = this._phPY - this._forceRemaining - 2;
				}

				var targetSpeed = this.isCrouching ? 0.9 : 2.8;

				// The desired x vel.
				var desvx = kx * targetSpeed;
				// Add to the physics velocity.
				// This depends on the player being in the ground or not.
				if(!this.isGrounded()) {
					// If not, lose a lot of control.
					desvx *= this.airControlFactor;
				}

				var vx = this._vx;

				var avx = Math.abs(vx);
				var adesvx = Math.abs(desvx);

				if(iSign(vx) == iSign(desvx)) {
					// Player's attempting to increase velocity.
					if(adesvx > avx) {
						// If their velocity's greater than the current, let them
						// increase the velocity by a little.
						vx = approach(vx, desvx, this.accelerateDV);
					} else {
						// Don't make them slow down when they're attempting to keep
						// going! (Unless they're crawling).
						if(this.isCrouching) {
							vx = approach(vx, desvx, this.accelerateDV);
						}
					}
				} else if(desvx == 0.0) {
					if(this.stopInMidAir || this.isGrounded()) {
						// Player might want to stop.
						vx = approach(vx, desvx, this.slowToStopDV);
					}
				} else {
					// The player is trying to turn around.
					// This is like "braking" in preparation to accelerate the other
					// direction, so do it a little quicker.
					vx = approach(vx, desvx, this.activeBrakeDV);
				}

				this._phX = this._phPX + vx;

				this._vx = vx;

				// Check if we should stand up
				// This is needed for when the down arrow was released with an obstacle overhead
				if(!this.keyDown("down") && this.isCrouching) {
					if (this.getControl("Horizontal") != 0) {
						this.trigger("Walk");
					} else {
						this.trigger("Stand");
					}
				}
			},

			EvaluateInertia:
			function() {
				if(this.isGrounded()) {
					// If on the ground, use simple weird physics!

					// If player was just about stopped horizontally, reset _vx.
					if(approx(this._phPX, this._phX, 0.01)) {
						this._vx = 0;
					}

					this._phPX = this._phX;
					this._phPY = this._phY;

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

					this._phAY += 580;
				}
			},

			GroundLand:
			function() {
				this._secondJump = false;
				// Trigger jumping, landing, walking, or crouching.
				if(this.keyDown("jump")) {
					this.trigger("Jump");
					this._jump();
				} else {
					if(this.getControl("Horizontal") != 0) {
						if(this.keyDown("down")) {
							this.trigger("Crawl");
						} else {
							this.trigger("Walk");
						}
					} else {
						if(this.keyDown("down")) {
							this.trigger("Crouch");
						} else {
							this.trigger("Land");
						}
						this.trigger("Stand");
					}
				}
			},

			GroundLeave:
			function() {
				// Trigger falling.
				this.trigger("Fall");
			},

			Impulse:
			function(impulse) {
				this._vx += impulse[0];
			}
		});

		this.setState("Platform");
	},

	/**
	 * Select a value based on which direction we are facing, given a left and
	 * right value.
	 */
	dxSelect:
	function(leftValue, rightValue) {
		return this.dx < 0 ? leftValue : rightValue;
	},

	_jump:
	function() {
		if (!this.isGrounded()) {
			this._secondJump = true;
		}

		this._isJumping = true;
		this.timeout(function() {
			this.unstickFromGround();
			this._forceRemaining = 2.0;
		}, 140);
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
