// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { getDatabase, set, get, ref, update } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
    apiKey: "AIzaSyDIZR2sSjEYCEn1S343UOYZjp4sUE3HbB4",
    authDomain: "vendingmachinesurveillance.firebaseapp.com",
    databaseURL: "https://vendingmachinesurveillance-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "vendingmachinesurveillance",
    storageBucket: "vendingmachinesurveillance.firebasestorage.app",
    messagingSenderId: "898316734619",
    appId: "1:898316734619:web:a1efba38a57275c11eb63e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
// const provider = new GoogleAuthProvider();
const db = getDatabase(app);


// logged in and logged out sections
const loggedInView = document.getElementById('logged-in-view-host')
const loggedInViewUser = document.getElementById('logged-in-view-user')
const loggedOutView = document.getElementById('logged-out-view')
const userEmail = document.getElementById('user-email')
const userEmail2 = document.getElementById('user-email2')


// email and password for signin
const emailSignInForm = document.getElementById('signin-email-input')
const passwordSignInForm = document.getElementById('signin-password-input')

// email and password for signup
const emailSignUpForm = document.getElementById('signup-email-input')
const passwordSignUpForm = document.getElementById('signup-password-input')
const rfidSignUpForm = document.getElementById('rfid-input')

// Buttons
// const signInGoogleBtn = document.getElementById('sign-in-with-google-btn')
// const signUpGoogleBtn = document.getElementById('sign-up-with-google-btn')
// const googleBtns = [signInGoogleBtn, signUpGoogleBtn]

const createAccountBtn = document.getElementById('sign-up-btn')
const loginBtn = document.getElementById('sign-in-btn')
const logoutBtn = document.getElementById('logout-button')
const logoutBtn2 = document.getElementById('logout-button2')

const passwordError = document.getElementById('password-error-message')
const emailError = document.getElementById('email-error-message')


// Detects state change
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        const email = user.email
        if (email === "vending@machine.com") {
            loggedInView.style.display = 'block'
            loggedInViewUser.style.display = 'none'
            userEmail.innerText = email
        }
        else {
            loggedInView.style.display = 'none'
            loggedInViewUser.style.display = 'block'
            userEmail2.innerText = email
        }
        loggedOutView.style.display = 'none'

        // ...
    } else {
        // User is signed out
        // ...
        loggedInView.style.display = 'none'
        loggedInViewUser.style.display = 'none'
        loggedOutView.style.display = 'block'
    }
});


// Event Listeners for Buttons
// Click on Create Account Button
createAccountBtn.addEventListener('click', () => {
    if (passwordSignUpForm.value.length <= 6)
        console.log('Not long enough');
    createUserWithEmailAndPassword(auth, emailSignUpForm.value, passwordSignUpForm.value)
        .then((userCredential) => {
            console.log(userCredential.user);

            return get(ref(db, 'Users/NumberOfUsers'));
        })
        .then((snapshot) => {
            if (snapshot.exists()) {
                const number = snapshot.val();

                set(ref(db, 'Users/NumberOfUsers'), number + 1);
                return set(ref(db, 'Users/' + (number + 1)), {
                    uid: auth.currentUser.uid,
                    RFID: rfidSignUpForm.value,
                    Name: emailSignUpForm.value,
                    Credit: 0
                });
            }
        })
        .catch((error) => {
            console.log(error.message);
        });
    console.log('Create Account Button Clicked')
    console.log(`Email: ${emailSignUpForm.value}`)
    console.log(`Password: ${passwordSignUpForm.value}`)

});
// Click on Login Button
loginBtn.addEventListener('click', () => {
    signInWithEmailAndPassword(auth, emailSignInForm.value, passwordSignInForm.value)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            console.log(user)
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorMessage)
        });

    console.log('Login Clicked')
    console.log(`Email: ${emailSignInForm.value}`)
    console.log(`Password: ${passwordSignInForm.value}`)
})

async function addCredit(user, credit_amount) {
    const snapshot = await get(ref(db, 'Users/1'));
    let i = 0;
        while (snapshot.exists()) {
            i++;
            const snapshot = await get(ref(db, 'Users/' + i));
            if (snapshot.exists()) {
                const data = snapshot.val();
                if (user == data.Name) {
                    update(ref(db, 'Users/' + i), {
                        Credit: data.Credit + credit_amount
                    });
                }
            }
        }
    
}

async function changeRGBColor(r, g, b) {
    set(ref(db, 'RGB-Colors/'), {
        Red: r,
        Green: g,
        Blue: b
    });
}

async function readSlot(slotName, slotAdress, amount_slot, price_slot) {
    const snapshot = await get(ref(db, 'Machine/' + slotName)); // ref(db, 'shoppingList/' + slotName) auch als eigene Konstante

    if ((await get(ref(db, 'Machine/' + slotName))).exists()) {
        const data = snapshot.val();
        // Wert in das Input-Feld schreiben
        document.getElementById(slotAdress).value = data.Name;
        document.getElementById(amount_slot).value = data.Quantity;
        document.getElementById(price_slot).value = data.Price + '€';
    } else {
        document.getElementById(slotAdress).value = 'Keine Daten';
        document.getElementById(amount_slot).value = 'X';
        document.getElementById(price_slot).value = 'X€';
    }
}

async function readUser() {
    for (let i = 1; i <= 6; i++) {
        const snapshot = await get(ref(db, 'Machine/Slot' + i)); // ref(db, 'shoppingList/' + slotName) auch als eigene Konstante
        if (snapshot.exists()) {
            const data = snapshot.val();
            // Wert in das Input-Feld schreiben
            document.getElementById('slot' + i + '_field2').value = data.Name;
            document.getElementById('slot' + i + '_amount2').value = data.Quantity;
            document.getElementById('slot' + i + '_price2').value = data.Price + '€';
        } else {
            document.getElementById('slot' + i + '_field2').value = 'Keine Daten';
            document.getElementById('slot' + i + '_amount2').value = 'X';
            document.getElementById('slot' + i + '_price2').value = 'X€';
        }
    }

    const snapshot3 = await get(ref(db, 'Users/1')); // ref(db, 'shoppingList/' + slotName) auch als eigene Konstante
    let i = 0;
    while(snapshot3.exists()) {
        i++;
        const snapshot3 = await get(ref(db, 'Users/' + i)); // ref(db, 'shoppingList/' + slotName) auch als eigene Konstante
        if (snapshot3.exists()) {
            const data = snapshot3.val();
            if (data.Name === auth.currentUser.email) {
                document.getElementById("credit_field2").value = data.Credit;
            }
        }
    }
}

async function set_products(slot_name, name_source, amount_source, price_source) {
    set(ref(db, 'Machine/' + slot_name), {
        Quantity: Number(document.getElementById(amount_source).value),
        Price: Number((document.getElementById(price_source).value).replace('€', '')),
        Name: document.getElementById(name_source).value
    });

}

document.getElementById('reloadBtn').addEventListener('click', () => {
    readSlot('Slot1', 'slot1_field', 'slot1_amount', 'slot1_price');
    readSlot('Slot2', 'slot2_field', 'slot2_amount', 'slot2_price');
    readSlot('Slot3', 'slot3_field', 'slot3_amount', 'slot3_price');
    readSlot('Slot4', 'slot4_field', 'slot4_amount', 'slot4_price');
    readSlot('Slot5', 'slot5_field', 'slot5_amount', 'slot5_price');
    readSlot('Slot6', 'slot6_field', 'slot6_amount', 'slot6_price');
});

document.getElementById('apply_changes_button').addEventListener('click', () => {
    set_products('Slot1', 'slot1_field', 'slot1_amount', 'slot1_price');
    set_products('Slot2', 'slot2_field', 'slot2_amount', 'slot2_price');
    set_products('Slot3', 'slot3_field', 'slot3_amount', 'slot3_price');
    set_products('Slot4', 'slot4_field', 'slot4_amount', 'slot4_price');
    set_products('Slot5', 'slot5_field', 'slot5_amount', 'slot5_price');
    set_products('Slot6', 'slot6_field', 'slot6_amount', 'slot6_price');
});

document.getElementById('apply_credit_button').addEventListener('click', () => {
    const name = document.getElementById("username_field").value;
    const amount = Number(document.getElementById("credit_field").value);
    addCredit(name, amount);
    document.getElementById("username_field").value = "";
    document.getElementById("credit_field").value = "";
});

document.getElementById('set_rgb_button').addEventListener('click', () => {
    const red = Number(document.getElementById("r_input").value);
    const green = Number(document.getElementById("g_input").value);
    const blue = Number(document.getElementById("b_input").value);
    if (red < 256 & red >= 0 & green < 256 & green >= 0 & blue < 256 & blue >= 0) {
        changeRGBColor(red, green, blue);
        document.getElementById("r_input").value = "";
        document.getElementById("g_input").value = "";
        document.getElementById("b_input").value = "";
    }
});

document.getElementById('reloadBtn2').addEventListener('click', () => {
    readUser();
})


// logout button
logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        // Sign-out successful.
    }).catch((error) => {
        // An error happened.
    });

    console.log('Logout Clicked')
})
logoutBtn2.addEventListener('click', () => {
    signOut(auth).then(() => {
        // Sign-out successful.
    }).catch((error) => {
        // An error happened.
    });

    console.log('Logout Clicked')
})

