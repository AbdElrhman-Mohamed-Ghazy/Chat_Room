
// إعداد الاتصال بالسيرفر
const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7205/chatHub") // تأكد من البورت بتاعك
    .withAutomaticReconnect() // إعادة الاتصال تلقائياً لو النت فصل
    .build();

let myUsername = "";

// عناصر الواجهة (DOM)
const loginScreen = document.getElementById("loginScreen");
const chatScreen = document.getElementById("chatScreen");
const usernameInput = document.getElementById("usernameInput");
const joinBtn = document.getElementById("joinBtn");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messagesContainer = document.getElementById("messagesContainer");
const usersList = document.getElementById("usersList");
const connectionStatus = document.getElementById("connectionStatus");
const currentUserDisplay = document.getElementById("currentUserDisplay");

// 1. بدء اتصال الـ SignalR أول ما الصفحة تفتح
connection.start()
    .then(() => {
        connectionStatus.textContent = "Connected";
        connectionStatus.className = "text-emerald-400 font-medium";
    })
    .catch(err => {
        connectionStatus.textContent = "Disconnected";
        connectionStatus.className = "text-rose-500 font-medium";
        console.error(err);
    });

// 2. كود زرار الدخول للشات
joinBtn.addEventListener("click", () => {
    const user = usernameInput.value.trim();
    if (!user) return alert("Please enter a valid name");

    myUsername = user;
    
    // استدعاء دالة التسجيل في السيرفر
    connection.invoke("RegisterUser", myUsername)
        .then(() => {
            // إخفاء شاشة اللوجن وإظهار الشات
            loginScreen.classList.add("hidden");
            chatScreen.classList.remove("hidden");
            currentUserDisplay.textContent = `Active as: ${myUsername}`;
            
            // تفعيل حقول الرسائل
            messageInput.disabled = false;
            sendBtn.disabled = false;
            messageInput.focus();
        })
        .catch(err => alert("Failed to join chat: " + err));
});

// 3. استقبال رسالة جديدة وعرضها بشكل شات مودرن
connection.on("ReceiveMessage", (user, message) => {
    const msgDiv = document.createElement("div");
    
    if (user === "System") {
        // رسائل النظام (دخول/خروج)
        msgDiv.className = "text-center text-xs text-slate-500 my-2 italic";
        msgDiv.textContent = message;
    } else {
        // رسائل المستخدمين
        const isMe = user === myUsername;
        msgDiv.className = `flex flex-col ${isMe ? 'items-end' : 'items-start'}`;
        
        msgDiv.innerHTML = `
            <span class="text-xs text-slate-400 mb-1 px-1">${user}</span>
            <div class="max-w-md p-3 rounded-2xl shadow-md ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-100 rounded-tl-none'}">
                <p class="text-sm break-all">${message}</p>
            </div>
        `;
    }
    
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // سكرول لأسفل تلقائياً
});

// 4. استقبال وتحديث قائمة المتصلين (Online Users) مع علامة خضراء
connection.on("UpdateUserList", (users) => {
    usersList.innerHTML = ""; // مسح القائمة القديمة
    
    users.forEach(user => {
        const li = document.createElement("li");
        li.className = "flex items-center gap-3 p-2 rounded-xl bg-slate-800/40 border border-slate-700/50";
        
        li.innerHTML = `
            <div class="relative">
                <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-indigo-300 uppercase">
                    ${user.substring(0, 2)}
                </div>
                <!-- النقطة الخضراء للمتصل -->
                <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-800 rounded-full"></span>
            </div>
            <span class="text-sm font-medium text-slate-200">${user} ${user === myUsername ? '(You)' : ''}</span>
        `;
        usersList.appendChild(li);
    });
});

// 5. إرسال الرسالة عند الضغط على زرار Send أو Enter
function handleSendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    connection.invoke("SendMessage", text)
        .then(() => {
            messageInput.value = "";
            messageInput.focus();
        })
        .catch(err => console.error(err));
}

sendBtn.addEventListener("click", handleSendMessage);
messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSendMessage();
});