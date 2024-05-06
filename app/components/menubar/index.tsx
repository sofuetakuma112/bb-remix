import { Link } from "@remix-run/react";
import { useLocation } from "@remix-run/react";
import React from "react";

type Props = {
  icons: {
    href?: string;
    text: string;
    icon: React.JSX.Element;
    selectedIcon?: React.JSX.Element;
  }[];
};

function MobileMenubar({ icons }: Props) {
  const location = useLocation();
  const pathname = location.pathname;
  const initialSelectedIconIndex = icons.findIndex(
    (icon) => icon.href === pathname
  );
  const selectedIconIndex =
    initialSelectedIconIndex !== -1
      ? initialSelectedIconIndex
      : icons.length - 1;

  return (
    <div className="flex size-full sm:hidden">
      {icons.map(({ href, icon, selectedIcon }, i) =>
        href ? (
          <Link
            className="flex h-full flex-1 flex-col items-center"
            to={href}
            key={`header-link-${i}`}
          >
            {selectedIconIndex === i && selectedIcon ? selectedIcon : icon}
          </Link>
        ) : (
          <div
            className="flex h-full flex-1 flex-col items-center"
            key={`header-link-${i}`}
          >
            {selectedIconIndex === i && selectedIcon ? selectedIcon : icon}
          </div>
        )
      )}
    </div>
  );
}

export { MobileMenubar };
