// Chris Schrobilgen
// CSC 337
// Client side javascript to send asynchronous requests to the server using the HTML buttons and text fields

// Utilizing event listeners from the User form and the Item form
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const createAccountForm = document.getElementById('create-account');

    console.log('DOM loaded')

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        let username = document.getElementById('login-username').value;
        let password = document.getElementById('login-password').value;
        const loginData = { username: username, password: password };
        
        console.log(loginData);

        // Send a POST request to /add/user with username and password
        let p = fetch('/login', {
            method: 'POST',
            body: JSON.stringify(loginData),
            headers: { 'Content-Type': 'application/json' },
        });

        p.then((response) => {
            return response.json();
        }); // Return the promise here*/

        p.then((response) => {
            console.log(response);
            if (response.status == 401) {
                alert('Login Failed');
            } else {
                alert('Login Successful')
                window.location.href = '/app/home.html';
            }
        });
    });

    createAccountForm.addEventListener('submit', (event) => {
        event.preventDefault();
        let username = document.getElementById('create-username').value;
        let password = document.getElementById('create-password').value;
        createAccountData = { username: username, password: password };

        // Send a POST request to /add/user with username and password
        let p = fetch('/add/user', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: {'Content-Type': 'application/json',},
        })
        p.then((response) => {
            return response.json();
        }); // Return the promise here*/

        p.then((response) => {
            console.log(response);
            if (response.status == 401) {
                alert('Account Creation Failed');
            } else {
                alert('Account Creation Successful')
            }
        });
    });
});
    /* addItemForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const image = document.getElementById('image').value;
        const price = parseFloat(document.getElementById('price').value);
        const status = document.getElementById('status').value;
        const username = document.getElementById('itemUser').value;

        // Send a POST request to /add/user with title, description, image, price, and status
        fetch(`/add/item/${username}`, {
            method: 'POST',
            body: JSON.stringify({ title, description, image, price, status}),
            headers: {'Content-Type': 'application/json',},
        })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
        });
    }); */

