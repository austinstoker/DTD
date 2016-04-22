/*global DTD */

// ------------------------------------------------------------------
//
// This provides the audio code for the game.
//
// ------------------------------------------------------------------
DTD.audio = (function() {
  
  var isMuted = false,
    music,
    musicFile,
    musicPlaying = false;
  
  function play(file) {
    if (!isMuted) {
      new Audio(file).play();
    }
  }
  
  function setMusicFile(file) {
    musicFile = file;
  }
  
  function playMusic() {
    if (musicFile !== undefined) {
      music = new Audio(musicFile);
      music.loop = true;
      music.play();
      musicPlaying = true;
    }
  }
  
  function stopMusic() {
    if (music !== undefined) {
      music.pause();
    }
    musicPlaying = false;
  }
  
  function toggleMute() {
    console.log(isMuted);
    isMuted = !isMuted;
    console.log(isMuted);
  }
  
  function toggleMusic() {
    if (musicPlaying) {
      stopMusic();
    }
    else {
      playMusic();
    }
  }
  
  return {
    play: play,
    setMusicFile: setMusicFile,
    playMusic: playMusic,
    stopMusic: stopMusic,
    toggleMute: toggleMute,
    toggleMusic: toggleMusic
  };
}());