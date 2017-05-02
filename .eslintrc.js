module.exports = {
  "ecmaFeatures": {
    "jsx": true,
    "modules": true
  },
  "env": {
    "browser": true,
    "node": true
  },
  "parser": "babel-eslint",
  "rules": {
    "quotes": [2, "single"],
    "strict": [2, "never"],
    "react/jsx-uses-react": 2,
    "react/jsx-uses-vars": 2,
    "react/react-in-jsx-scope": 2,

    // "quotes": [2, ["backtick", "single"]],
    "quotes": ["error", "single"],
    // "indent": ["error", 2],
    "semi": [2, "never"]
  },
  "plugins": [
    "react"
  ]
};

