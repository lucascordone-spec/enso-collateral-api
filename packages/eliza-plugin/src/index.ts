import { Plugin } from "@ai16z/eliza";
import { buildLeverageAction } from "./leverageAction.js";

export const ensoCollateralPlugin: Plugin = {
    name: "enso-collateral",
    description: "Enso Collateral Flash Loan Leverage & Deleverage Plugin for Eliza OS",
    actions: [buildLeverageAction],
    providers: [],
    evaluators: [],
};

export { buildLeverageAction };
