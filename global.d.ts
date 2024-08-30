declare namespace NodeJS {
	interface Global {
		mongoose: {
			conn: any;
			promise: Promise<any> | null;
		};
	}
}
