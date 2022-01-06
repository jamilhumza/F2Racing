//Setting the canvas and context
var canvas = document.getElementById('canvas')
var c = canvas.getContext('2d')

//================================================
//Uploading Audio tracks and setting some variables
//================================================

//Starting Car Sound
var startcar = new Audio('audio/startCar.mp3')

//Play start car sound right away
startcar.play()

//Empty Array for keyCodes
var keys = []

//Road Position and speed
var roadPosition = 0
var roadSpeed = 1.5

//================
// User Car Class
//================

//Uploading User car
var carImage = new Image()
carImage.src = 'img/Car.png'

//User Car Class
function Car(x, y, speed, mod, angle) {
  //Setting variables to "this."
  this.x = x
  this.y = y
  this.speed = speed
  this.mod = mod
  this.angle = angle

  //Key presses with smooth movement
  this.listenInput = function () {
    if (keys[37]) {
      this.x -= speed //If left arrow-key pressed, move left
    }
    if (keys[39]) {
      this.x += speed //If right arrow-key pressed, move right
    }
  }

  //Move cars with speed+mod
  this.move = function () {
    this.x += speed * mod
    this.y += speed * mod
  }

  //Draw user car w/ required context properties
  this.draw = function () {
    c.save()
    c.translate(this.x, this.y)
    c.rotate((this.angle * Math.PI) / 180)
    c.drawImage(carImage, -(carImage.width / 2), -(carImage.height / 2))
    c.restore()

    //Warning for out of bounds I, off the canvas to the right
    if (this.x > canvas.width) {
      // collisionDetection()
      c.beginPath()
      c.fillStyle = 'black'
      c.font = '60px Verdana'
      c.fillText('Out of bounds! Get Back!', 70, 325)
    }

    //Warning for out of bounds II, off canvas to the left
    if (this.x < 0) {
      c.beginPath()
      c.fillStyle = 'black'
      c.font = '60px Verdana'
      c.fillText('Out of bounds! Get Back!', 70, 325)
    }
  }

  //Collision detection
  this.testCollision = function (other) {
    //Variables to detect distance between edges of car
    px = Math.abs(other.x - this.x)
    py = Math.abs(other.y - this.y)
    pa = carImage.width / 2
    pb = carImage.height
    //If cars collide, game over
    if (px < pa && py < pb) {
      gameOver()
    }
  }
}

//Draw the object from that class with x, y, speed, mod, angle
var userCar = new Car(450, 590, 5.5, -1, -90)

//===================
// Obstacle CAR Class
//===================

//Uploading obstacle Car
var obstImage = new Image()
obstImage.src = 'img/obstcar.png'

//Obstacle car class
function obstCar(x, y, speed, mod, angle) {
  this.x = x
  this.y = y
  this.speed = speed
  this.mod = mod
  this.angle = angle

  //Move obstacle cars with speed+mod and angular position
  this.move = function () {
    this.x += this.speed * this.mod * Math.cos((Math.PI / 180) * this.angle)
    this.y += this.speed * this.mod * Math.sin((Math.PI / 180) * this.angle)

    //Return obstacle cars after they reach edge of canvas, x-position random
    if (this.y > canvas.height + 150) {
      this.y = -obstImage.height
      this.x = Math.floor(Math.random() * canvas.width)
    }
  }

  //Draw obstacle cars w/ required context properties
  this.draw = function () {
    c.save()
    c.translate(this.x, this.y)
    c.rotate((this.angle * Math.PI) / 180)
    c.drawImage(obstImage, -(obstImage.width / 2), -(obstImage.height / 2))
    c.restore()
  }

  //Collision Detection II (required because of two classes)
  this.testCollision = function (other) {
    //Variables to detect distance between edges of car
    dx = Math.abs(other.x - this.x)
    dy = Math.abs(other.y - this.y)
    da = obstImage.width / 2
    db = obstImage.height
    //If cars collide, stop obstacle cars and play the crash noise
    if (dx < da && dy < db) {
      this.mod = 0
    }
  }
}

//Properties for score keep
var score
var startTime
var gameOver

//Set spacebar presses to false to ignore, only works on Game Over screen
var spaceBarPressed = false

//================
//Starting game
//================

function setupGame() {
  //Draw 6 obstacle cars with x, y, speed, mod, and angle
  obstacleCar1 = new obstCar(100, 10, 9, 5 / 10, 90)
  obstacleCar2 = new obstCar(300, 10, 9, 5 / 10, 90)
  obstacleCar3 = new obstCar(450, 10, 9, 5 / 10, 90)
  obstacleCar4 = new obstCar(600, 10, 9, 5 / 10, 90)
  obstacleCar5 = new obstCar(750, 10, 9, 5 / 10, 90)
  obstacleCar6 = new obstCar(900, 10, 9, 5 / 10, 90)

  //Game is starting
  gameOver = false
  //The variable startTime is the time elapsing
  startTime = Date.now()
}

//===========================
//Draw Final and Elasped Time
//===========================
function drawElapsedTime() {
  c.save()
  c.fillStyle = 'black'
  c.font = '30px Verdana'
  c.fillText(
    parseInt((Date.now() - startTime) / 1000) + ' secs',
    canvas.width - 117,
    40
  )
  c.restore()
}

function drawFinalScore() {
  c.save()
  c.fillStyle = 'black'
  c.font = '30px Verdana'
  c.fillText('Game Over: ' + score + ' secs', 320, 100)
  c.font = '12px Verdana'
  c.fillText('Press space to restart!', 390, 150)
  c.restore()
}

function drawStart() {
  c.save()
  c.fillStyle = 'black'
  //c.font = '30px Verdana'
  //c.fillText('Game Over: ' + score + ' secs', 320, 100)
  c.font = '12px Verdana'
  c.fillText('Press space to start!', 390, 150)
  c.restore()
}

//=======================================
//All game draw properties and Game Loop
//=======================================
function gameLoop() {
  //Animates when game starts
  requestAnimationFrame(gameLoop)
  //Clear canvas
  c.clearRect(0, 0, canvas.width, canvas.height)

  //Adding the road's position to the road's speed
  roadPosition += roadSpeed
  //Call moving background function
  drawBackground()

  //If gameOver then....
  if (gameOver) {
    //Draw Final Score
    drawFinalScore()
    //Reset Road Speed
    roadSpeed = 1.5

    //When Space bar is pressed then...
    if (spaceBarPressed) {
      //Reset Game
      setupGame()
      //Reset Road Speed
      roadSpeed = 1.5
      //Pause Sad Music
      //sadMusic.pause()
      //Play car start sound
      startcar.play()
      //Play Mission Music
      //mission.play()
    }
    //Stop Function
    return
  }

  //Draw Obstacle Car with movement and collision with user car
  obstacleCar1.move()
  obstacleCar1.draw()
  obstacleCar1.testCollision(userCar)

  //Spawn obstacle cars with move and collision at different times
  if (parseInt((Date.now() - startTime) / 1000) >= 3) {
    obstacleCar2.move()
    obstacleCar2.testCollision(userCar)
    obstacleCar2.draw()
  }

  if (parseInt((Date.now() - startTime) / 1000) >= 5) {
    obstacleCar3.move()
    obstacleCar3.testCollision(userCar)
    obstacleCar3.draw()
  }

  if (parseInt((Date.now() - startTime) / 1000) >= 7) {
    obstacleCar4.move()
    obstacleCar4.testCollision(userCar)
    obstacleCar4.draw()
  }

  if (parseInt((Date.now() - startTime) / 1000) >= 10) {
    obstacleCar5.move()
    obstacleCar5.testCollision(userCar)
    obstacleCar5.draw()
  }

  if (parseInt((Date.now() - startTime) / 1000) >= 13) {
    obstacleCar6.move()
    obstacleCar6.testCollision(userCar)
    obstacleCar6.draw()
  }

  //ULTIMATE MODE increase speed for all cars after 15 secs
  if (parseInt((Date.now() - startTime) / 1000) >= 15) {
    obstacleCar1.speed = 17
    obstacleCar2.speed = 17
    obstacleCar3.speed = 17
    obstacleCar4.speed = 17
    obstacleCar5.speed = 17
    obstacleCar6.speed = 17

    //Increase road speed
    roadSpeed = 5
  }

  //Super ULTIMATE MODE increase speed for all cars after 25 secs
  if (parseInt((Date.now() - startTime) / 1000) >= 25) {
    obstacleCar1.speed = 25
    obstacleCar2.speed = 25
    obstacleCar3.speed = 25
    obstacleCar4.speed = 25
    obstacleCar5.speed = 25
    obstacleCar6.speed = 25

    //Increase Road Speed
    roadSpeed = 6.5
  }

  //Display ULTIMATE MODE on screen When it starts
  if (
    parseInt((Date.now() - startTime) / 1000) >= 15 &&
    parseInt((Date.now() - startTime) / 1000) <= 19
  ) {
    c.beginPath()
    c.fillStyle = 'red'
    c.font = '50px Verdana'
    c.fillText('ULTIMATE MODE!', 100, 100)
  }

  //Display SUPER ULTIMATE MODE on screen When it starts
  if (
    parseInt((Date.now() - startTime) / 1000) >= 25 &&
    parseInt((Date.now() - startTime) / 1000) <= 29
  ) {
    c.beginPath()
    c.fillStyle = 'red'
    c.font = '50px Verdana'
    c.fillText('SUPER ULTIMATE MODE!', 100, 100)
  }

  //When obstacle car mod === 0, Game Over
  if (obstacleCar1.mod === 0) {
    score = parseInt((Date.now() - startTime) / 1000)
    gameOver = true
    spaceBarPressed = false
  }

  if (obstacleCar2.mod === 0) {
    score = parseInt((Date.now() - startTime) / 1000)
    gameOver = true
    spaceBarPressed = false
  }
  if (obstacleCar3.mod === 0) {
    score = parseInt((Date.now() - startTime) / 1000)
    gameOver = true
    spaceBarPressed = false
  }
  if (obstacleCar4.mod === 0) {
    score = parseInt((Date.now() - startTime) / 1000)
    gameOver = true
    spaceBarPressed = false
  }

  if (obstacleCar5.mod === 0) {
    score = parseInt((Date.now() - startTime) / 1000)
    gameOver = true
    spaceBarPressed = false
  }
  if (obstacleCar6.mod === 0) {
    score = parseInt((Date.now() - startTime) / 1000)
    gameOver = true
    spaceBarPressed = false
  }

  //Draw User Car with key inputs
  userCar.draw()
  userCar.listenInput()

  //Draw Elapsed Time when gameOver
  drawElapsedTime()
}

//========================
//  Keys handling
//========================

function setupKeys() {
  //Left, Right, and Space Bar
  var listenedKeys = [32, 37, 39]

  function keyUpHandler(event) {
    var keyCode = event.keyCode
    //Checks listenedKeys if any of them were pressed
    if (listenedKeys.indexOf(keyCode) === -1) return
    keys[keyCode] = false
  }

  function keyDownHandler(event) {
    var keyCode = event.keyCode
    //Checks listenedKeys if any of them were pressed
    if (listenedKeys.indexOf(keyCode) === -1) return
    keys[keyCode] = true
    //If spacebar is pressed, set condition to true
    if (keyCode === 32) {
      spaceBarPressed = true
    }
  }

  //Event listeners for keys
  window.addEventListener('keydown', keyDownHandler, false)
  window.addEventListener('keyup', keyUpHandler, false)
}

//========================
//Draw Moving Background
//========================

function drawBackground() {
  //Colour of the road
  c.fillStyle = '#C77F7F'

  //Fills whole canvas with colour
  c.fillRect(0, 0, canvas.width, canvas.height)

  //Lengths and widths of road rectangles
  var lineLength = 40
  var voidLength = 20
  var lineWidth = 5

  //Random number of blocks, so that for loop (see below) can keep making blocks
  var lineCount = Math.floor(canvas.height / (lineLength + voidLength)) + 2

  //Colour of road, and creating actual lines with context
  c.strokeStyle = '#888'
  c.lineWidth = lineWidth
  c.beginPath()

  //Blocks in middle of canvas
  var x = canvas.width / 2
  //Blocks moving down, segment by segment of roadPosition
  var y =
    -(lineLength + voidLength) + (roadPosition % (lineLength + voidLength))

  //For loop for moving blocks in the vertical direction
  for (var i = 0; i < lineCount; i++) {
    c.moveTo(x, y)
    c.lineTo(x, y + lineLength)
    y += lineLength + voidLength
  }
  c.stroke()
}

//=========================
// Launch the game
//=========================
setupKeys()
gameLoop()
function startGame() {
  setupGame()
}

function myFunction() {
  startGame()
  document.getElementById('btn').disabled = true
}
