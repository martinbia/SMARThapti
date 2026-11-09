// 3 s fade-in, five 2.4 s demonstrations, 3 s fade-out, 10 s scenery only.
export function welcomeMarkup(base) {
  return `<main class="welcome" aria-label="Willkommen bei Alma">
    <button class="welcome-open" data-action="home" aria-label="Menü öffnen. Alternativ eine QR-Karte mit dem Code zur Tablet-Kamera halten.">
      <img class="alpine-background" src="${base}alpine-meadow.webp" alt="Sonnige Bergwiese mit Kühen und Bergen der Zentralschweiz">
      <span class="welcome-guide" data-phase="fade-in" aria-hidden="true">
        <span class="welcome-kicker">Willkommen bei Alma</span>
        <span class="welcome-heading">Ihre Karte öffnet den Weg.</span>
        <svg class="card-demonstration" viewBox="0 0 520 300" role="presentation">
          <defs><filter id="soft-shadow"><feDropShadow dx="0" dy="7" stdDeviation="7" flood-opacity=".14"/></filter></defs>
          <g class="demo-tablet" filter="url(#soft-shadow)">
            <path d="M332 24 Q332 14 343 17 L462 45 Q471 47 471 59 L471 259 Q471 271 458 267 L343 237 Q332 234 332 222Z" fill="#2a3c37"/>
            <path d="M343 39 L460 65 L460 244 L343 217Z" fill="#bed4bf"/>
            <path d="M343 178 L382 132 L414 167 L443 139 L460 164 L460 244 L343 217Z" fill="#83a88a"/>
            <circle cx="401" cy="40" r="4" fill="#f8f2df"/>
            <path d="M395 249 L409 252" stroke="#d9e5da" stroke-width="4" stroke-linecap="round"/>
          </g>
          <g class="presented-card" filter="url(#soft-shadow)">
            <path d="M27 290 L50 231 Q60 212 80 204 L127 181 Q139 175 149 182 L182 204 L212 229 Q221 241 209 253 L180 277 L163 300Z" fill="#deb38e"/>
            <rect x="114" y="77" width="126" height="155" rx="10" fill="#fffef7" stroke="#d6d3c1" stroke-width="2" transform="rotate(9 177 155)"/>
            <g transform="translate(144 102) rotate(9 40 45)" fill="#244a40">
              <path fill-rule="evenodd" d="M0 0h28v28H0z M6 6v16h16V6z M48 0h28v28H48z M54 6v16h16V6z M0 48h28v28H0z M6 54v16h16V54z"/>
              <path d="M10 10h8v8h-8z M58 10h8v8h-8z M10 58h8v8h-8z M34 0h8v13h-8z M34 20h8v18h-8z M0 34h20v8H0z M27 34h15v9H27z M48 34h11v11H48z M65 34h11v8H65z M34 50h9v26h-9z M49 51h10v10H49z M65 48h11v18H65z M49 67h27v9H49z"/>
            </g>
            <path d="M104 235 L135 202 Q144 191 154 199 Q165 206 157 217 L145 234" fill="#e7bd99" stroke="#c99675" stroke-width="2" stroke-linecap="round"/>
          </g>
          <path d="M258 127 L303 137 M291 125 L305 138 L288 145" fill="none" stroke="#fffef7" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="welcome-instruction">QR-Karte vor das Tablet halten</span>
        <span class="welcome-caption">Mit dem QR-Code zur Kamera · oder hier tippen fürs Menü</span>
      </span>
    </button>
    <video id="camera" class="welcome-camera" autoplay muted playsinline aria-hidden="true"></video>
    <div id="status" class="sr-only" role="status" aria-live="polite"></div>
  </main>`;
}

export function animateWelcome(root) {
  const guide = root.querySelector(".welcome-guide");
  const hand = root.querySelector(".presented-card");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let timer;
  let animations = [];
  function phase(name) {
    animations.forEach((a) => a.cancel());
    animations = [];
    guide.dataset.phase = name;
    guide.style.visibility = name === "rest" ? "hidden" : "visible";
    guide.style.opacity = name === "rest" ? "0" : "1";
    if (name === "fade-in" || name === "fade-out") {
      if (!reducedMotion)
        animations.push(
          guide.animate(
            name === "fade-in"
              ? [{ opacity: 0 }, { opacity: 1 }]
              : [{ opacity: 1 }, { opacity: 0 }],
            { duration: 3000, fill: "forwards", easing: "ease-in-out" },
          ),
        );
      timer = setTimeout(
        () => phase(name === "fade-in" ? "present" : "rest"),
        3000,
      );
    } else if (name === "present") {
      if (!reducedMotion)
        animations.push(
          hand.animate(
            [
              { transform: "translate(-36px, 30px) rotate(-8deg)", offset: 0 },
              {
                transform: "translate(38px, -12px) rotate(0deg)",
                offset: 0.38,
              },
              {
                transform: "translate(38px, -12px) rotate(0deg)",
                offset: 0.72,
              },
              { transform: "translate(-36px, 30px) rotate(-8deg)", offset: 1 },
            ],
            { duration: 2400, iterations: 5, easing: "ease-in-out" },
          ),
        );
      timer = setTimeout(() => phase("fade-out"), 12000);
    } else timer = setTimeout(() => phase("fade-in"), 10000);
  }
  phase("fade-in");
  return () => {
    clearTimeout(timer);
    animations.forEach((a) => a.cancel());
  };
}
