const token = localStorage.getItem('token');

// Redirect ke login jika belum login
if (
  !token &&
  (window.location.pathname.includes('index.html') ||
    window.location.pathname === '/' ||
    window.location.pathname.endsWith('/'))
) {
  window.location.href = 'login.html';
}

const API_URL = "https://backend-836058602525.us-central1.run.app";

// Ambil dan render daftar lukisan
async function fetchLukisan() {
  try {
    const response = await fetch(`${API_URL}/lukisan`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401 || response.status === 403) {
      alert("Sesi login Anda telah habis. Silakan login kembali.");
      localStorage.removeItem('token');
      window.location.href = 'login.html';
      return;
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text);
    }

    const lukisanList = await response.json();

    renderLukisanList(lukisanList);

  } catch (error) {
    console.error("Error fetching lukisan:", error);
  }
}

// Render daftar lukisan ke galeri
function renderLukisanList(lukisanList) {
  const container = document.getElementById('listLukisan');
  container.innerHTML = '';
  lukisanList.forEach(lukisan => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = `
      <div class="gallery-item-image">
        <img src="${lukisan.gambar || 'https://via.placeholder.com/320x240?text=No+Image'}" alt="${lukisan.judul}" />
      </div>
      <div class="gallery-item-content">
        <h3>${lukisan.judul}</h3>
        <p>${lukisan.deskripsi || ''}</p>
        <div><b>Seniman:</b> ${lukisan.seniman || '-'}</div>
        <div><b>Tahun:</b> ${lukisan.tahun || '-'}</div>
      </div>
      <div class="gallery-item-actions">
        <button class="btn-edit" onclick="updateLukisan(${lukisan.id})">✏️ Edit</button>
        <button class="btn-delete" onclick="deleteLukisan(${lukisan.id})">🗑️ Hapus</button>
      </div>
    `;
    container.appendChild(item);
  });
}

// Tambah lukisan
async function createLukisan() {
  const judul = document.getElementById("judul").value.trim();
  const deskripsi = document.getElementById("deskripsi").value.trim();
  const gambar = document.getElementById("gambar").value.trim();
  const seniman = document.getElementById("seniman") ? document.getElementById("seniman").value.trim() : "";
  const tahun = document.getElementById("tahun") ? document.getElementById("tahun").value.trim() : "";

  if (!judul || !deskripsi || !gambar || !seniman || !tahun) {
    alert("⚠️ Harap isi semua kolom!");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/lukisan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ judul, deskripsi, gambar, seniman, tahun }),
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
      return;
    }

    document.getElementById("judul").value = "";
    document.getElementById("deskripsi").value = "";
    document.getElementById("gambar").value = "";
    if (document.getElementById("seniman")) document.getElementById("seniman").value = "";
    if (document.getElementById("tahun")) document.getElementById("tahun").value = "";

    fetchLukisan();
  } catch (error) {
    console.error("Error adding lukisan:", error);
  }
}

// Edit lukisan
async function updateLukisan(id) {
  const newJudul = prompt("🖌️ Masukkan judul baru lukisan:");
  const newDeskripsi = prompt("📝 Masukkan deskripsi baru lukisan:");
  const newGambar = prompt("🖼️ Masukkan URL gambar baru:");
  const newSeniman = prompt("👤 Masukkan nama seniman:");
  const newTahun = prompt("📅 Masukkan tahun:");

  if (!newJudul || !newDeskripsi || !newGambar || !newSeniman || !newTahun) return;

  try {
    await fetch(`${API_URL}/lukisan/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        judul: newJudul,
        deskripsi: newDeskripsi,
        gambar: newGambar,
        seniman: newSeniman,
        tahun: newTahun
      }),
    });

    fetchLukisan();
  } catch (error) {
    console.error("Error editing lukisan:", error);
  }
}

// Hapus lukisan
async function deleteLukisan(id) {
  if (!confirm("⚠️ Yakin ingin menghapus lukisan ini?")) return;

  try {
    await fetch(`${API_URL}/lukisan/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchLukisan();
  } catch (error) {
    console.error("Error deleting lukisan:", error);
  }
}

// Ambil dan render user
async function fetchUsers() {
  try {
    const response = await fetch(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401 || response.status === 403) {
      alert("Sesi login Anda telah habis. Silakan login kembali.");
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return;
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text);
    }

    const users = await response.json();

    const tbody = document.getElementById("userTableBody");
    tbody.innerHTML = "";

    users.forEach(user => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${user.id}</td>
        <td>${user.username || "-"}</td>
        <td>${user.email}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

// Tombol logout
window.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.createElement("button");
  logoutBtn.textContent = "Logout";
  logoutBtn.style.position = "fixed";
  logoutBtn.style.top = "24px";
  logoutBtn.style.right = "32px";
  logoutBtn.style.padding = "10px 18px";
  logoutBtn.style.backgroundColor = "#e23636";
  logoutBtn.style.color = "#fff";
  logoutBtn.style.border = "none";
  logoutBtn.style.borderRadius = "8px";
  logoutBtn.style.fontWeight = "bold";
  logoutBtn.style.fontSize = "16px";
  logoutBtn.style.cursor = "pointer";
  logoutBtn.style.zIndex = "1000";
  logoutBtn.onmouseover = () => logoutBtn.style.backgroundColor = "#c01c1c";
  logoutBtn.onmouseout = () => logoutBtn.style.backgroundColor = "#e23636";
  logoutBtn.onclick = function () {
    if (confirm("Yakin ingin logout?")) {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    }
  };
  document.body.appendChild(logoutBtn);

  // Form submit
  const form = document.getElementById("formLukisan");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      createLukisan();
    });
  }

  fetchLukisan();
});
