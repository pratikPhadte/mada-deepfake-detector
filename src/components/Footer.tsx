import { Logo } from './Logo';
import { Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-mada-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-mada-gray-500">
              Detect AI-generated content with state-of-the-art deep learning models.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-mada-gray-500 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-mada-gray-500 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-mada-gray-500 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 uppercase tracking-wider text-sm">Product</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-mada-gray-500 hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-mada-gray-500 hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-mada-gray-500 hover:text-white transition-colors">
                  API Docs
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-mada-gray-500 hover:text-white transition-colors">
                  Changelog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 uppercase tracking-wider text-sm">Company</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-mada-gray-500 hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-mada-gray-500 hover:text-white transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-mada-gray-500 hover:text-white transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-mada-gray-500 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 uppercase tracking-wider text-sm">Legal</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-mada-gray-500 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-mada-gray-500 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-mada-gray-500 hover:text-white transition-colors">
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-sm text-mada-gray-500 text-center">
            &copy; {new Date().getFullYear()} MADA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
