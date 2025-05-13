export default function Header({ username }) {
  return (
    <>
      <header className="home-header">
        <div className="logo-area">
          <div className="logo-icon"></div>
          <h1>Arkade</h1>
        </div>
        <div className="user-welcome">
          <button className="username">{username}</button>
        </div>
      </header>
    </>
  );
}
