import "./AuthBox.css";

function AuthBox({ title, children }) {
  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">{title}</h1>
        {children}
      </div>
    </div>
  );
}

export default AuthBox;
