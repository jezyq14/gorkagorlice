import { env } from "$env/dynamic/private";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = () => {
    return {
        authors: env.ABOUT_AUTHORS.split(",").map((author) => author.trim()),
        mail: env.ABOUT_MAIL,
        github: env.ABOUT_GITHUB,
        discord: env.ABOUT_DISCORD
    }
};