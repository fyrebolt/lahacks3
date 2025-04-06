
        // Import Firebase modules
        import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
        import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
        import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

        // Firebase configuration (Replace with your actual Firebase config)
        const firebaseConfig = {
              apiKey: "AIzaSyCSTnMELsGO_6sII4Aw9vRsVgKHH0RD97E",
              authDomain: "lahacks3.firebaseapp.com",
              databaseURL: "https://lahacks3-default-rtdb.firebaseio.com",
              projectId: "lahacks3",
              storageBucket: "lahacks3.firebasestorage.app",
              messagingSenderId: "363279399619",
              appId: "1:363279399619:web:d8c8deaa765265da514076",
              measurementId: "G-1VE0XSZESF"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const database = getDatabase(app);

        // Function to sign up users and store in database
        window.signUp = function () {
            var email = document.getElementById("email").value;
            var password = document.getElementById("password").value;
            var username = email.split("@")[0]; // Use the part before @ as a username

            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;

                    // Store user details in the database
                    set(ref(database, 'users/' + user.uid), {
                        email: email,
                        username: username
                    });

                    alert("Sign-up successful! You can now log in.");
                })
                .catch((error) => {
                    document.getElementById("error-message").innerText = error.message;
                });
        };

        // Function to log in and verify credentials from the database
        window.login = function () {
            var email = document.getElementById("email").value;
            var password = document.getElementById("password").value;

            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;

                    // Check if user exists in the database
                    const userRef = ref(database, 'users/' + user.uid);
                    get(userRef).then((snapshot) => {
                        if (snapshot.exists()) {
                            sessionStorage.setItem("user", username)
                            window.location.href = "home.html"; // Redirect on success
                        } else {
                            document.getElementById("error-message").innerText = "User not found in database.";
                        }
                    });
                })
                .catch((error) => {
                    document.getElementById("error-message").innerText = error.message;
                });
        };
  
