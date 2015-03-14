/**
 * Items are defined in this file. Item names should end with Item to prevent
 * naming conflicts (e.g. Dynamite vs. DynamiteItem).
 */

/**
 * Example item.
 */
Crafty.c('ExampleItem', {

	init:
	function() {
		this.requires('2D');
		this.bind('ItemEquip', function() {
			console.log('ExampleItem was equipped!');
		});
		this.bind('ItemUnequip', function() {
			console.log('ExampleItem was unequipped!');
		});
		this.bind('ItemActivate', function() {
			console.log('ExampleItem was activated!');
		});
		this.bind('ItemDeactivate', function() {
			console.log('ExampleItem was deactivated!');
		});
	}
});

/**
 * Dynamite item.
 */
Crafty.c('DynamiteItem', {

	init:
	function() {
		this.requires('2D, Attachable');
		this.bind('ItemAttach', function(data) {
			var owner = data.owner;
			this.attachTo(owner, 'hand.R');
		});
		this.bind('ItemActivate', function(data) {
			var dynamite = Crafty.e('Dynamite');
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
Crafty.c('PistolItem', {

	init:
	function() {
		this.requires('2D, Canvas, Sprite, Attachable, SpriteData').setSprite('pistol');

		this.bind('ItemAttach', function(data) {
			var owner = data.owner;
			this.attachTo(owner, 'hand.R', {
				visible: function(data) { return !!data; },
				rotation: getOrientationAngle,
				flipped: function() { return owner.dxSelect(true, false); }
			});
			this.attached = false;
		});

		this.bind('ItemEquip', function() {
			this.attached = true;
		});

		this.bind('ItemUnequip', function() {
			this.attached = false;
		});

		this.bind('ItemActivate', function(data) {
			var bullet = Crafty.e('Projectile');
			bullet.setPhysPos(this.x - bullet.w / 2, this.y - bullet.h / 2);
			bullet._phX = bullet._phPX + data.params.direction[0] * 10;
			bullet._phY = bullet._phPY + data.params.direction[1] * 10;
		});
	}
});

/**
 * Harpoon item.
 */
Crafty.c('HarpoonItem', {
	init:
	function() {
		this.requires('2D, Canvas, Sprite, Tween, SpriteData, Attachable').setSprite('harpoon');

		this.visible = false;

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

		// The entity using the harpoon.
		this._owner = null;

		// Whether or not the harpoon is being fired or attached to something.
		this._active = false;

		// Whether or not the harpoon is attached to something.
		this._attached = false;

		// Time for the harpoon to reel in.
		this._reelTime = 0.3;

		var thickness = 2;

		// The line entity.
		this._line = Crafty.e('2D, Canvas, Color, Collision, Attachable')
			.attr({
				x: this.x,
				y: this.y - thickness / 2,
				w: 0,
				h: thickness,
				z: 100
			})
			.color('#000000')
			.origin(0, thickness / 2)
			.attachTo(this, 'tip');

		this.bind('ItemAttach', function(data) {
			this._owner = data.owner.addComponent('DistanceConstraint');
			var owner = this._owner;
			this.attachTo(this._owner, 'hand.R', {
				visible: function(data) { return !!data; },
				rotation: _.constant(0),
				flipped: function() { return owner.dxSelect(true, false); }
			});
			this.attached = false;
		});
		this.bind('ItemActivate', function(data) {
			if(this._active) {
				if(this._attached) {
					var distance = dist(this._owner.getRelativePosition());
					if(distance < this._thresholdLength) {
						this.deactivate();
					} else {
						this.reel();
					}
				}
			} else if(this.visible) {
				this.fire(data.params.direction);
			}
		});
		this.bind('ItemEquip', function() {
			this.attached = true;
			this.visible = true;
		});
		this.bind('ItemUnequip', function() {
			this.attached = false;
			this.deactivate();
		});
		this.bind('EnterFrame', function() {
			this._line.visible = this._active;
			if(this._active) {
				if(this._attached) {
					// Update the length of the distance constraint to match the
					// length of the line, and offset by the tip position.
					this._owner.distanceConstraint(null, this._length);

					// Orient the harpoon line towards the target position.
					var relPos = this._owner.getRelativePosition();
					relPos = [Math.round(relPos[0]), Math.round(relPos[1])];

					this._line.attr({
						rotation: Math.atan2(relPos[1], relPos[0]) * 180 / Math.PI,
						w: dist(relPos)
					});

					if(this._reeling) {
						if(this._owner.hitNormal(scale(relPos, -1))) {
							this.deactivate();
						}
					}
				} else {
					this._line.attr({ w: this._length });

					var hits = this._line.hit('Tile');
					if(hits) {
						this.cancelTween('_length');

						while(this._line.hit('Tile') && this._line.w > 10) {
							this._line.w--;
						}
						this._length = this._line.w;


						// Attach owner to object when object is hit.
						var target = hits[0].obj;
						var harpoonPos = [
							this.x + this._length * this._direction[0],
							this.y + this._length * this._direction[1]
						];
						var targetOffset = sub(
							harpoonPos,
							[target.x, target.y]);

						this._owner.distanceConstraint(
							target,
							this._length,
							'tip',
							targetOffset,
							this);

						this.attr({ _attached: true });

						this._owner.trigger('HarpoonAttached');
					}
					if(this._length >= this._maxLength) {
						// Deactivate when harpoon line reaches full extent and
						// nothing is hit.
						this.deactivate();
					}
				}
			}
		});
	},

	/**
	 * Fire the harpoon gun.
	 */
	fire:
	function(dir) {

		var time = this._maxLength / this._speed * 1000;

		this._direction = dir || this._direction;
		this._line.attr({
			rotation: Math.atan2(dir[1], dir[0]) * 180 / Math.PI
		});
		this.attr({ _length: 0, _active: true, _attached: false })
			.tween({ _length: this._maxLength }, time);

		this.animate('fire');
		this.one('AnimationEnd', function(data) {
			if(data.id === 'fire') {
				this.animate('idle');
			}
		});

		return this;
	},

	/**
	 * Reel in the harpoon, drawing the owner towards the target entity.
	 */
	reel:
	function() {
		this.attr({ _reeling: true });
		this.tween({ _length: this._minLength }, this._reelTime * 1000);
		this.timeout(function() { this._reeling = false; }, this._reelTime * 1000);

		return this;
	},

	/**
	 * Deactivate the harpoon and unattach it from everything.
	 */
	deactivate:
	function() {
		this._owner.cancelDistanceConstraint();
		this._owner.trigger('HarpoonUnattached');
		this.cancelTween('_length');
		this.attr({
			_length: 0,
			_active: false,
			_attached: false,
			_reeling: false
		});

		return this;
	}
});

Crafty.c('Attachable', {
	init:
	function() {
		var self = this;
		self._attachEntity = null;
		self._attachPoint = null;
		self._attachProperties = {};
		self.attached = false;

		self.bind('EnterFrame', function() {

			if(!self.attached || !self._attachEntity) {
				self.visible = false;
				return;
			}

			var spriteData = self._attachEntity.getSpriteData(self._attachPoint);
			_(self._attachProperties).each(function(propertyFn, property) {
				self[property] = propertyFn(spriteData);
			});
			if(self.flipped) {
				this.flip('X');
			} else {
				this.unflip('X');
			}
			var offset = self._attachPoint && self._attachEntity.getVector(self._attachPoint) || [0, 0];
			var offsetZ = spriteData && spriteData.z || 0;
			var origin = self._getOrigin();
			var target = sub(add([self._attachEntity.x, self._attachEntity.y], offset), origin);
			self.x = target[0];
			self.y = target[1];
			// The abs is just a temp workaround for now. If we put the weapon behind the player, all the other stuff gets
			// "parented" to it and whirls around. Probably a Crafty bug.
			self.z = self._attachEntity.z + Math.abs(offsetZ);
		});
	},

	/**
	 * Attach the entity to a certain point on another entity.
	 */
	attachTo:
	function(ent, point, attachProperties) {
		this._attachEntity = ent || null;
		this._attachPoint = point || null;
		this._attachProperties = attachProperties || {};
		this.attached = true;

		return this;
	},

	_getOrigin:
	function() {
		var origin = this.has('SpriteData') && this.getVector('origin') || [0, 0];
		if(this.flipped) {
			origin[0] = this.w - origin[0];
		}
		origin = rotate(origin, this.rotation);
		return origin;
	}
});

function rotate(pt, angle) {
	var result = [
		pt[0] * Math.cos(angle * Math.PI / 180) - pt[1] * Math.sin(angle * Math.PI / 180),
		pt[0] * Math.sin(angle * Math.PI / 180) + pt[1] * Math.cos(angle * Math.PI / 180)
	];

	return result;
}

function getOrientationAngle(data) {
	var angles = {
		r: {
			n: -90,
			ne: -45,
			e: 0,
			se: 45,
			s: 90,
			sw: 135,
			w: 180,
			nw: -135
		},
		l: {
			n: 90,
			ne: 135,
			e: 180,
			se: -135,
			s: -90,
			sw: -45,
			w: 0,
			nw: 45
		}
	};
	var result = data ? angles[data.facing][data.orientation] : 0;
	return result;
}
