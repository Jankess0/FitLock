export function Banner({ isLogged }: { isLogged: boolean }) {
  return <div className={`banner-area ${isLogged ? 'banner-logged' : 'banner-unlogged'}`} />;
}