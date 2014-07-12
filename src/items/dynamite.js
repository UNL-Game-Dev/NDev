/**
 * Dynamite item.
 */
Crafty.c("Dynamite", {
	init:
	function() {
		this.bind("ItemEquipped", function() {
			console.log("Dynamite: I was equipped!");
		});
		this.bind("ItemUnequipped", function() {
			console.log("Dynamite: I was unequipped!");
		});
		this.bind("ItemActivated", function() {
			console.log("Dynamite: I was activated!");
		});
		this.bind("ItemDeactivated", function() {
			console.log("Dynamite: I was deactivated!");
		});
	}
});
