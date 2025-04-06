let video;
let bodyPose;
let connections;
let poses = [];
let dotSize = 12;
let allGood = 1;
let movementDir = 0
let static = false;
let time = 15;

const currentStretch = document.getElementById("currentStretch")
const nextStretch = document.getElementById("nextStretch")
const fp24 = document.getElementById("fp24")
const fp25 = document.getElementById("fp25")

//myWorkouts = sessionStorage.getItem("workout").split(",")
//reps = sessionStorage.getItem("reps")
reps = 3
myWorkouts = ["Push Up", "Squat", "Lunges", "Plank", "Wall Sit"]
//myWorkouts = ["Plank", "Wall Sit"]
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
    "Wall Sit": [0, 170, 160, 160, 165]
}

workoutIdealsDown = {
    "Push Up": [97, 170, 160, 160, 73],
    "Squat": [25, 85, 50, 50, 23.5],
    "Lunges": [15, 140, 110, 110, 23.5],
}

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
            currentIdeals = workoutIdealsUp[myWorkouts[0]]
            if(getDist(pose, currentIdeals) < 800){
                time -= 0.02;
            } else{
                time -= 0.005;
            }
            if (time < 0.17){
                console.log("timer log")
                myWorkouts.shift(1)
                if (myWorkouts.length==0){
                    window.location.href = "index.html";
                }
                else if (myWorkouts[0]=="Plank" || myWorkouts[0]=="Wall Sit"){
                    static=true;
                    timer = 15;
                } else{
                    static = false;
                    repsLeft = 1 + (2*reps);
                }
            }
            currentStretch.innerHTML = "Time Remaining: " + Math.round(time)

        } else{
            currentStretch.innerHTML = "reps left: " + Math.floor(repsLeft/2) + "  exercise: " + myWorkouts[0]
            if (movementDir==0){
                nextStretch.innerHTML = "going up"
            } else{
                nextStretch.innerHTML = "going down"
            }
            
            if(getDist(pose, currentIdeals) < 800){
                repsLeft -= 1;
                
                movementDir = (movementDir + 1)%2

                if (repsLeft <= 0){
                    console.log("reps")
                    myWorkouts.shift(1)
                    console.log(myWorkouts)
                    if (myWorkouts.length==0){
                        window.location.href = "index.html";
                    }
                    else if (myWorkouts[0]=="Plank" || myWorkouts[0]=="Wall Sit"){
                        static=true;
                        timer = 15;
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
  var canvas = createCanvas(640, 480);
  canvas.parent('workoutTop')
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
    if(static && getDist(pose, currentIdeals) > 800){
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
