const PRODUCTS = [
  {id:"tradicional", name:"Baaita Tradicional", desc:"Sem recheio.", price:5},
  {id:"branco", name:"Baaita Branco", desc:"Recheio de chocolate branco.", price:7},
  {id:"ao-leite", name:"Baaita Ao Leite", desc:"Recheio de chocolate preto.", price:7},
  {id:"mesclado", name:"Baaita Mesclado", desc:"Recheio de chocolate branco e preto.", price:7},
  {id:"ninho", name:"Baaita Ninho", desc:"Recheio de creme de Leite Ninho.", price:7},
  {id:"ovomaltine", name:"Baaita Ovomaltine", desc:"Recheio de creme de Ovomaltine.", price:9},
  {id:"nutella", name:"Baaita Nutella", desc:"Recheio de Nutella.", price:9},
  {id:"meio-amargo", name:"Baaita Meio Amargo", desc:"Recheio de chocolate Meio Amargo.", price:7},
  {id:"bueno", name:"Baaita Bueno", desc:"Recheio de Bueno.", price:9},
  {id:"bites", name:"Baaita Bites", desc:"Brownies banhados em chocolate ao leite.", price:10}
];

// ALTERE SOMENTE ESTE NÚMERO para o WhatsApp da empresa.
// Use DDI + DDD + número, sem espaços, parênteses ou símbolos.
// Exemplo Brasil: 5551999999999
const WHATSAPP_NUMBER = "5551996250507";

let cart = JSON.parse(localStorage.getItem("baaitaCart") || "{}");

const money = n => n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const save = () => localStorage.setItem("baaitaCart", JSON.stringify(cart));

function renderProducts(){
  document.getElementById("products").innerHTML = PRODUCTS.map(p => `
    <article class="product">
      <div class="product-art" aria-hidden="true"></div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="product-bottom">
          <span class="price">${money(p.price)}</span>
          <button class="add" onclick="addToCart('${p.id}')" aria-label="Adicionar ${p.name}">+</button>
        </div>
      </div>
    </article>`).join("");
}

function addToCart(id){
  cart[id] = (cart[id] || 0) + 1;
  save(); renderCart(); openCart();
}
function changeQty(id, delta){
  cart[id] = (cart[id] || 0) + delta;
  if(cart[id] <= 0) delete cart[id];
  save(); renderCart();
}
function getItems(){
  return Object.entries(cart).map(([id,qty]) => ({...PRODUCTS.find(p=>p.id===id),qty}));
}
function renderCart(){
  const items = getItems();
  const count = items.reduce((s,i)=>s+i.qty,0);
  const total = items.reduce((s,i)=>s+i.price*i.qty,0);
  document.getElementById("cartCount").textContent = count;
  document.getElementById("cartTotal").textContent = money(total);

  document.getElementById("cartItems").innerHTML = items.length ? items.map(i=>`
    <div class="cart-item">
      <div><h4>${i.name}</h4><small>${money(i.price)} cada</small></div>
      <div class="qty">
        <button onclick="changeQty('${i.id}',-1)">−</button><strong>${i.qty}</strong><button onclick="changeQty('${i.id}',1)">+</button>
      </div>
    </div>`).join("") : `<div style="text-align:center;padding:70px 10px;color:#8a6862">Seu carrinho está vazio.<br>Escolha seus brownies favoritos! </div>`;

  document.getElementById("emptyOrder").classList.toggle("hidden", !items.length);
  document.getElementById("filledOrder").classList.toggle("hidden", !items.length);
  if(items.length){
    document.getElementById("orderSummary").innerHTML = `
      ${items.map(i=>`<div class="summary-row"><span>${i.qty}× ${i.name}</span><strong>${money(i.qty*i.price)}</strong></div>`).join("")}
      <div class="summary-total"><span>Total</span><span>${money(total)}</span></div>`;
  }
}
function openCart(){
  document.getElementById("cartDrawer").classList.add("show");
  document.getElementById("cartOverlay").classList.add("show");
}
function closeCart(){
  document.getElementById("cartDrawer").classList.remove("show");
  document.getElementById("cartOverlay").classList.remove("show");
}
function openModal(){
  if(!getItems().length){ location.hash="#cardapio"; return; }
  document.getElementById("customerModal").classList.add("show");
  document.getElementById("configWarning").textContent = "";
}
function closeModal(){document.getElementById("customerModal").classList.remove("show")}

document.getElementById("openCart").onclick=openCart;
document.getElementById("closeCart").onclick=closeCart;
document.getElementById("cartOverlay").onclick=closeCart;
document.getElementById("goToOrder").onclick=()=>{closeCart()};
document.getElementById("sendWhatsapp").onclick=openModal;
document.getElementById("closeModal").onclick=closeModal;

document.getElementById("customerForm").addEventListener("submit", e=>{
  e.preventDefault();
  const data = new FormData(e.target);
  const items = getItems();
  const total = items.reduce((s,i)=>s+i.price*i.qty,0);
  let msg = `Olá, Baaita Brownie! %0A%0A`;
  msg += `Quero fazer um pedido:%0A`;
  items.forEach(i => msg += `- ${i.qty}x ${i.name} — ${money(i.price*i.qty)}%0A`);
  msg += `%0A*Total: ${money(total)}*%0A`;
  msg += `Nome: ${data.get("name")}%0A`;
  msg += `Entrega/retirada: ${data.get("delivery")}%0A`;
  if(data.get("note")) msg += `Observação: ${data.get("note")}%0A`;
  msg += `%0A@baaitabrownie`;
  if(WHATSAPP_NUMBER.startsWith("550000")){
    alert("Configure o número do WhatsApp no início do arquivo script.js.");
    return;
  }
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`,"_blank");
});

document.getElementById("year").textContent = new Date().getFullYear();
renderProducts(); renderCart();
