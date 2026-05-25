import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "api";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type NewsStory = RouterOutputs["news"]["byId"];
export type NewsListPage = RouterOutputs["news"]["list"];
