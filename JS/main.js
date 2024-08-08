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
        function updateCart() {
            cartTableBody.innerHTML = '';
            let finalTotalPrice = 0;
            let cartData = [];

            const updatedInputs = document.querySelectorAll('.quantity_input');

            updatedInputs.forEach(function(input) {
                const quantity = parseFloat(input.value);
                if (quantity > 0) {
                    const itemElement = input.closest('.product');
                    const itemName = itemElement.querySelector('.name').textContent;
                    const priceText = itemElement.querySelector('.price').textContent;
                    const price = parseFloat(priceText.replace('Rs.', '').replace(',', ''));
                    const totalPrice = price * quantity;
                    const imageSrc = itemElement.querySelector('.item-image').src;

                    const newRow = document.createElement('tr');
                    newRow.setAttribute('data-item', itemName);
                    newRow.innerHTML = `
                        <td>
                            <img src="${imageSrc}" alt="${itemName}" class="cart-item-image">
                            ${itemName}
                        </td>
                        <td>Rs.${price.toFixed(2)}</td>
                        <td><input type="number" class="quantity_input" value="${quantity}" min="1"></td>
                        <td>Rs.${totalPrice.toFixed(2)}</td>
                        <td><button class="remove-btn">Remove</button></td>
                    `;
                    cartTableBody.appendChild(newRow);

                    finalTotalPrice += totalPrice;

                    cartData.push({
                        name: itemName,
                        price: price,
                        quantity: quantity,
                        total: totalPrice,
                        imageSrc: imageSrc
                    });

                    newRow.querySelector('.remove-btn').addEventListener('click', function() {
                        const itemIndex = cartData.findIndex(item => item.name === itemName);
                        if (itemIndex > -1) {
                            cartData.splice(itemIndex, 1);
                        }

                        newRow.remove();
                        finalTotalPrice -= totalPrice;
                        finalTotalPriceElement.textContent = finalTotalPrice.toFixed(2);

                        localStorage.setItem('cartData', JSON.stringify(cartData));
                        localStorage.setItem('finalTotalPrice', finalTotalPrice.toFixed(2));
                    });

                    newRow.querySelector('.quantity_input').addEventListener('change', updateCart);
                }
            });

            finalTotalPriceElement.textContent = finalTotalPrice.toFixed(2);
            localStorage.setItem('cartData', JSON.stringify(cartData));
            localStorage.setItem('finalTotalPrice', finalTotalPrice.toFixed(2));
        }

        const quantityInputs = document.querySelectorAll('.quantity_input');
        quantityInputs.forEach(function(input) {
            input.addEventListener('change', updateCart);
        });

        document.getElementById('buy-now').addEventListener('click', function() {
            transferCartToCheckout();
            window.location.href = 'checkout.html';
        });

        addFavoriteButton.addEventListener('click', function() {
            const cartData = JSON.parse(localStorage.getItem('cartData')) || [];
            localStorage.setItem('favoriteData', JSON.stringify(cartData));
            alert("These items have been added to your favorite list.");
        });

        applyFavoriteButton.addEventListener('click', function() {
            const favoriteData = JSON.parse(localStorage.getItem('favoriteData')) || [];
            if (favoriteData.length > 0) {
                cartTableBody.innerHTML = '';
                let finalTotalPrice = 0;

                favoriteData.forEach(function(item) {
                    const newRow = document.createElement('tr');
                    newRow.setAttribute('data-item', item.name);
                    newRow.innerHTML = `
                        <td>
                            <img src="${item.imageSrc}" alt="${item.name}" class="cart-item-image">
                            ${item.name}
                        </td>
                        <td>Rs.${item.price.toFixed(2)}</td>
                        <td><input type="number" class="quantity_input" value="${item.quantity}" min="1"></td>
                        <td>Rs.${item.total.toFixed(2)}</td>
                        <td><button class="remove-btn">Remove</button></td>
                    `;
                    cartTableBody.appendChild(newRow);

                    finalTotalPrice += item.total;

                    newRow.querySelector('.quantity_input').addEventListener('change', updateCart);

                    newRow.querySelector('.remove-btn').addEventListener('click', function() {
                        newRow.remove();
                        updateCart();
                    });
                });

                finalTotalPriceElement.textContent = finalTotalPrice.toFixed(2);

                const newQuantityInputs = document.querySelectorAll('.quantity_input');
                newQuantityInputs.forEach(function(input) {
                    input.addEventListener('change', updateCart);
                });

                localStorage.setItem('cartData', JSON.stringify(favoriteData));
                localStorage.setItem('finalTotalPrice', finalTotalPrice.toFixed(2));
            }
        });

        function transferCartToCheckout() {
            const rows = cartTableBody.querySelectorAll('tr');
            const cartItems = [];

            rows.forEach(row => {
                const itemName = row.getAttribute('data-item');
                const price = row.cells[1].textContent.replace('Rs.', '').replace(',', '');
                const quantity = row.cells[2].querySelector('.quantity_input').value;
                const total = row.cells[3].textContent.replace('Rs.', '').replace(',', '');
                const imageSrc = row.querySelector('.cart-item-image').src;

                cartItems.push({ itemName, price, quantity, total, imageSrc });
            });

            const subtotal = finalTotalPriceElement.textContent;
            const total = document.getElementById('total')?.textContent || subtotal;

            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            localStorage.setItem('subtotal', subtotal);
            localStorage.setItem('total', total);
        }

        updateCart();
    }

    if (isCheckoutPage) {
        loadCart();

        function loadCart() {
            const cartData = JSON.parse(localStorage.getItem('cartItems')) || [];
            const subtotal = localStorage.getItem('subtotal');
            const total = localStorage.getItem('total');

            if (cartData.length > 0) {
                cartData.forEach(function(item) {
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

        const form = document.getElementById('checkoutForm');
        const confirmationMessage = document.getElementById('confirmationMessage');

        form.addEventListener('submit', function(event) {
            event.preventDefault();

            const today = new Date();
            const deliveryDate = new Date(today.setDate(today.getDate() + 3));

            const options = { weekday: 'long', month: 'long', year: 'numeric' };
            const formattedDate = deliveryDate.toLocaleDateString('en-US', options);

            confirmationMessage.innerHTML = `
                <p>Thank you for your order! Your order will be delivered by ${formattedDate}.</p>
            `;

            form.reset();
        });
    }
});
