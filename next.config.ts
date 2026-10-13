import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: true },
      { source: "/home.php", destination: "/", permanent: true },
      { source: "/index.php", destination: "/", permanent: true },
      { source: "/pharmacy", destination: "/pharmacist", permanent: true },
      { source: "/pharmacies", destination: "/pharmacist", permanent: true },
      { source: "/patients", destination: "/patient", permanent: true },
      { source: "/clinics", destination: "/clinic", permanent: true },
      { source: "/doctor", destination: "/clinic", permanent: true },
      { source: "/pilot-case-study", destination: "/clinic", permanent: true },
      { source: "/blog", destination: "/blogs", permanent: true },
      { source: "/privacy", destination: "/privacy-policy", permanent: true },
      { source: "/team", destination: "/about#team", permanent: false },
      { source: "/careers", destination: "/contact", permanent: false },
      { source: "/refund-policy", destination: "/pricing#refunds", permanent: false },
    ];
  },
  async rewrites() {
    // Optional: serve the old prototypes under /demo from another origin.
    const origin = process.env.DEMO_ORIGIN;
    return origin ? [{ source: "/demo/:path*", destination: `${origin}/demo/:path*` }] : [];
  },
};

export default nextConfig;
