#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod menu;

fn main() {
  tauri::Builder::default()
    .menu(menu::default())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
