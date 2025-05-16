import Link from "next/link";
import { Twitter, Github, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 bg-[#0D47A1] text-white">
      <div className="container px-4 mx-auto">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-xl font-bold">ChainSure</h3>
            <p className="mb-4 text-sm text-gray-200">
              Decentralized insurance platform powered by blockchain technology.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-white hover:text-gray-200">
                <Twitter className="w-5 h-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-white hover:text-gray-200">
                <Github className="w-5 h-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link href="#" className="text-white hover:text-gray-200">
                <Linkedin className="w-5 h-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Products</h3>
            <ul className="space-y-2 text-sm text-gray-200">
              <li>
                <Link href="#" className="hover:text-white">
                  Health Insurance
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Flight Delay Insurance
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Rainfall Insurance
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Custom Solutions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-200">
              <li>
                <Link href="#" className="hover:text-white">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Whitepaper
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  API
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Community
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-200">
              <li>
                <Link href="#" className="hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 text-sm text-center text-gray-200 border-t border-gray-700">
          <p>© 2025 ChainSure. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
