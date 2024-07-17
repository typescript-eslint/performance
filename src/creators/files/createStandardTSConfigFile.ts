export function createStandardTSConfigFile() {
	return {
		compilerOptions: {
			module: "NodeNext",
			noEmit: true,
			skipLibCheck: true,
			strict: true,
			target: "ESNext",
		},
		include: ["src"],
	};
}
