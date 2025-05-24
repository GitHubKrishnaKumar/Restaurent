document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const foodGrid = document.getElementById('food-grid');
    const orderButton = document.getElementById('order-button');
    const orderStatusDiv = document.getElementById('order-status');
    const orderListUl = document.getElementById('order-list');

    // JSON Link
    const jsonLink = 'https://raw.githubusercontent.com/saksham-accio/f2_contest_3/main/food.json';

    // Global variable to store all fetched food items
    let allFoodItems = [];

    /**
     * Task 1: getMenu()
     * Fetches the menu items from the JSON link and displays them.
     * Runs on page load.
     */
    async function getMenu() {
        orderStatusDiv.textContent = 'Loading menu items...';
        try {
            const response = await fetch(jsonLink);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allFoodItems = await response.json(); // Store all items for later use
            displayFoodItems(allFoodItems);
            orderStatusDiv.textContent = 'Menu loaded successfully! Click "Place New Order" to begin.';
        } catch (error) {
            console.error('Error fetching food data:', error);
            foodGrid.innerHTML = '<p style="color: red; text-align: center; font-size: 1.2em;">Failed to load menu. Please check your internet connection or try again later.</p>';
            orderStatusDiv.textContent = 'Failed to load menu.';
            orderButton.disabled = true; // Disable order button if menu fails to load
        }
    }

    function displayFoodItems(items) {
        foodGrid.innerHTML = '';
        if (items.length === 0) {
            foodGrid.innerHTML = '<p style="text-align: center;">No menu items available.</p>';
            return;
        }

        items.map(item => {
            const foodItemDiv = document.createElement('div');
            foodItemDiv.classList.add('food-item'); 
            foodItemDiv.innerHTML = `
                <img src="${item.imgSrc}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p>$${item.price.toFixed(2)}</p>
                <button class="add-to-cart">+</button>
            `;
            foodGrid.appendChild(foodItemDiv);
        });
    }

    // task 2: takeOrder()
    function takeOrder() {
        return new Promise(resolve => {
            orderStatusDiv.textContent = 'Taking your order (2.5 seconds)...';
            orderListUl.innerHTML = '<li>Processing your request...</li>';
            setTimeout(() => {
                const burgers = allFoodItems.filter(item => item.name.toLowerCase().includes('burger'));
                const selectedItems = [];

                // Select 3 random burgers or any 3 random items if burgers are scarce
                if (burgers.length >= 3) {
                    // Shuffle burgers and take the first 3
                    const shuffledBurgers = [...burgers].sort(() => 0.5 - Math.random());
                    selectedItems.push(...shuffledBurgers.slice(0, 3));
                } else if (allFoodItems.length >= 3) {
                    const shuffledAllItems = [...allFoodItems].sort(() => 0.5 - Math.random());
                    selectedItems.push(...shuffledAllItems.slice(0, 3));
                } else {
                    
                    selectedItems.push(...allFoodItems);
                }

                // Display ordered items in the UI
                orderListUl.innerHTML = '';
                if (selectedItems.length > 0) {
                    selectedItems.forEach(item => {
                        const li = document.createElement('li');
                        li.textContent = ` ${item.name} - $${item.price.toFixed(2)}`;
                        orderListUl.appendChild(li);
                    });
                } else {
                    orderListUl.innerHTML = '<li>No items were selected for the order.</li>';
                }

                resolve({ order: selectedItems });
            }, 2500);
        });
    }

//    task 3: orderPrep()
    function orderPrep() {
        return new Promise(resolve => {
            orderStatusDiv.textContent = 'Order is being prepared (1.5 seconds)...';
            setTimeout(() => {
                resolve({ order_status: true, paid: false });
            }, 1500);
        });
    }

//    task4: payOrder()
    function payOrder() {
        return new Promise(resolve => {
            orderStatusDiv.textContent = 'Processing payment (1 second)...';
            setTimeout(() => {
                resolve({ order_status: true, paid: true });
            }, 1000);
        });
    }

    /**
     * Task 5: thankyouFnc()
     * Displays a thank you message.
     */
    function thankyouFnc() {
        orderStatusDiv.textContent = 'Order completed successfully!';
        alert('Thank you for eating with us today! We hope to see you again!');
    }

    // --- Main Order Process Orchestration (Promise Chaining with Async/Await) ---
    orderButton.addEventListener('click', async () => {
        // Disable button to prevent multiple simultaneous orders
        
        orderButton.disabled = true;
        orderStatusDiv.textContent = 'Initiating order process...';
        orderListUl.innerHTML = '<li>Awaiting order selection...</li>'; // Clear previous order display

        try {
            // 1. Take the order
            const orderResult = await takeOrder();
            console.log('Order taken:', orderResult.order);

            // 2. Prepare the order
            const prepStatus = await orderPrep();
            console.log('Order preparation status:', prepStatus);

            if (prepStatus.order_status) {
                // 3. Pay for the order
                const paymentStatus = await payOrder();
                console.log('Payment status:', paymentStatus);

                if (paymentStatus.paid) {
                    // 4. Thank the customer
                    thankyouFnc();
                } else {
                    // Handle payment failure (though current logic always succeeds)
                    orderStatusDiv.textContent = 'Payment could not be processed.';
                    alert('Payment failed. Please try again.');
                }
            } else {
                // Handle preparation failure
                orderStatusDiv.textContent = 'Order preparation failed.';
                alert('Order preparation failed. Please contact staff.');
            }
        } catch (error) {
            console.error('An error occurred during the order process:', error);
            orderStatusDiv.textContent = `Order process failed: ${error.message}`;
            alert(`An unexpected error occurred: ${error.message}`);
        } finally {
            orderButton.disabled = false;
        }
    });

    // Initial call to load the menu when the page is ready
    getMenu();
});