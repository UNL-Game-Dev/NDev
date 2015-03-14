/**
 * Light beam.
 * A thin beam of light emanating from one object and activating other objects.
 */
Crafty.c("LightBeam", {
	// Speed of the beam, in pixels/frame.
	travelSpeed: 24,
	
	init:
	function() {
		this.requires("2D, DOM, lightBeam, Collision, Tween")
			.origin(this.w / 2, 0)
			.attr({
				z: 99,
				h: 0,
				visible: false,
				_on: false,
				_hit: false,
				_initialPos: { x: this.x, y: this.y, w: this.w, h: 0, alpha: 1.0 }
			})
			.collision(new Crafty.polygon([
				[ this.w * 0.375, this.h * 0.000 ],
				[ this.w * 0.625, this.h * 0.000 ],
				[ this.w * 0.625, this.h * 1.000 ],
				[ this.w * 0.375, this.h * 1.000 ]
			]))
			.bind("EnterFrame", function() {
				if(this._on) {
					if(!this._hit) {
						this.h += this.travelSpeed;
					}
				}
			})
			.bind("Move", function() {
				this._initialPos = { x: this.x, y: this.y, w: this.w, h: 0, alpha: 1.0 };
			})
			.onHit("Tile", function(hits) {
				var obj = hits[0].obj;
				this._hit = true;
				if(obj.__c["LightCrystal"]) {
					obj.turnOn();
				}
			}, function() {
				this._hit = false;
			});
	},
	
	turnOn:
	function() {
		if(!this._on) {
			this._on = true;
			this.visible = true;
			this._initialPos = { x: this.x, y: this.y, w: this.w, h: 0, alpha: 1.0 };
		}
	},
	
	turnOff:
	function() {
		if(this._on) {
			this._on = false;
			this.tween({ w: 0, x: this.x - this.w / 2 }, 120)
				.one("TweenEnd", function() {
					this.visible = false;
					this.attr(this._initialPos);
				});
		}
	}
});