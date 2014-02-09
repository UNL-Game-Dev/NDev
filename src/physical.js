
/**
 * Crafty component that carries out physics ticks in order.
 *
 * This is so that we can have a more controlled sequence that can be relied
 * upon to execute in a specific order.
 */
Crafty.c("PhysicsTicker", {

	init:
	function() {
		this.bind("EnterFrame", function() {
			Crafty.trigger("PrePhysicsTick");
			Crafty.trigger("EvaluateAccel");
			Crafty.trigger("ResolveConstraint");
			Crafty.trigger("EvaluateInertia");
			Crafty.trigger("UpdateDraw");
		});
	}

});

/**
 * Crafty component for being affected by basic tile collision response.
 *
 * This component only evaluates acceleration--other components need to be added
 * for traditional realistic collision response.
 *
 * _phX/Y is the next position of the physical object. This can be set to a
 *        offset from previous position to set velocity or increased from its
 *        current value to accelerate.
 *
 * _phPX/PY is the previous position of the physical object. This can be used
 *          as a basis for setting a new velocity.
 *
 * _phAX/AY can be used to set an acceleration that will be applied upon the
 *          next call to EvaluateAccel. Since this is a platformer, realistic
 *          accelerations probably won't be much use.
 */
Crafty.c("Physical", {

	init: 
	function() {
		this._phX = this._x;
		this._phY = this._y;
		this._phPX = this._phX;
		this._phPY = this._phY;
		this._phAX = 0.0;
		this._phAY = 0.0;

		this.bind("EvaluateAccel", function() {
			// Seconds per frame.
			var sPerF = 1.0 / Crafty.timer.FPS();
			// Apply acceleration to velocity. Since velocity is stored as the
			// difference between the prev frame and the next, apply as
			// p += a * t^2
			this._phX += this._phAX * sPerF * sPerF;
			this._phY += this._phAY * sPerF * sPerF;
			this._phAX = 0.0;
			this._phAY = 0.0;
		});
	},

	setPhysPos:
	function(x, y) {
		this._phX = x;
		this._phY = y;
		this._phPX = x;
		this._phPY = y;
	},
	
	getDX:
	function() {
		return this._phX - this._phPX;
	},
	
	getDY:
	function() {
		return this._phY - this._phPY;
	},
	
	getDisplacement:
	function() {
		return [this.getDX(), this.getDY()];
	}
});

/**
 * A simple physics graphic updater. Updates the entity's x and y coordinates to
 * match the physics coordinates after each physics tick.
 */
Crafty.c("DefaultPhysicsDraw", {
	init:
	function() {
		this.bind("UpdateDraw", function() {
			this.x = (this._phPX);
			this.y = (this._phPY);
		});
	}
});

/**
 * General constraint for responding to physical events including tile collision
 * and platform movement.
 */
Crafty.c("PhysicalConstraint", {
	init:
	function() {
		this.requires("TileConstraint, PlatformConstraint");
	}
});

/**
 * Applies a simple tile constraint on the attached physical entity, forcing it
 * to remain outside of tiles.
 */
Crafty.c("TileConstraint", {
	init:
	function() {
		this.requires("Physical");
		
		this.currentNormals = [];
		this._oneWay = false;

		this.bind("ResolveConstraint", function() {
			this.currentNormals = [];
			
			// Loop through collisions and resolve each.
			this.x = this._phX;
			this.y = this._phY;
			var hits = this.hit("Tile");
			if(hits) {
				var newDisplacement = [ 0, 0 ];
				var oldDisplacement = this.getDisplacement();
				for(var i in hits) {
					var hit = hits[i];
					// Just resolve it lazily, yay verlet integration.
					var norm = scale([hit.normal.x, hit.normal.y], -hit.overlap);
					var ob = hit.obj;
					// See if the collision should be resolved.
					if(!ob.oneway
					|| this._checkOneWayCollision(norm, oldDisplacement)) {
						// Add the component of the normal that is perpendicular to
						// the current displacement.
						newDisplacement = add_perp(newDisplacement, norm);
						// Maintain a "current normals" list in case other components
						// (such as platforming physics) are interested.
						this.currentNormals.push(norm);
					}
				}
				this._phX += newDisplacement[0];
				this._phY += newDisplacement[1];
			}
		});
	},
	
	_checkOneWayCollision:
	function(norm, oldDisplacement) {
		return -norm[1] >= Math.abs(norm[0])
			&& dot(norm, add(norm, oldDisplacement)) <= 1.0;
	}
});

/**
 * Applies a platform constraint on the entity, such that the entity lying on
 * the platform will move with it.
 */
Crafty.c("PlatformConstraint", {
	init:
	function() {
		this.bind("ResolveConstraint", function() {
			this.x = this._phX;
			this.y = this._phY + 1;
			var hits = this.hit("MovingPlatform");
			if(hits) {
				var hit = hits[0];
				var platform = hit.obj;
				this._phX += platform.getDX();
				this._phY += platform.getDY();
			}
		});
	}
});

/**
 * Apply a simple, constant acceleration downwards on the physical entity.
 */
Crafty.c("PhysicsGravity", {
	init:
	function() {
		this.bind("PrePhysicsTick", function() {
			this._phAY += 280;
		});
	}
});

/**
 * Intertia application, as per verlet integration. Kept separate in case
 * "special" objects need to be simulated. (Like player physics.)
 */
Crafty.c("Inertia", {
	init:
	function() {
		this.bind("EvaluateInertia", function() {
			var px = this._phPX;
			var py = this._phPY;
			this._phPX = this._phX;
			this._phPY = this._phY;
			this._phX += this._phX - px;
			this._phY += this._phY - py;
		});
	}
});

/**
 * "Fake" inertia that responds to movement of object but does not continue
 * movement, such as a moving platform.
 */
Crafty.c("FakeInertia", {
	init:
	function() {
		this.bind("EvaluateInertia", function() {
			this._phPX = this._phX;
			this._phPY = this._phY;
		});
	}
});

//---------------------------
// Common physics vector math.
// Assumes vectors in form [x,y]

// Returns the dot product of v1 and v2.
function dot(v1, v2) {
	return v1[0]*v2[0] + v1[1]*v2[1];
}

// Returns the "right" (+rotation in this orientation) normal.
function rNormal(v) {
	return [-v[1], v[0]];
}

// Returns the normalized version of the given vector.
function norm(v) {
	var x = v[0];
	var y = v[1];
	var d = Math.sqrt(x*x + y*y);
	return [x/d, y/d];
}

function dist2(v) {
	var x = v[0];
	var y = v[1];
	return x*x + y*y;
}

function dist(v) {
	return Math.sqrt(dist2(v));
}

// Returns v1 + v2
function add(v1, v2) {
	return [v1[0] + v2[0], v1[1] + v2[1]];
}

// Returns v1 - v2
function sub(v1, v2) {
	return [v1[0] - v2[0], v1[1] - v2[1]];
}

// Returns v * scalar
function scale(v, scalar) {
	return [v[0]*scalar, v[1]*scalar];
}

// Returns v1 + (component of v2 perpendicular to v1)
function add_perp(v1, v2) {
	var result;
	if(dist(v1) > 0) {
		result = sub(add(v1, v2),
			scale(v1, dot(v1, v2) / (dist(v1) * dist(v2))));
	} else {
		result = v2;
	}
	return result;
}

// Returns angle of v w/r to x axis, in degrees
function angle(v) {
	return Math.atan2(-v[1], v[0]) * 180 / Math.PI;
}
