import "./globals.css";
import Providers from "@/components/Providers";
import Nav from "@/components/Nav";

export const metadata = {
  title: "Finanças do Casal",
  description: "Gerenciamento financeiro para casais",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <Nav />
          <main className="max-w-2xl mx-auto px-4 pb-16">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
