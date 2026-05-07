import { ABOUT_AUTHORS, ABOUT_DISCORD, ABOUT_GITHUB, ABOUT_MAIL } from "$env/static/private";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = () => {
    return {
        authors: ABOUT_AUTHORS.split(",").map((author) => author.trim()),
        mail: ABOUT_MAIL,
        github: ABOUT_GITHUB,
        discord: ABOUT_DISCORD
    }
};