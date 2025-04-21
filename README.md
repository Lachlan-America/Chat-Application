# 💬 Chatify – Real-Time Chat Application

Chatify is a real-time chat application built with the MERN stack, featuring custom user authentication, secure password handling, and responsive UI design. It supports dynamic, socket-based communication and user profile creation with real-time updates.

## 🚀 Tech Stack
- **Frontend**: React, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT, bcrypt
- **Real-time Communication**: socket.io

## ✨ Features
- 🔐 **User Authentication** using JWT with hashed & salted passwords
- 👤 **Profile Creation** with duplicate-checking on server
- 💬 **Live Chat** powered by socket.io for real-time updates
- ⚡ **Efficient Rendering** for dynamic UI without unnecessary re-renders
- 📱 **Responsive Design** using TailwindCSS for mobile & desktop

## 🧠 What I Learned
- How JWTS and cookies are used to keep users logged in and secure against cross-origin resource sharing and XSS, and how to mitigate them (only allow trusted domains; sanitise input fields; read-only, secure cookies and not storing sessions in local storage)
- That there is a prebuilt package to hash passwords with salt before storage (used bcrypt), and it is done server-side, to prevent the user from gaining the hash algorithm
- Real-time chat with live UI updates with React (figuring out socket events with socket.io and state syncing was a fun challenge)
- Structuring Express routes and API endpoints with async callback functions
- Applying Tailwindcss for the first time with faster and more intuitive UI styling (found it faster than writing pure CSS)
- There is a lot to protect from, assume the client can do ANYTHING (including putting massive amounts of lorem ipsum as a username)
- How to set up a basic user profile system with server-side validation to prevent duplicates

## 📸 Screenshots

### 🔐 Signup Page  
Client-side + server-side validations  
![SignupPage](https://github.com/user-attachments/assets/1df899b3-789a-48ee-bd83-45a41674e091)

### 🔐 Login Page  
Secure login with token-based authentication  
![LoginPage](https://github.com/user-attachments/assets/2a6b1b1b-0eb5-4e17-a737-16643fa907ff)

### 💬 Chatroom (Lachlan vs. Edward perspectives)  
Fully functional, real-time message sync  
![LachlanPerspective](https://github.com/user-attachments/assets/856a6e7d-b2f7-43d8-a901-de7f59d1b2a7)  
![EdwardPerspective](https://github.com/user-attachments/assets/01675a2e-dd6e-4895-b7d3-c99478b28c14)

## 🧪 Future Improvements
- 🔁 Multiple chat rooms and group messaging support
- 🎨 Profile customization (avatars, status, etc.)
- 🔗 OAuth integration for sign-in with Google/email + need to handle expiry of JWT tokens
- ⚙️ Settings page with account deletion options
