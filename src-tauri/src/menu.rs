use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

pub fn default() -> Menu{
  let window_menu = Submenu::new("Window",
    Menu::new()
      .add_native_item(MenuItem::Quit)
  );
  let edit_menu = Submenu::new("Edit",
    Menu::new()
      .add_native_item(MenuItem::Undo)
      .add_native_item(MenuItem::Redo)
      .add_native_item(MenuItem::Cut)
      .add_native_item(MenuItem::Copy)
      .add_native_item(MenuItem::Paste)
      .add_native_item(MenuItem::SelectAll)
  );
  let menu = Menu::new()
    .add_item(CustomMenuItem::new("hide", "Hide"))
    .add_submenu(window_menu)
    .add_submenu(edit_menu);

  return menu;
}