/**
 * Component for loading sprite and animation data from an XML file.
 */

Crafty.c("SpriteLoader", {
	init:
	function() {
		this._spriteAnimDict = {};
	},
	
	/**
	 * Load sprite and animation data from a given file path.
	 */
	load:
	function(filename) {
		var that = this;
		$.ajax({
			type: "GET",
			url: filename,
			success: function (data) {
				
				data = $(data).children("spritesData");
				
				// Get the base URL and file extension for resolving sources.
				that._baseUrl = data.children("baseUrl").text().trim();
				that._fileExtension = data.children("fileExtension").text()
					.trim();
				that._currDirectory = getDirectory(filename);
				
				// Load each sprite sheet.
				data.children("spriteSheet").each(function(index,
														spriteSheetElement) {
					that._loadSpriteSheet(spriteSheetElement);
				});
			}
		});
		
		/**
		 * When new sprite entities are created, load their respective
		 * animations.
		 */
		Crafty.bind("NewEntity", function(data) {
			var ent = Crafty(data.id);
			if(!ent.has("Sprite") || !ent.has("SpriteAnimation")) {
				return;
			}
			
			that._defineAnimations(ent);
		});
	},
	
	/**
	 * Define the associated animations for a given entity.
	 */
	_defineAnimations:
	function(ent) {
		for(var sprite in this._spriteAnimDict) {
			if(ent.has(sprite)) {
				ent.addComponent("SpriteAnimation");
				var animDict = this._spriteAnimDict[sprite];
				for(var name in animDict) {
					var anim = animDict[name];
					if(anim.frames) {
						ent.reel(name, anim.duration, anim.frames);
					} else {
						ent.reel(name, anim.duration, anim.from[0],
								 anim.from[1], anim.frameCount);
					}
				}
			}
		}
	},
	
	/**
	 * Load a sprite sheet from its XML definition.
	 */
	_loadSpriteSheet:
	function(spriteSheetElement) {
		var that = this;
		spriteSheetElement = $(spriteSheetElement);
		var src = spriteSheetElement.attr("src");
		var tileSize = spriteSheetElement.children("tileSize").text().trim();
		var tilePadding = spriteSheetElement.children("tilePadding").text()
			.trim();
		var paddingAroundBorder = spriteSheetElement
			.children("paddingAroundBorder").text().trim();

		if(!src) {
			throw "Sprite sheet src attribute missing";
		}

		// Get tile dimensions.
		var tileWidth = 1, tileHeight = 1;
		if(tileSize) {
			var tileSize = tileSize.split(" ");
			if(tileSize.length === 1) {
				tileWidth = tileHeight = parseInt(tileSize[0]);
			} else if(tileSize.length === 2) {
				tileWidth = parseInt(tileSize[0]);
				tileHeight = parseInt(tileSize[1]);
			}
		}

		// Get tile padding.
		var paddingX = 0, paddingY = 0;
		if(tilePadding) {
			tilePadding = tilePadding.split(" ");
			if(tilePadding.length === 1) {
				paddingX = paddingY = parseInt(tilePadding[0]);
			} else if(tilePadding.length === 2) {
				paddingX = parseInt(tilePadding[0]);
				paddingY = parseInt(tilePadding[1]);
			}
		}
		paddingAroundBorder = (paddingAroundBorder === "true");

		// Load sprites.
		var spriteDict = {};
		spriteSheetElement.children("sprite").each(function(index,
													spriteElement) {
			var sprite = that._createSprite(spriteElement);

			// Create the sprite dict entry.
			spriteDict[sprite.name] = sprite.bounds;
		});

		// Determine the URL to get the image from.
		var url = src;
		if(this._baseUrl) {
			url = this._baseUrl + "/" + url;
		}
		if(this._fileExtension) {
			url += "." + this._fileExtension;
		}
		if(this._currDirectory) {
			url = this._currDirectory + "/" + url;
		}
		
		// Load the sprite into Crafty.
		Crafty.sprite(tileWidth, tileHeight, url, spriteDict,
					  paddingX, paddingY, paddingAroundBorder);
	},
	
	/**
	 * Create a sprite object from its XML definition.
	 */
	_createSprite:
	function(spriteElement) {
		var that = this;
		spriteElement = $(spriteElement);
		var name = spriteElement.attr("name");
		var location = spriteElement.children("location").text()
			.trim();
		var dimensions = spriteElement.children("dimensions").text()
			.trim();

		if(!name) {
			throw "Sprite name attribute missing";
		}

		// Get the sprite location and dimensions.
		var spriteX = 0, spriteY = 0, spriteW = 1, spriteH = 1;
		if(location) {
			location = location.split(" ");
			if(location.length === 2) {
				spriteX = parseInt(location[0]);
				spriteY = parseInt(location[1]);
			}
		}
		if(dimensions) {
			dimensions = dimensions.split(" ");
			if(dimensions.length === 1) {
				spriteW = spriteH = parseInt(dimensions[0]);
			} else if(dimensions.length === 2) {
				spriteW = parseInt(dimensions[0]);
				spriteH = parseInt(dimensions[1]);
			}
		}

		// Load each animation.
		var animElements = spriteElement.children("reel");
		if(animElements.length) {
			var animDict = {};
			animElements.each(function(index, animElement) {
				var anim = that._createAnimation(animElement);
				animDict[anim.name] = anim;
			});
			that._spriteAnimDict[name] = animDict;
		}
		
		return {
			name: name,
			bounds: [
				spriteX,
				spriteY,
				spriteW,
				spriteH
			]
		};
	},
	
	/**
	 * Create an animation object from its XML definition.
	 */
	_createAnimation:
	function(animElement) {
		animElement = $(animElement);

		var name = animElement.attr("name");
		var duration = animElement.children("duration").text()
			.trim();
		var from = animElement.children("from").text().trim();
		var frameCount = animElement.children("frameCount")
			.text().trim();
		var frameElements = animElement.children("frame");

		if(!name) {
			throw "Sprite animation name attribute missing";
		}

		if(!duration) {
			throw "Sprite animation duration attribute missing";
		}
		
		duration = parseInt(duration);

		// Data for current animation.
		var anim = {
			name: name,
			duration: duration
		};

		// Load animation frames.
		if(frameElements.length) {
			// Load explicit list of frames.
			var frames = [];
			frameElements.each(function(index, frame) {
				frame = $(frame);
				var location = frame.text().trim()
					.split(" ");

				if(location.length !== 2) {
					throw "Frame coordinates must be x y: "
						+ location.join(" ");
				}

				frames.push([
					parseInt(location[0]),
					parseInt(location[1])
				]);
			});
			anim.frames = frames;
		} else if(from && frameCount) {
			// Load start frame and frame count.
			from = from.split(" ");
			if(from.length !== 2) {
				throw "Frame coordinates must be x y: " + location.join(" ");
			}
			anim.from = [
				parseInt(from[0]),
				parseInt(from[1])
			];
			anim.frameCount = parseInt(frameCount);
		} else {
			throw "Sprite frames undefined: " + name;
		}
		
		return anim;
	}
});

/**
 * Get the directory of a file path.
 */
function getDirectory(filename) {
	return filename.substring(0, filename.lastIndexOf("/") + 1);
}
