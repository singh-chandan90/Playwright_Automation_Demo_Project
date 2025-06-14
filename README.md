# Playwright_Automation_Demo_Project

demo project using playwright for UI and API test Automation

# Playwright Framework

This repository contains a Playwright framework setup for automated testing. The framework is structured as follows:

## Project Folder Structure

Project Folder<br>
├── node_modules <br>
├── config<br>
│ ├── env.qa.json<br>
│ └── env.staging.json<br>
├── logging<br>
│ ├── test_error.log<br>
│ └── test_run.log<br>
├── pages<br>
│ ├── cart-page.ts<br>
│ ├── checkout-page.ts<br>
│ ├── login-page.ts<br>
│ └── products-page.ts<br>
├── playwright-report<br>
│ └── index.html<br>
│ └── allure-results/<br>
├── test-results<br>
├── testdata<br>
│ ├── api_test_data/<br>
│ └── ui_test_data/<br>
├── tests<br>
│ ├── api-tests/<br>
│ └── ui-tests/<br>
├── utils<br>
│ ├── config.ts<br>
│ ├── CryptojsUtil.ts<br>
│ ├── CsvtoJsonUtil.ts<br>
│ ├── EncryptEnvFile.ts<br>
│ ├── ExcelToJsonUtil.ts<br>
│ ├── LoggerUtil.ts<br>
│ └── MySqlUtil.ts<br>
├── .eslintrc.json<br>
├── .gitignore<br>
├── package-lock.json<br>
├── package.json<br>
├── playwright.config.ts<br>
├── tsconfig.json<br>
└── .github<br>
└── workflows<br>
└── main.yml<br>

## Description

- `.eslint.Config.js`: ESLint configuration file for linting TypeScript and playwright  code.
- `.gitignore`: Specifies intentionally untracked files to ignore in Git.
- `package-lock.json` and `package.json`: Node.js package files specifying project dependencies.
- `playwright.config.ts`: Configuration file for Playwright settings.
- `tsconfig.json`: TypeScript compiler options file.
- `config/`: Contains environment configuration files and authentication data (`env.qa.json`, `env.staging.json`).
- `logging/`: Log files generated during test execution.
- `pages/`: Page object files representing different pages of the application under test.
- `testdata/`: Test data files in various formats, such as JSON and CSV.
- `tests/`: Test scripts written in TypeScript for UI and API.
- `utils/`: Utility scripts for encryption, logging, data conversion, and database access.

### `.github`

- `.github/workflows/playwright.yml`: GitHub Actions workflow file for continuous integration.

### `playwright-report`

- Directory for storing Playwright test reports and Allure results.

### `test-results`

- Directory for storing test execution results, including screenshots, trace files, and videos.

## Usage

- Clone the repository and install dependencies using `npm install`.
- Run tests using `npm test`.
- View test reports in the `playwright-report` directory.
- Explore source code files for detailed implementation.

## Contributing

Contributions are welcome! Please follow the established coding style and guidelines. If you find any issues or have suggestions for improvements, feel free to open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
