export class Header {
  private readonly selectors: Record<string, string> = {
    root: "[data-js-header]",
    overlay: "[data-js-header-overlay]",
    triggerButton: "[data-js-header-trigger-button]",
    itemHasSubmenu: ".has-submenu",
    panel: "[data-js-header-panel]",
  };
  private readonly attributes: Record<string, string> = {
    ariaExpanded: "aria-expanded",
  };
  private readonly stateClasses: Record<string, string> = {
    isActive: "is-active",
    isLock: "is-lock",
  };
  private rootElement: HTMLElement | null;
  private overlayElement: HTMLElement | null;
  private triggerButtonElement: HTMLElement | null;
  private itemHasSubmenuElements: HTMLElement[];
  private toggleElements: HTMLElement[];
  private panels: HTMLElement[];
  private historyStack: string[] = ["main"];

  constructor() {
    this.rootElement = document.querySelector(this.selectors.root);
    this.overlayElement = this.rootElement?.querySelector(this.selectors.overlay) || null;
    this.triggerButtonElement = this.rootElement?.querySelector(this.selectors.triggerButton) || null;
    this.toggleElements = [this.rootElement, this.overlayElement, this.triggerButtonElement].filter(
      Boolean
    ) as HTMLElement[];
    this.panels = Array.from(this.rootElement?.querySelectorAll(this.selectors.panel) || []) as HTMLElement[];
    this.itemHasSubmenuElements = Array.from(
      this.rootElement?.querySelectorAll(this.selectors.itemHasSubmenu) || []
    ) as HTMLElement[];
    this.init();
  }

  private isReady(): boolean {
    return !!this.rootElement && !!this.overlayElement && !!this.triggerButtonElement;
  }

  private init(): void {
    if (!this.isReady()) return;
    this.bindEvents();
  }

  private onButtonClick = (): void => {
    const isActive = this.rootElement?.classList.contains(this.stateClasses.isActive);
    this.setActive(!isActive);
  };

  private onDocumentClick = (e: MouseEvent): void => {
    const target = e.target as HTMLElement;
    if (
      target.closest(this.selectors.triggerButton) ||
      target.closest(this.selectors.overlay) ||
      target.closest(this.selectors.itemHasSubmenu)
    )
      return;
    this.setActive(false);
    this.closeAllMenus();
  };

  private onOverlayClick = (e: MouseEvent): void => {
    const target = e.target as HTMLElement;
    const nextButton = target.closest(".next-panel");
    const backButton = target.closest(".prev-panel");
    if (nextButton) {
      event?.preventDefault();
      const id = (nextButton as HTMLElement).dataset.panel;
      if (!id) return;
      this.historyStack.push(id);
      this.showPanel(id);
    }

    if (backButton) {
      this.historyStack.pop();
      this.showPanel(this.historyStack[this.historyStack.length - 1]);
    }
  };

  private showPanel(id: string): void {
    this.panels.forEach(panel => {
      panel.classList.remove("is-active", "to-right", "to-left");
      const panelIdStr = (panel as HTMLElement).dataset.panelId;
      if (panelIdStr !== undefined && panelIdStr === id) {
        panel.classList.add("is-active");
      } else if (
        this.historyStack[this.historyStack.length - 2] &&
        this.historyStack[this.historyStack.length - 2] === (panel as HTMLElement).dataset.panelId
      ) {
        panel.classList.add("to-left");
      } else {
        panel.classList.add("to-right");
      }
    });
  }

  private toggleSubmenu(currentIndex: number): void {
    this.itemHasSubmenuElements.forEach((menuItem, index) => {
      const subMenu = menuItem.querySelector(".mega-header__menu-dropdown") as HTMLElement;
      if (!subMenu) return;
      const active = menuItem.classList.contains(this.stateClasses.isActive);

      if (currentIndex === index) {
        menuItem?.classList.toggle(this.stateClasses.isActive);
        subMenu.style.maxHeight = active ? "" : `${subMenu.scrollHeight}px`;
      } else {
        menuItem.classList.remove(this.stateClasses.isActive);
        subMenu.style.maxHeight = "";
      }
    });
  }

  private closeAllMenus(): void {
    this.itemHasSubmenuElements.forEach(menuItem => {
      const subMenu = menuItem.querySelector(".mega-header__menu-dropdown") as HTMLElement;
      if (!subMenu) return;
      menuItem?.classList.remove(this.stateClasses.isActive);
      subMenu.style.maxHeight = "";
    });
    this.historyStack = ["main"];
    this.showPanel("main");
    this.setActive(false);
  }

  private setActive(state: boolean): void {
    this.toggleElements.forEach(el => el.classList.toggle(this.stateClasses.isActive, state));
    document.documentElement.classList.toggle(this.stateClasses.isLock, state);
    this.setAttributes(state);
  }

  private setAttributes(state: boolean): void {
    this.triggerButtonElement?.setAttribute(this.attributes.ariaExpanded, String(state));
  }

  private handleInteraction = (index: number, event: MouseEvent) => {
    const menuItem = this.itemHasSubmenuElements[index];
    const isActive = menuItem.classList.contains(this.stateClasses.isActive);

    if (!isActive) {
      event.preventDefault();
      this.toggleSubmenu(index);
    }
  };

  private bindEvents(): void {
    this.triggerButtonElement?.addEventListener("click", this.onButtonClick);
    document.addEventListener("click", this.onDocumentClick);
    this.overlayElement?.addEventListener("click", this.onOverlayClick);
    this.itemHasSubmenuElements.forEach((item, index) => {
      const link = item.querySelector(":scope > a") as HTMLAnchorElement;
      if (!link) return;
      link.addEventListener("click", (event: MouseEvent) => {
        this.handleInteraction(index, event);
      });
    });
  }
}

export default Header;
