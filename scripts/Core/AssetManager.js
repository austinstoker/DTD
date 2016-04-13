// Code by Austin Stoker and Kendall Spackman

/*global AssetManager */
AssetManager = (function() {
  assets = {};
  
  function loadImage(imageSrc) {
    var image;
    if (!assets.hasOwnProperty(imageSrc)) {
      image = new Image();
      image.src = imageSrc;
      assets[imageSrc] = image;
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
