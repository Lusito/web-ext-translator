const utils = require("@lusito/eslint-config/utils");

module.exports = {
    extends: ["@lusito/eslint-config-react"],
    rules: {
        ...utils.getA11yOffRules(), // just for now
        "import/no-cycle": "off", // fixme
        "react/require-default-props": "off",
    },
    env: {
        browser: true,
    },
};
