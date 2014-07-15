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
			console.log("ExamplteItem was deactivated!");
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
		var controls = Crafty("Controls");
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
