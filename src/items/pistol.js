/**
 * Pistol.
 */
Crafty.c("Pistol", {
	init:
	function() {
		this.bind("ItemEquipped", function() {
			console.log("Pistol: I was equipped!");
		});
		this.bind("ItemUnequipped", function() {
			console.log("Pistol: I was unequipped!");
		});
		this.bind("ItemActivated", function() {
			console.log("Pistol: I was activated!");
		});
		this.bind("ItemDeactivated", function() {
			console.log("Pistol: I was deactivated!");
		});
	}
});
