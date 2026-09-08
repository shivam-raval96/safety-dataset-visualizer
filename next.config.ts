import type { NextConfig } from 'next';

const onGitHubPages = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  output: onGitHubPages ? 'export' : undefined,
  basePath: onGitHubPages ? '/safety-dataset-visualizer' : '',
  assetPrefix: onGitHubPages ? '/safety-dataset-visualizer/' : undefined,
  images: { unoptimized: true },
};

export default nextConfig;
