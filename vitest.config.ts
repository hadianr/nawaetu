
import { defineConfig } from 'vitest/config'
// import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [],
    test: {
        environment: 'node',
        globals: true,
        setupFiles: ['./src/__tests__/setup.ts'],
        alias: {
            '@': '/src'
        }
    },
    resolve: {
        alias: {
            '@': '/src'
        }
    }
})
