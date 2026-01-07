# WorkDesks - Helpdesk & Support Ticket System

A modern, full-stack helpdesk and support ticket system built with the MERN stack (MongoDB, Express, React, Node.js). WorkDesks is designed to streamline customer support workflows with a beautiful, responsive UI and powerful ticket management features.

## 🚀 Features

-   **Ticket Management**: Create, view, update, and delete support tickets.
-   **Role-Based Access Control**:
    -   **Customers**: Create tickets and view their own history.
    -   **Agents**: View assigned tickets (or unassigned ones) and manage them.
    -   **Managers/Admins**: Full visibility and management capabilities.
-   **Real-time Updates**: Status changes and comments.
-   **Dashboard**: Visual statistics on ticket volume, priority distribution, and agent performance.
-   **Advanced Filtering**: Filter tickets by status, priority, agent, time, and more. Persists user preferences.
-   **Keyboard Shortcuts**: Rapid navigation and actions (e.g., `Alt+N` for new ticket).
-   **Responsive Design**: Fully optimized for desktop and mobile devices.
-   **Dark/Light Mode**: Seamless theme switching.

## 🛠️ Tech Stack

### Frontend
-   **React** (Vite)
-   **Tailwind CSS** & **Shadcn/UI** (Styling)
-   **React Router** (Navigation)
-   **Recharts** (Data Visualization)
-   **React Query** & **Context API** (State Management)

### Backend
-   **Node.js** & **Express.js**
-   **MongoDB** & **Mongoose** (Database)
-   **JWT** (Authentication)

## 📦 Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/developer-yasir/support-desk.git
    cd support-desk
    ```

2.  **Install Dependencies**

    *Backend:*
    ```bash
    cd backend
    npm install
    ```

    *Frontend:*
    ```bash
    cd ../frontend
    npm install
    ```

3.  **Environment Variables**

    Create a `.env` file in the `backend` directory:
    ```env
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/supportdesk
    JWT_SECRET=your_jwt_secret_key
    NODE_ENV=development
    ```

    Create a `.env` file in the `frontend` directory (optional, defaults to localhost):
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```

4.  **Run the Application**

    *Start Backend:*
    ```bash
    cd backend
    npm run dev
    ```

    *Start Frontend:*
    ```bash
    cd frontend
    npm run dev
    ```

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
| :--- | :--- |
| **New Ticket** | `Alt + N` |
| **Go to Tickets** | `Alt + T` |
| **Go to Dashboard** | `Alt + D` |
| **Go to Reports** | `Alt + R` |
| **Focus Search** | `/` |
| **Show Help** | `?` |

## 👥 Authors

-   **Yasir** - [GitHub](https://github.com/developer-yasir)

## 📄 License

This project is licensed under the MIT License.
