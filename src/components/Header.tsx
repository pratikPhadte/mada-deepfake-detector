import { Logo } from './Logo';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-mada-gray-500 hover:text-white transition-colors uppercase tracking-wider"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm text-mada-gray-500 hover:text-white transition-colors uppercase tracking-wider"
            >
              Pricing
            </a>
            <a
              href="/docs"
              className="text-sm text-mada-gray-500 hover:text-white transition-colors uppercase tracking-wider"
            >
              Docs
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="/docs"
              className="hidden sm:flex text-sm text-mada-gray-500 hover:text-white transition-colors uppercase tracking-wider"
            >
              API
            </a>
            <button className="btn-primary text-sm px-5 py-2 uppercase tracking-wider">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
