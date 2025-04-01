import '../styles/globals.css';
import { Providers } from './providers';
import type { Metadata } from 'next';
import React from "react";
import clsx from "clsx";
import { fontMono } from "@/config/fonts";

export const metadata: Metadata = {
    title: 'URL Shortener',
    description: 'A URL shortener application with tracking and management features',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body
            className={clsx(
                "min-h-screen bg-background font-sans antialiased",
                fontMono.className,
            )}
        >
                <Providers themeProps={{ attribute: "class", defaultTheme: "dark"}}>
                    <div className="min-h-screen text-foreground font-sans">
                        <div className="max-w-6xl mx-auto p-8 max-w-[800px]">
                            {children}
                        </div>
                    </div>
                </Providers>
            </body>
        </html>
    );
}