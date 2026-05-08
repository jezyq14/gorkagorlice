import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, request }) => {
    const res = await locals.api.v1.auth.me.$get();

    if (!res.ok) {
        return { user: null, locationPath: new URL(request.url).pathname };
    }

    const user = await res.json();

    return {
        user: {
            avatar: user.avatar,
            email: user.email,
            name: user.name,
        },
        locationPath: new URL(request.url).pathname,
    };
}