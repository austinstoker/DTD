// Code by Austin Stoker and Kendall Spackman

/*global AssetManager */
AssetManager = (function() {
  assets = {};
  
  function loadImage(key, imageSrc) {
    var image;
    if (imageSrc === undefined) {
      imageSrc = key;
    }
    if (!assets.hasOwnProperty(key)) {
      image = new Image();
      image.src = imageSrc;
      assets[key] = image;
    }
  }
  
  function getImage(key) {
    if (!assets.hasOwnProperty[key]) {
      loadImage(key);
    }
    return assets[key];
  }
  
  return {
    loadImage: loadImage,
    getImage: getImage
  };
}());
