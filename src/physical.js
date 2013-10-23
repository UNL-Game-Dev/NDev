
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

		this.currentNormals = [];

		this.bind("EvaluateAccel", function() {
			// Seconds per frame.
			var sPerF = 1.0 / Crafty.timer.getFPS();
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
	}

});

Crafty.c("DefaultPhysicsDraw", {
	init:
	function() {
		this.bind("UpdateDraw", function() {
			this.x = (this._phPX);
			this.y = (this._phPY);
		});
	}
});

Crafty.c("TileConstraint", {
	init:
	function() {
		this.bind("ResolveConstraint", function() {
			this.currentNormals = [];
			// Tiles to collide against.
			var tiles = Crafty("Tile");
			// Try 20 times, since there could only possibly be 20 tiles next
			// to you at once, right?
			for(var i = 20; i >= 0; --i) {
				this.x = this._phX;
				this.y = this._phY;
				var hits = this.hit("Tile");
				if(!hits)
					break;
				var hit = hits[0];
				var norm = hit.normal;
				norm.x *= -hit.overlap;
				norm.y *= -hit.overlap;
				this._phX += norm.x;
				this._phY += norm.y;
				this.currentNormals.push([norm.x, norm.y]);
			}
		});
	}
})

Crafty.c("PhysicsGravity", {
	init:
	function() {
		var that = this;
		this.bind("PrePhysicsTick", function() {
			that._phAY += 280;
		});
	}
});

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

