'use client';
import { sidebarLinks } from '@/constants';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BottomBar = () => {
  const pathname = usePathname();

  return (
    <section className="bottomBar">
      <div className="bottomBar_container">
        {sidebarLinks.map((link) => {
          const isActive =
            (pathname.includes(link.route) && link.route.length > 1) ||
            pathname === link.route;

          return (
            <Link
              className={`bottomBar_link ${isActive && 'bg-primary-500'}`}
              href={link.route}
              key={link.label}
            >
              <Image
                alt={link.label}
                className="object-contain"
                height={16}
                src={link.imgURL}
                width={16}
              />

              <p className="text-subtle-medium text-light-1 max-sm:hidden">
                {link.label.split(/\s+/u)[0]}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default BottomBar;
