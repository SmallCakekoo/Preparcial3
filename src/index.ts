// import firebaseComponent from "./components/firebase-component";
import RootApp from "./root/RootApp";
import LoginForm from "./components/LoginForm";
import PostCard from "./components/PostCard";
import PostList from "./components/PostList";
import PostForm from "./components/PostForm";
import RegisterForm from "./components/RegisterForm";
import MenuPage from "./pages/MenuPage";
import PostPage from "./pages/PostPage";

// customElements.define("firebase-component", firebaseComponent);
customElements.define("root-app", RootApp);
customElements.define("login-form", LoginForm);
customElements.define("post-card", PostCard);
customElements.define("post-list", PostList);
customElements.define("post-form", PostForm);
customElements.define("register-form", RegisterForm);
customElements.define("menu-page", MenuPage);
customElements.define("post-page", PostPage);
