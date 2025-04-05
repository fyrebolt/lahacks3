
let video;
let bodyPose;
let connections;
let poses = [];
let dotSize = 15;

const currentStretch = document.getElementById("currentStretch")
const nextStretch = document.getElementById("nextStretch")

function preload() {
  bodyPose = ml5.bodyPose("MoveNet", { flipped: true });
}

function mousePressed() {
  console.log(poses);
}

function getAngle(Ax, Ay, Bx, By, Cx, Cy){
    b=Math.sqrt((Ax - Bx)**2 + (Ay - By)**2)
    a=Math.sqrt((Cx - Bx)**2 + (Cy - By)**2)
    c=Math.sqrt((Ax - Cx)**2 + (Ay - Cy)**2)
    return 57.3 * Math.acos((a**2 + b**2 - c**2) / (2 * a * b))
}

function gotPoses(results) {
  poses = results;
  //code starts here
  let pose = poses[0];
  currentStretch.innerHTML = toDisplay(getAngle(pose.nose.x, pose.nose.y, (pose.right_hip.x + pose.left_hip.x)/2, (pose.right_hip.y + pose.left_hip.y)/2, (pose.right_hip.x + pose.left_hip.x)/2, (pose.right_hip.y + pose.left_hip.y)/2 -1))
  nextStretch.innerHTML  = toDisplay(getAngle(pose.right_shoulder.x, pose.right_shoulder.y, pose.right_elbow.x, pose.right_elbow.y, ))
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();
  bodyPose.detectStart(video, gotPoses);
}

function draw() {
  image(video, 0, 0);
  if (poses.length > 0) {
    let pose = poses[0];
    fill(255,0,0);
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
}
