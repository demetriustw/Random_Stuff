const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.7;

const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  imageSrc: "./game/img/background.png",
});

const shop = new Sprite({
  position: {
    x: 620,
    y: 128,
  },
  imageSrc: "./game/img/shop.png",
  scale: 2.75,
  framesMax: 6,
});

const player = new Fighter({
  position: {
    x: 150,
    y: 0,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  offset: {
    x: 0,
    y: 0,
  },
  imageSrc: "./game/img/samuraiMack/Idle.png",
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 200,
    y: 157,
  },
  sprites: {
    idle: {
      imageSrc: "./game/img/samuraiMack/Idle.png",
      framesMax: 8,
    },
    run: {
      imageSrc: "./game/img/samuraiMack/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./game/img/samuraiMack/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./game/img/samuraiMack/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./game/img/samuraiMack/Attack1.png",
      framesMax: 6,
    },
    takeHit: {
      imageSrc: "./game/img/samuraiMack/Take Hit - white silhouette.png",
      framesMax: 4,
    },
    death: {
      imageSrc: "./game/img/samuraiMack/Death.png",
      framesMax: 6,
    },
  },
  attackBox: {
    offset: {
      x: 100,
      y: 50,
    },
    width: 160,
    height: 50,
  },
});

const enemy = new Fighter({
  position: {
    x: 800,
    y: 100,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  offset: {
    x: -50,
    y: 0,
  },
  imageSrc: "./game/img/kenji/Idle.png",
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 200,
    y: 170,
  },
  sprites: {
    idle: {
      imageSrc: "./game/img/kenji/Idle.png",
      framesMax: 4,
    },
    run: {
      imageSrc: "./game/img/kenji/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./game/img/kenji/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./game/img/kenji/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./game/img/kenji/Attack1.png",
      framesMax: 4,
    },
    takeHit: {
      imageSrc: "./game/img/kenji/Take hit.png",
      framesMax: 3,
    },
    death: {
      imageSrc: "./game/img/kenji/Death.png",
      framesMax: 7,
    },
  },
  attackBox: {
    offset: {
      x: -160,
      y: 50,
    },
    width: 160,
    height: 50,
  },
});

console.log(player);

const keys = {
  // start timer
  Escape: {
    pressed: false,
  },
  // player keys
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  w: {
    pressed: false,
  },
  // enemy keys
  ArrowLeft: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
  ArrowUp: {
    pressed: false,
  },
};

// If want start button keep commented
// decreaseTimer();

///////////////////////////////////////////////////////////
// Animations
function animate() {
  window.requestAnimationFrame(animate);
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  background.update();
  shop.update();
  c.fillStyle = "rgba(255, 255, 255, 0.15)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  enemy.update();

  player.velocity.x = 0;
  enemy.velocity.x = 0;

  // player move
  if (keys.a.pressed && player.lastKey === "a") {
    player.velocity.x = -5;
    player.switchSprite("run");
  } else if (keys.d.pressed && player.lastKey === "d") {
    player.velocity.x = 5;
    player.switchSprite("run");
  } else {
    player.switchSprite("idle");
  }

  // player jumping
  if (player.velocity.y < 0) {
    player.switchSprite("jump");
  } else if (player.velocity.y > 0) {
    player.switchSprite("fall");
  }

  // enemy move
  if (keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft") {
    enemy.velocity.x = -5;
    enemy.switchSprite("run");
  } else if (keys.ArrowRight.pressed && enemy.lastKey === "ArrowRight") {
    enemy.velocity.x = 5;
    enemy.switchSprite("run");
  } else {
    enemy.switchSprite("idle");
  }

  // enemy jumping
  if (enemy.velocity.y < 0) {
    enemy.switchSprite("jump");
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite("fall");
  }

  // detect for collision & enemy gets hit
  if (
    // player attack
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy,
    }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.takeHit();
    player.isAttacking = false;
    document.querySelector("#enemyHealth").style.width = enemy.health + "%";
  }

  // if player misses
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false;
  }

  // this is where our player gets hit
  if (
    // enemy's attack
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player,
    }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    player.takeHit();
    enemy.isAttacking = false;
    document.querySelector("#playerHealth").style.width = player.health + "%";
  }

  // if enemy misses
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false;
  }

  // end game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId });
  }
}

animate();

///////////////////////////////////////////////////////////
// Controles
function allowMove() {
  window.addEventListener("keydown", (event) => {
    if (!player.dead) {
      switch (event.key) {
        // player keys
        case "d":
          keys.d.pressed = true;
          player.lastKey = "d";
          break;
        case "a":
          keys.a.pressed = true;
          player.lastKey = "a";
          break;
        case "w":
          if (player.velocity.y == 0) {
            player.velocity.y = -20;
          }
          break;
        case " ":
          player.attack();
          break;
      }
    }

    // enemy keys
    if (!enemy.dead) {
      switch (event.key) {
        case "ArrowRight":
          keys.ArrowRight.pressed = true;
          enemy.lastKey = "ArrowRight";
          break;
        case "ArrowLeft":
          keys.ArrowLeft.pressed = true;
          enemy.lastKey = "ArrowLeft";
          break;
        case "ArrowUp":
          if (enemy.velocity.y == 0) {
            enemy.velocity.y = -20;
          }
          break;
        case "ArrowDown":
          enemy.attack();
          break;
      }
    }
  });
}

// START GAME BUTTON
window.addEventListener("keyup", (event) => {
  const text = document.getElementById("displayText");
  if (!keys.Escape.pressed) {
    switch (event.key) {
      case "Escape":
        keys.Escape.pressed = true;
        text.style.display = "none";
        decreaseTimer();
        allowMove();
        break;
    }
  } else if (keys.Escape.pressed) {
    switch (event.key) {
      case "Escape":
        keys.Escape.pressed = false;
        text.style.display = "flex";
        console.log(canvas.width);
        canvas.width += 1;
        console.log(canvas.width);
        canvas.width -= 1;
        console.log(canvas.width);
        break;
    }
  }
});

window.addEventListener("keyup", (event) => {
  switch (event.key) {
    case "d":
      keys.d.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
  }

  // enemy keys
  switch (event.key) {
    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;
  }
});
