const API_URL = "http://localhost:5000";
let token = localStorage.getItem("token"); // Pastikan sudah login dan token tersimpan
let currentLukisanId = null; 

// Render komentar ke dalam modal
function renderComments(comments) {
  const container = document.getElementById("modalKomentarList");
  container.innerHTML = "";

  if (!Array.isArray(comments) || comments.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #999;">Belum ada komentar.</p>';
    return;
  }

  comments.forEach(comment => {
    const commentDiv = document.createElement("div");
    commentDiv.classList.add("comment-item");

    const date = new Date(comment.tanggal || comment.created_at).toLocaleDateString('id-ID');

    commentDiv.innerHTML = `
      <div class="comment-author">${comment.username || 'User'}</div>
      <div class="comment-text" data-id="${comment.id}">${comment.isi || comment.content}</div>
      <div class="comment-date">${date}</div>
      <div class="comment-actions">
        <button class="btn-edit-comment" data-id="${comment.id}">✏️ Edit</button>
        <button class="btn-delete-comment" data-id="${comment.id}">🗑️ Hapus</button>
      </div>
    `;

    container.appendChild(commentDiv);
  });

  // Pasang event listener tombol edit
  document.querySelectorAll(".btn-edit-comment").forEach(button => {
    button.addEventListener("click", () => {
      const commentId = button.getAttribute("data-id");
      enableEditComment(commentId, button);
    });
  });

  // Pasang event listener tombol hapus
  document.querySelectorAll(".btn-delete-comment").forEach(button => {
    button.addEventListener("click", () => {
      const commentId = button.getAttribute("data-id");
      deleteComment(commentId);
    });
  });
}

// Aktifkan mode edit komentar
function enableEditComment(commentId, button) {
  const commentTextDiv = button.parentElement.parentElement.querySelector(".comment-text");
  const originalText = commentTextDiv.textContent;

  const textarea = document.createElement("textarea");
  textarea.value = originalText;
  textarea.style.width = "100%";
  textarea.style.minHeight = "60px";
  textarea.style.fontFamily = "inherit";
  textarea.style.fontSize = "14px";

  commentTextDiv.replaceWith(textarea);

  button.textContent = "💾 Simpan";

  // Tambah tombol batal
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "❌ Batal";
  cancelBtn.style.marginLeft = "10px";

  button.parentElement.appendChild(cancelBtn);

  button.onclick = async () => {
    const updatedText = textarea.value.trim();
    if (!updatedText) {
      alert("Komentar tidak boleh kosong!");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/komentar/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ isi: updatedText }),
      });

      if (res.status === 401) {
        alert("Sesi login habis. Silakan login ulang.");
        localStorage.removeItem("token");
        window.location.href = "login.html";
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        alert("Gagal update komentar: " + (errorData.message || "Error"));
        return;
      }

      loadComments();

    } catch (err) {
      console.error("Error update komentar:", err);
      alert("Terjadi kesalahan saat mengupdate komentar.");
    }
  };

  cancelBtn.onclick = () => {
    const newDiv = document.createElement("div");
    newDiv.classList.add("comment-text");
    newDiv.textContent = originalText;
    textarea.replaceWith(newDiv);

    button.textContent = "✏️ Edit";
    cancelBtn.remove();

    button.onclick = () => enableEditComment(commentId, button);
  };
}

// Hapus komentar
async function deleteComment(commentId) {
  if (!confirm("⚠️ Yakin ingin menghapus komentar ini?")) return;

  try {
    const res = await fetch(`${API_URL}/komentar/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      alert("Sesi login habis. Silakan login ulang.");
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return;
    }

    if (!res.ok) {
      const errorData = await res.json();
      alert("Gagal hapus komentar: " + (errorData.message || "Error"));
      return;
    }

    alert("✅ Komentar berhasil dihapus!");
    loadComments();
  } catch (err) {
    console.error("Error deleting comment:", err);
    alert("Terjadi kesalahan saat menghapus komentar.");
  }
}

// Load komentar (pastikan currentLukisanId sudah diset)
async function loadComments() {
  if (!currentLukisanId) {
    console.error("No lukisan ID set");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/komentar?lukisanId=${currentLukisanId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const comments = await res.json();
    renderComments(comments);
  } catch (err) {
    console.error("Gagal load komentar:", err);
    document.getElementById("modalKomentarList").innerHTML =
      '<p style="color: red; text-align: center;">Gagal memuat komentar.</p>';
  }
}
