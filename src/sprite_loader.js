/**
 * Component for loading sprite data from an XML file.
 */

Crafty.c("SpriteLoader", {
	init:
	function() {
		this._spriteAnimationDict = {};
	},
	
	load:
	function(filename) {
		var that = this;
		$.ajax({
			type: "GET",
			url: filename,
			success: function (data) {
				
				data = $(data).children("spritesData");
				
				// Get the base URL and file extension for resolving sources.
				var baseUrl = data.children("baseUrl").text().trim();
				var fileExtension = data.children("fileExtension").text()
					.trim();
				
				// Load each sprite sheet.
				data.children("spriteSheet").each(function(index, spriteSheet) {
					spriteSheet = $(spriteSheet);
					var src = spriteSheet.attr("src");
					var tileSize = spriteSheet.children("tileSize").text()
						.trim();
					var tilePadding = spriteSheet.children("tilePadding").text()
						.trim();
					var paddingAroundBorder = spriteSheet
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
					paddingAroundBorder = paddingAroundBorder === "true"
										  ? true
										  : false;
					
					// Load each sprite.
					var spriteDict = {};
					spriteSheet.children("sprite").each(function(index,
																  sprite) {
						sprite = $(sprite);
						var name = sprite.attr("name");
						var location = sprite.children("location").text()
							.trim();
						var dimensions = sprite.children("dimensions").text()
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
						var animationElements = sprite.children("reel");
						if(animationElements.length) {
							var animationDict = {};
							sprite.children("reel").each(function(index, reel) {
								reel = $(reel);

								var name = reel.attr("name");
								var duration = reel.children("duration").text()
									.trim();
								var from = reel.children("from").text().trim();
								var frameCount = reel.children("frameCount")
									.text().trim();
								var frameElements = reel.children("frame");

								if(!name) {
									throw "Sprite animation name attribute " +
										"missing";
								}

								if(!duration) {
									throw "Sprite animation duration " +
										"attribute missing";
								}

								// Data for current animation.
								var anim = {
									duration: parseInt(duration)
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
											throw "Frame coordinates must be " +
												"x y: " + location.join(" ");
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
										throw "Frame coordinates must be " +
											"x y: " + location.join(" ");
									}
									anim.from = [
										parseInt(from[0]),
										parseInt(from[1])
									];
									anim.frameCount = parseInt(frameCount);
								} else {
									throw "Sprite frames undefined: " + name;
								}
								animationDict[name] = anim;
							});
							that._spriteAnimationDict[name] = animationDict;
						}
						
						// Create the sprite dict entry.
						spriteDict[name] = [
							spriteX,
							spriteY,
							spriteW,
							spriteH
						];
					});
					
					// Determine the URL to get the image from.
					var currLoc = getDirectory(filename);
					var url = src;
					if(baseUrl) {
						url = baseUrl + "/" + url;
					}
					if(fileExtension) {
						url += "." + fileExtension;
					}
					if(currLoc) {
						url = currLoc + "/" + url;
					}
					
					// Create the sprite sheet.
					Crafty.sprite(tileWidth, tileHeight, url, spriteDict,
								 paddingX, paddingY, paddingAroundBorder);
				});
			}
		});
		
		Crafty.bind("NewEntity", function(data) {
			var ent = Crafty(data.id);
			//console.log(ent);
			for(var sprite in that._spriteAnimationDict) {
				if(ent.has(sprite)) {
					ent.addComponent("SpriteAnimation");
					var animationDict = that._spriteAnimationDict[sprite];
					for(var name in animationDict) {
						var anim = animationDict[name];
						if(anim.frames) {
							ent.reel(name, anim.duration, anim.frames);
						} else {
							ent.reel(name, anim.duration, anim.from[0],
									 anim.from[1], anim.frameCount);
						}
					}
				}
			}
		});
	}
});

function getDirectory(filename) {
	var tokens = filename.split("/");
	tokens.splice(-1);
	return tokens.join("/");
}
