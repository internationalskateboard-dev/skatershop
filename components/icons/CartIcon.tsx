// components/icons/CartIcon.tsx
export function CartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      {/* halo/glow */}
      <circle
        cx="12"
        cy="12"
        r="11"
        className="opacity-30"
        fill="currentColor"
      />

      {/* carrito */}
      <path
        d="M7 7h13l-1.2 6.4a1.8 1.8 0 0 1-1.77 1.5H9.1a1.8 1.8 0 0 1-1.77-1.5L6 4.8H4"
        stroke="black"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* ruedas */}
      <circle cx="10" cy="18" r="1.2" fill="black" />
      <circle cx="17" cy="18" r="1.2" fill="black" />
      {/* rayita interior tipo “skater” */}
      <path
        d="M10 11h6.5"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
