import { expect, type Page } from "@playwright/test";

export interface TestContext {
  id: string;
  feature: string;
  selectedTool?: string;
  selectedLLM?: string;
}

export interface Example {
  desc?: string;
  params?: Record<string, unknown>;
  expect?: Record<string, unknown>;
}

export type StepFn = (
  page: Page,
  ctx: TestContext,
  example: Example,
) => Promise<void>;

export const navigate_to_home: StepFn = async (page) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
};

export const navigate_to_guest_mode: StepFn = async (page) => {
  await page.goto("/?guest=true#explore");
  await page.waitForLoadState("networkidle");
};

export const chat_is_visible: StepFn = async (page) => {
  await expect(page.locator("#explore")).toBeVisible();
};

export const config_panel_is_hidden: StepFn = async (page) => {
  const panel = page.locator('[data-testid="chat-layout-wrapper"]');
  await expect(panel).toBeVisible();
};

export const click_toggle_panels_button: StepFn = async (page) => {
  const toggleButton = page.locator('button[aria-label*="panels"]');
  await toggleButton.click();
};

export const config_panel_visible: StepFn = async (page) => {
  await expect(page.getByText("Agent Configuration")).toBeVisible();
};

export const config_panel_hidden: StepFn = async (page) => {
  const toggleButton = page.locator('button[aria-label="Show panels"]');
  await expect(toggleButton).toBeVisible();
};

export const evaluation_form_visible: StepFn = async (page) => {
  await expect(page.locator('[data-slot="evaluation-form"]')).toBeVisible();
};

export const evaluation_form_hidden: StepFn = async (page) => {
  const toggleButton = page.locator('button[aria-label="Show panels"]');
  await expect(toggleButton).toBeVisible();
};

export const select_llm: StepFn = async (page, ctx, example) => {
  const llmSelect = page.locator('select[title="Select an LLM"]');
  const llmName = (example.params?.llm as string) ?? "openai";
  const options = llmSelect.locator("option");
  const count = await options.count();
  for (let i = 0; i < count; i++) {
    const optionText = await options.nth(i).textContent();
    if (optionText?.toLowerCase().includes(llmName.toLowerCase())) {
      await llmSelect.selectOption({ index: i });
      break;
    }
  }
  ctx.selectedLLM = llmName;
};

export const llm_selected: StepFn = async (page, ctx, example) => {
  const llmSelect = page.locator('select[title="Select an LLM"]');
  const expectedLLM = (example.expect?.llm as string) ?? ctx.selectedLLM;
  const selectedOption = llmSelect.locator("option:checked");
  await expect(selectedOption).toContainText(expectedLLM ?? "", {
    ignoreCase: true,
  });
};

export const edit_system_prompt: StepFn = async (page, _ctx, example) => {
  const promptTextarea = page
    .locator('textarea[placeholder="Enter system prompt..."]')
    .first();
  const promptText = (example.params?.prompt as string) ?? "Test system prompt";
  await promptTextarea.fill(promptText);
};

export const system_prompt_updated: StepFn = async (page, _ctx, example) => {
  const promptTextarea = page
    .locator('textarea[placeholder="Enter system prompt..."]')
    .first();
  const expectedPrompt = example.expect?.prompt as string;
  if (expectedPrompt) {
    await expect(promptTextarea).toHaveValue(expectedPrompt);
  }
};

export const system_prompt_contains: StepFn = async (page, _ctx, example) => {
  const promptTextarea = page
    .locator('textarea[placeholder="Enter system prompt..."]')
    .first();
  const expectedText = example.expect?.prompt_contains as string;
  if (expectedText) {
    await expect(promptTextarea).toContainText(expectedText);
  }
};

export const add_tool: StepFn = async (page, ctx, example) => {
  const toolSelect = page.locator('select[title="Add a tool"]').first();
  const toolName = (example.params?.tool as string) ?? "";
  await toolSelect.selectOption(toolName);
  ctx.selectedTool = toolName;
};

export const remove_tool: StepFn = async (page, _ctx, example) => {
  const toolName = example.params?.tool as string;
  const removeButton = page
    .locator(`button[aria-label="Remove ${toolName}"]`)
    .first();
  await removeButton.click();
};

export const tool_in_selected_list: StepFn = async (page, ctx, example) => {
  const toolName = (example.expect?.tool as string) ?? ctx.selectedTool;
  const toolBadge = page.locator(`span.inline-flex:has-text("${toolName}")`);
  await expect(toolBadge.first()).toBeVisible();
};

export const tool_not_in_selected_list: StepFn = async (
  page,
  _ctx,
  example,
) => {
  const toolName = example.expect?.tool as string;
  const toolsSection = page
    .locator("div")
    .filter({ hasText: /^Tools$/ })
    .first();
  await expect(toolsSection).toBeVisible();
  const toolBadge = toolsSection.locator(
    `button[aria-label="Remove ${toolName}"]`,
  );
  await expect(toolBadge).toHaveCount(0);
};

export const click_save_button: StepFn = async (page) => {
  const saveButton = page.locator('[data-testid="save-agent-config-button"]');
  await saveButton.click();
};

export const click_reset_button: StepFn = async (page) => {
  const resetButton = page.locator('button:has-text("Reset")');
  await resetButton.click();
};

export const toast_success_visible: StepFn = async (page, _ctx, example) => {
  const message = (example.expect?.toast as string) ?? "saved";
  await expect(page.locator(`text=${message}`).first()).toBeVisible({
    timeout: 5000,
  });
};

export const toast_info_visible: StepFn = async (page, _ctx, example) => {
  const message = (example.expect?.toast as string) ?? "reset";
  await expect(page.locator(`text=${message}`).first()).toBeVisible({
    timeout: 5000,
  });
};

export const set_evaluation_field: StepFn = async (page, _ctx, example) => {
  const fieldLabel = example.params?.field as string;
  const value = example.params?.value as number;
  const max = 5;
  const fieldContainer = page
    .locator('[data-slot="evaluation-field"]')
    .filter({ hasText: fieldLabel })
    .first();
  await fieldContainer.waitFor({ state: "visible" });
  const slider = fieldContainer.locator('[data-slot="slider"]');
  const sliderBox = await slider.boundingBox();
  if (!sliderBox) throw new Error("Slider not found");
  const targetX = sliderBox.x + (sliderBox.width * (value - 1)) / (max - 1);
  const targetY = sliderBox.y + sliderBox.height / 2;
  await page.mouse.click(targetX, targetY);
};

export const click_save_evaluation: StepFn = async (page) => {
  const saveButton = page.locator('button:has-text("Save Evaluation")');
  await saveButton.click();
};

export const evaluation_save_status: StepFn = async (page, _ctx, example) => {
  const status = example.expect?.status as string;
  if (status === "success") {
    await expect(page.locator("text=Saved").first()).toBeVisible({
      timeout: 5000,
    });
  } else if (status === "error") {
    await expect(page.locator("text=Error").first()).toBeVisible({
      timeout: 5000,
    });
  }
};

export const click_theme_toggle: StepFn = async (page) => {
  const themeButton = page.locator(
    "button:has(svg.lucide-sun, svg.lucide-moon)",
  );
  await themeButton.click();
};

export const theme_is_dark: StepFn = async (page) => {
  await expect(page.locator("html")).toHaveClass(/dark/);
};

export const theme_is_light: StepFn = async (page) => {
  await expect(page.locator("html")).not.toHaveClass(/dark/);
};

export const theme_toggled: StepFn = async (page) => {
  const themeButton = page.locator(
    "button:has(svg.lucide-sun, svg.lucide-moon)",
  );
  await expect(themeButton).toBeVisible();
};

export const theme_toggled_back: StepFn = async (page) => {
  const themeButton = page.locator(
    "button:has(svg.lucide-sun, svg.lucide-moon)",
  );
  await expect(themeButton).toBeVisible();
};

export const login_overlay_visible: StepFn = async (page) => {
  await expect(page.locator("text=Login").first()).toBeVisible();
};

export const guest_button_visible: StepFn = async (page) => {
  await expect(page.locator('a[href="/?guest=true#explore"]')).toBeVisible();
};

export const click_guest_button: StepFn = async (page) => {
  const guestButton = page.locator('a[href="/?guest=true#explore"]');
  await guestButton.click();
  await page.waitForLoadState("networkidle");
};

export const chat_input_enabled: StepFn = async (page) => {
  const chatInput = page.locator('input[placeholder*="Type"]');
  await expect(chatInput).toBeVisible();
  await expect(chatInput).toBeEnabled();
};

export const send_chat_message: StepFn = async (page, _ctx, example) => {
  const message = (example.params?.message as string) ?? "Hello";
  const chatInput = page.locator('input[placeholder*="Type"]');
  await chatInput.fill(message);
  const sendButton = page.locator('button:has-text("Send")');
  await sendButton.click();
};

export const message_appears_in_chat: StepFn = async (page, _ctx, example) => {
  const message = example.expect?.message as string;
  await expect(page.locator(`text=${message}`)).toBeVisible({ timeout: 5000 });
};

export const typing_indicator_visible: StepFn = async (page) => {
  await expect(page.locator(".animate-bounce").first()).toBeVisible({
    timeout: 5000,
  });
};

export const click_download_config: StepFn = async (page) => {
  const downloadButton = page.locator(
    '[data-testid="download-agent-config-button"]',
  );
  await downloadButton.click();
};

export const select_answer_formatter: StepFn = async (page, _ctx, example) => {
  const formatterSelect = page.locator(
    'select[title="Select an answer formatter"]',
  );
  const formatterName = example.params?.formatter as string;
  const options = formatterSelect.locator("option");
  const count = await options.count();
  for (let i = 0; i < count; i++) {
    const optionText = await options.nth(i).textContent();
    if (optionText?.toLowerCase().includes(formatterName.toLowerCase())) {
      await formatterSelect.selectOption({ index: i });
      break;
    }
  }
};

export const toggle_evaluation_type: StepFn = async (page) => {
  const toggleButton = page
    .locator("button")
    .filter({ has: page.locator("span.pointer-events-none") })
    .first();
  await toggleButton.click();
};

export const evaluation_type_is: StepFn = async (page, _ctx, example) => {
  const expectedType = example.expect?.evaluationType as string;
  const label = page.locator(`text=${expectedType}`).first();
  await expect(label).toHaveClass(/text-primary/);
};

export const hero_visible: StepFn = async (page) => {
  await expect(page.locator("#hero")).toBeVisible();
  await expect(page.locator("#hero h1")).toContainText(
    "Welcome to Ben Horner's portfolio",
  );
};

export const protected_content_hidden: StepFn = async (page) => {
  const protectedContent = page.locator('[data-auth-required="true"]');
  await expect(protectedContent).not.toBeVisible();
};

export const login_button_visible: StepFn = async (page) => {
  const loginButton = page
    .locator('a:has-text("Login"), a:has-text("Sign In")')
    .first();
  await expect(loginButton).toBeVisible();
};

export const click_login_button: StepFn = async (page) => {
  const loginButton = page
    .locator('a:has-text("Login"), a:has-text("Sign In")')
    .first();
  await loginButton.click();
  await page.waitForURL(/benhorner-portfolio\.au\.auth0\.com/, {
    timeout: 10000,
  });
};

export const fill_auth0_credentials: StepFn = async (page) => {
  await page.fill(
    'input[name="email"], input[name="username"]',
    process.env.TEST_EMAIL || "",
  );
  await page.fill('input[name="password"]', process.env.TEST_PASSWORD || "");
};

export const submit_auth0_form: StepFn = async (page) => {
  await page.click('button[type="submit"], button[name="submit"]');
  await page.waitForURL(/^((?!auth0).)*$/, { timeout: 15000 });
  await page.waitForLoadState("networkidle");
};

export const click_explore_cta: StepFn = async (page) => {
  const ctaButton = page.locator('a[href="#explore"] button');
  await expect(ctaButton).toBeVisible();
  await ctaButton.click();
};

export const explore_section_visible: StepFn = async (page) => {
  await expect(page.locator("#explore")).toBeVisible();
  const exploreTitle = page.getByRole("heading", {
    name: "Explore Ben's work",
  });
  await expect(exploreTitle).toBeVisible();
};

export const ai_response_received: StepFn = async (page) => {
  await expect(page.locator("text=test question three")).toBeVisible({
    timeout: 8000,
  });
};

export const quick_reply_visible: StepFn = async (page) => {
  const quickReplies = page.locator("text=Tell me about your projects");
  await expect(quickReplies.first()).toBeVisible({ timeout: 2000 });
};

export const click_quick_reply: StepFn = async (page) => {
  const quickReplies = page.locator("text=Tell me about your projects");
  await quickReplies.first().click();
  await expect(
    page
      .locator('div[class*="justify-end"]')
      .filter({ hasText: "Tell me about your projects" }),
  ).toBeVisible();
};

export const send_message_with_enter: StepFn = async (page, _ctx, example) => {
  const message =
    (example.params?.message as string) ?? "Message sent with Enter key";
  const chatInput = page.locator('input[placeholder*="Type"]');
  await expect(chatInput).toBeEnabled();
  await chatInput.fill(message);
  await chatInput.press("Enter");
  await expect(page.locator(`text=${message}`)).toBeVisible();
};

export const navigate_to_contact: StepFn = async (page) => {
  await page.locator('nav a[href="#contact"]').click();
  await expect(page.locator("#contact")).toBeVisible();
  await expect(page.locator("#contact h1")).toContainText("Let's Connect");
};

export const social_links_visible: StepFn = async (page) => {
  await expect(page.locator('a[href*="github"]')).toBeVisible();
  await expect(page.locator('a[href*="linkedin"]')).toBeVisible();
};

export const click_github_link: StepFn = async (page) => {
  const githubLink = page.locator('a[href*="github"]');
  const [newPage] = await Promise.all([
    page.context().waitForEvent("page"),
    githubLink.click(),
  ]);
  expect(newPage.url()).toContain("github.com");
  await newPage.close();
};

export const click_linkedin_link: StepFn = async (page) => {
  const linkedinLink = page.locator('a[href*="linkedin"]');
  const [newPage] = await Promise.all([
    page.context().waitForEvent("page"),
    linkedinLink.click(),
  ]);
  expect(newPage.url()).toContain("linkedin.com");
  await newPage.close();
};

export const navigate_to_hero: StepFn = async (page) => {
  await page.locator('nav a[href="#hero"]').click();
  await expect(page.locator("#hero")).toBeVisible();
};

export const logout_button_visible: StepFn = async (page) => {
  const logoutButton = page
    .locator('a:has-text("Logout"), a:has-text("Sign Out")')
    .first();
  await expect(logoutButton).toBeVisible({ timeout: 10000 });
};

export const click_logout: StepFn = async (page) => {
  const logoutButton = page
    .locator('a:has-text("Logout"), a:has-text("Sign Out")')
    .first();
  await logoutButton.click();
  await page.waitForLoadState("networkidle");
};

export const navigate_to_explore: StepFn = async (page) => {
  await page.locator('a[href="#explore"]').first().click();
};

export const show_panels_button_visible: StepFn = async (page) => {
  const toggleButton = page.locator('button[aria-label="Show panels"]');
  await expect(toggleButton).toBeVisible({ timeout: 10000 });
};

export const snap_sections_have_count: StepFn = async (page, _ctx, example) => {
  const expectedCount = (example.expect?.snap_count as number) ?? 5;
  const chatLayout = page.locator('[data-testid="chat-layout-wrapper"]');
  const snapSections = chatLayout.locator(".snap-start");
  await expect(snapSections).toHaveCount(expectedCount);
};

export const scroll_through_snap_sections: StepFn = async (page) => {
  const chatLayout = page.locator('[data-testid="chat-layout-wrapper"]');
  const snapSections = chatLayout.locator(".snap-start");
  const count = await snapSections.count();
  for (let i = 0; i < count; i++) {
    const section = snapSections.nth(i);
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();
  }
};

export const steps: Record<string, StepFn> = {
  navigate_to_home,
  navigate_to_guest_mode,
  chat_is_visible,
  config_panel_is_hidden,
  click_toggle_panels_button,
  config_panel_visible,
  config_panel_hidden,
  evaluation_form_visible,
  evaluation_form_hidden,
  select_llm,
  llm_selected,
  edit_system_prompt,
  system_prompt_updated,
  system_prompt_contains,
  add_tool,
  remove_tool,
  tool_in_selected_list,
  tool_not_in_selected_list,
  click_save_button,
  click_reset_button,
  toast_success_visible,
  toast_info_visible,
  set_evaluation_field,
  click_save_evaluation,
  evaluation_save_status,
  click_theme_toggle,
  theme_is_dark,
  theme_is_light,
  theme_toggled,
  theme_toggled_back,
  login_overlay_visible,
  guest_button_visible,
  click_guest_button,
  chat_input_enabled,
  send_chat_message,
  message_appears_in_chat,
  typing_indicator_visible,
  click_download_config,
  select_answer_formatter,
  toggle_evaluation_type,
  evaluation_type_is,
  hero_visible,
  protected_content_hidden,
  login_button_visible,
  click_login_button,
  fill_auth0_credentials,
  submit_auth0_form,
  click_explore_cta,
  explore_section_visible,
  ai_response_received,
  quick_reply_visible,
  click_quick_reply,
  send_message_with_enter,
  navigate_to_contact,
  social_links_visible,
  click_github_link,
  click_linkedin_link,
  navigate_to_hero,
  logout_button_visible,
  click_logout,
  navigate_to_explore,
  show_panels_button_visible,
  snap_sections_have_count,
  scroll_through_snap_sections,
};

const validators: Record<string, StepFn> = {
  config_panel: async (page, _ctx, example) => {
    if (example.expect?.config_panel === "visible") {
      await config_panel_visible(page, _ctx, example);
    } else {
      await config_panel_hidden(page, _ctx, example);
    }
  },
  evaluation_form: async (page, _ctx, example) => {
    if (example.expect?.evaluation_form === "visible") {
      await evaluation_form_visible(page, _ctx, example);
    } else {
      await evaluation_form_hidden(page, _ctx, example);
    }
  },
  toast: toast_success_visible,
  llm: llm_selected,
  tool: tool_in_selected_list,
  prompt: system_prompt_updated,
  prompt_contains: system_prompt_contains,
  status: evaluation_save_status,
  message: message_appears_in_chat,
  theme: async (page, _ctx, example) => {
    if (example.expect?.theme === "dark") {
      await theme_is_dark(page, _ctx, example);
    } else {
      await theme_is_light(page, _ctx, example);
    }
  },
  evaluationType: evaluation_type_is,
  snap_count: snap_sections_have_count,
};

export const autoValidate: StepFn = async (page, ctx, example) => {
  if (!example.expect) return;
  for (const key of Object.keys(example.expect)) {
    const validator = validators[key];
    if (!validator) {
      throw new Error(
        `Unknown expect key: "${key}". Available: ${Object.keys(validators).join(", ")}`,
      );
    }
    await validator(page, ctx, example);
  }
};
