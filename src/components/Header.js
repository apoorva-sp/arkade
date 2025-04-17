import "../styles/loginstyle.css"
 export default function Header({username}){
    return<> <header className="home-header">
    <div className="logo-area">
      <div className="logo-icon"></div>
      <h1>Arkade</h1>
    </div>
    <div className="user-welcome">
      <p>Welcome back,</p>
      <h2 className="username">{username}</h2>
    </div>
  </header>
   </>;
}
