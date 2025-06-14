import { TestCase } from "@playwright/test/reporter";
import { AllureReporter, allure } from "allure-playwright";

const JIRA_BASE_URL = "https://testqa.sample.portal/browse/"; // <-- Set your Jira base URL

export default class JiraAllureReporter extends AllureReporter {
  onTestBegin(test: TestCase) {
    // Match @JIRA:-test123 or @JIRA:-TEST-123 (case-insensitive)
    const jiraTag = test.title.match(/@JIRA:-([A-Za-z0-9\-]+)/i);
    if (jiraTag && jiraTag[1]) {
      const jiraId = jiraTag[1];
      // Use allure.issue for clickable Jira link in Allure report
      allure.issue(jiraId, `${JIRA_BASE_URL}${jiraId}`);
    } else {
      // Soft enforcement: log a warning if no Jira tag is present
      console.warn(
        `WARNING: Test '${test.title}' is missing a @JIRA:-<ticket> tag in the title.`
      );
    }
    super.onTestBegin(test);
  }
}
