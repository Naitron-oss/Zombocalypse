(function( global ) {
  "use strict";

  var WEAPON_PISTOL = {name:'Pistol',className:'pistol',firepower:40};
  var WEAPON_SHOTGUN = {name:'Shotgun',className:'shotgun',firepower:90};
  var WEAPON_MACHINE_GUN = {name:'Machine gun',className:'machine-gun',firepower:20};



  /**
   * Zombie
   * @constructor
   */
  function Zombie( config ) {
    this.doc = global.document;
    this.holder = config.holder;
    this.steps = 0;
    this.strength = 10;
    this.game = config.game;
    this.player = config.player;
    this.zIndex = config.zIndex;
    this.health = 100;
    this.pic = this.getRandomRange(1,3);
    this.render();
    this.bind();
    this.move();
    var self = this;
    this.direction = this.getRandomRange(1,2) === 1 ? 'left' : 'right';
    this.interval = setInterval(function() {
      self.move();
    }, 1000);
  }
  Zombie.prototype = {

    getRandomRange: function( min, max ) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    render: function() {
      this.element = this.doc.createElement('div');
      this.element.classList.add('zombie');
      this.holder = this.doc.querySelector('.' + this.holder.className);
      this.holder.appendChild(this.element);
      this.element.style.left = this.getRandomRange(100, 600) + '%';
      this.element.style.zIndex = this.zIndex;
      this.element.style.width = '8px';
      this.element.style.height = '16px';
      this.element.classList.add('zombie-' + this.pic);
    },

    move: function() {
      //console.log('MOVE');

      if (this.steps >= 100) {
        this.player.damage(this.strength);
        this.game.updateHealthStatus();
      } else {
        this.steps += 1;
        this.element.style.height = (parseInt(this.element.style.height, 10) + 2) + 'px';
        this.element.style.width = (parseInt(this.element.style.width, 10) + 1) + 'px';
        if (this.direction === 'left') {
          this.element.style.left = (parseInt(this.element.style.left, 10) + 2) + 'px';
        } else {
          this.element.style.left = (parseInt(this.element.style.left, 10) - 1) + 'px';
        }
      }
    },

    updateProgress: function() {

    },

    damage: function() {
      //console.log('DAMAGE: ', this.game.player.weapon.firepower);
      this.health -= this.game.player.weapon.firepower;
      //console.log('Damage: %i, health: %i', damage, this.health);
      this.updateProgress();
      if (this.health <= 0) {
        this.die();
      }
    },

    bind: function() {
      this.element.onclick = this.damage.bind(this);
    },

    die: function() {
      var self = this;
      var pic = this.getRandomRange(1,3);
      this.element.classList.add('blood-splatter-' + pic);
      clearInterval(this.interval);
      this.game.kill(this);
      this.element.onclick = null;
      setTimeout(function() {
        self.holder.removeChild(self.element);
      }, 300);
    }
  };



  /**
   * Player
   * @constructor
   */
  function Player( config ) {
    this.health = 100;
    this.weapon = config.weapon;
    this.game = config.game;
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
      this.game.end();
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
    this.current = [];
    this.count = 1;
    this.zIndex = 100000000;
  }
  ZombieApocalypse.prototype = {

    render: function() {
      this.holder.classList.add('zombie-apocalypse-screen');

      this.weaponElement = this.doc.createElement('div');
      this.holder.appendChild(this.weaponElement);
      this.weaponElement.classList.add('weapon');
      this.weaponElement.classList.add(this.player.weapon.className);
      this.weaponElement.onclick = this.changeWeapon.bind(this);

      this.healthElement = this.doc.createElement('div');
      this.holder.appendChild(this.healthElement);
      this.healthElement.textContent = 'Health: ' + this.player.health;
      this.healthElement.classList.add('health');

      this.killCounter = this.doc.createElement('div');
      this.holder.appendChild(this.killCounter);
      this.killCounter.classList.add('kill-counter');
      this.killCounter.textContent = 'Kills: ' + this.killed;

      this.waveIndicator = this.doc.createElement('div');
      this.holder.appendChild(this.waveIndicator);
      this.waveIndicator.classList.add('wave-indicator');
    },

    nextWave: function() {
      var i, j = 0, self = this, interval;
      if (this.waves === 100) {
        this.quit();
      } else {
        this.waves += 1;
        this.count *= 2;
        console.log('----------------');
        console.log('Start wave: %i', this.waves);
        console.log('Create %i zombies', this.count);
        this.indicateWave(this.waves, this.count);
        var delay = 2000;
        var toCreate = this.count;


        // put up to 20 zombies
        // put max 200

        interval = setInterval(function() {
          if (self.current.length >= 400) {
            // ..
            console.info('Skip: 400 or more zombies on screen currently');
          } else if (toCreate === 0 && self.current.length === 0) {
            clearInterval(interval);
            self.waitingForNextWave(5000);
            setTimeout(function() { self.nextWave(); }, 5000);
          } else if (toCreate === 0) {
            // .. no more zombies to create, skip
          } else {

            console.log('blahdw');
            // .. draw 10 zombies then repeat after 2 minutes

            for (i = 0; toCreate > 0; toCreate -= 1, i += 1) {
              if (self.current.length >= 400 || i > 10) {
                break;
              }
              self.zIndex -= 1;
              self.current.push(new Zombie({holder:self.holder, player:self.player, game:self, zIndex:self.zIndex}));
            }

          }
        }, delay);
      }
    },

    changeWeapon: function() {
      console.log('CHANGE WEAPON');
      var self = this;
      this.player.weapon = WEAPON_MACHINE_GUN;
      //console.log('PLAYER CHANGED WEAPON: ', this.player);
      this.weaponElement.className = 'weapon ' + this.player.weapon.className;
      this.doc.onmousedown = function() {
        self.doc.onmousemove = function( e ) {
          //console.log('SHooting');
          e.target.click();
        };
      };
      this.doc.onmouseup = function() {
        self.doc.onmousemove = false;
      };
    },

    kill: function( zombie ) {
      var self = this;
      this.killed += 1;
      this.updateKillCounter();
      this.current.splice(zombie, 1);
      console.log('Current zombies count: ', this.current.length);
//      if (this.current.length === 0) {
//        this.waitingForNextWave(5000);
//        setTimeout(function() { self.nextWave(); }, 5000);
//      }
    },

    bind: function() {
      this.doc.onkeyup = function( event ) {
        switch (event.keyCode) {
          case 27: // "Escape"

            break;
          case 80: // "P"
            this.pause();
            break;
          default:
          //console.log('Unhandled key code: ', event.keyCode);
        }
      };
    },

    waitingForNextWave: function( delay ) {
      var self = this;

      var interval = setInterval(function() {
        delay -= 1000;
        if (delay === 0) {
          clearInterval(interval);
          return;
        }
        self.waveIndicator.textContent = "Next wave in " + (delay / 1000);
      }, 1000);
    },

    indicateWave: function( wave, zombies ) {
      this.waveIndicator.textContent = 'Wave: ' + wave + " (zombies: " + zombies + ")";
    },

    updateHealthStatus: function() {
      this.healthElement.textContent = 'Health: ' + this.player.health;
    },

    updateKillCounter: function() {
      this.killCounter.textContent = 'Kills: ' + this.killed;
    },

    pause: function() {
      console.log('PAUSE THE GAME');
    },

    quit: function() {
      console.log('QUIT THE GAME');
    },

    end: function() {
      console.log('Game over');
      for (var i = 0; i < this.current.length; i += 1) {
        clearInterval(this.current[i].interval);
      }
      this.holder.classList.add('killed');
    },

    init: function() {
      console.log('Start the game');
      this.player = new Player({
        weapon: WEAPON_PISTOL,
        game: this
      });
      this.bind();
      this.render();
      this.nextWave();
    }
  };


  var game = new ZombieApocalypse({holder:'#zombie-apocalypse'});
  game.init();

}( window ));
