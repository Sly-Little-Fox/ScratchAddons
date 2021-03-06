import LocalizationProvider from "../libraries/l10n.js";

export default class BackgroundLocalizationProvider extends LocalizationProvider {
  constructor() {
    super();
    this.loaded = [];
  }

  async load(addonIds) {
    addonIds = ["_general", ...addonIds].filter(
      (addonId) => !addonId.startsWith("//") && !this.loaded.includes(addonId)
    );
    const ui = chrome.i18n.getUILanguage();
    const locales = [ui];
    if (ui.includes("-")) locales.push(ui.split("-")[0]);
    if (!locales.includes("en")) locales.push("en");

    localeLoop: for (const locale of locales) {
      for (const addonId of addonIds) {
        let resp;
        let messages = {};
        const url = `/addons-l10n/${locale}/${addonId}.json`;
        try {
          resp = await fetch(url);
          messages = await resp.json();
        } catch (_) {
          if (addonId === "_general") continue localeLoop;
          continue;
        }
        this.messages = Object.assign(messages, this.messages);
      }
    }
    this._generateCache();
    this._refreshDateTime();
    this.loaded = this.loaded.concat(addonIds);
  }
}
