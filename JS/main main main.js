document.addEventListener('DOMContentLoaded', function() {
    const cartTableBody = document.querySelector('#cartTable tbody');
    const checkoutTableBody = document.querySelector('#checkoutTable tbody');
    const finalTotalPriceElement = document.getElementById('subtotal');
    const checkoutSubtotalElement = document.getElementById('checkout-subtotal');
    const checkoutTotalElement = document.getElementById('checkout-total');
    const addFavoriteButton = document.getElementById('add-favorite');
    const applyFavoriteButton = document.getElementById('apply-favorites');

    const isCartPage = !!cartTableBody;
    const isCheckoutPage = !!checkoutTableBody;

    if (isCartPage) {
        // Clear cart data on page load
        localStorage.removeItem('cartData');
        localStorage.removeItem('finalTotalPrice');

        function updateCart() {
            cartTableBody.innerHTML = '';
            let finalTotalPrice = 0;
            let cartData = JSON.parse(localStorage.getItem('cartData')) || [];

            cartData.forEach(item => {
                const totalPrice = item.price * item.quantity;
                const newRow = document.createElement('tr');
                newRow.setAttribute('data-item', item.name);
                newRow.innerHTML = `
                    <td>
                        <img src="${item.imageSrc}" alt="${item.name}" class="cart-item-image">
                        ${item.name}
                    </td>
                    <td>Rs.${item.price.toFixed(2)}</td>
                    <td><input type="number" class="quantity_input" value="${item.quantity}" min="1"></td>
                    <td>Rs.${totalPrice.toFixed(2)}</td>
                    <td><button class="remove-btn">Remove</button></td>
                `;
                cartTableBody.appendChild(newRow);

                finalTotalPrice += totalPrice;
            });

            finalTotalPriceElement.textContent = finalTotalPrice.toFixed(2);

            // Reattach event listeners
            attachEventListeners();
        }

        function attachEventListeners() {
            document.querySelectorAll('.quantity_input').forEach(input => {
                input.addEventListener('change', function() {
                    const row = this.closest('tr');
                    if (row) {
                        const itemName = row.getAttribute('data-item');
                        const newQuantity = parseFloat(this.value);

                        if (newQuantity > 0) {
                            let cartData = JSON.parse(localStorage.getItem('cartData')) || [];
                            const item = cartData.find(item => item.name === itemName);
                            if (item) {
                                item.quantity = newQuantity;
                                item.total = item.price * newQuantity;
                                localStorage.setItem('cartData', JSON.stringify(cartData));
                                updateCart();
                            }
                        }
                    }
                });
            });

            document.querySelectorAll('.remove-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const row = this.closest('tr');
                    if (row) {
                        const itemName = row.getAttribute('data-item');

                        let cartData = JSON.parse(localStorage.getItem('cartData')) || [];
                        cartData = cartData.filter(item => item.name !== itemName);
                        localStorage.setItem('cartData', JSON.stringify(cartData));
                        updateCart();
                    }
                });
            });
        }

        document.getElementById('buy-now').addEventListener('click', function(event) {
            if (isCartEmpty()) {
                event.preventDefault();
                alert('Your cart is empty');
            } else {
                transferCartToCheckout();
                window.location.href = 'checkout.html';
            }
        });

        addFavoriteButton.addEventListener('click', function() {
            const cartData = JSON.parse(localStorage.getItem('cartData')) || [];
            localStorage.setItem('favoriteData', JSON.stringify(cartData));
            alert("These items have been added to your favorite list.");
        });

        applyFavoriteButton.addEventListener('click', function() {
            const favoriteData = JSON.parse(localStorage.getItem('favoriteData')) || [];
            if (favoriteData.length > 0) {
                localStorage.setItem('cartData', JSON.stringify(favoriteData));
                updateCart();
            }
        });

        function transferCartToCheckout() {
            const rows = cartTableBody.querySelectorAll('tr');
            const cartItems = [];

            rows.forEach(row => {
                const itemName = row.getAttribute('data-item');
                const priceCell = row.cells[1];
                const quantityCell = row.cells[2];
                const totalCell = row.cells[3];

                if (itemName && priceCell && quantityCell && totalCell) {
                    const price = parseFloat(priceCell.textContent.replace('Rs.', '').replace(',', ''));
                    const quantity = parseFloat(quantityCell.querySelector('.quantity_input')?.value || 0);
                    const total = parseFloat(totalCell.textContent.replace('Rs.', '').replace(',', ''));
                    const imageSrc = row.querySelector('.cart-item-image')?.src || '';

                    cartItems.push({ itemName, price, quantity, total, imageSrc });
                }
            });

            const subtotal = parseFloat(finalTotalPriceElement.textContent);
            const total = (subtotal * 1.02).toFixed(2); // Calculate total with 2% tax

            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            localStorage.setItem('subtotal', subtotal.toFixed(2));
            localStorage.setItem('total', total);
        }

        function isCartEmpty() {
            const cartItems = JSON.parse(localStorage.getItem('cartData')) || [];
            return cartItems.length === 0;
        }

        updateCart();
    }

    if (isCheckoutPage) {
        function loadCart() {
            const cartData = JSON.parse(localStorage.getItem('cartItems')) || [];
            const subtotal = localStorage.getItem('subtotal');
            const total = localStorage.getItem('total');

            if (cartData.length > 0) {
                cartData.forEach(item => {
                    const newRow = document.createElement('tr');
                    newRow.innerHTML = `
                        <td>
                            <img src="${item.imageSrc}" alt="${item.itemName}" class="cart-item-image">
                            ${item.itemName}
                        </td>
                        <td>Rs.${parseFloat(item.price).toFixed(2)}</td>
                        <td>${item.quantity}</td>
                        <td>Rs.${parseFloat(item.total).toFixed(2)}</td>
                    `;
                    checkoutTableBody.appendChild(newRow);
                });

                checkoutSubtotalElement.textContent = `Rs.${parseFloat(subtotal).toFixed(2)}`;
                checkoutTotalElement.textContent = `Rs.${parseFloat(total).toFixed(2)}`;
            }
        }

        loadCart();

        const form = document.getElementById('checkoutForm');
        const confirmationMessage = document.getElementById('confirmationMessage');

        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the default form submission

            // Calculate delivery date (e.g., adding 3 days to the current date)
            const today = new Date();
            const deliveryDate = new Date(today.setDate(today.getDate() + 3));

            // Format the delivery date as "12th of July Monday in 2024"
            const day = deliveryDate.getDate();
            const month = deliveryDate.toLocaleString('default', { month: 'long' });
            const weekday = deliveryDate.toLocaleString('default', { weekday: 'long' });
            const year = deliveryDate.getFullYear();

            const formattedDate = `${day}${getOrdinalSuffix(day)} of ${month} ${weekday} in ${year}`;

            // Create a confirmation message
            confirmationMessage.innerHTML = `
                <p>Thank you for your order! Your order will be delivered by ${formattedDate}.</p>
            `;

            // Optionally, you can also reset the form here
            form.reset();
        });

        function getOrdinalSuffix(day) {
            if (day > 3 && day < 21) return 'th'; // covers 11th to 13th
            switch (day % 10) {
                case 1:  return "st";
                case 2:  return "nd";
                case 3:  return "rd";
                default: return "th";
            }
        }
    }
});
