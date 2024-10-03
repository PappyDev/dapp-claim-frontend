// app/layout.js

import './globals.css';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  weight: ['400', '700'],
  subsets: ['latin'],
});

export const metadata = {
  title: 'Token Claim dApp',
  description: 'A simple token claim dApp',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={roboto.className}>
      <body>
        <header className="header">
        </header>
        <main>{children}</main>
        <footer className="footer">
          <p>Pappy Token Claimer</p>
        </footer>
      </body>
    </html>
  );
}
