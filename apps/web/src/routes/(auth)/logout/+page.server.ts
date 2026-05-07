import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    await locals.api.v1.auth.logout.$post();

    throw redirect(302, "/");
}