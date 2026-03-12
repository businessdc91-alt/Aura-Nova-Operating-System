// frontend/next.config.mjs
var nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  trailingSlash: true
};
var next_config_default = nextConfig;
export {
  next_config_default as default
};
