(function( global ) {
  "use strict";

  var WEAPON_PISTOL = 1;
  var WEAPON_SHOTGUN = 2;
  var WEAPON_MACHINE_GUN = 3;

  var player;

  /**
   * Zombie
   * @constructor
   */
  function Zombie() {
    this.health = 100;
    this.render();
    this.move();
  }
  Zombie.prototype = {

    render: function() {

    },

    move: function() {

    },

    updateProgress: function() {

    },

    damage: function( damage ) {
      this.health -= damage;
      this.updateProgress();
      if (this.health <= 0) {
        this.die();
      }
    },

    die: function() {

    }
  };



  /**
   * Player
   * @constructor
   */
  function Player( config ) {
    this.health = 100;
    this.weapon = config.weapon;
    this.init();
  }
  Player.prototype = {
    shoot: function() {

    },

    damage: function( damage ) {
      this.health -= damage;
      if (this.health <= 0) {
        this.die();
      }
    },

    die: function() {

    },

    init: function() {

    }
  };



  /**
   * Zombie Apocalypse Game
   * @constructor
   */
  function ZombieApocalypse( config ) {
    this.doc = global.document;
    this.holder = this.doc.querySelector(config.holder);
    this.score = 0;
    this.killed = 0;
    this.waves = 0;
    this.speed = 1000;
  }
  ZombieApocalypse.prototype = {

    render: function() {
      this.holder.classList.add('zombie-apocalypse-screen');
    },

    nextWave: function() {
      if (this.waves === 100) {
        this.quit();
      } else {

      }
    },

    bind: function() {
      this.doc.onkeyup = function( event ) {
        switch (event.keyCode) {
          case 27: // Escape

            break;
          case 80: // P
            this.pause();
            break;
          default:
            console.log('Unhandled key code: ', event.keyCode);
        }
      };
    },

    pause: function() {
      console.log('PAUSE THE GAME');
    },

    quit: function() {
      console.log('QUIT THE GAME');
    },

    init: function() {
      console.log('Start the game');
      this.bind();
      this.render();
      player = new Player({
        weapon: WEAPON_PISTOL
      });
      this.nextWave();
    }
  };


  var game = new ZombieApocalypse({holder:'#zombie-apocalypse'});
  game.init();

}( window ));
