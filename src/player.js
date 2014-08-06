/**
 * Player component.
 * Includes all the base components and animations for a player.
 */

// Default time to recover from being hit, in seconds.
var defaultRecoveryTime = 1.0;

Crafty.c("Player", {
    
	init:
	function() {
		var controls = Crafty("Controls");
		this
		// Base components
			.requires("2D")
			.requires("Canvas")
			.requires("SpriteAnimation")
			.requires("player")
			.requires("Collision")
			.requires("Physical")
			.requires("TileConstraint")
			.requires("PlatformConstraint")
            .requires("HazardResponse")
			.requires("DefaultPhysicsDraw")
			.requires("ScrollTarget")
			.requires("ItemEquip")
			.requires("Controls")
			.requires("PlatformControls")
			.requires("ClimbingControls")
		// Collision bounds
			.collision([11, 0], [21, 0], [21, 32], [11, 32])
			.attr({ sensorBounds: [11, 0, 21, 32] })
		// Load controls
			.loadKeyMapping("assets/controls/player_controls.xml")
		// Bind animations
			.bind("Stand", function() {
				if (!this._setCollisionNormal()) {
					if (this._setCollisionCrouch()) {
						this.trigger("Crouch");
						return;
					}
					this._setCollisionNormal();
				}
				
				// Play stand animation.
				// If landing animation is playing, wait until done.
				var reel = this.reel();
				if(reel !== "PlayerLandLeft" && reel !== "PlayerLandRight") {
					this.animate(this.dxSelect("PlayerStandLeft", "PlayerStandRight"), -1);
				} else {
					this.one("AnimationEnd", function(reel) {
						if(reel.id === "PlayerLandLeft") {
							this.animate("PlayerStandLeft", -1);
						} else if(reel.id === "PlayerLandRight") {
							this.animate("PlayerStandRight", -1);
						}
					});
				}
				this.isCrouching = false;
			})
			.bind("Walk", function(ev) {
				if (!this._setCollisionNormal()) {
					if (this._setCollisionCrouch()) {
						this.trigger("Crawl");
						return;
					}
					this._setCollisionNormal();
				}
				if(this.isGrounded()) {
					this.animate(this.dxSelect("PlayerWalkLeft", "PlayerWalkRight"), -1);
				} else {
					this.animate(this.dxSelect("PlayerFallLeft", "PlayerFallRight"), -1);
				}
				this.isCrouching = false;
			})
			.bind("Jump", function() {
				this._setCollisionNormal();
				this.animate(this.dxSelect("PlayerJumpLeft", "PlayerJumpRight"), 0);
				this.isCrouching = false;
			})
			.bind("Fall", function() {
				this._setCollisionNormal();
				
				// Play fall animation.
				// If jumping animation is playing, wait until done.
				var reel = this.reel();
				if(reel !== "PlayerJumpLeft" && reel !== "PlayerJumpRight") {
					this.animate(this.dxSelect("PlayerFallLeft", "PlayerFallRight"), -1);
				} else {
					this.one("AnimationEnd", function(reel) {
						if(reel.id === "PlayerJumpLeft") {
							this.animate("PlayerFallLeft", -1);
						} else if(reel.id === "PlayerJumpRight") {
							this.animate("PlayerFallRight", -1);
						}
					});
				}
				
				this.isCrouching = false;
			})
			.bind("Land", function() {
				this._setCollisionNormal();
				this.animate(this.dxSelect("PlayerLandLeft", "PlayerLandRight"), 0);
				this.timeout(function() {
					if(this.isGrounded()) {
						this.animate(this.dxSelect("PlayerStandLeft", "PlayerStandRight"), -1);
					}
				}, 500);
				this.isCrouching = false;
			})
			.bind("Crouch", function() {
				this._setCollisionCrouch();
				this.animate(this.dxSelect("PlayerCrouchLeft", "PlayerCrouchRight"), -1);
				this.isCrouching = true;
			})
			.bind("Crawl", function(ev) {
				this._setCollisionCrouch();
				this.animate(this.dxSelect("PlayerCrawlLeft", "PlayerCrawlRight"), -1);
				this.isCrouching = true;
			})
		// Key handler
			.bind("ControlPressed", function(ev) {
				if(ev.control === "equip") {
					this.switchItem();
				} else if(ev.control === "action") {
					this.activateItem({ direction: this._actionDirection() });
				}
			})
			.bind("ControlReleased", function(ev) {
				if(ev.control === "action") {
					this.deactivateItem();
				}
			})
		// Player attributes
			.attr({
				// Time to recover from being hit, in seconds.
				recoveryTime: defaultRecoveryTime,

				// Whether or not player can be hit.
				invincible: false,
			});
        
		this.bind("Hurt", function(hit) {
			if(!this.invincible) {
				this.invincible = true;
				var norm = hit.normal;
				// TODO: Respond to this hazardous collision somehow.
				this.timeout(function() {
					this.invincible = false;
				}, this.recoveryTime * 1000);
			}
		});
		
		this.bind("Crush", this.die);
        
		this.makeScrollTarget();
	},
	
	die:
	function() {
		this._destroyWorkaround();
		Crafty("Clock").schedule(function() {
			Crafty.trigger("SpawnPlayer");
		}, 0.5);
	},
	
	/**
	 * This is a very hackish workaround to a bug in the CraftyJS engine
	 * that causes the game to crash when a sprite animation is destroyed.
	 * When this bug is fixed, get rid of this and replace ._destroyWorkaround
	 * with .destroy().
	 */
	_destroyWorkaround:
	function() {
		this._phX = this.x = NaN;
		this.visible = false;
		this.unbind("EnterFrame")
		    .unbind("PrePhysicsTick")
		    .unbind("EvaluateAccel")
		    .unbind("UpdateCollisions")
		    .unbind("EvaluateHits")
		    .unbind("ResolveConstraint")
		    .unbind("EvaluateInertia")
		    .unbind("UpdateDraw")
		    .unbind("UpdateViewport")
		    .unbind("Stand")
		    .unbind("Walk")
		    .unbind("Jump")
		    .unbind("Fall")
		    .unbind("Land")
		    .unbind("Crouch")
		    .unbind("Crawl")
		    .unbind("ControlPressed")
		    .unbind("ControlReleased")
		    .removeComponent("Player")
			.removeComponent("2D")
			.removeComponent("Canvas")
			.removeComponent("SpriteAnimation")
			.removeComponent("player")
			.removeComponent("Collision")
			.removeComponent("Physical")
			.removeComponent("TileConstraint")
			.removeComponent("PlatformConstraint")
            .removeComponent("HazardResponse")
			.removeComponent("DefaultPhysicsDraw")
			.removeComponent("ScrollTarget")
			.removeComponent("ItemEquip")
			.removeComponent("Controls")
			.removeComponent("PlatformControls")
			.removeComponent("ClimbingControls");
	},
	
	_actionDirection:
	function() {
		var dir = Crafty("Controls").getControl("Direction");
		if(dir[0] == 0 && dir[1] == 0) {
			dir[0] = this.dxSelect(-1, +1);
		}
		return dir;
	},
	
	_setCollisionNormal:
	function() {
		this.collision(new Crafty.polygon([[11,0], [21,0], [21,32], [11,32]]));
		if( this.hitTile() )
			return false;
		return true;
	},
	
	_setCollisionCrouch:
	function() {
		this.collision(new Crafty.polygon([[11,16], [21,16], [21,32], [11,32]]));
		if ( this.hitTile() )
			return false;
		return true;
	}
});
