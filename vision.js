
let video;
let bodyPose;
let connections;
let poses = [];

function preload() {
  bodyPose = ml5.bodyPose("MoveNet", { flipped: true });
}

function mousePressed() {
  console.log(poses);
}

function gotPoses(results) {
  // Store detected poses in the global array
  poses = results;
}

function setup() {
  // Create canvas for displaying video feed
  createCanvas(640, 480);

  // Capture live video with flipped orientation
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting poses from the video feed
  bodyPose.detectStart(video, gotPoses);
}

function draw() {
  // Display the live video feed
  image(video, 0, 0);

  // Ensure at least one pose is detected before proceeding
  if (poses.length > 0) {
    let pose = poses[0];

    // Draw a circle at the detected nose position
    fill(236, 1, 90);
    noStroke();
    circle(pose.nose.x, pose.nose.y, 48);

    // Draw circles at the detected shoulder positions
    fill(146, 83, 161);
    if (pose.right_knee.confidence >0.1){
      circle(pose.right_knee.x, pose.right_knee.y, 64);
    }
    if (pose.left_knee.confidence >0.1){
        circle(pose.left_knee.x, pose.left_knee.y, 64);
      }
    if (pose.left_shoulder.confidence >0.1){
      circle(pose.left_shoulder.x, pose.left_shoulder.y, 64);
    }
    if (pose.right_shoulder.confidence >0.1){
        circle(pose.right_shoulder.x, pose.right_shoulder.y, 64);
    }
  }
}
