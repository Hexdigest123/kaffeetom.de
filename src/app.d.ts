import type { auth } from '$lib/server/auth';

type Session = typeof auth.$Infer.Session.session;
type User = typeof auth.$Infer.Session.user;

declare global {
	namespace App {
		interface Error {
			message: string;
		}
		interface Locals {
			user?: User;
			session?: Session;
		}
	}
}

export {};
