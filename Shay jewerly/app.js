// Variables
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDom = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDom = document.querySelector('.products-center');
const buttons = document.querySelectorAll('.bag-btn')
// Cart array
let cart = []
// Buttons array
let buttonsDom = [];
// Getting the products
class Products{
 async getProducts(){
  try {
    let result = await fetch("/products.json"); // Get the products json file
    let data = await result.json(); 
    let products = data.items; // The name of the items array
    products = products.map(item =>{ 
      const {id,img,title,name,price} = item;
      return {id,img,title,name,price} // Getting the properties from the array
    })
    return products;
  } catch (error) {
  }
 }
}
// Display the products
class UI{
displayProducts(products){
let result = ''; // Empty variable that display the products with iteration
products.forEach(object =>{
  result += `<article class="product">
    <div class="img-container text-center">
      <img class="product-img rounded-2" style='height:300px; width:300px;' src='${object.img}'>
      <button class="bag-btn" data-id="${object.id}"><i class="fa-solid fa-cart-plus"></i>Add To Cart</button></img>
      <h5>${object.title}</h5>
      <p>${object.name}</p>
      <h6>${object.price} ILS</h6>
    </div>
  </article>`
})
productsDom.innerHTML = result; // display the products into the HTML container
}
getBagButtons(){ // Getting every button in the iteration separately
  const buttons = [...document.querySelectorAll('.bag-btn')]; 
  buttonsDom = buttons; // Set buttons array into new empty array
  buttons.forEach(button => {
    let id = button.dataset.id; // Get the id from every single button of the products
    let inCart = cart.find(item => item.id === id); // Find item in the cart
    if(inCart){
      button.innerText = 'In Cart'; // Set the text in the button to: In Cart
      button.disabled = true; // Disabled the button 
    }
      button.addEventListener('click', (event) =>{ // The event on every single button
        event.target.innerText = 'In Cart';
        event.target.disabled = true;
        // Get product from products (based on the id)
        let cartItem = { ...Storage.getProduct(id), amount: 1};
        // Add product to the cart array
        cart = [...cart, cartItem];
        // Save cart in local storage
        Storage.saveCart(cart)
        // Set cart values to the cart container
        this.setCartValues(cart);
        // Add cart item to the cart container
        this.addCartItem(cartItem);
        // Show the cart container
        this.showCart()
      })
    }
  )
 }
 setCartValues(cart){ // Sets the cart values 
  let tempTotal = 0; // The number of the total in default
  let itemsTotal = 0; // The number of the cart items in default
  cart.map(item =>{ 
    tempTotal += item.price * item.amount; // Update the total the price multiplied by the amount of products
    itemsTotal += item.amount; // Update the amount of items in cart
  })
  cartTotal.innerText = parseFloat(tempTotal.toFixed(2)) // Setup total and fix the numbers amount
  cartItems.innerText = itemsTotal; // Setup cart items
 }
 addCartItem(item){ // Add item to the cart 
 const bag = document.createElement('div'); // Create the bag and the elements inside the bag
 bag.classList.add('cart-item');
 bag.innerHTML += `<img src="${item.img}" alt=""> 
 <div>
   <h4>${item.title}/h4>
   <p>${item.name}</p>
   <h5>${item.price} ILS</h5>
   <span class="remove-item" data-id="${item.id}">Remove</span>
 </div>
 <div>
   <i class="fas fa-chevron-up" data-id="${item.id}"></i>
   <h6 class="item-amount text-center">${item.amount}</h6>
   <i class="fas fa-chevron-down" data-id="${item.id}"></i>
 </div>`
 cartContent.appendChild(bag) // Append bag into the cart container
 }
 showCart(){ // Show the cart 
  cartOverlay.classList.add('transparentBcg');
  cartDom.classList.add('showCart');
 }
 setupApp(){ // Change the cart items as well as the cart total is in the cart
  cart = Storage.getCart(); 
  this.setCartValues(cart);
  this.populateCart(cart);
  cartBtn.addEventListener('click', this.showCart);
  closeCartBtn.addEventListener('click', this.hideCart);
}
 populateCart(cart){ // Add every item in the cart to the method
  cart.forEach(item => this.addCartItem(item));
 }
 hideCart(){ // Hide the cart
  cartOverlay.classList.remove('transparentBcg');
  cartDom.classList.remove('showCart');
 }
 cartLogic(){ // Event that calling to the method 
  // Clear cart button
  clearCartBtn.addEventListener('click', ()=>{
    this.clearCart();
  });
  //  Cart functionality
  cartContent.addEventListener('click', event =>{ // Event on every element in the div
    if (event.target.classList.contains('remove-item')) { // Target on specific class element
      let removeItem = event.target;
      let id = removeItem.dataset.id;
      cartContent.removeChild(removeItem.parentElement.parentElement); // Remove the item include the div
      this.removeItem(id) // Remove and update cart
    }else if (event.target.classList.contains('fa-chevron-up')){
      let addAmount = event.target;
      let id = addAmount.dataset.id;
      let tempItem = cart.find(item => item.id === id); // Find item in array by id
      tempItem.amount = tempItem.amount +1; // Add number to amount 
      Storage.saveCart(cart); // Updating storage 
      this.setCartValues(cart); // Updating cart 
      addAmount.nextElementSibling.innerText = tempItem.amount; // Display the result in cart
    }else if (event.target.classList.contains('fa-chevron-down')){
      let pullAmount = event.target;
      let id = pullAmount.dataset.id;
      let tempItem = cart.find(item => item.id === id);
      tempItem.amount = tempItem.amount -1;
      if (tempItem.amount > 0) {
        Storage.saveCart(cart);
        this.setCartValues(cart);
      }else{
        cartContent.removeChild(pullAmount.parentElement.parentElement); // Remove div if item value is below 0
        this.removeItem(id); // Also remove from storage and cart 
        pullAmount.previousElementSibling.innerText = tempItem.amount;
      }
    }
  });
 }
 clearCart(){ // Create array from id's in cart and remove them
  let cartItems = cart.map(item => item.id);
  cartItems.forEach(id => this.removeItem(id));

  while(cartContent.children.length>0){ // Removing index from array 
    cartContent.removeChild(cartContent.children[0])
  }
  this.hideCart();
 }
 removeItem(id){ // Removing item by id and updating correct storage
  cart = cart.filter(item => item.id !== id);
  this.setCartValues(cart);
  Storage.saveCart(cart);
  let button = this.getSingleButton(id);
  button.disabled = false;
  button.innerHTML = `<i class ="fa-solid fa-cart-plus"></i>Add to cart"`;
 }
 getSingleButton(id){ // Getting the id of every button in array
  return buttonsDom.find(button => button.dataset.id === id);
 }
}
// Local storage
class Storage{
static saveProducts(products){ // Save the array to local storage
  localStorage.setItem('products', JSON.stringify(products)) 
 }
 static getProduct(id){ // Store the item by id
  let products = JSON.parse(localStorage.getItem('products')); 
  return products.find(product => product.id === id); // Return the specific product from storage if it matches 
 }
 static saveCart(cart){ // Saving cart to local storage
  localStorage.setItem('cart', JSON.stringify(cart)); 
 }
 static getCart(){ // Store the cart 
  return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[] // Store the item if it not exist in cart array 
 }
}

document.addEventListener('DOMContentLoaded', ()=>{
  const ui = new UI();
  const products = new Products();
  // Setup app
  ui.setupApp();

  // Get all products
  products.getProducts().then(products => {
    ui.displayProducts(products) // Displaying the products
    Storage.saveProducts(products) // Saving the products 
  }).then(()=>{
    ui.getBagButtons();
    ui.cartLogic()
  });  
});
