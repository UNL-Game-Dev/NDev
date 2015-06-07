/**
 * Item able to be attached at a certain point on another item.
 */
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
                    self[property] = propertyFn(spriteData, self._attachEntity);
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
