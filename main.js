document.addEventListener("DOMContentLoaded", () => {
  const likeButtons = document.querySelectorAll(".like-btn");
  likeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      let count = parseInt(btn.dataset.likes);
      count++;
      btn.dataset.likes = count;
      btn.innerText = `Like (${count})`;
    });
  });

  const sendBtn = document.getElementById("sendBtn");
  const chatInput = document.getElementById("chatInput");
  const chatBox = document.querySelector(".chat-box");
  
  if(sendBtn) {
    sendBtn.addEventListener("click", () => {
      const text = chatInput.value.trim();
      if(text !== "") {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("message");
        msgDiv.innerHTML = `<strong>You:</strong> ${text}`;
        chatBox.appendChild(msgDiv);
        chatInput.value = "";
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    });
  }
});