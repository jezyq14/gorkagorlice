import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { WEB_URL } from '$env/static/private';

export const load: PageServerLoad = async ({ url, locals }) => {
    const error = url.searchParams.get('error');

    if (!error) {
        const user = await (await locals.api.auth.me.$get()).json();
        if (user?.id) {
            throw redirect(302, "/");
        }

        const callbackUrl = url.searchParams.get('callback') || WEB_URL + "/login";
        const authUrl = locals.api.auth.google.$url({
            query: { callback: callbackUrl }
        });

        throw redirect(302, authUrl.toString());
    }

    return { error };
};