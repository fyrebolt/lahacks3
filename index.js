
function myFunction(x) {
    if (x.matches) { 
        //phone
        document.getElementById("cp").style.display = "none"
        document.getElementById("c").style.display = "none"
        document.getElementById("pc").style.display = "block"
        document.getElementById("p").style.display = "block"
    } else {
        //computer
        document.getElementById("pc").style.display = "none"
        document.getElementById("p").style.display = "none"
        document.getElementById("cp").style.display = "inline"
        document.getElementById("c").style.display = "inline"
    }
  }
  
  // Create a MediaQueryList object
  var x = window.matchMedia("(max-width: 700px)")
  
  // Call listener function at run time
  myFunction(x);
  
  // Attach listener function on state changes
  x.addEventListener("change", function() {
    myFunction(x);
  });
document.getElementById("cp").onclick = () => {
    sessionStorage.setItem("cp",true)
}
document.getElementById("c").onclick = () => {
    sessionStorage.setItem("cp",false)
    
}
