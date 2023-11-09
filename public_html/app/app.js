document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-button');
    const itemSearch = document.getElementById('item-search');
    const itemList = document.getElementById('item-list');
    const welcomeMessageDiv = document.getElementById('welcome-message');

    // Fetch the username from the server and update the welcome message
    fetch('/get/username')
        .then(response => response.text())
        .then(username => {
            welcomeMessageDiv.textContent = `Welcome, ${username}! What would you like to do?`;
        })
        .catch(error => {
            console.error('Error fetching username:', error);
        });
});

async function getUsername() {
    try {
        const response = await fetch('/get/username');
        const username = await response.text();
        return username;
    } catch (error) {
        console.error('Error getting username:', error);
    }
}

async function searchItems() {
    try {
        const itemSearch = document.getElementById('item-search');
        const itemList = document.getElementById('item-list');
        const keyword = itemSearch.value;

        const response = await fetch(`/search/items/${keyword}`);
        const data = await response.json();

        // Clear existing items in item-list
        itemList.innerHTML = '';

        // Display the results in item-list
        data.forEach(item => {
            const itemElement = Object.assign(document.createElement('div'), { className: 'list' });
            itemElement.innerHTML = `
                <h2>${item.title}</h2>
                <p>Description: ${item.description}</p>
                <p>"${item.image}"<p>
                <p>Price: $${item.price.toFixed(2)}</p>
                <p>Status: ${item.stat}</p>
                <button onclick="buyNow('${item._id}')">Buy Now!</button>
            `;
            itemList.appendChild(itemElement);
        });
    } catch (error) {
        console.error('Error searching items:', error);
    }
}

async function searchListings() {
    try {
        const username = await getUsername();

        const response = await fetch(`/get/listings/${username}`);
        const data = await response.json();

        const itemList = document.getElementById('item-list');
        itemList.innerHTML = '';

        // Fetch details for each item and display in item-list
        await Promise.all(data.map(async (itemID) => {
            const itemResponse = await fetch(`/get/item/${itemID}`);
            const item = await itemResponse.json();

            const itemElement = Object.assign(document.createElement('div'), { className: 'list' });
            itemElement.innerHTML = `
                <h2>${item.title}</h2>
                <p>Description: ${item.description}</p>
                <p>"${item.image}"<p>
                <p>Price: $${item.price.toFixed(2)}</p>
                <p>Status: ${item.stat}</p>
            `;
            itemList.appendChild(itemElement);
        }));
    } catch (error) {
        console.error('Error searching listings:', error);
    }
}

async function searchPurchases() {
    try {
        const username = await getUsername();

        const response = await fetch(`/get/purchases/${username}`);
        const data = await response.json();

        const itemList = document.getElementById('item-list');
        itemList.innerHTML = '';

        // Fetch details for each purchased item and display in item-list
        await Promise.all(data.map(async (itemID) => {
            const itemResponse = await fetch(`/get/item/${itemID}`);
            const item = await itemResponse.json();

            const itemElement = Object.assign(document.createElement('div'), { className: 'list' });
            itemElement.innerHTML = `
                <h2>${item.title}</h2>
                <p>Description:${item.description}</p>
                <p>"${item.image}"<p>
                <p>Price: $${item.price.toFixed(2)}</p>
                <p>Status: ${item.stat}</p>
            `;
            itemList.appendChild(itemElement);
        }));
    } catch (error) {
        console.error('Error searching purchases:', error);
    }
}

async function buyNow(itemID) {
    try {
        const response = await fetch(`/buy/item/${itemID}`);
        const data = await response.json();

        if (data.status === 'success') {
            // Purchase was successful, you can update the UI or show a message
            console.log('Item purchased successfully.');
        } else {
            // Handle the case where the purchase failed
            console.error('Buy Now failed.');
        }

        // Refresh the item list after the purchase
        searchItems();
    } catch (error) {
        console.error('Error buying item:', error);
    }
}