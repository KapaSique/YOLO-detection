import type { Metadata } from "next";

import { Providers } from "./providers";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "YOLO Guard",
  description: "Real-time object detection platform"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
