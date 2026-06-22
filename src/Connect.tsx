type SocialLink = {
  href: string;
  icon: string;
  label: string;
};

const SOCIAL_LINKS: SocialLink[] = [
  { href: "https://github.com/vitejs/vite", icon: "github-icon", label: "GitHub" },
  { href: "https://chat.vite.dev/", icon: "discord-icon", label: "Discord" },
  { href: "https://x.com/vite_js", icon: "x-icon", label: "X.com" },
  { href: "https://bsky.app/profile/vite.dev", icon: "bluesky-icon", label: "Bluesky" },
];

const Connect = () => (
  <div id="social">
    <svg className="icon" role="presentation" aria-hidden="true">
      <use href="/icons.svg#social-icon"></use>
    </svg>
    <h2>Connect with us</h2>
    <p>Join the Vite community</p>
    <ul>
      {SOCIAL_LINKS.map((social) => (
        <li key={social.href}>
          <a href={social.href} target="_blank">
            <svg className="button-icon" role="presentation" aria-hidden="true">
              <use href={`/icons.svg#${social.icon}`}></use>
            </svg>
            {social.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export default Connect;
