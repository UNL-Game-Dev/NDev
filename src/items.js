/**
 * Items are defined in this file. Item names should end with Item to prevent
 * naming conflicts (e.g. Dynamite vs. DynamiteItem).
 */

/**
 * Example item.
 */
Crafty.c("ExampleItem", {
	
	init:
	function() {
		this.requires("2D");
		this.bind("ItemEquip", function() {
			console.log("ExampleItem was equipped!");
		});
		this.bind("ItemUnequip", function() {
			console.log("ExampleItem was unequipped!");
		});
		this.bind("ItemActivate", function() {
			console.log("ExampleItem was activated!");
		});
		this.bind("ItemDeactivate", function() {
			console.log("ExampleItem was deactivated!");
		});
	}
});

/**
 * Dynamite item.
 */
Crafty.c("DynamiteItem", {
	
	init:
	function() {
		this.requires("2D");
		this.bind("ItemActivate", function(data) {
			var dynamite = Crafty.e("Dynamite");
			dynamite.setPhysPos(
				this.x - dynamite.w / 2,
				this.y - dynamite.h / 2);
			dynamite.ignite();
			
			dynamite._phX = dynamite._phPX + data.params.direction[0] * 3;
			dynamite._phY = dynamite._phPY + data.params.direction[1] * 3;
		});
	}
});

/**
 * Pistol item.
 */
Crafty.c("PistolItem", {
	
	init:
	function() {
		this.requires("2D");
		this.bind("ItemActivate", function(data) {
			var bullet = Crafty.e("Projectile");
			bullet.setPhysPos(
				this.x - bullet.w / 2,
				this.y - bullet.h / 2);

			bullet._phX = bullet._phPX + data.params.direction[0] * 10;
			bullet._phY = bullet._phPY + data.params.direction[1] * 10;
		});
	}
});

/**
 * Harpoon item.
 */
Crafty.c("HarpoonItem", {
	init:
	function() {
		this.requires("2D, Tween");
		
		// The maximum length of the harpoon line.
		this._maxLength = 128;
		this._minLength = 24;
		this._thresholdLength = 32;
		
		// The firing direction.
		this._direction = [1, 0];
		
		// The current line length.
		this._length = 0;
		
		// The shooting speed of the line, in pixels/sec.
		this._speed = 512;
		
		this._owner = null;
		
		this._active = false;
		
		this._attached = false;
		
		this._reelTime = 0.3;
		
		// The line entity.
		var self = this;
		this._line = Crafty.e("2D, Canvas, Color, Collision")
			.attr({
				x: this.x,
				y: this.y - 3,
				w: 10,
				h: 6,
				z: 100
			})
			.color("#000000")
			.origin(0, 3);
		this.attach(this._line);
		
		this.bind("ItemAttach", function(data) {
			this._owner = data.owner.addComponent("DistanceConstraint");
		});
		this.bind("ItemActivate", function(data) {
			if(this._active) {
				if(this._attached) {
					var distance = this._owner.distanceConstraint().actualDistance;
					if(distance < this._thresholdLength) {
						this.deactivate();
					} else {
						this.reel();
					}
				}
			} else {
				this.fire(data.params.direction);
			}
		});
		this.bind("EnterFrame", function() { this._onEnterFrame(); });
	},
	
	fire:
	function(dir) {
		var time = this._maxLength / this._speed * 1000;

		this._direction = dir || this._direction;
		this._line.attr({
			rotation: Math.atan2(dir[1], dir[0]) * 180 / Math.PI
		});
		this.attr({ _length: 0, _active: true, _attached: false })
			.tween({ _length: this._maxLength }, time);
	},
	
	reel:
	function() {
		this.tween({ _length: this._minLength }, this._reelTime * 1000);
	},
	
	deactivate:
	function() {
		this._owner.cancelDistanceConstraint();
		this.cancelTween("_length");
		this.attr({ _length: 0, _active: false, _attached: false });
	},
	
	_onEnterFrame:
	function() {
		this._line.visible = this._active;
		if(this._active) {
			if(this._attached) {
				// Update the length of the distance constraint to match the
				// length of the line.
				this._owner.distanceConstraint(null, this._length);
				
				// Orient the harpoon line towards the target position.
				var constraint = this._owner.distanceConstraint();
				var relPos = sub(constraint.targetPos, constraint.myPos);
				
				this._line.attr({
					rotation: Math.atan2(relPos[1], relPos[0]) * 180 / Math.PI,
					w: constraint.actualDistance
				});
			} else {
				this._line.attr({ w: this._length });
				
				var hits = this._line.hit("Tile");
				if(hits) {
					
					while(this._line.hit("Tile")) {
						this._line.w--;
						console.log(this._line.w);
					}
					this._length = this._line.w;
					
					// Attach owner to object when object is hit.
					var target = hits[0].obj;
					var harpoonPos = [
						this.x + this._length * this._direction[0],
						this.y + this._length * this._direction[1]
					];
					var myOffset = sub(
						[this.x, this.y],
						[this._owner.x, this._owner.y]);
					var targetOffset = sub(harpoonPos, [target.x, target.y]);
					
					this._owner.distanceConstraint(
						target,
						this._length,
						myOffset,
						targetOffset);

					this.attr({ _attached: true });
				}
				if(this._length >= this._maxLength && !this._attached) {
					// Deactivate when harpoon line reaches full extent and nothing
					// is hit.
					this.deactivate();
				}
			}
		}
	}
});
