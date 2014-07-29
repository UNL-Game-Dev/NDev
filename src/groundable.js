/**
 * Anything that can sense and stick to the ground.
 */
Crafty.c("Groundable", {
	init:
	function() {
		
		this._grounded = false;
		this._groundStickActive = false;
		this._groundXVel = 0.0;
		
		this.requires("TileConstraint, Sensor");
		
		this.bind("EvaluateAccel", function() {
			var lastGrounded = this._grounded;
			
			this._grounded = this.hitNormal([0,-1]);
			// See if sticking makes sense now, and if it does, do so.
			if(this._groundStickActive && (this._grounded || lastGrounded)) {
				this._groundStick();
			}
			
			if(this._grounded && !lastGrounded) {
				this._groundStickActive = true;
				this.trigger("GroundLand");
			} else if(!this._grounded && lastGrounded) {
				this.trigger("GroundLeave");
			}
		});
	},
	
	isGrounded:
	function() {
		return this._grounded;
	},
	
	isStuckToGround:
	function() {
		return this._groundStickActive;
	},
	
	unstickFromGround:
	function() {
		this._groundStickActive = false;
	},
	
	/**
	 * Keeps the entity moving along a slope, up to 45 degrees either way.
	 */
	_groundStick:
	function() {
		// Here, need a specific order to work.
		// First check to see if the entity can move sideways.
		// If not, check to see how much up is necessary.
		// If so, check to see how much down is necessary.
		
		// Find the xvel first.
		var xvel = Math.abs(this._phX - this._phPX)*2;
		
		if(this.sense("Tile", this._phX, this._phY)) {
			// Entity can't move sideways.
			// Iterate upwards to see if it can stick up.
			for(var y = this._phY; y >= this._phY - xvel; --y) {
				if(!this.sense("Tile", this._phX, y)) {
					// If the entity moves up to y, it can stick!
					// Move the entity to y+1, so that it is still in the ground
					// after sticking.
					this._phY = y + 1;
					this._grounded = true;
					break;
				}
			}
		} else {
			// Entity can move sideways.
			// Iterate downwards to see if the entity can stick down.
			for(var y = this._phY; y <= this._phY + xvel; ++y) {
				if(this.sense("Tile", this._phX, y)) {
					// If the entity moves down to y, they can stick!
					// Move the entity to y+1, so that it is put in the ground
					// after sticking.
					this._phY = y + 1;
					this._grounded = true;
					break;
				}
			}
		}
	}
});
