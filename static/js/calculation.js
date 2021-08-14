"use strict"

// for apply discount
var primary = document.querySelector('.primary-price').textContent;

var discount = function(x, y) {
    var discount = (x - (x * (y / 100)));
    return discount.toFixed(2);
}

document.querySelector('.price12').textContent = discount(primary, 37)

document.querySelector('.price24').textContent = discount(primary, 40)

document.querySelector('.price36').textContent = discount(primary, 43)


// for subscription price and total bill with 5% off 

document.querySelector('.card1').addEventListener('click', function(){
    document.querySelector('.sub-price').textContent = primary
    document.querySelector('.sub-time').textContent = "1 month"
    var total = document.querySelector('.sub-price').textContent
    document.querySelector('.total-bill').textContent = discount(total, 5)
})

document.querySelector('.card12').addEventListener('click', function(){
    document.querySelector('.sub-price').textContent = subcriptionPrice(primary, 12)
    document.querySelector('.sub-time').textContent = "12 months"
    var total = document.querySelector('.sub-price').textContent
    document.querySelector('.total-bill').textContent = discount(total, 5)
})

document.querySelector('.card24').addEventListener('click', function(){
    document.querySelector('.sub-price').textContent = subcriptionPrice(primary, 24)
    document.querySelector('.sub-time').textContent = "24 months"
    var total = document.querySelector('.sub-price').textContent
    document.querySelector('.total-bill').textContent = discount(total, 5)
})

document.querySelector('.card36').addEventListener('click', function(){
    document.querySelector('.sub-price').textContent = subcriptionPrice(primary, 36)
    document.querySelector('.sub-time').textContent = "36 months"
    var total = document.querySelector('.sub-price').textContent
    document.querySelector('.total-bill').textContent = discount(total, 5)
})


var subcriptionPrice = function(x, y) {
    var total = (x * y);
    return total;
}



