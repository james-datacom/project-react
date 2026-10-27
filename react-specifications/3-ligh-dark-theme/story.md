Update the existing Account/Profile dropdown menu in my website.

Current behavior:
- There is an Account/Profile icon in the website header.
- Clicking the Account icon opens a small dropdown/popover menu.
- The menu currently contains:
  - Account Settings
  - Sign Out

I want to add Light Mode and Dark Mode support, but I do NOT want separate Light Mode and Dark Mode rows in the main Account menu.

Instead, add a single "Theme" menu item.

Main Account menu should look approximately like this:

[User/Settings Icon] Account Settings
[Theme Icon]         Theme                 Light >
[Logout Icon]        Sign Out

The "Light" text should dynamically show the currently active theme.

For example:

If Light Mode is active:
[Theme Icon] Theme                     Light >

If Dark Mode is active:
[Theme Icon] Theme                      Dark >

Theme Selection:
When the user clicks or hovers on "Theme", open a small submenu/popover containing:

[Sun Icon]  Light Mode
[Moon Icon] Dark Mode

The currently selected theme should have a visual indicator/checkmark:

✓ [Sun Icon] Light Mode
  [Moon Icon] Dark Mode

or:

  [Sun Icon] Light Mode
✓ [Moon Icon] Dark Mode

Functional requirements:

1. Clicking "Light Mode" should immediately switch the entire application to Light Mode.

2. Clicking "Dark Mode" should immediately switch the entire application to Dark Mode.

3. Save the selected theme in localStorage.

Example:
localStorage key: "theme"
Values:
- "light"
- "dark"

4. When the application loads:
   - Check localStorage for the saved theme.
   - If a saved theme exists, apply it.
   - Otherwise use the application's existing/default theme.

5. Apply the theme globally and consistently to:
   - Body/page background
   - Header/navigation
   - Sidebar
   - Cards
   - Tables
   - Modals
   - Dropdowns
   - Forms
   - Inputs
   - Buttons
   - Text
   - Borders
   - Icons
   - Hover states
   - Selected states
   - Disabled states

6. Dark Mode must maintain good contrast and readability.

7. Use the project's existing icon library.

Suggested icons:
- Account Settings → User or Settings icon
- Theme → Palette, Sun/Moon, or Appearance icon
- Light Mode → Sun icon
- Dark Mode → Moon icon
- Sign Out → Logout icon
- Current selection → Check icon
- Submenu indicator → ChevronRight icon

8. Keep all icons aligned consistently to the left of their labels.

9. Keep the Account dropdown compact and consistent with the website's existing design.

10. The Theme submenu should visually match the existing Account dropdown.

11. Do not redesign the Account dropdown or any unrelated parts of the website.

12. Reuse the application's existing theme implementation if one already exists.

13. If the application already uses CSS variables, Tailwind themes, MUI ThemeProvider, styled-components ThemeProvider, or another theme system, integrate with it instead of creating a duplicate system.

14. Make the theme logic reusable and maintainable.

Important:
Before making changes, inspect:
- The existing Account/Profile dropdown component
- The project's icon library
- Global styles
- Existing theme configuration
- Existing CSS variables or theme providers

Modify the existing implementation instead of creating a duplicate Account menu or separate theme system.

Do not change unrelated components, layouts, spacing, fonts, or functionality.