import Link from 'next/link';
import Image from 'next/image';

interface NavigationProps {
  showLoginButton?: boolean;
  showLogoutButton?: boolean;
  onLogout?: () => void;
}

export default function Navigation({ showLoginButton = true, showLogoutButton = false, onLogout }: NavigationProps) {
  return (
    <nav className="px-6 py-4 flex justify-between items-center border-b">
      <Link href="/" className="flex items-center gap-3">
        <div className="relative w-[48px] h-[48px]">
          <Image
            src="/logo.png"
            alt="AidX Logo"
            fill
            sizes="48px"
            className="object-contain"
            priority
          />
        </div>
        <span className="text-xl font-bold text-gray-900">AidX</span>
      </Link>
      <div className="flex gap-4 items-center">
        <Link href="/find-us" className="text-gray-600 hover:text-gray-900">Find us</Link>
        <Link href="/about" className="text-gray-600 hover:text-gray-900">About us</Link>
        {showLoginButton && (
          <Link href="/login" className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
            Login
          </Link>
        )}
        {showLogoutButton && onLogout && (
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
} 