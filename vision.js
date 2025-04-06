// fefasdf
let video;
let bodyPose;
let connections;
let poses = [];
let dotSize = 12;
let allGood = 1;
let movementDir = 0
let static = false;
let time = 15;
let wrongPos = false;

const currentStretch = document.getElementById("currentStretch")
const nextStretch = document.getElementById("nextStretch")
const fp24 = document.getElementById("fp24")
const fp25 = document.getElementById("fp25")
const gradeText = document.getElementById("gradeText")

//myWorkouts = sessionStorage.getItem("workout").split(",")
//reps = sessionStorage.getItem("reps")
reps = 2
// myWorkouts = ["Push Up", "Squat", "Lunges", "Plank", "Wall Sit"]
myWorkouts = ["Push Up", "Wall Sit"]
if (myWorkouts[0] == "Plank" || myWorkouts[0] == "Wall Sit"){
    static = true;
}
repsLeft = 1 + (2*reps);

workoutIdealsUp = {
    //vertical, leg bend, left knee angle, right knee angle, arm angle  
    "Push Up": [73, 170, 160, 23.5, 160],
    "Squat": [5, 170, 160, 160, 23.5],
    "Lunges": [5, 170, 160, 160, 23.5],
    "Plank": [73, 170, 160, 23.5, 160],
    "Wall Sit": [25, 90, 100, 100, 23.5]
}

workoutIdealsDown = {
    "Push Up": [97, 170, 160, 160, 73],
    "Squat": [25, 85, 50, 50, 23.5],
    "Lunges": [15, 140, 110, 110, 23.5]
}
//----//
const peer = new Peer();
let conn;

let velocity = { x: 0, y: 0, z: 0 };
let velM = 0;
let displacement = { x: 0, y: 0, z: 0 };
let lastTimestamp = null;

let squating = false;
let pushing = false;

let otherDisp = 0;
// let reps = 0;

// let queue = ['Plank', "Squat", "Push Ups"]; // update firebase
// let times = [10, 5, 5]; // update firebase
// let currentExerciseIndex = 0;

peer.on('open', id => {
    document.getElementById('peer-id').textContent = `Your Peer ID: ${id}`;
    const url = `https://fyrebolt.github.io/lahacks3/stream.html?id=${id}`;
    QRCode.toCanvas(document.getElementById('qr-code'), url);
});

peer.on('connection', connection => {
    conn = connection;
    document.querySelector('canvas').style.display = 'none';
    document.getElementById('peer-id').textContent = 'Phone Connected ✅';
    //document.getElementById('startWorkout').disabled = false;
    
    conn.on('data', data => {
      
      const now = Date.now();

      let x = data.x.toFixed(2);
      let y = data.y.toFixed(2);
      let z = data.z.toFixed(2);

      if (Math.abs(x) < 0.12) {
        x = 0;
      }

      if (Math.abs(y) < 0.12) {
        y = 0;
      }

      if (Math.abs(z) < 0.12) {
        z = 0;
      }
      
      const mag = Math.sqrt(x ** 2 + y ** 2 + z ** 2).toFixed(2);
      
      // document.getElementById('x').textContent = x;
      // document.getElementById('y').textContent = y;
      // document.getElementById('z').textContent = z;
      document.getElementById('mag').textContent = mag;

      // displacement = {x:x, y:y, z:z}
      
      // Integrate acceleration to velocity and displacement
      if (lastTimestamp !== null) {
        const dt = (now - lastTimestamp) / 1000; // convert ms to seconds

        // if (Math.abs(data.x) < 0.15 && Math.abs(data.y) < 0.1 && Math.abs(data.z) < 0.1) {
        //   velocity = { x: 0, y: 0, z: 0 };
        // }

        // bottom limit
        if (Math.abs(x) < 0.12) {
          velocity.x = 0;
        }

        if (Math.abs(y) < 0.12) {
          velocity.y = 0;
        }

        if (Math.abs(z) < 0.12) {
          velocity.z = 0;
        }

        // upper limit
        if (Math.abs(x) > 10) {
          if (x > 0) {
            velocity.x = 2 + 2 * Math.pow(Math.abs(x), 0.6);
          }
          else {
            velocity.x = (2 + 2 * Math.pow(Math.abs(x), 0.6)) * -1;
          }
        }

        if (Math.abs(y) > 10) {
          if (y > 0) {
            velocity.y = 2 + 2 * Math.pow(Math.abs(y), 0.6);
          }
          else {
            velocity.y = (2 + 2 * Math.pow(Math.abs(y), 0.6)) * -1;
          }
        }

        if (Math.abs(z) > 10) {
          if (z > 0) {
            velocity.z = 2 + 2 * Math.pow(Math.abs(z), 0.6);
          }
          else {
            velocity.z = (2 + 2 * Math.pow(Math.abs(z), 0.6)) * -1;
          }
        }

        if (x > 1) {
          x ** 0.5;
        }
        if (y > 1) {
          y ** 0.5;
        }
        if (z > 1) {
          z ** 0.5;
        }
        
        velocity.x += x * dt;
        velocity.y += y * dt;
        velocity.z += z * dt;

        displacement.x += velocity.x * dt;
        displacement.y += velocity.y * dt;
        displacement.z += velocity.z * dt;

        const totalVel = Math.sqrt(
        velocity.x ** 2 +
        velocity.y ** 2 +
        velocity.z ** 2
        );
        
        const totalDisp = Math.sqrt(
        displacement.x ** 2 +
        displacement.y ** 2 +
        displacement.z ** 2
        );

        otherDisp += ((mag) * (dt ** 2) / 2 + totalVel * dt) * 0.8;

        document.getElementById('vel').textContent = totalVel.toFixed(2);
        document.getElementById('disp').textContent = totalDisp.toFixed(2);
        // document.getElementById('other').textContent = otherDisp.toFixed(2);
    }

    lastTimestamp = now;

    // if (recording) {
    //   recordedData.push({
    //     x: +x, y: +y, z: +z, mag: +mag,
    //     time: now
    //   });
    // }
    });
});



function preload() {
    currentIdeals = workoutIdealsUp[myWorkouts[0]]
  bodyPose = ml5.bodyPose("MoveNet", { flipped: true });
}

function getDist(pose, ideals) {
    //vertical, leg bend, left knee angle, right knee angle, arm angle 
    angles = [0, 0, 0, 0, 0]
    diff = 0;

    //vertical
    angles[0] = getAngle(pose.nose.x, pose.nose.y, 
        (pose.right_hip.x + pose.left_hip.x)/2,
        (pose.right_hip.y + pose.left_hip.y)/2, 
        (pose.right_hip.x + pose.left_hip.x)/2, 
        (pose.right_hip.y + pose.left_hip.y)/2 -1)
    //leg bend
    angles[1] = getAngle(pose.nose.x, pose.nose.y, 
        (pose.right_hip.x + pose.left_hip.x)/2, 
        (pose.right_hip.y + pose.left_hip.y)/2,
        (pose.right_knee.x + pose.left_knee.x)/2, 
        (pose.right_knee.y + pose.left_knee.y)/2
    )
    //right knee
    angles[2] = getAngle(
        (pose.right_hip.x + pose.left_hip.x)/2, 
        (pose.right_hip.y + pose.left_hip.y)/2,
        pose.right_knee.x, pose.right_knee.y,
        (pose.right_ankle.x + pose.left_ankle.x)/2, 
        (pose.right_ankle.y + pose.left_ankle.y)/2
    )
    //left knee
    angles[3] = getAngle(
        (pose.right_hip.x + pose.left_hip.x)/2, 
        (pose.right_hip.y + pose.left_hip.y)/2,
        pose.left_knee.x, pose.left_knee.y,
        (pose.right_ankle.x + pose.left_ankle.x)/2, 
        (pose.right_ankle.y + pose.left_ankle.y)/2
    )
    //arm
    angles[4] = getAngle(pose.right_shoulder.x, pose.right_shoulder.y, 
        pose.right_elbow.x, pose.right_elbow.y, 
        pose.right_wrist.x, pose.right_wrist.y)

    for (let i=0; i<5; i++){
        if (ideals[i]!= 23.5){
            diff += (angles[i] - ideals[i])**2
        }
    }
    fp24.innerHTML= "angle to vertical: " + angles[0] +
                    "  leg bend: " + angles[1] + 
                    "  right knee: " + angles[2] + 
                    "  left knee: " + angles[3] + 
                    "arms: " + angles[4]
    fp25.innerHTML= "" + diff
    return diff
}

function getAngle(Ax, Ay, Bx, By, Cx, Cy){
    b=Math.sqrt((Ax - Bx)**2 + (Ay - By)**2)
    a=Math.sqrt((Cx - Bx)**2 + (Cy - By)**2)
    c=Math.sqrt((Ax - Cx)**2 + (Ay - Cy)**2)
    return 57.3 * Math.acos((a**2 + b**2 - c**2) / (2 * a * b))
}

function checkDots(pose){
    allGood = true;
    Lespos = [pose.nose.confidence, pose.right_hip.confidence, pose.left_hip.confidence, 
              pose.right_shoulder.confidence, pose.left_shoulder.confidence, 
              pose.right_knee.confidence, pose.left_knee.confidence, 
              pose.right_ankle.confidence, pose.left_ankle.confidence,
              pose.right_wrist.confidence, pose.left_wrist.confidence,
              pose.right_elbow.confidence, pose.left_elbow.confidence]
    for (let i = 0; i<Lespos.length; i++){
        if (Lespos[i] < 0.1){
            
            allGood = false;
            break
        }
    }
}


function gotPoses(results) {
  poses = results;
  
  //code starts here
  if (poses.length > 0){
    let pose = poses[0];
    checkDots(pose);
    if (allGood){
        if (static){
            console.log(currentIdeals)
            console.log(myWorkouts)
            currentIdeals = workoutIdealsUp[myWorkouts[0]]
            console.log(currentIdeals)
            if(getDist(pose, currentIdeals) < 800){
                wrongPos = false;
                time -= 0.02;
            } else{
                wrongPos = true;
                time -= 0.005;
            }
            if (time < 0.17){
                beep()
                console.log("timer log: ")
                console.log(myWorkouts)
                myWorkouts.shift(1)
                console.log(myWorkouts)
                // console.log("changing displacement to zero by time < 0.17")
                
                // console.log(totalDist)
                  gradeText.innerHTML = `Grade: ${staticGrade()}`;
                displacement = {x:0, y:0, z:0}
                if (myWorkouts.length==0){
                    // window.location.href = "index.html";
                }
                else if (myWorkouts[0]=="Plank" || myWorkouts[0]=="Wall Sit"){
                    static=true;
                    time = 15;
                } else{
                    static = false;
                    repsLeft = 1 + (2*reps);
                }
            }
            currentStretch.innerHTML = "Time Remaining: " + Math.round(time)

        } else{
            wrongPos = false;
            currentStretch.innerHTML = "reps left: " + Math.floor(repsLeft/2) + "  exercise: " + myWorkouts[0]
            if (movementDir==0){
                nextStretch.innerHTML = "going up"
            } else{
                nextStretch.innerHTML = "going down"
            }
            
            if(getDist(pose, currentIdeals) < 800){
                repsLeft -= 1;
                beep()
                movementDir = (movementDir + 1)%2

                if (repsLeft <= 0){
                    console.log("reps")
                    myWorkouts.shift(1)
                    displacement = {x:0, y:0, z:0}
                    console.log(myWorkouts)
                    if (myWorkouts.length==0){
                        window.location.href = "index.html";
                    }
                    else if (myWorkouts[0]=="Plank" || myWorkouts[0]=="Wall Sit"){
                        console.log("hasty is mid");
                        static=true
                        time = 15;
                    } else{
                        console.log('iabuefwebwfjw')
                        console.log(myWorkouts)
                        static = false;
                        repsLeft = 1 + (2*reps);

                    }
                }

                if (movementDir==1){
                    currentIdeals = workoutIdealsDown[myWorkouts[0]]
                } else {
                    currentIdeals = workoutIdealsUp[myWorkouts[0]]
                }
            }
        }

    }

  }
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();
  bodyPose.detectStart(video, gotPoses);
}

function draw() {
  image(video, 0, 0);
  if (static){
    //console.log("MENIFENK")
    fill(0, 255, 0);
    rect(0, 440, 640-(43*time), 40)
  }
  if (poses.length > 0 & allGood) {
    let pose = poses[0];
    if(wrongPos){
        fill(255,0,0);
    }
    noStroke();
    ellipse(pose.nose.x, pose.nose.y, dotSize)
    ellipse((pose.right_hip.x + pose.left_hip.x)/2, (pose.right_hip.y + pose.left_hip.y)/2, dotSize)

    ellipse(pose.right_wrist.x, pose.right_wrist.y, dotSize)
    ellipse(pose.left_wrist.x, pose.left_wrist.y, dotSize)

    ellipse(pose.right_elbow.x, pose.right_elbow.y, dotSize)
    ellipse(pose.left_elbow.x, pose.left_elbow.y, dotSize)
    
    ellipse(pose.right_shoulder.x, pose.right_shoulder.y, dotSize)
    ellipse(pose.left_shoulder.x, pose.left_shoulder.y, dotSize)
    
    ellipse(pose.right_knee.x, pose.right_knee.y, dotSize)
    ellipse(pose.left_knee.x, pose.left_knee.y, dotSize)

    ellipse(pose.right_ankle.x, pose.right_ankle.y, dotSize)
    ellipse(pose.left_ankle.x, pose.left_ankle.y, dotSize)

    ellipse(pose.right_hip.x, pose.right_hip.y, dotSize)
    ellipse(pose.left_hip.x, pose.left_hip.y, dotSize)

  }
  else{
    fill(255, 255, 255)
    textSize(42)
    textFont('Verdana');
    filter(BLUR, 8);
    textAlign(CENTER);
    text('Please Remain \nFully in Frame', 340, 240);
  }
  
}

function staticGrade() {
  let grade = 'No grade detected';
    console.log("static grade")
    console.log(displacement)
  const totalDisp = Math.sqrt(
    displacement.x ** 2 +
    displacement.y ** 2 +
    displacement.z ** 2
  );
    console.log(totalDisp);
  if (totalDisp < 0.25) grade = 'A+';
  else if (totalDisp < 0.35) grade = 'A';
  else if (totalDisp < 0.55) grade = 'B';
  else if (totalDisp < 1.5) grade = 'C';
  else grade = 'Needs Improvement';
  displacement = { x: 0, y: 0, z: 0 };

  return grade
}


function startFullscreenCountdown() {
  const screen = document.getElementById('fullscreen-countdown');
  let count = 3;
  screen.textContent = count;
  screen.style.display = 'flex';

  const countdown = setInterval(() => {
    count--;
    if (count > 0) {
        beep()
      screen.textContent = count;
    } else {
      clearInterval(countdown);
      screen.style.display = 'none';
      console.log("Countdown done ✅");
    }
  }, 1000);
}

function beep() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'sine';         // sine wave = smooth ding
  oscillator.frequency.value = 880; // 880 Hz = a nice high ding
  gainNode.gain.value = 0.1;        // volume (0.0 to 1.0)

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.2);
}
