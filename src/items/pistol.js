/**
 * Pistol item.
 */
Crafty.c('PistolItem', {
    init: function() {
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
            var muzzleFlash = Crafty.e('2D, Canvas, Sprite, Attachable, SpriteAnimation, SpriteData, flashes, Delay');
            muzzleFlash.attachTo(this, 'tip', {
                flipped: function (data, parent) { return parent.flipped; },
                rotation: function (data, parent) { return parent.rotation; }
            });
            muzzleFlash.animate('muzzleFlash');
            muzzleFlash.delay(this.destroy, 250);
        });
    }
});
