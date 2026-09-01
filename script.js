const PRODUCTS = [
  {id:"tradicional", name:"Baaita Tradicional", desc:"Sem recheio.", price:7},
  {id:"branco", name:"Baaita Branco", desc:"Recheio de chocolate branco.", price:7},
  {id:"ao-leite", name:"Baaita Ao Leite", desc:"Recheio de chocolate preto.", price:7},
  {id:"mesclado", name:"Baaita Mesclado", desc:"Recheio de chocolate branco e preto.", price:7},
  {id:"ninho", name:"Baaita Ninho", desc:"Recheio de creme de leite Ninho.", price:7},
  {id:"ovomaltine", name:"Baaita Ovomaltine", desc:"Recheio de creme de Ovomaltine.", price:9},
  {id:"nutella", name:"Baaita Nutella", desc:"Recheio de Nutella.", price:9},
  {id:"meio-amargo", name:"Baaita Meio Amargo", desc:"Recheio de chocolate Meio Amargo.", price:7},
  {id:"bueno", name:"Baaita Bueno", desc:"Recheio de Bueno.", price:9},
  {id:"bites", name:"Baaita Bites", desc:"Brownies banhados em chocolate ao leite.", price:10}
];

const WHATSAPP_NUMBER = "5551996250507";
const PICKUP_ADDRESS = "Av. Amazonas, 1815 - Universitário, Lajeado - RS, 95914-106";
const CART_KEY = "baaitaCart";

let cart = JSON.parse(localStorage.getItem(CART_KEY) || "{}");

const money = n => n.toLocaleString("pt-BR", {style:"currency", currency:"BRL"});

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getItems() {
  return Object.entries(cart)
    .map(([id, qty]) => {
      const product = PRODUCTS.find(p => p.id === id);
      return product ? {...product, qty} : null;
    })
    .filter(Boolean);
}

function getTotal() {
  return getItems().reduce((total, item) => total + item.price * item.qty, 0);
}

function renderProducts() {
  document.getElementById("products").innerHTML = PRODUCTS.map(p => `
    <article class="product">
      <div class="product-art" aria-hidden="true"></div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="product-bottom">
          <span class="price">${money(p.price)}</span>
          <button class="add-button" onclick="addToCart('${p.id}')" aria-label="Adicionar ${p.name}">Adicionar</button>
        </div>
      </div>
    </article>
  `).join("");
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
  openCart();
}

function changeQuantity(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  renderCart();
}

function renderCart() {
  const items = getItems();
  const count = items.reduce((sum, item) => sum + item.qty, 0);

  document.getElementById("cartCount").textContent = count;

  document.getElementById("emptyOrder").hidden = items.length > 0;
  document.getElementById("orderSummary").hidden = items.length === 0;
  document.getElementById("sendWhatsApp").disabled = items.length === 0;

  document.getElementById("cartItems").innerHTML = items.map(item => `
    <div class="cart-row">
      <div>
        <strong>${item.name}</strong>
        <span>${money(item.price)} cada</span>
      </div>
      <div class="quantity">
        <button onclick="changeQuantity('${item.id}', -1)" aria-label="Diminuir">−</button>
        <span>${item.qty}</span>
        <button onclick="changeQuantity('${item.id}', 1)" aria-label="Aumentar">+</button>
      </div>
    </div>
  `).join("");

  document.getElementById("orderSummary").innerHTML = `
    <div class="summary-total"><span>Total</span><strong>${money(getTotal())}</strong></div>
  `;
}

function openCart() {
  document.getElementById("cartDrawer").classList.add("show");
  document.getElementById("cartOverlay").classList.add("show");
  document.getElementById("cartDrawer").setAttribute("aria-hidden", "false");
}

function closeCart() {
  document.getElementById("cartDrawer").classList.remove("show");
  document.getElementById("cartOverlay").classList.remove("show");
  document.getElementById("cartDrawer").setAttribute("aria-hidden", "true");
}

function openModal() {
  if (!getItems().length) {
    openCart();
    alert("Adicione pelo menos um produto ao carrinho.");
    return;
  }
  document.getElementById("customerModal").classList.add("show");
  document.getElementById("customerModal").setAttribute("aria-hidden", "false");
}

function closeModal() {
  document.getElementById("customerModal").classList.remove("show");
  document.getElementById("customerModal").setAttribute("aria-hidden", "true");
}

function updateDeliveryFields() {
  const method = document.getElementById("deliveryMethod").value;
  const deliveryFields = document.getElementById("deliveryFields");
  const pickupFields = document.getElementById("pickupFields");

  deliveryFields.hidden = method !== "Entrega";
  pickupFields.hidden = method !== "Retirada";
}

function buildWhatsAppMessage() {
  const name = document.getElementById("customerName").value.trim();
  const method = document.getElementById("deliveryMethod").value;
  const observation = document.getElementById("observation").value.trim();

  if (!name) {
    alert("Digite seu nome.");
    return null;
  }

  if (!method) {
    alert("Escolha a forma de entrega.");
    return null;
  }

  let deliveryInfo = "";

  if (method === "Entrega") {
    const cidade = document.getElementById("cidade").value.trim();
    const bairro = document.getElementById("bairro").value.trim();
    const rua = document.getElementById("rua").value.trim();
    const numero = document.getElementById("numero").value.trim();

    if (!cidade || !bairro || !rua || !numero) {
      alert("Preencha cidade, bairro, rua e número para a entrega.");
      return null;
    }

    deliveryInfo =
      `Forma de entrega: Entrega\n` +
      `Endereço: ${rua}, ${numero} - ${bairro}, ${cidade}\n` +
      `Frete: valor será informado pelo WhatsApp`;
  } else {
    const pickupTime = document.getElementById("pickupTime").value;

    if (!pickupTime) {
      alert("Escolha um horário para retirada.");
      return null;
    }

    deliveryInfo =
      `Forma de entrega: Retirada\n` +
      `Horário: ${pickupTime}\n` +
      `Local: ${PICKUP_ADDRESS}`;
  }

  const items = getItems();
  const productsText = items
    .map(item => `${item.qty}x ${item.name} - ${money(item.qty * item.price)}`)
    .join("\n");

  return `Olá! Quero fazer um pedido na Baaita Brownie.

Nome: ${name}

Pedido:
${productsText}

Total dos produtos: ${money(getTotal())}

${deliveryInfo}${observation ? `\n\nObservação: ${observation}` : ""}`;
}

function sendOrder() {
  const message = buildWhatsAppMessage();
  if (!message) return;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

document.getElementById("openCart").onclick = openCart;
document.getElementById("closeCart").onclick = closeCart;
document.getElementById("cartOverlay").onclick = closeCart;
document.getElementById("goToOrder").onclick = openModal;
document.getElementById("sendWhatsApp").onclick = openModal;
document.getElementById("closeModal").onclick = closeModal;
document.getElementById("generateWhatsApp").onclick = sendOrder;
document.getElementById("deliveryMethod").addEventListener("change", updateDeliveryFields);

document.getElementById("customerModal").addEventListener("click", event => {
  if (event.target.id === "customerModal") closeModal();
});

renderProducts();
renderCart();
updateDeliveryFields();
