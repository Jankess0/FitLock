export function ProfileBadge({
  isLogged,
  avatarSrc,
}: {
  isLogged: boolean;
  avatarSrc?: string;
}) {
  return (
    <div className="profile-card-container">
      <div className="brand-card">
        <div className="brand-icon-circle">
          {isLogged && avatarSrc ? (
            <img src={avatarSrc} alt="Avatar" className="athlete-avatar" />
          ) : (
            <img src="logo.png" alt="FitLock" className="main-brand-img" />
          )}
        </div>
      </div>
    </div>
  );
}