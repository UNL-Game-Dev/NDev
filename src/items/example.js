/**
 * Items are defined in this folder. Item names should end with Item to prevent
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
