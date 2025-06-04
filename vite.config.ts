/** WARNING: DON'T EDIT THIS FILE */
/** WARNING: DON'T EDIT THIS FILE */
/** WARNING: DON'T EDIT THIS FILE */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

function getPlugins() {
  const plugins = [react(), tsconfigPaths()];
  
  // 动态加载 Tailwind 插件（解决 ESM 兼容性问题）
  if (process.env.NODE_ENV !== 'production') {
    try {
      const tailwindcss = require('@tailwindcss/vite');
      plugins.push(tailwindcss());
    } catch (e) {
      console.warn('Tailwind CSS 插件加载失败，可能需要安装：npm install @tailwindcss/vite');
    }
  }
  
  return plugins;
}

export default defineConfig({
  plugins: getPlugins(),
});