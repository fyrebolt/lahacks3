let video;
let poseNet;
let pose;
let inView = 1
let ticks = 0

const timer = document.getElementById("timer")
const currentStretch = document.getElementById("currentStretch")
const nextStretch = document.getElementById("nextStretch")
const accuracy = document.getElementById("accuracy")
const done2 = document.getElementById("done2")
done2.onclick = (event) =>{
    event.preventDefault()
    window.location.href="home.html"
}
errors = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100]

cameraOn = 1
dotSize = 15
myWorkouts = sessionStorage.getItem("workout").split(",")
    if (myWorkouts[0]=="null"){
        myWorkouts.push("warrior2")
    }

function visionLoad(){
    if(localStorage.getItem("loggedIn")!="yes"){
        window.location.href = "index.html";
    }
    myWorkouts = sessionStorage.getItem("workout").split(",")
    if (myWorkouts[0]=="null"){
        myWorkouts.push("warrior2")
    }
}

time = 15
workoutIdeals = {
    "butterfly": [40, 40, 74, 100, 100],
    "downwarddog": [160, 160, 125, 25, 25],
    "crescent": [90, 140, 160, 180, 180],
    "easy": [50, 50, 75, 100, 100],
    "triangle": [180, 180, 150, 50, 150],
    "reversewarrior": [160, 180, 83, 180, 50],
    "tree": [40, 170, 170, 90, 90],
    "warrior1": [180, 180, 145, 90, 90],
    "warrior2": [127, 170, 133, 90, 90],
    "warrior3": [160, 160, 130, 120, 120],

}


currentStretch.innerHTML = toDisplay(myWorkouts[0])
if (myWorkouts.length > 1){
    nextStretch.innerHTML = toDisplay(myWorkouts[1])
} else{
    nextStretch.innerHTML = "Workout complete!"
}

function setup() {
    var canvas = createCanvas(680, 480);
    canvas.parent('workoutTop')
    video = createCapture(VIDEO)
    video.hide()
    poseNet = ml5.poseNet(video, modelLoaded)
    poseNet.on('pose', gotPoses)
  }

function getDist(pose, currWorkout, checkTo){
    angles = [0, 0, 0, 0, 0]
    diff=0;
    angles[3] = getAngle(pose.rightWrist.x, pose.rightWrist.y, 
        pose.rightShoulder.x, pose.rightShoulder.y, 
        pose.rightHip.x, pose.rightHip.y)
    angles[4] = getAngle(pose.leftWrist.x, pose.leftWrist.y, 
        pose.leftShoulder.x, pose.leftShoulder.y, 
        pose.leftHip.x, pose.leftHip.y)
    angles[0] = getAngle(pose.rightHip.x, pose.rightHip.y, 
        pose.rightKnee.x, pose.rightKnee.y, 
        pose.rightAnkle.x, pose.rightAnkle.y)
    angles[1] = getAngle(pose.leftHip.x, pose.leftHip.y, 
        pose.leftKnee.x, pose.leftKnee.y, 
        pose.leftAnkle.x, pose.leftAnkle.y)
    angles[2] = getAngle(pose.leftKnee.x, pose.leftKnee.y,
        pose.leftHip.x, pose.leftHip.y, 
        pose.leftShoulder.x, pose.leftShoulder.y)
    //console.log(angles[2])
    for (let i=0; i<checkTo; i++){
        //console.log((angles[i] - currWorkout[i]))
        diff += (angles[i] - currWorkout[i])**2
    }
    proximity = 100 / (1 + 0.05 * Math.pow(1.1, Math.sqrt(diff)-35))
    accuracy.innerHTML = Math.round(proximity * 100) / 100
    return Math.sqrt(diff)
}

function checkDots(pose){
    allGood = true;
    Lespos = [pose.nose.confidence, pose.rightHip.confidence, pose.leftHip.confidence, 
              pose.rightShoulder.confidence, pose.leftShoulder.confidence, pose.rightKnee.confidence, 
              pose.leftKnee.confidence, pose.rightAnkle.confidence, pose.leftAnkle.confidence]
    for (let i = 0; i<Lespos.length; i++){
        if (Lespos[i] < 0.1){
            
            allGood = false;
            break
        }
    }
    if (allGood == true){
        
    }
}

function gotPoses(poses){
    //console.log(poses)
    if (poses.length > 0){
        inView = 1
        pose = poses[0].pose;
        checkDots(pose)
        checkTo=5;
        if(myWorkouts[0]=="easy" || myWorkouts[0]=="triangle" || myWorkouts[0]=="tree"){
            checkTo=3
        }
        errors.shift()
        errors.push(getDist(pose, workoutIdeals[myWorkouts[0]], checkTo))
        avg = 0
        for (let i = 0; i<errors.length; i++){
            avg += errors[i]
        }
        if (avg < 400){
            time -= 0.15
        } else{
            time -= 0.01
        }
        ticks += 1;
        
        timer.innerHTML = "Time Remaining: " + Math.round(time)
        if (time <= 0.2){
            pushStretchR(myWorkouts[0], ticks);
            myWorkouts.shift(1)
            time=15
            if (myWorkouts.length == 0){
                document.getElementById('workoutTop').style.display = "none"
                document.getElementById('workoutBottom').style.display = "none"
                document.getElementById('workoutDone').style.display = "flex"
            } 
            else{
                currentStretch.innerHTML = toDisplay(myWorkouts[0])
                if (myWorkouts.length > 1){
                    nextStretch.innerHTML = toDisplay(myWorkouts[1])
                } else{
                    nextStretch.innerHTML = "Workout complete!"
                }
                //stretchesLeft.innerHTML = myWorkouts.length
            }
        }
    } else{
        inView = 0
        
        
    }
}

function modelLoaded(){
    console.log("loaded")
}



function getAngle(Ax, Ay, Bx, By, Cx, Cy){
    b=Math.sqrt((Ax - Bx)**2 + (Ay - By)**2)
    a=Math.sqrt((Cx - Bx)**2 + (Cy - By)**2)
    c=Math.sqrt((Ax - Cx)**2 + (Ay - Cy)**2)
    return 57.3 * Math.acos((a**2 + b**2 - c**2) / (2 * a * b))
}

  function draw() {
    if (cameraOn == 1){
        background(220);
        image(video, 0, 0)
        avg=0
        for (let i = 0; i<errors.length; i++){
            avg += errors[i]
        }
        // fill(0, 255, 0)
        // rect(640, (time)*32, 659, 459)
        if (avg < 400){
            fill(0,255,0)
        } else{
            fill(255,0,0)
        }
        if (pose) {
            ellipse(pose.nose.x, pose.nose.y, dotSize)
            ellipse((pose.rightHip.x + pose.leftHip.x)/2, (pose.rightHip.y + pose.leftHip.y)/2, dotSize)

            ellipse(pose.rightWrist.x, pose.rightWrist.y, dotSize)
            ellipse(pose.leftWrist.x, pose.leftWrist.y, dotSize)
            
            ellipse(pose.rightShoulder.x, pose.rightShoulder.y, dotSize)
            ellipse(pose.leftShoulder.x, pose.leftShoulder.y, dotSize)
            
            ellipse(pose.rightKnee.x, pose.rightKnee.y, dotSize)
            ellipse(pose.leftKnee.x, pose.leftKnee.y, dotSize)

            ellipse(pose.rightAnkle.x, pose.rightAnkle.y, dotSize)
            ellipse(pose.leftAnkle.x, pose.leftAnkle.y, dotSize)

            ellipse(pose.rightHip.x, pose.rightHip.y, dotSize)
            ellipse(pose.leftHip.x, pose.leftHip.y, dotSize)

            //fill(0, 0, 0)
            //strokeWeight(5)
            //line(pose.nose.x, pose.nose.y,(pose.rightHip.x + pose.leftHip.x)/2, (pose.rightHip.y + pose.leftHip.y)/2)

        } 
        fill(0, 180, 0)
        rect(640, (time)*32, 659, 459)
        if(inView==0){
            fill(255, 255, 255)
            textSize(42)
            textFont('Verdana');
            filter(BLUR, 8);
            textAlign(CENTER);
            text('Please Enter Frame', 340, 240);
        }
    } 
    
  }
