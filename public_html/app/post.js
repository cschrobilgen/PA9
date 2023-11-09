document.addEventListener('DOMContentLoaded', () => {
    const addItemForm = document.getElementById('add-item-form');   
    
    addItemForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const image = document.getElementById('image').value;
        const price = parseFloat(document.getElementById('price').value);
        const username = document.getElementById('itemUser').value;

        // Send a POST request to /add/user with title, description, image, price, and status
        fetch(`/add/item/${username}`, {
            method: 'POST',
            body: JSON.stringify({ title, description, image, price}),
            headers: {'Content-Type': 'application/json',},
        })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
        });
    });
});