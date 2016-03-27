var game = new Phaser.Game("100%", "100%", Phaser.AUTO, 'gameDiv');

var mainState = {

  preload: function() {

    game.load.image("background", "assets/bg.png");
    //game.stage.backgroundColor = '#71c5cf';


    game.load.image('bird', 'assets/dilma.png');
    game.load.image('pipe', 'assets/mouro.png');

    // Load the jump sound
    game.load.audio('jump', 'assets/jump.wav');
    game.load.audio('cachorro', ['assets/cachorro.ogg', 'assets/cachorro.mp3']);
    game.load.audio('dentifricio', ['assets/dentifricio.ogg', 'assets/dentifricio.mp3']);


    game.load.image('jumpbutton', 'assets/jump.png');


    this.width = $('body').width();
    this.height = $('height').height();
  },

  create: function() {

    var bg = game.add.sprite(game.world.centerX, game.world.centerY, "background");
    bg.anchor.set(0.5);
    game.physics.startSystem(Phaser.Physics.ARCADE);

    this.pipes = game.add.group();
    this.pipes.enableBody = true;
    this.pipes.createMultiple(30, 'pipe');

    this.scoreCollider = this.game.add.group();
    this.scoreCollider.enableBody = true;
    this.scoreCollider.createMultiple(30, 'bird');

    this.timer = this.game.time.events.loop(1500, this.addRowOfPipes, this);

    this.bird = this.game.add.sprite(100, 245, 'bird');
    this.bird.scale.setTo(0.2, 0.2);
    game.physics.arcade.enable(this.bird);
    this.bird.body.gravity.y = 1000;

    // New anchor position
    this.bird.anchor.setTo(-0.2, 0.5);

  

    game.input.onDown.add(this.jump, this);

    this.score = 0;
    this.labelScore = this.game.add.text(20, 20, "0", {
      font: "30px Arial",
      fill: "#ffffff"
    });

    // Add the jump sound
    this.jumpsSound = [this.game.add.audio('cachorro'), this.game.add.audio('dentifricio')];
  },

  update: function() {
    if (this.bird.inWorld == false){
      this.restartGame();
    }

    game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);
    game.physics.arcade.overlap(this.bird, this.scoreCollider, this.hitScore, null, this);
    // Slowly rotate the bird downward, up to a certain point.
    if (this.bird.angle < 20){
      this.bird.angle += 1;
    }
  },
  render : function() {
    game.debug.body(this.bird);
    this.pipes.forEachAlive(function(pipe) {
      game.debug.body(pipe);
    }, this)
  },

  jump: function() {
    // If the bird is dead, he can't jump
    if (this.bird.alive == false){
      return;
    }

    this.bird.body.velocity.y = -350;

    // Jump animation
    game.add.tween(this.bird).to({
      angle: -20
    }, 100).start();


    // Play sound
    this.jumpsSound[Math.floor(Math.random() * this.jumpsSound.length) + 0].play();
  },

  hitPipe: function() {
    // If the bird has already hit a pipe, we have nothing to do
    if (this.bird.alive == false){
      return;
    }

    // Set the alive property of the bird to false
    this.bird.alive = false;

    // Prevent new pipes from appearing
    this.game.time.events.remove(this.timer);

    // Go through all the pipes, and stop their movement
    this.pipes.forEachAlive(function(p) {
      p.body.velocity.x = 0;
    }, this);
    this.scoreCollider.forEachAlive(function(p) {
      p.body.velocity.x = 0;
    }, this);
  },
  hitScore: function(player, scoreable) {
    scoreable.destroy();
    this.score += 1;
    this.labelScore.setText(this.score);
  },
  restartGame: function() {
    game.state.start('main');
  },
  addOneScoreCollider: function(x,y) {
    var col = this.scoreCollider.getFirstDead();
    col.reset(x, y);
    col.scale.setTo(0.10, 0.10);
    col.body.velocity.x = -200;
    col.checkWorldBounds = true;
    col.outOfBoundsKill = true;
  },
  addOnePipe: function(x, y) {
    var pipe = this.pipes.getFirstDead();
    pipe.reset(x, y);
    pipe.scale.setTo(0.25, 0.25);
    pipe.body.velocity.x = -200;
    pipe.checkWorldBounds = true;
    pipe.outOfBoundsKill = true;
  },
  addRowOfPipes: function() {
    var hole = Math.floor(Math.random() * 5) + 1;
    this.addOneScoreCollider(this.width,  (((hole) * 60  + 10) + ((hole + 1) * 60  + 10)) / 2);
    for (var i = 0; i < 9; i++) {
      if (i != hole && i != hole + 1) {
        this.addOnePipe(this.width, i * 60 + 10);
      }
    }
  },
};

game.state.add('main', mainState);
game.state.start('main');
