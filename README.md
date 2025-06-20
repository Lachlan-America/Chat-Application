# 💬 Chatify – Real-Time Chat Application

Chatify is a real-time chat application built with the MERN stack, featuring custom user authentication, secure password handling, and responsive UI design. It supports dynamic, socket-based communication and user profile creation with real-time updates.

## How to use it?
Click on the link that is advertised in the repo, and then you can use either of these test logins:
- Guest1, Password1
- Guest2, Password2
- Guest3, Password3
- Guest4, Password4
- Guest5, Password5

+ There is a signup feature, but I have disabled it due to the database's maximum size. However, the concept works, and passwords are hashed with salt before they are updated in the DB.
+ Also, the backend is hosted separately with a different platform and usually takes a bit to start up (welcome to free-tier hosting), so just be patient when logging in for the first time.

## Why did I make this?
I built this real-time chat app to learn how full-stack systems talk to each other under the hood. 
I wanted to understand how things like Socket.IO, authentication flows, and multi-user coordination work, because I’ve always been fascinated by real-time systems, especially games and messaging tools.

It started as a weekend curiosity and became a full-stack app with authentication, protected routes, responsive design, and a working deployment. 
Along the way, I ran into race conditions, session timing bugs, and UI performance hiccups, but I enjoyed figuring out how to debug them. I now feel way more confident building async systems and thinking about architecture.

This wasn’t just a portfolio project; It was a deep dive into making something real.

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

## 🧪 Future Improvements
- 🔁 Multiple chat rooms and group messaging support
- 🎨 Profile customization (avatars, status, etc.)
- 🔗 OAuth integration for sign-in with Google/email + need to handle expiry of JWT tokens
- ⚙️ Settings page with account deletion options
