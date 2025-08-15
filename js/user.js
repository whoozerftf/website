// user.js?v=4"
// Semua akses firebase via window.auth, window.db, dst (tanpa import)
// Pastikan CDN Firebase v8 dan firebase-config.js?v=4" sudah dimuat sebelum file ini

// DOM elements
const toast = document.getElementById("toast");
const usernameInput = document.getElementById("usernameInput");
const emailInput = document.getElementById("emailInput");
const phoneInput = document.getElementById("phoneInput");
const profilePic = document.getElementById("userPhoto");
const uploadPic = document.getElementById("uploadPic");
const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const logoutBtn = document.getElementById("logoutBtn");

let currentUser = null;

function toggleMenu() {
  document.querySelector(".nav-links").classList.toggle("active");
}
feather.replace();

const openCartBtn = document.getElementById("openCart");
const closeCartBtn = document.getElementById("closeCart");
const cartSidebar = document.getElementById("cartSidebar");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const cart = JSON.parse(localStorage.getItem("cart")) || [];

function updateCart() {
  cartItemsEl.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.qty;
    cartItemsEl.innerHTML += `
          <div class="cart-item">
            <h4>${item.name}</h4>
            <p>Size: ${item.size ? item.size : "-"}</p>
            <p>Rp ${item.price.toLocaleString("id-ID")} x ${item.qty}</p>
            <div class="qty-control">
              <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
              <span>${item.qty}</span>
              <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
            </div>
          </div>
        `;
  });

  cartTotalEl.textContent = total.toLocaleString("id-ID");
  localStorage.setItem("cart", JSON.stringify(cart));
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  updateCart();
}

window.onload = () => {
  updateCart();
};

window.changeQty = changeQty;

// Validasi elemen sebelum menambahkan event listener
document.querySelectorAll(".add-cart-btn").forEach((btn) => {
  if (!btn) return;
  btn.addEventListener("click", () => {
    const card = btn.closest(".product-card");
    const name = card.getAttribute("data-name");
    const price = parseInt(card.getAttribute("data-price"));

    const existing = cart.find((item) => item.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name, price, qty: 1 });
    }

    updateCart();
    cartSidebar.classList.add("active");
  });
});

openCartBtn.addEventListener("click", () =>
  cartSidebar.classList.add("active")
);
closeCartBtn.addEventListener("click", () =>
  cartSidebar.classList.remove("active")
);

const sidebar = document.getElementById("mobileSidebar");
const openBtn = document.getElementById("mobileMenuBtn");
const closeBtn = document.getElementById("closeSidebar");

openBtn.addEventListener("click", function (e) {
  e.stopPropagation();
  sidebar.classList.add("active");
});
closeBtn.addEventListener("click", function () {
  sidebar.classList.remove("active");
});
// Klik di luar sidebar untuk menutup
document.addEventListener("click", function (e) {
  if (
    sidebar.classList.contains("active") &&
    !sidebar.contains(e.target) &&
    e.target !== openBtn &&
    !openBtn.contains(e.target)
  ) {
    sidebar.classList.remove("active");
  }
});

// Show toast helper
function showToast(message, isError = false) {
  toast.textContent = message;
  toast.style.background = isError ? "#e74c3c" : "#2ecc71";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// Auth state listener
window.auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  if (!user.emailVerified) {
    alert("Silakan verifikasi email Anda terlebih dahulu.");
    await window.auth.signOut();
    window.location.href = "login.html";
    return;
  }

  currentUser = user;

  // Otomatis isi data email Google ke form jika login Google
  emailInput.value = user.email || "";
  if (user.displayName) usernameInput.value = user.displayName;
  if (user.phoneNumber) phoneInput.value = user.phoneNumber;

  try {
    const userDocRef = window.db.collection("users").doc(user.uid);
    const userSnap = await userDocRef.get();
    if (userSnap.exists) {
      const data = userSnap.data();
      if (data.username) usernameInput.value = data.username;
      if (data.email) emailInput.value = data.email;
      if (data.phone) phoneInput.value = data.phone;
      if (data.photoURL) profilePic.src = data.photoURL;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
});

// Upload photo to Cloudinary
uploadPic.addEventListener("change", async () => {
  const file = uploadPic.files[0];
  if (!file || !currentUser) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "profile_upload");
  formData.append("folder", "whoozer/profile_photos");

  try {
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dzcicmbh2/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await res.json();
    if (data.secure_url) {
      const userDocRef = window.db.collection("users").doc(currentUser.uid);
      await userDocRef.set({ photoURL: data.secure_url }, { merge: true });
      profilePic.src = data.secure_url;
      showToast("Foto profil berhasil diunggah.");
    } else {
      throw new Error("Upload gagal");
    }
  } catch (error) {
    console.error("Upload error:", error);
    showToast("Gagal mengunggah foto.", true);
  }
});

// Edit & Save logic
editBtn.addEventListener("click", () => {
  usernameInput.disabled = false;
  emailInput.disabled = false;
  phoneInput.disabled = false;
  saveBtn.style.display = "inline";
  editBtn.style.display = "none";
});

saveBtn.addEventListener("click", async () => {
  if (!currentUser) return;

  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();

  [usernameInput, emailInput, phoneInput].forEach((el) =>
    el.classList.remove("error")
  );

  if (!username) {
    usernameInput.classList.add("error");
    showToast("Username tidak boleh kosong.", true);
    return;
  }

  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    emailInput.classList.add("error");
    showToast("Email tidak valid.", true);
    return;
  }

  if (!phone.match(/^\d*$/)) {
    phoneInput.classList.add("error");
    showToast("Nomor HP hanya boleh angka.", true);
    return;
  }

  try {
    const userDocRef = window.db.collection("users").doc(currentUser.uid);
    await userDocRef.set({ username, email, phone }, { merge: true });
    showToast("Profil berhasil diperbarui.");
    usernameInput.disabled = true;
    emailInput.disabled = true;
    phoneInput.disabled = true;
    saveBtn.style.display = "none";
    editBtn.style.display = "inline";
  } catch (error) {
    console.error("Gagal menyimpan:", error);
    showToast("Terjadi kesalahan saat menyimpan.", true);
  }
});

// Logout
// Logout untuk button di profile
const logoutBtnProfile = document.getElementById("logoutBtnProfile");
if (logoutBtnProfile) {
  logoutBtnProfile.addEventListener("click", async function () {
    try {
      await window.auth.signOut();
      showToast("Berhasil logout.");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
    } catch (error) {
      console.error("Logout error:", error);
      showToast("Gagal logout.", true);
    }
  });
}
