/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{ protocol: 'https', hostname: 'upload.wikimedia.org' },
		],
	},
	experimental: {
		// React 19 and Next 15 features are already enabled via versions in package.json
	},
};

export default nextConfig;
