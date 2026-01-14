import { defineConfig } from "weapp-vite/config";
import { UnifiedViteWeappTailwindcssPlugin as uvwt } from "weapp-tailwindcss/vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";

export default defineConfig({
  plugins: [
    uvwt({ rem2rpx: true }),
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(__dirname, "app.miniapp.json"),
          dest: "" // 复制到 dist 根目录
        }
      ]
    })
  ],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "."),
      "@": path.resolve(__dirname, ".")
    }
  }
});