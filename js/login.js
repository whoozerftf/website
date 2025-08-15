console.log("login.js?v=4 loaded");

// Use global window.auth, window.db, etc. from firebase-config.js
const auth = window.auth;
const db = window.db;
const GoogleAuthProvider = window.GoogleAuthProvider;
const signInWithEmailAndPassword = window.signInWithEmailAndPassword;
const signInWithPopup = window.auth.signInWithPopup;
const createUserWithEmailAndPassword = window.auth.createUserWithEmailAndPassword;
const sendEmailVerification = (user) => user.sendEmailVerification();
const signOut = () => window.auth.signOut();
const onAuthStateChanged = window.auth.onAuthStateChanged;
const setDoc = async (docRef, data) => docRef.set(data, { merge: true });
const doc = (db, collection, uid) => db.collection(collection).doc(uid);

// 🔄 Loading overlay
const loading = document.getElementById("loading");
function showLoading(show) {
  if (loading) loading.style.display = show ? "flex" : "none";
}

// 🔁 Toggle form login/register
function showRegister() {
  document.getElementById("loginForm")?.classList.add("hidden");
  document.getElementById("registerForm")?.classList.remove("hidden");
}
function showLogin() {
  document.getElementById("registerForm")?.classList.add("hidden");
  document.getElementById("loginForm")?.classList.remove("hidden");
}

// ✅ Register
const registerForm = document.getElementById("registerSubmit");
if (registerForm) {
  let isRegistering = false;
  registerForm.addEventListener("submit", async (e) => {
    console.log("[DEBUG REGISTER] Event listener triggered");
    e.preventDefault();
    if (isRegistering) return;
    isRegistering = true;
    showLoading(true);

    const usernameInput = document.getElementById("registerUsername");
    const emailInput = document.getElementById("registerEmail");
    const phoneInput = document.getElementById("registerPhone");
    const passwordInput = document.getElementById("registerPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");

    const username = usernameInput ? usernameInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const phone = phoneInput ? phoneInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";
    const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : "";

    console.log("[DEBUG REGISTER]", { username, email, phone, password, confirmPassword });

    if (!username || !email || !phone || !password || !confirmPassword) {
      alert("Semua field wajib diisi.");
      showLoading(false);
      isRegistering = false;
      return;
    }
    if (password !== confirmPassword) {
      alert("Password tidak cocok!");
      showLoading(false);
      isRegistering = false;
      return;
    }
    if (password.length < 6) {
      alert("Password minimal 6 karakter!");
      showLoading(false);
      isRegistering = false;
      return;
    }

    try {
      const userCredential = await window.auth.createUserWithEmailAndPassword(
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        username,
        email,
        phone,
        createdAt: new Date(),
      });

      await sendEmailVerification(user);
      alert("Registrasi berhasil! Silakan verifikasi email.");
      showLogin();
      registerForm.reset();
    } catch (error) {
      let msg = "Gagal register: " + error.message;
      if (error.code === "auth/email-already-in-use") {
        msg = "Email sudah terdaftar. Silakan gunakan email lain.";
      } else if (error.code === "auth/invalid-email") {
        msg = "Format email tidak valid.";
      } else if (error.code === "auth/operation-not-allowed") {
        msg = "Pendaftaran dengan email/password dinonaktifkan. Silakan coba login atau hubungi admin.";
      } else if (error.code === "auth/weak-password") {
        msg = "Password terlalu lemah. Gunakan kombinasi huruf, angka, dan simbol.";
      }
      if (loading) {
        let notif = loading.querySelector('.login-error-msg');
        if (!notif) {
          notif = document.createElement('div');
          notif.className = 'login-error-msg';
          notif.title = 'Klik untuk menutup';
          loading.appendChild(notif);
        }
        notif.textContent = msg + ' (Klik untuk menutup)';
        notif.style.display = 'block';
        notif.className = 'login-error-msg';
        notif.removeAttribute('style');
        notif.onclick = function() {
          notif.style.display = 'none';
          showLoading(false);
        };
      } else {
        alert(msg);
        showLoading(false);
      }
    } finally {
      showLoading(false);
      isRegistering = false;
    }
  });
}

// ✅ Login Email/Password
const loginForm = document.getElementById("loginSubmit");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    showLoading(true);


    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");
    const email = emailInput ? String(emailInput.value).trim() : "";
    const password = passwordInput ? String(passwordInput.value) : "";

    console.log("[DEBUG] Email:", email, "Password:", password);
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      let msg = "Email dan password wajib diisi.";
      if (loading) {
        let notif = loading.querySelector('.login-error-msg');
        if (!notif) {
          notif = document.createElement('div');
          notif.className = 'login-error-msg';
          notif.title = 'Klik untuk menutup';
          loading.appendChild(notif);
        }
        notif.textContent = msg + ' (Klik untuk menutup)';
        notif.style.display = 'block';
        notif.className = 'login-error-msg';
        notif.removeAttribute('style');
        notif.onclick = function() {
          notif.style.display = 'none';
          showLoading(false);
        };
      } else {
        alert(msg);
        showLoading(false);
      }
      return;
    }

    try {
      const userCredential = await window.auth.signInWithEmailAndPassword(
        email,
        password
      );
      const user = userCredential.user;

      // if (!user.emailVerified) {
      //   alert("Email belum diverifikasi.");
      //   await signOut(auth);
      //   showLoading(false);
      //   return;
      // }
      if (!user.emailVerified) {
        // Tampilkan popup error email belum diverifikasi
        if (loading) {
          let notif = loading.querySelector('.login-error-msg');
          if (!notif) {
            notif = document.createElement('div');
            notif.className = 'login-error-msg';
            notif.title = 'Klik untuk menutup';
            loading.appendChild(notif);
          }
          notif.textContent = 'Email belum diverifikasi. Silakan cek email Anda dan lakukan verifikasi terlebih dahulu. (Klik untuk menutup)';
          notif.style.display = 'block';
          notif.className = 'login-error-msg';
          notif.removeAttribute('style');
          notif.onclick = function() {
            notif.style.display = 'none';
            showLoading(false);
          };
        } else {
          showLoading(false);
        }
        await signOut(auth);
        return;
      }

      // alert("Login berhasil."); // Hapus alert bawaan browser
      // Tampilkan popup sukses dengan style yang sama, tapi warna hijau dan auto hilang
      if (loading) {
        let notif = loading.querySelector('.login-error-msg');
        if (!notif) {
          notif = document.createElement('div');
          notif.className = 'login-error-msg login-success-msg';
          notif.title = '';
          loading.appendChild(notif);
        }
        notif.textContent = 'Login berhasil!';
        notif.style.display = 'block';
        notif.className = 'login-error-msg login-success-msg';
        notif.removeAttribute('style'); // Hapus semua inline style agar hanya pakai CSS
        setTimeout(() => {
          notif.style.display = 'none';
          showLoading(false);
          window.location.href = "index.html";
        }, 1200);
      } else {
        showLoading(false);
        window.location.href = "index.html";
      }
    } catch (error) {
      let msg = "Terjadi kesalahan saat login. Silakan coba lagi.";
      if (error.code === "auth/user-not-found") {
        msg = "Akun tidak ditemukan. Silakan cek email Anda atau buat akun terlebih dahulu melalui menu Register.";
      } else if (error.code === "auth/wrong-password") {
        msg = "Password salah. Silakan cek password Anda dan coba lagi.";
      } else if (error.code === "auth/invalid-email") {
        msg = "Format email tidak valid. Pastikan email sudah benar.";
      } else if (error.code === "auth/too-many-requests") {
        msg = "Akun Anda diblokir sementara karena terlalu banyak percobaan login gagal. Silakan coba lagi nanti.";
      } else if (error.code === "auth/invalid-credential") {
        msg = "Email atau Password salah. Silakan cek kembali dan coba lagi.";
      }
      // Hilangkan loading overlay HANYA jika user sudah menutup popup error
      if (loading) {
        let notif = loading.querySelector('.login-error-msg');
        if (!notif) {
          notif = document.createElement('div');
          notif.className = 'login-error-msg';
          notif.title = 'Klik untuk menutup';
          loading.appendChild(notif);
        }
        notif.textContent = msg + ' (Klik untuk menutup)';
        notif.style.display = 'block';
        notif.className = 'login-error-msg';
        notif.removeAttribute('style'); // Hapus semua inline style agar hanya pakai CSS
        notif.onclick = function() {
          notif.style.display = 'none';
          showLoading(false);
        };
        // Jangan panggil showLoading(false) di sini!
      } else {
        alert(msg);
        showLoading(false);
      }
    }
  });
}

// ✅ Google Sign-In (POPUP FIXED & ONLY REGISTERED, VERIFIED USERS CAN LOGIN)
const googleLoginBtn = document.getElementById("googleLoginBtn");
if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    const provider = new window.GoogleAuthProvider();
    showLoading(true);

    try {
      const result = await window.auth.signInWithPopup(provider);
      const user = result.user;
      const isNewUser = result._tokenResponse?.isNewUser;

      // Jika user baru (belum terdaftar di Firebase Auth)
      if (isNewUser) {
        // Sign out, tampilkan popup error
        if (loading) {
          let notif = loading.querySelector('.login-error-msg');
          if (!notif) {
            notif = document.createElement('div');
            notif.className = 'login-error-msg';
            notif.title = 'Klik untuk menutup';
            loading.appendChild(notif);
          }
          notif.textContent = 'Akun Google Anda belum terdaftar di Whoozer. Silakan daftar terlebih dahulu. (Klik untuk menutup)';
          notif.style.display = 'block';
          notif.className = 'login-error-msg';
          notif.removeAttribute('style');
          notif.onclick = function() {
            notif.style.display = 'none';
            showLoading(false);
          };
        } else {
          showLoading(false);
        }
        await signOut(auth);
        return;
      }

      // Cek verifikasi email Google
      if (!user.emailVerified) {
        // Tampilkan popup error email belum diverifikasi
        if (loading) {
          let notif = loading.querySelector('.login-error-msg');
          if (!notif) {
            notif = document.createElement('div');
            notif.className = 'login-error-msg';
            notif.title = 'Klik untuk menutup';
            loading.appendChild(notif);
          }
          notif.textContent = 'Email Google Anda belum diverifikasi. Silakan cek email Anda dan lakukan verifikasi terlebih dahulu. (Klik untuk menutup)';
          notif.style.display = 'block';
          notif.className = 'login-error-msg';
          notif.removeAttribute('style');
          notif.onclick = function() {
            notif.style.display = 'none';
            showLoading(false);
          };
        } else {
          showLoading(false);
        }
        await signOut(auth);
        return;
      }

      // Jika sudah verifikasi, tampilkan popup sukses, auto hilang, lalu redirect
      if (loading) {
        let notif = loading.querySelector('.login-error-msg');
        if (!notif) {
          notif = document.createElement('div');
          notif.className = 'login-error-msg login-success-msg';
          notif.title = '';
          loading.appendChild(notif);
        }
        notif.textContent = 'Login berhasil!';
        notif.style.display = 'block';
        notif.className = 'login-error-msg login-success-msg';
        notif.removeAttribute('style');
        setTimeout(() => {
          notif.style.display = 'none';
          showLoading(false);
          window.location.href = "index.html";
        }, 1200);
      } else {
        showLoading(false);
        window.location.href = "index.html";
      }
    } catch (error) {
      // Tampilkan error Google login dengan popup overlay
      let msg = "Login Google gagal: " + error.message;
      if (loading) {
        let notif = loading.querySelector('.login-error-msg');
        if (!notif) {
          notif = document.createElement('div');
          notif.className = 'login-error-msg';
          notif.title = 'Klik untuk menutup';
          loading.appendChild(notif);
        }
        notif.textContent = msg + ' (Klik untuk menutup)';
        notif.style.display = 'block';
        notif.className = 'login-error-msg';
        notif.removeAttribute('style');
        notif.onclick = function() {
          notif.style.display = 'none';
          showLoading(false);
        };
      } else {
        showLoading(false);
      }
    }
  });
}

// ✅ Google Register
// Tambahkan event handler Google Register jika tombol ada
const googleRegisterBtn = document.getElementById("googleRegisterBtn");
if (googleRegisterBtn) {
  googleRegisterBtn.addEventListener("click", async () => {
    const provider = new window.GoogleAuthProvider();
    showLoading(true);
    try {
      const result = await window.auth.signInWithPopup(provider);
      const user = result.user;
      const isNewUser = result._tokenResponse?.isNewUser;
      if (!isNewUser) {
        showPopupError('Akun Google sudah terdaftar, silakan login.');
        await signOut(auth);
        return;
      }
      if (!user.emailVerified) {
        showPopupError('Email Google Anda belum diverifikasi. Silakan cek email Anda dan lakukan verifikasi terlebih dahulu.');
        await signOut(auth);
        return;
      }
      await setDoc(doc(db, "users", user.uid), {
        username: user.displayName || "",
        email: user.email,
        phone: user.phoneNumber || "",
        createdAt: new Date(),
      });
      showPopupSuccess('Registrasi Google berhasil!', () => {
        window.location.href = "index.html";
      });
    } catch (error) {
      showPopupError('Registrasi Google gagal: ' + error.message);
    }
  });
}

// Helper untuk popup error/success
function showPopupError(msg) {
  if (loading) {
    let notif = loading.querySelector('.login-error-msg');
    if (!notif) {
      notif = document.createElement('div');
      notif.className = 'login-error-msg';
      notif.title = 'Klik untuk menutup';
      loading.appendChild(notif);
    }
    notif.textContent = msg + ' (Klik untuk menutup)';
    notif.style.display = 'block';
    notif.className = 'login-error-msg';
    notif.removeAttribute('style');
    notif.onclick = function() {
      notif.style.display = 'none';
      showLoading(false);
    };
  } else {
    alert(msg);
    showLoading(false);
  }
}
function showPopupSuccess(msg, cb) {
  if (loading) {
    let notif = loading.querySelector('.login-error-msg');
    if (!notif) {
      notif = document.createElement('div');
      notif.className = 'login-error-msg login-success-msg';
      notif.title = '';
      loading.appendChild(notif);
    }
    notif.textContent = msg;
    notif.style.display = 'block';
    notif.className = 'login-error-msg login-success-msg';
    notif.removeAttribute('style');
    setTimeout(() => {
      notif.style.display = 'none';
      showLoading(false);
      if (cb) cb();
    }, 1200);
  } else {
    showLoading(false);
    if (cb) cb();
  }
}

// ✅ Auto redirect if already logged in
onAuthStateChanged(auth, (user) => {
  console.log("🔄 onAuthStateChanged triggered. User:", user);
  if (user) {
    console.log("✅ User is signed in:", user);
    window.location.href = "index.html";
  }
});

// ✅ Form toggling links
document.querySelectorAll('[data-action="showRegister"]').forEach((el) =>
  el.addEventListener("click", (e) => {
    e.preventDefault();
    showRegister();
  })
);
document.querySelectorAll('[data-action="showLogin"]').forEach((el) =>
  el.addEventListener("click", (e) => {
    e.preventDefault();
    showLogin();
  })
);
