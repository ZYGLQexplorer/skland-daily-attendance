import { spawn } from 'node:child_process'
import process from 'node:process'
import * as core from '@actions/core'

core.info('🚀 准备执行签到任务...')

// 直接执行 task 脚本
const task = spawn('pnpm', ['task'], {
  stdio: 'inherit',
  env: {
    ...process.env,
  },
})

task.on('exit', (code) => {
  if (code === 0) {
    core.info('✅ 任务执行成功')
    process.exit(0)
  }
  else {
    core.error(`❌ 任务执行失败 (退出码: ${code})`)
    core.setFailed(`Task failed with exit code ${code}`)
    process.exit(code || 1)
  }
})

task.on('error', (error) => {
  core.error(`❌ 执行失败: ${error.message}`)
  core.setFailed(error.message)
  process.exit(1)
})
