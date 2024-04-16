import { govNotify } from "./functions/govNotify";

const isOffline: boolean = !process.env.BRANCH || process.env.BRANCH === "local";

if (isOffline) {
}

export { govNotify as handler };
