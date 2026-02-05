import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Suspense } from "react";
import { LogoButton } from "@/components/atoms/logoButton";
import { NavigationButton } from "@/components/atoms/navigationButton";
import { Toaster } from "@/components/atoms/sonner";
import { ThemeProvider } from "@/components/atoms/themeProvider";
import { ThemeToggle } from "@/components/atoms/themeToggle";
import { TooltipProvider } from "@/components/atoms/tooltip";
import { DevToolbar } from "@/components/molecules/toolbar/Toolbar";
import { Navigation } from "@/components/organisms/navigation";
import { getContentConfig } from "@/lib/getContentConfig";
import { auth0 } from "@/lib/identity/auth0";

const jetbrainsMono = localFont({
  src: "./fonts/JetBrainsMonoNL-Regular.ttf",
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ben Horner's Portfolio",
  description: "Ben Horner's Portfolio",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const contentConfig = await getContentConfig();
  const navBtnIds = Object.values(contentConfig.navigation.screenTypes).slice(
    1,
  );

  const logoButton = (
    <LogoButton href={`#${contentConfig.navigation.screenTypes.first}`} />
  );

  const navigationButtons = navBtnIds.map((navBtnId) => (
    <NavigationButton key={navBtnId} href={`#${navBtnId}`} text={navBtnId} />
  ));

  const session = await auth0.getSession();
  const loggedIn = session?.user?.name;
  const loginButton = (
    <NavigationButton
      key="login"
      href={loggedIn ? "/auth/logout" : "/auth/login"}
      text={loggedIn ? "Logout" : "Login"}
    />
  );
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jetbrainsMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <Navigation
              logoButton={logoButton}
              navigationButtons={[
                ...navigationButtons,
                loginButton,
                <ThemeToggle key="theme-toggle" />,
              ]}
            />
            {children}
            <Suspense fallback={null}>
              <DevToolbar />
            </Suspense>
            <Toaster position="bottom-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
