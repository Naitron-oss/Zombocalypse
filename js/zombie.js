(function( global ) {
  "use strict";

  var WEAPON_PISTOL = {name:'Pistol',className:'pistol',firepower:40};
  var WEAPON_SHOTGUN = {name:'Shotgun',className:'shotgun',firepower:90};
  var WEAPON_MACHINE_GUN = {name:'Machine gun',className:'shotgun',firepower:30};



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
      this.element.style.width = '5px';
      this.element.style.height = '10px';
      this.element.style.background = 'url("images/zombie' + this.pic + '.gif") no-repeat center center';
//      this.element.src = "images/zombie" + this.pic + ".gif";
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

    damage: function( damage ) {
      this.health -= damage;
      //console.log('Damage: %i, health: %i', damage, this.health);
      this.updateProgress();
      if (this.health <= 0) {
        this.die();
      }
    },

    bind: function() {
      this.element.onclick = this.damage.bind(this, this.player.firepower);
    },

    die: function() {
      clearInterval(this.interval);
      this.game.kill(this);
      this.holder.removeChild(this.element);
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
    this.firepower = this.weapon.firepower;
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
      this.weaponElement.classList.add('weapon', this.player.weapon.className);

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


        if (Math.floor(this.count / 10) > 0) {
          console.log('HERE');
          var temp = Math.floor(this.count / 10);
          var count = 0;
          interval = setInterval(function() {
            for (i = 0; i < temp; i += 1, count += 1) {
              if (self.count === count) {
                clearInterval(interval);
                break;
              }
              self.zIndex -= 1;
              self.current.push(new Zombie({holder:self.holder, player:self.player, game:self, zIndex:self.zIndex}));
            }
          }, 2000);
        } else {
          for (i = 0; i < self.count; i += 1) {
            self.zIndex -= 1;
            self.current.push(new Zombie({holder:self.holder, player:self.player, game:self, zIndex:self.zIndex}));
          }
        }
      }
    },

    kill: function( zombie ) {
      var self = this;
      this.killed += 1;
      this.updateKillCounter();
      this.current.splice(zombie, 1);
      console.log('Current zombies count: ', this.current.length);
      if (this.current.length === 0) {
        this.waitingForNextWave(5000);
        setTimeout(function() { self.nextWave(); }, 5000);
      }
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
