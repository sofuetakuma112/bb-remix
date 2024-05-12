import { Link, useLocation } from "@remix-run/react";

type Icon = {
  href?: string;
  text: string;
  icon: (props: { className?: string }) => JSX.Element;
};

type Props = {
  icons: Icon[];
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
      {icons.map(({ href, icon: IconComponent }, i) =>
        href ? (
          <Link
            className="flex h-full flex-1 flex-col items-center"
            to={href}
            key={`header-link-${i}`}
          >
            {selectedIconIndex === i ? (
              <IconComponent className="bg-accent" />
            ) : (
              <IconComponent />
            )}
          </Link>
        ) : (
          <div
            className="flex h-full flex-1 flex-col items-center"
            key={`header-link-${i}`}
          >
            {selectedIconIndex === i ? (
              <IconComponent className="bg-accent" />
            ) : (
              <IconComponent />
            )}
          </div>
        )
      )}
    </div>
  );
}

export { MobileMenubar };
